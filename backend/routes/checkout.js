import express from 'express'
import * as checkoutController from '../controllers/checkoutController.js'

const router = express.Router()

router.post('/', checkoutController.processPayment)
router.get('/:userId', checkoutController.getUserOrders)

export default router
