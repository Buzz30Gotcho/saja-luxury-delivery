import {
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} from '../services/shopsService.js'
import { normalizeError } from '../utils/httpError.js'

export async function getAll(req, res) {
  try {
    const data = await getAllShops()
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}


export async function getById(req, res) {
  const { id } = req.params
  try {
    const data = await getShopById(id)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}


// CREATE SHOP
export async function create(req, res) {
  try {
    const userId = req.user?.id
    const payload = req.body

    const data = await createShop(userId, payload)

    return res.status(201).json(data)

  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function update(req, res) {
  const { id } = req.params
  const payload = req.body
  try {
    const data = await updateShop(id, payload)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function remove(req, res) {
  const { id } = req.params

  try {
    const data = await deleteShop(id)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

