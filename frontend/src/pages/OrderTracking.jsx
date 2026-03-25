import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

export default function OrderTracking() {
    const { orderId } = useParams()
    const [mission, setMission] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSimulating, setIsSimulating] = useState(false)

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

    // Simuler une étape du déplacement
    const simulateStep = async () => {
        try {
            const response = await fetch(`/api/delivery/simulate-step/${orderId}`, { method: 'POST' })
            if (!response.ok) throw new Error('Erreur simulation')
            const data = await response.json()
            setMission(data.mission)
        } catch (err) {
            console.error('Simulation error:', err)
        }
    }

    // Chargement initial
    useEffect(() => {
        fetchTracking()
    }, [orderId])

    // Auto-simulation toutes les 3 secondes
    useEffect(() => {
        if (!mission || mission.status === 'delivered') return

        const interval = setInterval(() => {
            simulateStep()
        }, 3000)

        return () => clearInterval(interval)
    }, [mission?.status])

    if (loading) return <LoadingSpinner />
    if (error) return <div className="p-6 text-center text-red-600">Erreur: {error}</div>
    if (!mission) return <div className="p-6 text-center">Aucune mission trouvée</div>

    const statusLabels = {
        courier_assigned: '✅ Coursier assigné',
        picked_up: '📦 Colis récupéré',
        on_the_way: '🚗 En route vers toi',
        delivered: '🎉 Livré !',
    }

    const statusColors = {
        courier_assigned: 'bg-blue-100 border-blue-300',
        picked_up: 'bg-purple-100 border-purple-300',
        on_the_way: 'bg-orange-100 border-orange-300',
        delivered: 'bg-green-100 border-green-300',
    }

    const progressSteps = 4
    const allSteps = ['courier_assigned', 'picked_up', 'on_the_way', 'delivered']
    const currentStep = allSteps.indexOf(mission.status)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-md mx-auto">
                {/* En-tête */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Suivi de livraison</h1>
                    <p className="text-sm text-gray-600">Commande: {orderId.slice(0, 8)}...</p>
                </div>

                {/* Statut principal */}
                <div className={`rounded-lg border-2 p-6 mb-6 text-center ${statusColors[mission.status]}`}>
                    <div className="text-4xl mb-2">{statusLabels[mission.status].split(' ')[0]}</div>
                    <h2 className="text-xl font-bold text-gray-800">{statusLabels[mission.status]}</h2>
                </div>

                {/* Infos du coursier */}
                {mission.courier_name && (
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <p className="text-gray-600 text-sm">Coursier</p>
                        <p className="text-2xl font-bold text-gray-800">{mission.courier_name}</p>
                    </div>
                )}

                {/* Barre de progression */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        {allSteps.map((step, i) => (
                            <div
                                key={step}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    i <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
                                }`}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-500"
                            style={{ width: `${(currentStep / (allSteps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* ETA */}
                {mission.eta_minutes != null && mission.status !== 'delivered' && (
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <p className="text-gray-600 text-sm">Temps d'arrivée estimé</p>
                        <p className="text-3xl font-bold text-blue-600">{mission.eta_minutes} min</p>
                    </div>
                )}

                {/* Coordonnées du coursier */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <p className="text-gray-600 text-sm mb-3">Position du coursier</p>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            <span className="font-semibold">Latitude:</span> {mission.courier_lat?.toFixed(6)}
                        </p>
                        <p>
                            <span className="font-semibold">Longitude:</span> {mission.courier_lng?.toFixed(6)}
                        </p>
                    </div>
                </div>

                {/* Bouton de simulation (pour les tests) */}
                {mission.status !== 'delivered' && (
                    <button
                        onClick={simulateStep}
                        disabled={isSimulating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        {isSimulating ? 'Simulation...' : 'Simuler étape (test)'}
                    </button>
                )}

                {/* Message de livraison */}
                {mission.status === 'delivered' && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                        <p className="text-green-800 font-bold">✅ Votre commande a été livrée !</p>
                        <p className="text-green-700 text-sm mt-2">Merci pour vos achats chez nous 🎁</p>
                    </div>
                )}
            </div>
        </div>
    )
}
