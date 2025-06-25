import { authenticateRequest, requireAuth } from '$lib/auth-helper'
import { createComment, getPostById } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const user = await authenticateRequest(request)
    requireAuth(user)

    const { postId, content } = await request.json()

    // Validate input
    if (!postId || typeof postId !== 'number') {
      return json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Verify post exists
    const post = getPostById(postId)
    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 })
    }

    // Create the comment
    const comment = createComment(user?.id, postId, content.trim())

    console.log('Comment created by', user?.username, 'on post', postId)

    return json({
      success: true,
      comment: {
        ...comment,
        username: user?.username,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    console.error('Error creating comment:', error)
    return json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
