import { findOrCreateUser, getUserResponses } from '$lib/database'
import { randomBytes } from 'node:crypto'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get('token')

  if (!token) {
    const newToken = randomBytes(32).toString('hex')
    throw redirect(302, `/survey?token=${newToken}`)
  }

  // Validate token format (64 hex characters)
  const tokenRegex = /^[a-f0-9]{64}$/
  if (!tokenRegex.test(token)) {
    const newToken = randomBytes(32).toString('hex')
    throw redirect(302, `/survey?token=${newToken}`)
  }

  try {
    // Find or create user and load existing responses
    const user = findOrCreateUser(token)
    const responses = getUserResponses(user.id)

    return {
      token,
      responses,
    }
  } catch (error) {
    console.error('Database error in survey load:', error)
    // Fallback to new token on database error
    const newToken = randomBytes(32).toString('hex')
    throw redirect(302, `/survey?token=${newToken}`)
  }
}
