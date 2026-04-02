import { supabase } from '../lib/supabaseClient';

export const shopService = {
  async getAllShops() {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(shop => ({
        ...shop,
        deliveryAvailable: true, // Defaulting to true as columns don't exist yet
        pickupAvailable: true,
        isOpen: shop.is_active !== false
      }));
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  },

  async getShopsByCategory(category) {
    try {
      // Requête avec eq pour une correspondance exacte
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`Fetched shops for category "${category}":`, data);

      return data.map(shop => ({
        ...shop,
        deliveryAvailable: shop.delivery_available === false ? false : true,
        pickupAvailable: shop.pickup_available === false ? false : true,
        isOpen: shop.is_open === false ? false : true
      }));
    } catch (error) {
      console.error('Error fetching shops by category:', error);
      throw error;
    }
  },

  async getShopById(id) {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          products (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        deliveryAvailable: data.delivery_available === false ? false : true,
        pickupAvailable: data.pickup_available === false ? false : true,
        isOpen: data.is_open === false ? false : true
      };
    } catch (error) {
      console.error('Error fetching shop by id:', error);
      throw error;
    }
  },

  async searchShops(query) {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .textSearch('name', query);

      if (error) throw error;
      if (!data) return [];

      return data.map(shop => ({
        ...shop,
        deliveryAvailable: shop.delivery_available === false ? false : true,
        pickupAvailable: shop.pickup_available === false ? false : true,
        isOpen: shop.is_open === false ? false : true
      }));
    } catch (error) {
      console.error('Error searching shops:', error);
      throw error;
    }
  }
};