import { supabase } from '../lib/supabaseClient'

const BASE_URL = '/api' // Use relative URL that works on all environments (dev + prod)

async function getAuthContext(explicitUserId = null) {
  try {
    const { data } = await supabase.auth.getSession()
    const session = data?.session || null
    return {
      accessToken: session?.access_token || null,
      userId: explicitUserId || session?.user?.id || null,
    }
  } catch {
    return { accessToken: null, userId: explicitUserId || null }
  }
}

async function request(endpoint, options = {}, explicitUserId = null) {
  const url = `${BASE_URL}${endpoint}`
  const { accessToken, userId } = await getAuthContext(explicitUserId)
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) // Catch if response is not json
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  // For DELETE requests with no content, or other methods that might not return JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null
  }

  return response.json()
}

export function getCart(userId = null) {
  return request(userId ? `/cart?user_id=${encodeURIComponent(userId)}` : '/cart', {}, userId)
}

export function addItemToCart(item, userId = null) {
  return request('/cart', {
    method: 'POST',
    body: JSON.stringify({ ...item, user_id: userId }),
  }, userId)
}

export function updateCartItem(id, payload, userId = null) {
  return request(`/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...payload, user_id: userId }),
  }, userId)
}

export function removeCartItem(id, userId = null) {
  return request(`/cart/${id}`, {
    method: 'DELETE',
    headers: userId ? { 'x-user-id': userId } : {},
  }, userId)
}

export function clearCart(userId = null) {
  return request('/cart', {
    method: 'DELETE',
    headers: userId ? { 'x-user-id': userId } : {},
  }, userId)
}
