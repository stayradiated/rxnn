import { createUser, isUsernameAvailable } from '$lib/platform-database'
import { generateUniqueUsername } from '$lib/username-generator'
import { randomBytes } from 'node:crypto'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async () => {
  try {
    // Generate secure token
    const token = randomBytes(32).toString('hex')

    // Generate unique username
    const username = generateUniqueUsername((name) => isUsernameAvailable(name))

    // Create user in database
    const user = createUser(token, username)

    console.log('Created new user:', username)

    return json({
      success: true,
      token,
      username,
      userId: user.id,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return json({ error: 'Failed to create user account' }, { status: 500 })
  }
}
