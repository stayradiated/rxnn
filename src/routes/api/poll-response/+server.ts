import {
  getPollAggregates,
  getPostById,
  submitPollResponse,
} from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = locals.user
    const { postId, responseData } = await request.json()

    // Validate input
    if (!postId || typeof postId !== 'number') {
      return json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (!responseData) {
      return json({ error: 'Response data is required' }, { status: 400 })
    }

    // Verify post exists and is a poll
    const post = getPostById(postId)
    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.post_type === 'text') {
      return json(
        { error: 'Cannot submit poll response to text post' },
        { status: 400 },
      )
    }

    // Submit the response
    submitPollResponse(user.id, postId, responseData)

    // Get updated poll aggregates (no raw data exposed)
    const pollResults = getPollAggregates(postId)

    // Only include poll results if there are at least 5 total responses
    const includeResults = pollResults && pollResults.totalResponses >= 5

    console.log('Poll response submitted by', user.username, 'for post', postId)

    return json({
      success: true,
      pollResults: includeResults ? pollResults : null,
    })
  } catch (error) {
    console.error('Error submitting poll response:', error)
    return json({ error: 'Failed to submit response' }, { status: 500 })
  }
}
