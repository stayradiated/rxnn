import { deleteComment, updateComment } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const commentId = Number.parseInt(params.id)
    const { content } = await request.json()

    // Validate input
    if (!commentId || Number.isNaN(commentId)) {
      return json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Update the comment
    const updatedComment = updateComment(commentId, user.id, content.trim())

    console.log('Comment updated by', user.username, 'comment ID', commentId)

    return json({
      success: true,
      comment: {
        ...updatedComment,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Error updating comment:', error)

    if (error instanceof Error) {
      if (error.message === 'Comment not found') {
        return json({ error: 'Comment not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const commentId = Number.parseInt(params.id)

    // Validate input
    if (!commentId || Number.isNaN(commentId)) {
      return json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    // Delete the comment
    const result = deleteComment(commentId, user.id)

    console.log('Comment deleted by', user.username, 'comment ID', commentId)

    return json(result)
  } catch (error) {
    console.error('Error deleting comment:', error)

    if (error instanceof Error) {
      if (error.message === 'Comment not found') {
        return json({ error: 'Comment not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
