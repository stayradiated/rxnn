import {
  deletePost,
  getCommentsForPost,
  getPollAggregates,
  getPostById,
  getUserPollResponse,
  updatePost,
} from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const postId = Number.parseInt(params.id)
    if (Number.isNaN(postId)) {
      return json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Authentication is optional for viewing posts
    const user = locals.user

    // Get post details
    const post = getPostById(postId)
    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 })
    }

    // Get comments
    const comments = getCommentsForPost(postId)

    // Get poll results and user's response if it's a poll
    let pollResults = null
    let userResponse = null

    if (post.post_type !== 'text') {
      pollResults = getPollAggregates(postId)

      if (user) {
        userResponse = getUserPollResponse(user.id, postId)
      }
    }

    return json({
      success: true,
      post: {
        ...post,
        comments,
        pollResults,
        userResponse,
      },
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const postId = Number.parseInt(params.id)
    if (Number.isNaN(postId)) {
      return json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const { title, content, postType, pollConfig } = await request.json()

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return json({ error: 'Title is required' }, { status: 400 })
    }

    if (!postType || typeof postType !== 'string') {
      return json({ error: 'Post type is required' }, { status: 400 })
    }

    // Validate post type
    const validPostTypes = ['text', 'radio', 'scale']
    if (!validPostTypes.includes(postType)) {
      return json({ error: 'Invalid post type' }, { status: 400 })
    }

    // Validate content requirement for text posts
    if (postType === 'text' && (!content || content.trim().length === 0)) {
      return json(
        { error: 'Content is required for text posts' },
        { status: 400 },
      )
    }

    // Validate poll configuration for poll posts
    if (postType !== 'text') {
      if (!pollConfig) {
        return json(
          { error: 'Poll configuration is required for polls' },
          { status: 400 },
        )
      }

      if (postType === 'radio') {
        if (
          !pollConfig.options ||
          !Array.isArray(pollConfig.options) ||
          pollConfig.options.length < 2
        ) {
          return json(
            { error: 'Radio polls need at least 2 options' },
            { status: 400 },
          )
        }
      } else if (postType === 'scale') {
        if (
          typeof pollConfig.min !== 'number' ||
          typeof pollConfig.max !== 'number' ||
          pollConfig.min >= pollConfig.max
        ) {
          return json(
            { error: 'Scale polls need valid min and max values' },
            { status: 400 },
          )
        }
      }
    }

    // Update the post
    const updatedPost = updatePost(
      postId,
      user.id,
      title.trim(),
      content ? content.trim() : null,
      postType,
      pollConfig,
    )

    console.log('Post updated by', user.username, 'for post', postId)

    return json({
      success: true,
      post: updatedPost,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Post not found') {
        return json({ error: 'Post not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return json(
          { error: 'Unauthorized: You can only edit your own posts' },
          { status: 403 },
        )
      }
    }

    console.error('Error updating post:', error)
    return json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const postId = Number.parseInt(params.id)

    // Validate input
    if (!postId || Number.isNaN(postId)) {
      return json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Delete the post
    const result = deletePost(postId, user.id)

    console.log('Post deleted by', user.username, 'post ID', postId)

    return json(result)
  } catch (error) {
    console.error('Error deleting post:', error)

    if (error instanceof Error) {
      if (error.message === 'Post not found') {
        return json({ error: 'Post not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
