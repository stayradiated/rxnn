import { randomBytes } from 'node:crypto'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod/v4'
import { zfd } from 'zod-form-data'
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '$lib/auth'
import {
  createUser,
  findUserByToken,
  isUsernameAvailable,
} from '$lib/platform-database'

import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
  if (locals.user) {
    redirect(303, '/feed')
  }
}) satisfies PageServerLoad

const createAccountSchema = zfd.formData({
  username: zfd.text(
    z
      .string()
      .trim()
      .min(2, 'Username must be at least 2 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens',
      ),
  ),
})

const verifyTokenSchema = zfd.formData({
  token: zfd.text(
    z
      .string()
      .trim()
      .min(20, 'Invalid token format')
      .max(40, 'Invalid token format')
      .regex(/^[A-Za-z0-9_-]+$/, 'Invalid token format'),
  ),
})

export const actions: Actions = {
  createAccount: async (event) => {
    const { request } = event

    const formData = await request.formData()
    const { username } = createAccountSchema.parse(formData)

    // Check if requested username is available
    if (!isUsernameAvailable(username)) {
      return fail(400, { error: 'Username is already taken' })
    }

    // Generate secure token using base64url encoding for shorter length
    // 20 bytes = 160 bits of entropy, base64url encoded = ~27 characters
    const token = randomBytes(20).toString('base64url')

    // Create user in database
    const user = createUser(token, username)

    // Create session for the new user
    const sessionToken = generateSessionToken()
    const session = createSession(sessionToken, user.id)

    // Set session cookie
    setSessionTokenCookie(event, sessionToken, session.expiresAt)

    return {
      success: true,
      token,
      username,
      userId: user.id,
    }
  },

  verifyToken: async (event) => {
    const { request } = event

    const formData = await request.formData()
    const { token } = verifyTokenSchema.parse(formData)

    // Find user by token
    const user = findUserByToken(token)

    if (!user) {
      return fail(400, { error: 'Invalid token. Please check and try again.' })
    }

    // Create and set session cookie for token login
    const sessionToken = generateSessionToken()
    const session = createSession(sessionToken, user.id)
    setSessionTokenCookie(event, sessionToken, session.expiresAt)

    // Redirect to feed after successful login
    redirect(303, '/feed')
  },
}
