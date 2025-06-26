import { invalidateSession } from '$lib/auth'
import {
  createComment,
  deleteComment,
  deletePost,
  getPlatformStats,
  getPollAggregates,
  getPostById,
  getPostsForFeedWithDetails,
  submitPollResponse,
  toggleHeart,
  updateComment,
} from '$lib/platform-database'
import { pollResponseDataSchema } from '$lib/schemas'
import { json } from '$lib/zod-helpers'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod/v4'
import { zfd } from 'zod-form-data'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    // If the user is not logged in, redirect to the login page
    throw redirect(303, '/login')
  }

  // Get posts for feed with comments and poll aggregates
  const posts = getPostsForFeedWithDetails(locals.user?.id)

  // Get platform statistics including user-specific unanswered questions
  const stats = getPlatformStats(locals.user.id)

  return {
    posts,
    stats,
    user: locals.user,
    session: locals.session,
  }
}

const submitPollResponseSchema = zfd.formData({
  postId: zfd.numeric(z.number().int().positive('Invalid post ID')),
  responseData: zfd.text(json(pollResponseDataSchema)),
})

const createCommentSchema = zfd.formData({
  postId: zfd.numeric(z.number().int().positive('Invalid post ID')),
  content: zfd.text(z.string().trim().min(1, 'Comment content is required')),
})

const toggleHeartSchema = zfd.formData({
  targetType: zfd.text(
    z.enum(['post', 'comment'], { message: 'Invalid target type' }),
  ),
  targetId: zfd.numeric(z.number().int().positive('Invalid target ID')),
})

const updateCommentSchema = zfd.formData({
  commentId: zfd.numeric(z.number().int().positive('Invalid comment ID')),
  content: zfd.text(z.string().trim().min(1, 'Comment content is required')),
})

const deleteCommentSchema = zfd.formData({
  commentId: zfd.numeric(z.number().int().positive('Invalid comment ID')),
})

const deletePostSchema = zfd.formData({
  postId: zfd.numeric(z.number().int().positive('Invalid post ID')),
})

export const actions: Actions = {
  submitPollResponse: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { postId, responseData } = submitPollResponseSchema.parse(formData)

    // Verify post exists and is a poll
    const post = getPostById(postId)
    if (!post) {
      return fail(404, { error: 'Post not found' })
    }

    if (post.post_type === 'text') {
      return fail(400, { error: 'Cannot submit poll response to text post' })
    }

    // Submit the response
    const submissionResult = submitPollResponse(
      locals.user.id,
      postId,
      responseData,
    )

    // Get updated poll aggregates (no raw data exposed)
    const pollResults = getPollAggregates(postId)

    // Only include poll results if there are at least 5 total responses
    const includeResults = pollResults && pollResults.totalResponses >= 5

    console.log(
      'Poll response submitted by',
      locals.user.username,
      'for post',
      postId,
      submissionResult.isNewResponse ? '(new)' : '(edit)',
    )

    return {
      success: true,
      pollResults: includeResults ? pollResults : null,
      isNewResponse: submissionResult.isNewResponse,
    }
  },

  createComment: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { postId, content } = createCommentSchema.parse(formData)

    // Verify post exists
    const post = getPostById(postId)
    if (!post) {
      return fail(404, { error: 'Post not found' })
    }

    // Create the comment
    const comment = createComment(locals.user.id, postId, content)

    console.log('Comment created by', locals.user.username, 'on post', postId)

    return {
      success: true,
      comment: {
        ...comment,
        username: locals.user.username,
      },
    }
  },

  toggleHeart: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { targetType, targetId } = toggleHeartSchema.parse(formData)

    // Toggle the heart
    const result = toggleHeart(locals.user.id, targetType, targetId)

    console.log(
      'Heart toggled by',
      locals.user.username,
      'for',
      targetType,
      targetId,
      '- hearted:',
      result.hearted,
    )

    return {
      success: true,
      hearted: result.hearted,
    }
  },

  updateComment: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { commentId, content } = updateCommentSchema.parse(formData)

    // Update the comment
    const updatedComment = updateComment(commentId, locals.user.id, content)

    console.log(
      'Comment updated by',
      locals.user.username,
      'comment ID',
      commentId,
    )

    return {
      success: true,
      comment: {
        ...updatedComment,
        username: locals.user.username,
      },
    }
  },

  deleteComment: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { commentId } = deleteCommentSchema.parse(formData)

    // Delete the comment
    const result = deleteComment(commentId, locals.user.id)

    console.log(
      'Comment deleted by',
      locals.user.username,
      'comment ID',
      commentId,
    )

    return result
  },

  logout: async ({ locals }) => {
    if (locals.session) {
      // Invalidate the session
      invalidateSession(locals.session.id)
      console.log('Session invalidated for user:', locals.user?.username)
    }

    // Redirect to login page after logout
    redirect(303, '/login')
  },

  deletePost: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { postId } = deletePostSchema.parse(formData)

    // Delete the post
    deletePost(postId, locals.user.id)

    console.log('Post deleted by', locals.user.username, 'post ID', postId)

    // Redirect to feed after successful deletion
    redirect(303, '/feed')
  },
}
