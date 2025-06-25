import { isUsernameAvailable, updateUserProfile } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const { username, avatar } = await request.json()

    // Validate that at least one field is being updated
    if (username === undefined && avatar === undefined) {
      return json(
        { error: 'At least one field (username or avatar) must be provided' },
        { status: 400 },
      )
    }

    // Validate username if provided
    if (username !== undefined) {
      if (typeof username !== 'string' || username.trim().length === 0) {
        return json(
          { error: 'Username must be a non-empty string' },
          { status: 400 },
        )
      }

      const trimmedUsername = username.trim()

      // Basic username validation
      if (trimmedUsername.length < 2 || trimmedUsername.length > 30) {
        return json(
          { error: 'Username must be between 2 and 30 characters' },
          { status: 400 },
        )
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
        return json(
          {
            error:
              'Username can only contain letters, numbers, underscores, and hyphens',
          },
          { status: 400 },
        )
      }

      // Check if username is available (excluding current user)
      if (!isUsernameAvailable(trimmedUsername, user.id)) {
        return json({ error: 'Username is already taken' }, { status: 400 })
      }
    }

    // Validate avatar if provided
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.length > 10) {
        return json(
          { error: 'Avatar must be a string with maximum 10 characters' },
          { status: 400 },
        )
      }
    }

    // Update user profile
    const updatedUser = updateUserProfile(
      user.id,
      username ? username.trim() : undefined,
      avatar,
    )

    console.log(
      'User profile updated:',
      user.username,
      '->',
      updatedUser.username,
    )

    return json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        updated_at: updatedUser.updated_at,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return json({ error: 'User not found' }, { status: 404 })
    }

    console.error('Error updating user profile:', error)
    return json({ error: 'Failed to update user profile' }, { status: 500 })
  }
}
