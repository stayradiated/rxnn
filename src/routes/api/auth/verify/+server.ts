import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
  validateSessionToken,
} from '$lib/auth'
import { findUserByToken, updateLastSeen } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async (event) => {
  const { request } = event
  try {
    const { token, sessionToken } = await request.json()

    if (
      (!token && !sessionToken) ||
      (token && typeof token !== 'string') ||
      (sessionToken && typeof sessionToken !== 'string')
    ) {
      return json({ error: 'Token or sessionToken required' }, { status: 400 })
    }

    // Try session token first (preferred method)
    if (sessionToken) {
      const result = validateSessionToken(sessionToken)

      if (result.session && result.user) {
        // Update last seen timestamp
        updateLastSeen(result.user.id)

        console.log('User verified via session:', result.user.username)

        return json({
          valid: true,
          user: {
            id: result.user.id,
            username: result.user.username,
            avatar: result.user.avatar,
            token: result.user.token,
          },
        })
      }
    }

    // Fallback to legacy token verification
    if (token) {
      // Validate token format (base64url encoded, ~27 characters)
      // Base64url uses A-Z, a-z, 0-9, -, _ characters
      const tokenRegex = /^[A-Za-z0-9_-]+$/
      if (!tokenRegex.test(token) || token.length < 20 || token.length > 40) {
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

      // Create and set session cookie for legacy token login
      const newSessionToken = generateSessionToken()
      const session = createSession(newSessionToken, user.id)
      setSessionTokenCookie(event, newSessionToken, session.expiresAt)

      console.log('User verified via legacy token:', user.username)

      return json({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          token: user.token,
        },
      })
    }

    return json({ valid: false, error: 'No valid authentication provided' })
  } catch (error) {
    console.error('Error verifying token:', error)
    return json({ error: 'Token verification failed' }, { status: 500 })
  }
}
