import { authenticateRequest } from '$lib/auth-helper'
import {
  getCommentsForPost,
  getPollResults,
  getPostById,
  getUserPollResponse,
} from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, request }) => {
  try {
    const postId = Number.parseInt(params.id)
    if (Number.isNaN(postId)) {
      return json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const user = await authenticateRequest(request)

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
      pollResults = getPollResults(postId)

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
