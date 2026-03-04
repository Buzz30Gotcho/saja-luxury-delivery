import express from 'express'
import * as checkoutController from '../controllers/checkoutController.js'

const router = express.Router()

router.post('/', checkoutController.processPayment)

export default router
