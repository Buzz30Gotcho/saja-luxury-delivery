import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRouter from './routes/index.js'
import * as webhookController from './controllers/webhookController.js'; // Import webhookController directly

dotenv.config()

const app = express()
app.use(cors())

// IMPORTANT: Stripe webhook endpoint must be defined BEFORE express.json()
// to ensure the raw body is available for signature verification.
app.post('/webhook', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

app.use(express.json())

app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'Ydays backend running' })
})

app.use('/', apiRouter)


const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server listening : http://localhost:${port}`)
})
