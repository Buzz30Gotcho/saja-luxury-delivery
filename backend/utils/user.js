export function getUserIdFromRequest(req) {
    if (req.user?.id) return req.user.id

    const headerUserId = req.headers['x-user-id']
    const queryUserId = req.query?.user_id
    const bodyUserId = req.body?.user_id
    const rawUserId = headerUserId || queryUserId || bodyUserId

    if (typeof rawUserId !== 'string') return null

    const uuidV4LikeRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    return uuidV4LikeRegex.test(rawUserId) ? rawUserId : null
}
