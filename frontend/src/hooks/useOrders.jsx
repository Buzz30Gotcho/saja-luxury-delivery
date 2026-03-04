import { useState, useEffect } from 'react';

export const useOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/checkout/${userId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des commandes');
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading, error };
};
