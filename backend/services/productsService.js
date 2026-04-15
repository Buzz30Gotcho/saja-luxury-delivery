import supabase from '../supabaseClient.js'
import { createHttpError } from '../utils/httpError.js'

export async function getAllProducts() {
    const { data, error } = await supabase.from('products').select('*')
    if (error) throw createHttpError(500, error.message)
    return data
}

export async function getProductById(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

    if (error) {
        if (error.code === 'PGRST116') throw createHttpError(404, 'Not found')
        throw createHttpError(500, error.message)
    }

    return data
}

export async function createProduct(payload) {
    if (!payload) throw createHttpError(400, 'Missing request body')

    const { data, error } = await supabase.from('products').insert([payload]).select().single()
    if (error) throw createHttpError(500, error.message)
    return data
}

export async function updateProduct(id, payload) {
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
    if (error) throw createHttpError(500, error.message)
    return data
}

export async function deleteProduct(id) {
    const { data, error } = await supabase.from('products').delete().eq('id', id).select().single()
    if (error) throw createHttpError(500, error.message)
    return { success: true, deleted: data }
}
