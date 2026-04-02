import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDeliveredMissions } from '../../services/orderService';

export default function HistoriqueLivraisons() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDelivered() {
      setLoading(true);
      setError('');
      if (!user?.id) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }
      const { data, error } = await getDeliveredMissions(user.id);
      if (error) setError(error.message || 'Erreur chargement historique');
      setMissions(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    fetchDelivered();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Historique des livraisons</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : missions.length === 0 ? (
        <div className="text-slate-400 italic">Aucune livraison terminée.</div>
      ) : (
        <ul className="space-y-4">
          {missions.map((mission) => (
            <li key={mission.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-blue-700">Commande #{mission.order_id.slice(0,8)}</div>
                <div className="text-slate-600 text-sm">Livrée le {mission.updated_at ? new Date(mission.updated_at).toLocaleString() : 'N/A'}</div>
                <div className="text-slate-500 text-xs">Client: {mission.orders?.customer_name || 'N/A'}</div>
                <div className="text-slate-500 text-xs">Adresse: {mission.orders?.delivery_address || 'N/A'}</div>
              </div>
              <div className="mt-2 md:mt-0 text-emerald-600 font-bold">Statut: Livrée</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
