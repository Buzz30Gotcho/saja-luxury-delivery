import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRouter from './routes/index.js'
import * as webhookController from './controllers/webhookController.js'; // Import webhookController directly

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')))

// SPA fallback - serve index.html for all unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server listening : http://localhost:${port}`)
})
