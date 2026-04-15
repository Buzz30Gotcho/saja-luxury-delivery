import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productsService.js'
import { normalizeError } from '../utils/httpError.js'

export async function getAll(req, res) {
  try {
    const data = await getAllProducts()
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function getById(req, res) {
  const { id } = req.params
  try {
    const data = await getProductById(id)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function create(req, res) {
  const payload = req.body
  try {
    const data = await createProduct(payload)
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
    const data = await updateProduct(id, payload)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}

export async function remove(req, res) {
  const { id } = req.params
  try {
    const data = await deleteProduct(id)
    return res.json(data)
  } catch (err) {
    const { status, payload } = normalizeError(err)
    return res.status(status).json(payload)
  }
}
