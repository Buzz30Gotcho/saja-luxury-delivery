import supabase from '../supabaseClient.js'
import { createHttpError } from '../utils/httpError.js'

export async function getCartByUser(userId) {
    if (!userId) throw createHttpError(401, 'Utilisateur non authentifié pour le panier')

    const { data, error } = await supabase
        .from('cart_items')
        .select(
            `
        id,
        quantity,
        products:product_id (
          id,
          name,
          price,
          image,
          shop_id
        )
      `
        )
        .eq('user_id', userId)

    if (error) throw createHttpError(500, error.message)
    return data
}

export async function addCartItem(userId, { product_id, quantity }) {
    if (!userId) throw createHttpError(401, 'Utilisateur non authentifié pour le panier')
    if (!product_id || !quantity) throw createHttpError(400, 'product_id and quantity are required')

    const { data: existingItem, error: selectError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .maybeSingle()

    if (selectError) throw createHttpError(500, selectError.message)

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity

        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id)
            .select()
            .single()

        if (error) throw createHttpError(500, error.message)

        return { status: 200, data }
    }

    const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id, quantity }])
        .select()
        .single()

    if (error) throw createHttpError(500, error.message)

    return { status: 201, data }
}

export async function updateCartItemById(userId, id, quantity) {
    if (!userId) throw createHttpError(401, 'Utilisateur non authentifié pour le panier')

    if (!quantity || quantity <= 0) {
        return removeCartItemById(userId, id)
    }

    const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw createHttpError(500, error.message)
    if (!data) throw createHttpError(404, 'Cart item not found')

    return { status: 200, data }
}

export async function removeCartItemById(userId, id) {
    if (!userId) throw createHttpError(401, 'Utilisateur non authentifié pour le panier')

    const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw createHttpError(500, error.message)
    if (!data) throw createHttpError(404, 'Cart item not found or already deleted')

    return { status: 200, data: { success: true, deleted: data } }
}

export async function clearCartByUser(userId) {
    if (!userId) throw createHttpError(401, 'Utilisateur non authentifié pour le panier')

    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId)
    if (error) throw createHttpError(500, error.message)

    return { success: true, message: 'Cart cleared' }
}
