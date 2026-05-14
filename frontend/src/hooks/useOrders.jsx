import { useState, useEffect, useCallback } from 'react';

export const useOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      // Ajout d'un timestamp pour forcer le rafraîchissement (bypass cache)
      const response = await fetch(`/api/checkout/${userId}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("[useOrders] Fetch error:", err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refreshOrders: fetchOrders };
};
