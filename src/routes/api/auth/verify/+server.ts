import { findUserByToken, updateLastSeen } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return json({ error: 'Token required' }, { status: 400 })
    }

    // Validate token format (64 hex characters)
    const tokenRegex = /^[a-f0-9]{64}$/
    if (!tokenRegex.test(token)) {
      return json(
        { valid: false, error: 'Invalid token format' },
        { status: 400 },
      )
    }

    // Find user by token
    const user = findUserByToken(token)

    if (!user) {
      return json({ valid: false, error: 'Token not found' })
    }

    // Update last seen timestamp
    updateLastSeen(user.id)

    console.log('User verified:', user.username)

    return json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        token: user.token,
      },
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    return json({ error: 'Token verification failed' }, { status: 500 })
  }
}
