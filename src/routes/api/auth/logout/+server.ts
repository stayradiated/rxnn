import { invalidateSession } from '$lib/auth'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
  if (locals.session) {
    // Invalidate the session
    invalidateSession(locals.session.id)
    console.log('Session invalidated for user:', locals.user?.username)
    return json({ success: true })
  }
  return json({ success: false })
}
