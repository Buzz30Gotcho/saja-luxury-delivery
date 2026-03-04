const BASE_URL = '/api' // Use relative URL that works on all environments (dev + prod)

function getSupabaseAccessToken() {
  try {
    const storageKey = Object.keys(localStorage).find((key) => key.endsWith('-auth-token'))
    if (!storageKey) return null
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return parsed?.access_token || null
  } catch {
    return null
  }
}

function getAuthenticatedUserId() {
  try {
    const storageKey = Object.keys(localStorage).find((key) => key.endsWith('-auth-token'))
    if (!storageKey) return null
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return parsed?.user?.id || null
  } catch {
    return null
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const accessToken = getSupabaseAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

export function getCart() {
  const userId = getAuthenticatedUserId()
  return request(userId ? `/cart?user_id=${encodeURIComponent(userId)}` : '/cart')
}

export function addItemToCart(item) {
  const userId = getAuthenticatedUserId()
  return request('/cart', {
    method: 'POST',
    body: JSON.stringify({ ...item, user_id: userId }),
  })
}

export function updateCartItem(id, payload) {
  const userId = getAuthenticatedUserId()
  return request(`/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...payload, user_id: userId }),
  })
}

export function removeCartItem(id) {
  const userId = getAuthenticatedUserId()
  return request(`/cart/${id}`, {
    method: 'DELETE',
    headers: userId ? { 'x-user-id': userId } : {},
  })
}

export function clearCart() {
  const userId = getAuthenticatedUserId()
  return request('/cart', {
    method: 'DELETE',
    headers: userId ? { 'x-user-id': userId } : {},
  })
}
