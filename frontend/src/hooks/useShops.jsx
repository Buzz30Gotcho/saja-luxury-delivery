import { useState, useEffect } from 'react';
import { shopService } from '../services/shopService';

export const useShops = (category = null, deliveryMode = null) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;
        
        console.log('Fetching shops with category:', category);
        
        if (category && category !== 'Toutes') {
          data = await shopService.getShopsByCategory(category);
        } else {
          data = await shopService.getAllShops();
        }

        console.log('Shops fetched:', data);

        // Filtrage selon le mode de livraison (si spécifié et si les données existent)
        if (deliveryMode === 'delivery') {
          data = data.filter(shop => shop.deliveryAvailable !== false);
        } else if (deliveryMode === 'pickup') {
          data = data.filter(shop => shop.pickupAvailable !== false);
        }

        setShops(data);
      } catch (err) {
        const errorMessage = err.message || 'Erreur lors du chargement des boutiques';
        setError(errorMessage);
        console.error('Error fetching shops:', err);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [category, deliveryMode]);

  return { shops, loading, error };
};