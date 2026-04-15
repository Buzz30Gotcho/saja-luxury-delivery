import supabase from '../supabaseClient.js'
import { createHttpError } from '../utils/httpError.js'

export async function getAllShops() {
    const { data, error } = await supabase.from('shops').select('*')
    if (error) throw createHttpError(500, error.message)
    return data
}

export async function getShopById(id) {
    const { data, error } = await supabase.from('shops').select('*').eq('id', id).single()

    if (error) {
        if (error.code === 'PGRST116') throw createHttpError(404, 'Not found')
        throw createHttpError(500, error.message)
    }

    return data
}

export async function createShop(userId, payload) {
    if (!userId) throw createHttpError(401, 'Unauthorized')

    if (!payload?.name || !payload?.category || !payload?.city) {
        throw createHttpError(400, 'Missing required fields')
    }

    const shopData = {
        ...payload,
        owner_id: userId,
    }

    const { data, error } = await supabase
        .from('shops')
        .insert([shopData])
        .select()
        .single()

    if (error) throw createHttpError(400, error.message)

    return data
}

export async function updateShop(id, payload) {
    const { data, error } = await supabase.from('shops').update(payload).eq('id', id).select().single()
    if (error) throw createHttpError(500, error.message)
    return data
}

export async function deleteShop(id) {
    const { data, error } = await supabase
        .from('shops')
        .delete()
        .eq('id', id)
        .select()

    if (error) throw createHttpError(500, error.message)

    if (!data || data.length === 0) {
        throw createHttpError(404, 'Shop not found or not allowed to delete')
    }

    return { success: true, deleted: data[0] }
}
