import { supabase } from '../lib/supabaseClient'

export const productService = {
  async getProductsByShop(shopId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, shops(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getProductsByCategory(category) {
    const { data, error } = await supabase
      .from('products')
      .select('*, shops(*)')
      .ilike('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}