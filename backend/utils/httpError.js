export class HttpError extends Error {
    constructor(status, message, details = null) {
        super(message)
        this.name = 'HttpError'
        this.status = status
        this.details = details
    }
}

export function createHttpError(status, message, details = null) {
    return new HttpError(status, message, details)
}

export function normalizeError(error) {
    if (error instanceof HttpError) {
        return {
            status: error.status,
            payload: {
                error: error.message,
                ...(error.details ? { details: error.details } : {}),
            },
        }
    }

    return {
        status: 500,
        payload: { error: error?.message || 'Une erreur serveur est survenue.' },
    }
}
