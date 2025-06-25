import { findUserByToken } from '$lib/platform-database'

export interface AuthenticatedUser {
  id: number
  token: string
  username: string
}

export async function authenticateRequest(
  request: Request,
): Promise<AuthenticatedUser | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    let token: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Try to get token from request body
      const body = await request.json()
      token = body.token
    }

    if (!token) {
      return null
    }

    // Validate token format
    const tokenRegex = /^[a-f0-9]{64}$/
    if (!tokenRegex.test(token)) {
      return null
    }

    // Find user
    const user = findUserByToken(token)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      token: user.token,
      username: user.username,
    }
  } catch (_error) {
    return null
  }
}

export function requireAuth(user: AuthenticatedUser | null): AuthenticatedUser {
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
