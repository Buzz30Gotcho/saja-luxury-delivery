import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Clock, 
  Package, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Star,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS = {
  awaiting_courier: 'En attente',
  courier_assigned: 'Acceptée',
  picked_up: 'Récupérée',
  on_the_way: 'En route',
  delivered: 'Livrée',
};

const NEXT_STATUS = {
  courier_assigned: 'picked_up',
  picked_up: 'on_the_way',
  on_the_way: 'delivered',
};

export default function CoursierDashboard() {
  const { user, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [deliveredHistory, setDeliveredHistory] = useState([]);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);

  const userName = useMemo(() => {
    return user?.profile?.display_user || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Coursier';
  }, [user]);

  // Stats réelles du livreur
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalDeliveries: 0,
    rating: 5.0,
    onlineTime: '—'
  });

  const presenceState = activeMission ? 'busy' : isAvailable ? 'available' : 'offline';
  const presenceMeta = {
    busy: {
      label: 'En livraison',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      actionLabel: 'En livraison',
      actionDisabled: true,
      helper: 'Vous avez déjà une mission active.',
      statusCard: 'bg-amber-50 border-amber-200 text-amber-800',
    },
    available: {
      label: 'En ligne',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      actionLabel: 'Passer hors ligne',
      actionDisabled: false,
      helper: 'Vous pouvez accepter de nouvelles missions.',
      statusCard: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    },
    offline: {
      label: 'Hors ligne',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      actionLabel: 'Prendre le service',
      actionDisabled: false,
      helper: 'Passez en ligne pour recevoir des missions.',
      statusCard: 'bg-slate-100 border-slate-200 text-slate-700',
    },
  }[presenceState];

  // Fonction réutilisable pour recharger les stats
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/delivery/courier/${user.id}/stats`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Erreur chargement stats coursier:', payload?.error || 'Erreur inconnue');
        setIsAvailable(false);
        return;
      }

      const apiStats = payload?.stats || {};
      setIsAvailable(Boolean(apiStats.isAvailable));
      setStats({
        totalEarnings: Number(apiStats.totalEarnings || 0),
        totalDeliveries: Number(apiStats.totalDeliveries || 0),
        rating: Number(apiStats.rating || 5.0),
        onlineTime: '—'
      });
    } catch (error) {
      console.error('Erreur réseau chargement stats coursier:', error);
      setIsAvailable(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const statsArray = [
    { label: "Gains totaux", value: `${stats.totalEarnings.toFixed(2)} €`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Livraisons", value: stats.totalDeliveries, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Note", value: stats.rating, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Statut", value: presenceMeta.label, icon: Power, color: "text-slate-600", bg: presenceMeta.statusCard },
  ];

  const persistAvailability = async (nextAvailability) => {
    if (!user?.id) return;

    const response = await fetch(`/api/delivery/courier/${user.id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: nextAvailability }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setActionError(data.error || 'Impossible de mettre à jour votre statut.');
      return;
    }

    setIsAvailable(data?.courier?.is_available ?? nextAvailability);
    setActionMessage(nextAvailability ? 'Vous êtes maintenant en ligne.' : 'Vous êtes passé hors ligne.');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const loadAvailable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/delivery/missions/available');
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setAvailableMissions(Array.isArray(data.missions) ? data.missions : []);
      }
    } catch (error) {
      console.error("Erreur chargement missions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailable();
  }, []);

  const loadCourierMissions = async () => {
    const courierId = user?.id || (await supabase.auth.getSession()).data?.session?.user?.id;
    if (!courierId) return;

    try {
      const response = await fetch(`/api/delivery/missions/courier/${courierId}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;

      const missions = Array.isArray(data.missions) ? data.missions : [];
      const active = missions.find((m) => m.status !== 'delivered') || null;
      const delivered = missions.filter((m) => m.status === 'delivered');

      setActiveMission(active);
      setDeliveredHistory(delivered);
    } catch (error) {
      console.error('Erreur chargement missions coursier:', error);
    }
  };

  useEffect(() => {
    loadCourierMissions();
  }, [user?.id]);

  const acceptMission = async (missionToAccept) => {
    setActionError('');
    setActionMessage('');
    try {
      if (!isAvailable && !activeMission) {
        throw new Error('Passe en ligne avant d’accepter une mission.');
      }
      const courierId = user?.id || (await supabase.auth.getSession()).data?.session?.user?.id;
      if (!courierId) throw new Error('Authentification requise: veuillez vous reconnecter');
      const orderId = missionToAccept?.order_id;
      if (!orderId) throw new Error('Mission invalide: order_id manquant');

      const response = await fetch(`/api/delivery/accept/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierName: userName, deliveryPersonId: courierId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l’acceptation');

      // On garde les infos de mission enrichies (order/shop) si la réponse backend ne les retourne pas
      const mergedMission = {
        ...missionToAccept,
        ...(data.mission || {}),
        orders: data?.mission?.orders || missionToAccept?.orders || null,
      };

      setActiveMission(mergedMission);
      setAvailableMissions(prev => prev.filter(m => m.order_id !== orderId));
      setActionMessage('Mission acceptée ! Bonne route 🚀');
      loadCourierMissions();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const moveToNextStatus = async () => {
    if (!activeMission?.order_id) return;
    const nextStatus = NEXT_STATUS[activeMission.status];
    if (!nextStatus) return;

    // Si on passe à "delivered" (dernière étape), afficher la modale de confirmation
    if (nextStatus === 'delivered') {
      setShowConfirmDelivery(true);
      return;
    }

    // Pour les autres étapes, continuer normalement
    try {
      const response = await fetch(`/api/delivery/status/${activeMission.order_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Erreur mise à jour statut');
      
      setActiveMission(data.mission);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const confirmDelivery = async () => {
    if (!activeMission?.order_id) return;

    try {
      const response = await fetch(`/api/delivery/status/${activeMission.order_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la livraison');
      
      setActiveMission(data.mission);
      setShowConfirmDelivery(false);
      setActionMessage('✨ Livraison confirmée! Bravo! 🎉');
      
      loadCourierMissions();
      await fetchStats();
      
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      setActionError(error.message);
      setShowConfirmDelivery(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Statut */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${presenceMeta.dot}`} />
            <h1 className="text-lg font-bold text-slate-800">
              {presenceMeta.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!presenceMeta.actionDisabled) {
                  persistAvailability(!isAvailable);
                }
              }}
              disabled={presenceMeta.actionDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                presenceMeta.actionDisabled
                  ? 'bg-amber-50 text-amber-700 cursor-not-allowed'
                  : isAvailable
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              <Power size={16} />
              {presenceMeta.actionLabel}
            </button>
            <button
              onClick={async () => {
                await logout();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Power size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif text-slate-900">Bonjour, {userName} 👋</h2>
            <p className="text-slate-500 mt-1">Prêt pour vos prochaines livraisons ?</p>
          </div>
          <button 
            onClick={loadAvailable}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm"
          >
            <Clock size={18} className="text-blue-500" />
            Actualiser les missions
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsArray.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className={`rounded-2xl border p-4 ${presenceMeta.statusCard}`}>
          <p className="text-sm font-semibold">{presenceMeta.label}</p>
          <p className="text-sm mt-1 opacity-80">{presenceMeta.helper}</p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3"
            >
              <CheckCircle size={20} />
              <span className="font-medium">{actionMessage}</span>
            </motion.div>
          )}
          {actionError && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <span className="font-medium">{actionError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mission Active (Colonne Principale) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Navigation size={22} className="text-blue-600" />
              Mission en cours
            </h3>

            {!activeMission ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Truck size={32} className="text-slate-300" />
                </div>
                <div className="max-w-xs mx-auto">
                  <p className="text-slate-900 font-semibold">Aucune mission active</p>
                  <p className="text-slate-500 text-sm mt-1">Acceptez une commande dans la liste de droite pour commencer votre tournée.</p>
                </div>
              </div>
            ) : (
              <motion.div 
                layoutId="active-mission"
                className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden"
              >
                <div className="bg-blue-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">Commande active</span>
                      <h4 className="text-xl font-bold mt-1">#{activeMission.order_id.slice(0, 8)}</h4>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                      {STATUS_LABELS[activeMission.status]}
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Timeline de livraison */}
                  <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0" />
                    <div className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500 -z-0" 
                         style={{ width: activeMission.status === 'delivered' ? '100%' : activeMission.status === 'on_the_way' ? '66%' : activeMission.status === 'picked_up' ? '33%' : '0%' }} 
                    />
                    
                    {[
                      { s: 'courier_assigned', i: CheckCircle, t: 'Accepté' },
                      { s: 'picked_up', i: Package, t: 'Récupéré' },
                      { s: 'on_the_way', i: Navigation, t: 'En route' },
                      { s: 'delivered', i: CheckCircle, t: 'Livré' }
                    ].map((step, idx) => {
                      const isDone = activeMission.status === step.s || 
                                    (idx === 0 && activeMission.status !== 'awaiting_courier') ||
                                    (idx === 1 && (activeMission.status === 'on_the_way' || activeMission.status === 'delivered')) ||
                                    (idx === 2 && activeMission.status === 'delivered');
                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                            <step.i size={18} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${isDone ? 'text-blue-600' : 'text-slate-400'}`}>{step.t}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    {/* Point de retrait (boutique) */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><MapPin size={20} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Point de retrait</p>
                          <p className="text-slate-900 font-semibold mt-0.5">
                            {activeMission?.orders?.shop?.name || 'Boutique inconnue'}
                          </p>
                          <p className="text-slate-500 text-sm">
                            {activeMission?.orders?.shop?.address || 'Adresse inconnue'}
                            {activeMission?.orders?.shop?.city ? `, ${activeMission.orders.shop.city}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Destination (client) */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Navigation size={20} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Destination</p>
                          <p className="text-slate-900 font-semibold mt-0.5">
                            {activeMission?.orders?.customer_name || 'Client inconnu'}
                          </p>
                          <p className="text-slate-500 text-sm">
                            {activeMission?.orders?.delivery_address || 'Adresse inconnue'}
                            {activeMission?.orders?.delivery_city ? `, ${activeMission.orders.delivery_city}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeMission.status !== 'delivered' ? (
                    <>
                      <button
                        onClick={moveToNextStatus}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                      >
                        <span className="uppercase tracking-widest text-sm">Valider l'étape : {STATUS_LABELS[NEXT_STATUS[activeMission.status]]}</span>
                        <ChevronRight size={20} />
                      </button>

                      {/* Modale de confirmation de livraison */}
                      <AnimatePresence>
                        {showConfirmDelivery && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowConfirmDelivery(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, y: 20 }}
                              animate={{ scale: 1, y: 0 }}
                              exit={{ scale: 0.9, y: 20 }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
                            >
                              <div className="bg-emerald-600 p-6 text-white rounded-t-3xl">
                                <h3 className="text-2xl font-bold">Confirmer la livraison</h3>
                                <p className="text-emerald-100 text-sm mt-1">Vérifiez l'identité du client avant de confirmer</p>
                              </div>

                              <div className="p-8 space-y-6">
                                {/* Numéro de commande */}
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Numéro de commande</p>
                                  <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">#{activeMission?.order_id?.slice(0, 8).toUpperCase()}</p>
                                </div>

                                {/* Nom du client */}
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Destinataire</p>
                                  <p className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                                    👤 {activeMission?.orders?.customer_name || 'Client inconnu'}
                                  </p>
                                </div>

                                {/* Instructions */}
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                  <p className="text-amber-800 text-sm">
                                    <strong>Note:</strong> Demandez au client de confirmer le numéro de commande avant de valider.
                                  </p>
                                </div>
                              </div>

                              <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button
                                  onClick={() => setShowConfirmDelivery(false)}
                                  className="flex-1 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={confirmDelivery}
                                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle size={18} />
                                  Confirmer
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center font-bold flex items-center justify-center gap-3 border border-emerald-100">
                      <CheckCircle size={24} />
                      Mission terminée avec succès !
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Liste des Missions (Sidebar Droite) */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={22} className="text-emerald-500" />
              Missions à proximité
            </h3>

            {!isAvailable && !activeMission && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Vous êtes hors ligne pour le moment. Passez en ligne pour accepter une mission.
              </div>
            )}

            {activeMission && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Une mission est déjà en cours : vous êtes occupé jusqu’à la livraison.
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-50 rounded"></div>
                  </div>
                ))
              ) : availableMissions.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center">
                  <p className="text-slate-400 text-sm italic">Aucune mission disponible pour le moment.</p>
                </div>
              ) : (
                availableMissions.map((mission) => (
                  <motion.div 
                    key={mission.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Prêt pour retrait
                      </div>
                      <span className="text-slate-900 font-bold">{Number(mission?.orders?.total_amount || 0).toFixed(2)} €</span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-sm text-slate-600 truncate"><span className="font-bold text-slate-800">Shop:</span> {mission?.orders?.shop?.name || 'Boutique inconnue'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <p className="text-sm text-slate-600 truncate"><span className="font-bold text-slate-800">Vers:</span> {mission?.orders?.delivery_postal_code || ''} {mission?.orders?.delivery_city || 'Adresse inconnue'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptMission(mission)}
                      disabled={!!activeMission || !isAvailable}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeMission || !isAvailable
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      Accepter
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Historique des livraisons</h4>
              {deliveredHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune livraison terminée.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {deliveredHistory.slice(0, 8).map((mission) => (
                    <div key={mission.id} className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs font-semibold text-slate-900">#{mission.order_id?.slice(0, 8)} • {mission?.orders?.shop?.name || 'Boutique'}</p>
                      <p className="text-xs text-slate-500">{mission?.orders?.customer_name || 'Client'} — {mission?.orders?.delivery_city || 'Ville inconnue'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
