import express from 'express'
import productsRouter from './products.js'
import shopsRouter from './shops.js'
import cartRouter from './cart.js'
import paiementRouter from './paiement.js'
const router = express.Router()

router.use('/products', productsRouter)
router.use('/shops', shopsRouter)
router.use('/cart', cartRouter)
router.use('/paiement', paiementRouter) // Corrected and removed duplicate

export default router
