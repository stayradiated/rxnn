import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '$lib/auth'
import { createUser, isUsernameAvailable } from '$lib/platform-database'
import { randomBytes } from 'node:crypto'
import { json } from '@sveltejs/kit'
import { z } from 'zod/v4'
import type { RequestHandler } from './$types'

const $RequestBody = z.object({
  username: z.string(),
})

export const POST: RequestHandler = async (event) => {
  const { request } = event

  // Parse request body for optional username
  const requestData = $RequestBody.parse(await request.json())

  const { username: requestedUsername } = requestData

  // Generate secure token using base64url encoding for shorter length
  // 20 bytes = 160 bits of entropy, base64url encoded = ~27 characters
  const token = randomBytes(20).toString('base64url')

  const username = requestedUsername.trim()

  // Check if requested username is available
  if (!isUsernameAvailable(username)) {
    return json({ error: 'Username is already taken' }, { status: 400 })
  }

  // Basic username validation
  if (username.length < 2 || username.length > 30) {
    return json(
      { error: 'Username must be between 2 and 30 characters' },
      { status: 400 },
    )
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return json(
      {
        error:
          'Username can only contain letters, numbers, underscores, and hyphens',
      },
      { status: 400 },
    )
  }

  // Create user in database
  const user = createUser(token, username)

  // Create session for the new user
  const sessionToken = generateSessionToken()
  const session = createSession(sessionToken, user.id)

  // Set session cookie
  setSessionTokenCookie(event, sessionToken, session.expiresAt)

  console.log('Created new user:', username)

  return json({
    success: true,
    token,
    sessionToken,
    username,
    userId: user.id,
  })
}
