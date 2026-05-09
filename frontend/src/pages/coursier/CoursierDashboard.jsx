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

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/delivery/courier/${user.id}/stats`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
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
      console.error('Erreur stats:', error);
      setIsAvailable(false);
    }
  };

  useEffect(() => { fetchStats(); }, [user]);

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
      console.error("Erreur missions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAvailable(); }, []);

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
      console.error('Erreur missions coursier:', error);
    }
  };

  useEffect(() => { loadCourierMissions(); }, [user?.id]);

  // Géolocalisation en temps réel quand le coursier est en ligne
  useEffect(() => {
    let watchId = null;

    if (isAvailable && user?.id) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await fetch(`/api/delivery/courier/${user.id}/location`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: latitude, lng: longitude }),
              });
            } catch (err) {
              console.error("Erreur mise à jour position GPS:", err);
            }
          },
          (error) => {
            console.error("Erreur GPS:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
          }
        );
      }
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isAvailable, user?.id]);

  const acceptMission = async (missionToAccept) => {
    setActionError('');
    setActionMessage('');
    try {
      if (!isAvailable && !activeMission) throw new Error('Passe en ligne avant d’accepter une mission.');
      const courierId = user?.id || (await supabase.auth.getSession()).data?.session?.user?.id;
      if (!courierId) throw new Error('Authentification requise');
      const orderId = missionToAccept?.order_id;
      if (!orderId) throw new Error('Mission invalide');

      const response = await fetch(`/api/delivery/accept/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierName: userName, deliveryPersonId: courierId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l’acceptation');

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
    if (nextStatus === 'delivered') {
      setShowConfirmDelivery(true);
      return;
    }
    try {
      const response = await fetch(`/api/delivery/status/${activeMission.order_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Erreur mise à jour');
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
      if (!response.ok) throw new Error(data.error || 'Erreur livraison');
      setActiveMission(data.mission);
      setShowConfirmDelivery(false);
      setActionMessage('✨ Livraison confirmée ! 🎉');
      loadCourierMissions();
      await fetchStats();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      setActionError(error.message);
      setShowConfirmDelivery(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 overflow-x-hidden">
      {/* Header Statut */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full animate-pulse ${presenceMeta.dot}`} />
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
              {presenceMeta.label}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
            <button
              onClick={() => { if (!presenceMeta.actionDisabled) persistAvailability(!isAvailable); }}
              disabled={presenceMeta.actionDisabled}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all shadow-sm ${
                presenceMeta.actionDisabled
                  ? 'bg-amber-50 text-amber-700 cursor-not-allowed opacity-75'
                  : isAvailable
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              <Power size={18} />
              <span className="whitespace-nowrap">{presenceMeta.actionLabel}</span>
            </button>
            <button
              onClick={async () => { await logout(); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Power size={18} />
              <span className="whitespace-nowrap">Sortir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight">Bonjour, <br className="md:hidden"/><span className="text-blue-600 font-bold italic">{userName}</span> 👋</h2>
            <p className="text-base md:text-xl text-slate-500 mt-2 font-medium">Votre centre logistique est prêt.</p>
          </div>
          <button 
            onClick={loadAvailable}
            className="flex items-center justify-center gap-3 bg-white border border-slate-200 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-slate-700 font-bold text-base md:text-lg hover:bg-slate-50 transition-all shadow-md active:scale-95 w-full md:w-auto"
          >
            <Clock size={20} className="text-blue-500" />
            Actualiser
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsArray.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className={`${stat.bg} ${stat.color} w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6`}>
                <stat.icon size={20} className="md:w-8 md:h-8" />
              </div>
              <p className="text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">{stat.label}</p>
              <p className="text-xl md:text-4xl font-black text-slate-900 mt-1 md:mt-2 tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className={`rounded-3xl border-2 p-6 flex items-center gap-4 ${presenceMeta.statusCard}`}>
          <AlertCircle size={28} />
          <div>
            <p className="text-lg font-bold uppercase tracking-wider">{presenceMeta.label}</p>
            <p className="text-base font-medium opacity-90">{presenceMeta.helper}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Mission Active (Colonne Principale) */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight uppercase">
              <Navigation size={36} className="text-blue-600" />
              Mission en cours
            </h3>

            {!activeMission ? (
              <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-20 text-center space-y-6">
                <div className="bg-slate-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto border-2 border-slate-100 shadow-inner">
                  <Truck size={48} className="text-slate-300" />
                </div>
                <div className="max-w-md mx-auto">
                  <p className="text-2xl font-bold text-slate-900">En attente de commande</p>
                  <p className="text-lg text-slate-500 mt-2 font-medium">Les nouvelles missions apparaîtront dans la colonne de droite.</p>
                </div>
              </div>
            ) : (
              <motion.div 
                layoutId="active-mission"
                className="bg-white rounded-[3rem] border border-blue-100 shadow-2xl shadow-blue-500/10 overflow-hidden"
              >
                <div className="bg-blue-600 p-10 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-blue-100 text-sm font-black uppercase tracking-[0.3em]">Code Mission</span>
                      <h4 className="text-4xl font-black mt-2 tracking-tight">#{activeMission.order_id.slice(0, 8).toUpperCase()}</h4>
                    </div>
                    <div className="bg-white/20 px-6 py-2 rounded-2xl text-sm font-black backdrop-blur-md border border-white/30 uppercase tracking-widest">
                      {STATUS_LABELS[activeMission.status]}
                    </div>
                  </div>
                </div>

                <div className="p-12 space-y-12">
                  {/* Timeline de livraison */}
                  <div className="relative flex justify-between px-4">
                    <div className="absolute top-8 left-0 w-full h-1 bg-slate-100 -z-0 rounded-full" />
                    <div className="absolute top-8 left-0 h-1 bg-blue-500 transition-all duration-700 -z-0 rounded-full" 
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
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isDone ? 'bg-blue-600 text-white scale-110' : 'bg-white border-4 border-slate-50 text-slate-300'}`}>
                            <step.i size={28} />
                          </div>
                          <span className={`text-xs font-black uppercase tracking-widest ${isDone ? 'text-blue-600' : 'text-slate-400'}`}>{step.t}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-6">
                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-slate-500 border border-slate-100"><MapPin size={28} /></div>
                        <div>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Expéditeur</p>
                          <p className="text-2xl font-bold text-slate-900 mt-2">{activeMission?.orders?.shop?.name || 'Boutique'}</p>
                          <p className="text-lg text-slate-600 mt-2 leading-relaxed">{activeMission?.orders?.shop?.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 border border-blue-100"><Navigation size={28} /></div>
                        <div>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Destinataire</p>
                          <p className="text-2xl font-bold text-slate-900 mt-2">{activeMission?.orders?.customer_name || 'Client'}</p>
                          <p className="text-lg text-slate-600 mt-2 leading-relaxed">{activeMission?.orders?.delivery_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeMission.status !== 'delivered' ? (
                    <>
                      <button
                        onClick={moveToNextStatus}
                        className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-300 active:scale-[0.98] uppercase tracking-[0.2em]"
                      >
                        Valider : {STATUS_LABELS[NEXT_STATUS[activeMission.status]]}
                        <ChevronRight size={28} />
                      </button>

                      <AnimatePresence>
                        {showConfirmDelivery && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowConfirmDelivery(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full overflow-hidden"
                            >
                              <div className="bg-emerald-600 p-10 text-white">
                                <h3 className="text-3xl font-black uppercase tracking-tight">Confirmer la livraison</h3>
                                <p className="text-emerald-100 text-lg mt-2 font-medium">Vérifiez l'identité du client.</p>
                              </div>
                              <div className="p-10 space-y-8">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                  <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Référence</p>
                                  <p className="text-4xl font-black text-slate-900 mt-3 font-mono">#{activeMission?.order_id?.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                                  <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Destinataire</p>
                                  <p className="text-2xl font-bold text-slate-900 mt-3 flex items-center gap-3">
                                    👤 {activeMission?.orders?.customer_name || 'Client'}
                                  </p>
                                </div>
                              </div>
                              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                                <button onClick={() => setShowConfirmDelivery(false)} className="flex-1 py-4 rounded-2xl font-bold text-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">Annuler</button>
                                <button onClick={confirmDelivery} className="flex-1 py-4 rounded-2xl font-black text-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                                  <CheckCircle size={24} /> CONFIRMER
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-700 p-10 rounded-[2rem] text-center font-black text-2xl flex items-center justify-center gap-4 border-2 border-emerald-100 shadow-inner">
                      <CheckCircle size={36} /> LIVRAISON RÉUSSIE !
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight uppercase">
              <TrendingUp size={28} className="text-emerald-500" />
              Disponibles
            </h3>
            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 animate-pulse space-y-6"><div className="h-6 bg-slate-100 rounded-full w-2/3"></div><div className="h-12 bg-slate-50 rounded-2xl"></div></div>
                ))
              ) : availableMissions.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 text-center"><p className="text-slate-400 font-bold text-lg italic">Calme plat sur le secteur...</p></div>
              ) : (
                availableMissions.map((mission) => (
                  <motion.div key={mission.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-md hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">Mission</div>
                      <span className="text-2xl font-black text-slate-900">{Number(mission?.orders?.total_amount || 0).toFixed(2)} €</span>
                    </div>
                    <div className="space-y-4 mb-8">
                      <p className="text-lg text-slate-700 font-medium"><span className="font-black text-slate-900 uppercase">De :</span> {mission?.orders?.shop?.name}</p>
                      <p className="text-lg text-slate-700 font-medium"><span className="font-black text-slate-900 uppercase">À :</span> {mission?.orders?.delivery_city}</p>
                    </div>
                    <button onClick={() => acceptMission(mission)} disabled={!!activeMission || !isAvailable} className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 ${activeMission || !isAvailable ? 'bg-slate-50 text-slate-300' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'}`}>ACCEPTER <ChevronRight size={20} /></button>
                  </motion.div>
                ))
              )}
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h4 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500" /> Dernières missions</h4>
              {deliveredHistory.length === 0 ? (
                <p className="text-sm text-slate-400 italic font-medium">Aucun historique récent.</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-auto pr-2 custom-scrollbar">
                  {deliveredHistory.slice(0, 5).map((m) => (
                    <div key={m.id} className="rounded-2xl border border-slate-50 bg-slate-50/30 p-4 transition-colors hover:bg-white hover:border-slate-100">
                      <p className="text-sm font-black text-slate-900">#{m.order_id?.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{m?.orders?.shop?.name} ➝ {m?.orders?.delivery_city}</p>
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
