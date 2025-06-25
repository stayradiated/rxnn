import { invalidateSession, validateSessionToken } from '$lib/auth'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken || typeof sessionToken !== 'string') {
      return json({ error: 'Session token required' }, { status: 400 })
    }

    // Validate and get session
    const result = validateSessionToken(sessionToken)

    if (result.session) {
      // Invalidate the session
      invalidateSession(result.session.id)
      console.log('Session invalidated for user:', result.user?.username)
    }

    return json({ success: true })
  } catch (error) {
    console.error('Error during logout:', error)
    return json({ error: 'Logout failed' }, { status: 500 })
  }
}
