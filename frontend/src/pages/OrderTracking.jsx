import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function OrderTracking() {
    const { orderId } = useParams()
    const [mission, setMission] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey || '',
    })

    // Récupérer les infos du suivi
    const fetchTracking = async () => {
        try {
            const response = await fetch(`/api/delivery/track/${orderId}`)
            if (!response.ok) throw new Error('Impossible de récupérer le suivi')
            const data = await response.json()
            setMission(data.tracking)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Chargement initial
    useEffect(() => {
        fetchTracking()
    }, [orderId])

    // Rafraîchir le tracking toutes les 5 secondes
    useEffect(() => {
        if (!mission || mission.status === 'delivered') return

        const interval = setInterval(() => {
            fetchTracking()
        }, 5000)

        return () => clearInterval(interval)
    }, [mission?.status])

    if (loading) return <LoadingSpinner />
    if (error) return <div className="p-6 text-center text-red-600">Erreur: {error}</div>
    if (!mission) return <div className="p-6 text-center">Aucune mission trouvée</div>

    const statusMeta = {
        awaiting_courier: { emoji: '⏳', label: "En attente d'un coursier", shortLabel: 'Attente' },
        courier_assigned: { emoji: '✅', label: 'Coursier assigné', shortLabel: 'Assigné' },
        picked_up: { emoji: '📦', label: 'Colis récupéré', shortLabel: 'Récup' },
        on_the_way: { emoji: '🚗', label: 'En route vers toi', shortLabel: 'Route' },
        delivered: { emoji: '🎉', label: 'Livré !', shortLabel: 'Livré' },
    }

    const statusColors = {
        awaiting_courier: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        courier_assigned: 'bg-blue-50 border-blue-200 text-blue-800',
        picked_up: 'bg-purple-50 border-purple-200 text-purple-800',
        on_the_way: 'bg-orange-50 border-orange-200 text-orange-800',
        delivered: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    }

    const allSteps = ['awaiting_courier', 'courier_assigned', 'picked_up', 'on_the_way', 'delivered']
    const currentStep = Math.max(0, allSteps.indexOf(mission.status))
    const currentStatus = statusMeta[mission.status] || { emoji: '📍', label: 'Statut inconnu', shortLabel: 'Inconnu' }
    const progress = (currentStep / (allSteps.length - 1)) * 100
    const courierLat = Number(mission?.courier_lat)
    const courierLng = Number(mission?.courier_lng)
    const customerLat = Number(mission?.dropoff_lat)
    const customerLng = Number(mission?.dropoff_lng)
    const hasCourierCoords = Number.isFinite(courierLat) && Number.isFinite(courierLng)
    const hasCustomerCoords = Number.isFinite(customerLat) && Number.isFinite(customerLng)
    const hasBothCoords = hasCourierCoords && hasCustomerCoords
    const combinedMapLink = hasBothCoords
        ? `https://www.google.com/maps/dir/${courierLat},${courierLng}/${customerLat},${customerLng}`
        : null
    
    // Détails de livraison
    const deliveryAddress = mission?.delivery_address || 'Adresse non disponible'
    const deliveryCity = mission?.delivery_city || ''
    const deliveryPostalCode = mission?.delivery_postal_code || ''
    const customerName = mission?.customer_name || 'Client'
    const fullDeliveryAddress = `${deliveryAddress}, ${deliveryPostalCode} ${deliveryCity}`.trim()
    
    const mapOptions = {
        center: hasBothCoords 
            ? { lat: (courierLat + customerLat) / 2, lng: (courierLng + customerLng) / 2 }
            : { lat: 48.8566, lng: 2.3522 }, // Centre de Paris par défaut
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        fullscreenControl: false,
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 px-4 py-8 md:px-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-xl rounded-2xl p-6 md:p-7">
                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Suivi de livraison</h1>
                            <p className="text-sm text-slate-500 mt-1 font-mono">Commande: {orderId.slice(0, 8)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[mission.status] || 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                            {currentStatus.emoji} {currentStatus.label}
                        </span>
                    </div>

                    <div className="my-5 border-t border-slate-200" />

                    {/* Statut principal */}
                    <div className={`rounded-xl border p-5 text-center ${statusColors[mission.status] || 'border-slate-200 text-slate-700'}`}>
                        <div className="text-4xl mb-2">{currentStatus.emoji}</div>
                        <h2 className="text-xl font-bold">{currentStatus.label}</h2>
                        <p className="text-sm mt-2 opacity-80">Suivi actualisé automatiquement toutes les 5 secondes</p>
                    </div>

                    {mission.courier_name && (
                        <>
                            <div className="my-5 border-t border-slate-200" />
                            <div>
                                <p className="text-slate-500 text-sm">Coursier</p>
                                <p className="text-2xl font-bold text-slate-900">{mission.courier_name}</p>
                            </div>
                        </>
                    )}

                    <div className="my-5 border-t border-slate-200" />

                    {/* Barre de progression */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            {allSteps.map((step, i) => (
                                <div key={step} className="flex flex-col items-center gap-1 min-w-0 flex-1">
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-700 ease-out ${
                                            i <= currentStep ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                                        }`}
                                    >
                                        {i + 1}
                                    </div>
                                    <span className={`text-[10px] md:text-xs font-medium truncate ${i <= currentStep ? 'text-blue-700' : 'text-slate-400'}`}>
                                        {statusMeta[step]?.shortLabel}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-600 h-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {mission.eta_minutes != null && mission.status !== 'delivered' && (
                        <>
                            <div className="my-5 border-t border-slate-200" />
                            <div>
                                <p className="text-slate-500 text-sm">Temps d'arrivée estimé</p>
                                <p className="text-3xl font-bold text-blue-600">{mission.eta_minutes} min</p>
                            </div>
                        </>
                    )}

                    <div className="my-5 border-t border-slate-200" />

                    {/* Carte avec marqueurs colorés */}
                    <div>
                        <p className="text-slate-500 text-sm mb-3">Carte en direct (coursier + client)</p>
                        
                        {/* Affichage de l'adresse réelle de livraison */}
                        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 p-4">
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">📍 Destination</p>
                            <p className="text-sm font-bold text-slate-900">{customerName}</p>
                            <p className="text-sm text-slate-700 mt-1">{fullDeliveryAddress}</p>
                        </div>

                        {hasBothCoords ? (
                            <>
                                {/* Google Map avec marqueurs */}
                                {!googleMapsApiKey ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                        Carte indisponible : ajoute <strong>VITE_GOOGLE_MAPS_API_KEY</strong> dans <strong>frontend/.env</strong>.
                                    </div>
                                ) : mapLoadError ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                        Carte indisponible : chargement Google Maps bloqué (clé API, quota ou extension de blocage).
                                    </div>
                                ) : !isMapLoaded ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                        Chargement de la carte…
                                    </div>
                                ) : (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '0.75rem', border: '1px solid rgb(226, 232, 240)' }}
                                        center={mapOptions.center}
                                        zoom={mapOptions.zoom}
                                        options={mapOptions}
                                    >
                                        {/* Marqueur BLEU = Position du livreur */}
                                        {hasCourierCoords && (
                                            <Marker
                                                position={{ lat: courierLat, lng: courierLng }}
                                                title={`📦 Livreur en route`}
                                                icon={{
                                                    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z',
                                                    fillColor: '#3B82F6',
                                                    fillOpacity: 1,
                                                    strokeWeight: 2,
                                                    strokeColor: '#1E40AF',
                                                    scale: 2,
                                                    anchor: { x: 12, y: 12 },
                                                }}
                                            />
                                        )}
                                        
                                        {/* Marqueur ROUGE = Position du client */}
                                        {hasCustomerCoords && (
                                            <Marker
                                                position={{ lat: customerLat, lng: customerLng }}
                                                title={`🏁 Destination de livraison`}
                                                icon={{
                                                    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z',
                                                    fillColor: '#EF4444',
                                                    fillOpacity: 1,
                                                    strokeWeight: 2,
                                                    strokeColor: '#DC2626',
                                                    scale: 2,
                                                    anchor: { x: 12, y: 12 },
                                                }}
                                            />
                                        )}
                                    </GoogleMap>
                                )}

                                <div className="mt-3">
                                    <a
                                        href={combinedMapLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                                    >
                                        Ouvrir le trajet complet dans Google Maps
                                    </a>
                                </div>
                                
                                {/* Légende des marqueurs */}
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-start gap-2">
                                        <span className="text-lg">🔵</span>
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold">LIVREUR</p>
                                            <p className="text-xs text-slate-600 italic">En mouvement</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                                        <span className="text-lg">🔴</span>
                                        <div>
                                            <p className="text-xs text-red-600 font-bold">CLIENT</p>
                                            <p className="text-xs text-slate-600 italic">Destination</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                Position GPS du coursier ou du client indisponible pour le moment.
                            </div>
                        )}
                    </div>

                    <div className="my-5 border-t border-slate-200" />

                    {mission.status !== 'delivered' && (
                        <button
                            onClick={fetchTracking}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        >
                            Rafraîchir le suivi
                        </button>
                    )}

                    {mission.status === 'delivered' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                            <p className="text-emerald-800 font-bold">✅ Votre commande a été livrée !</p>
                            <p className="text-emerald-700 text-sm mt-2">Merci pour vos achats chez nous 🎁</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
