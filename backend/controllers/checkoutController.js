import { getUserOrdersService, processPaymentService } from '../services/checkoutService.js'
import { HttpError, normalizeError } from '../utils/httpError.js'

export const processPayment = async (req, res) => {
    try {
        const result = await processPaymentService(req.body)
        return res.status(200).json(result)
    } catch (error) {
        if (error instanceof HttpError && error.status === 402 && error.details?.transactionId === null) {
            return res.status(402).json({ error: error.message, transactionId: null })
        }

        const { status, payload } = normalizeError(error)
        return res.status(status).json(payload)
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const result = await getUserOrdersService(req.params.userId)
        return res.status(200).json(result)
    } catch (error) {
        const { status, payload } = normalizeError(error)
        return res.status(status).json(payload)
    }
};
