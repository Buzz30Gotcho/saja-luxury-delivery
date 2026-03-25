import express from 'express'
import {
    assignCourierToOrder,
    getDeliveryTracking,
    updateDeliveryStatus,
    simulateDeliveryStep,
} from '../controllers/deliveryController.js'

const router = express.Router()

// Assigner un coursier à une commande
router.post('/assign/:orderId', assignCourierToOrder)

// Récupérer le tracking d'une livraison
router.get('/track/:orderId', getDeliveryTracking)

// Mettre à jour le statut de livraison
router.patch('/status/:orderId', updateDeliveryStatus)

// Simuler une étape de déplacement du coursier (pour tests/démo)
router.post('/simulate-step/:orderId', simulateDeliveryStep)

export default router
