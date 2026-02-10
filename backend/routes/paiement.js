import express from 'express'
import * as paiementController from '../controllers/paiementController.js'
const router = express.Router()

router.post('/', paiementController.createPaymentIntent)
export default router