import express from 'express'
import productsRouter from './products.js'
import shopsRouter from './shops.js'
import cartRouter from './cart.js'
import checkoutRouter from './checkout.js'
const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Ydays backend running' })
})

router.use('/products', productsRouter)
router.use('/shops', shopsRouter)
router.use('/cart', cartRouter)
router.use('/checkout', checkoutRouter)

export default router
