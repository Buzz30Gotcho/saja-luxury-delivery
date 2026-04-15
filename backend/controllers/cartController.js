import {
  addCartItem,
  clearCartByUser,
  getCartByUser,
  removeCartItemById,
  updateCartItemById,
} from '../services/cartService.js'
import { getUserIdFromRequest } from '../utils/user.js'
import { normalizeError } from '../utils/httpError.js'

export async function getCart(req, res) {
  const userId = getUserIdFromRequest(req)
  try {
    const data = await getCartByUser(userId)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function addItemToCart(req, res) {
  const userId = getUserIdFromRequest(req)

  try {
    const result = await addCartItem(userId, req.body)
    return res.status(result.status).json(result.data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function updateCartItem(req, res) {
  const userId = getUserIdFromRequest(req)
  const { id } = req.params
  const { quantity } = req.body

  try {
    const result = await updateCartItemById(userId, id, quantity)
    return res.status(result.status).json(result.data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function removeCartItem(req, res) {
  const userId = getUserIdFromRequest(req)
  const { id } = req.params

  try {
    const result = await removeCartItemById(userId, id)
    return res.status(result.status).json(result.data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function clearCart(req, res) {
  const userId = getUserIdFromRequest(req)

  try {
    const data = await clearCartByUser(userId)
    return res.status(200).json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}
