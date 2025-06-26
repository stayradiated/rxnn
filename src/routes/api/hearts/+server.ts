import { toggleHeart } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const { targetType, targetId } = await request.json()

    // Validate input
    if (!targetType || (targetType !== 'post' && targetType !== 'comment')) {
      return json(
        { error: 'Invalid target type. Must be "post" or "comment"' },
        { status: 400 },
      )
    }

    if (!targetId || typeof targetId !== 'number') {
      return json(
        { error: 'Target ID is required and must be a number' },
        { status: 400 },
      )
    }

    // Toggle the heart
    const result = toggleHeart(user.id, targetType, targetId)

    console.log(
      'Heart toggled by',
      user.username,
      'for',
      targetType,
      targetId,
      '- hearted:',
      result.hearted,
    )

    return json({
      success: true,
      hearted: result.hearted,
    })
  } catch (error) {
    console.error('Error toggling heart:', error)
    return json({ error: 'Failed to toggle heart' }, { status: 500 })
  }
}
