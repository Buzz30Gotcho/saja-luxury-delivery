import express from 'express'
import {
    assignCourierToOrder,
    getAvailableMissions,
    acceptMission,
    getCourierMissions,
    getCourierStats,
    updateCourierAvailability,
    getDeliveryTracking,
    updateDeliveryStatus,
    simulateDeliveryStep,
    recalculateCourierStats,
} from '../controllers/deliveryController.js'

const router = express.Router()

// Assigner un coursier à une commande
router.post('/assign/:orderId', assignCourierToOrder)

// Lister les missions en attente de coursier
router.get('/missions/available', getAvailableMissions)

// Accepter une mission coursier
router.post('/accept/:orderId', acceptMission)

// Récupérer les missions du coursier (actives + historique)
router.get('/missions/courier/:courierId', getCourierMissions)

// Récupérer les stats consolidées du coursier
router.get('/courier/:courierId/stats', getCourierStats)

// Mettre à jour la disponibilité du coursier
router.patch('/courier/:courierId/availability', updateCourierAvailability)

// Récupérer le tracking d'une livraison
router.get('/track/:orderId', getDeliveryTracking)

// Mettre à jour le statut de livraison
router.patch('/status/:orderId', updateDeliveryStatus)

// Simuler une étape de déplacement du coursier (pour tests/démo)
router.post('/simulate-step/:orderId', simulateDeliveryStep)

// Admin: Recalculer les stats d'un coursier à partir de ses livraisons complétées
router.get('/admin/recalculate/:email', recalculateCourierStats)

export default router
