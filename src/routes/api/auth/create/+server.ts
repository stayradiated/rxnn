import { createUser, isUsernameAvailable } from '$lib/platform-database'
import { generateUniqueUsername } from '$lib/username-generator'
import { randomBytes } from 'node:crypto'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse request body for optional username and avatar
    let requestData = {}
    try {
      requestData = await request.json()
    } catch {
      // No body provided, use defaults
    }

    const { username: requestedUsername, avatar: requestedAvatar } = requestData

    // Generate secure token using base64url encoding for shorter length
    // 20 bytes = 160 bits of entropy, base64url encoded = ~27 characters
    const token = randomBytes(20).toString('base64url')

    let username = requestedUsername
    const avatar = requestedAvatar || '😊'

    // If no username provided or invalid, generate one
    if (
      !username ||
      typeof username !== 'string' ||
      username.trim().length === 0
    ) {
      username = generateUniqueUsername((name) => isUsernameAvailable(name))
    } else {
      username = username.trim()

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
    }

    // Basic avatar validation (if provided)
    if (
      requestedAvatar &&
      (typeof requestedAvatar !== 'string' || requestedAvatar.length > 10)
    ) {
      return json(
        { error: 'Avatar must be a string with maximum 10 characters' },
        { status: 400 },
      )
    }

    // Create user in database
    const user = createUser(token, username, avatar)

    console.log('Created new user:', username, 'with avatar:', avatar)

    return json({
      success: true,
      token,
      username,
      avatar,
      userId: user.id,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return json({ error: 'Failed to create user account' }, { status: 500 })
  }
}
