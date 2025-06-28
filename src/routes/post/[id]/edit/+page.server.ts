import { getPostById, updatePost } from '$lib/platform-database'
import { pollConfigSchema } from '$lib/schemas'
import { json } from '$lib/zod-helpers'
import { error, fail, redirect } from '@sveltejs/kit'
import { z } from 'zod/v4'
import { zfd } from 'zod-form-data'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const postId = Number.parseInt(params.id)
  if (Number.isNaN(postId)) {
    throw error(400, 'Invalid post ID')
  }

  // Get post details
  const post = getPostById(postId)
  if (!post) {
    throw error(404, 'Post not found')
  }

  // Only allow editing of text and poll posts (not if there are responses yet)
  // For now, we'll allow editing regardless, but this could be restricted later

  return {
    post: {
      id: post.id,
      title: post.title,
      content: post.content,
      post_type: post.post_type,
      poll_config: post.poll_config,
      user_id: post.user_id,
    },
  }
}

const updatePostSchema = zfd.formData({
  title: zfd.text(z.string().trim().min(1, 'Title is required')),
  content: zfd.text(z.string().trim().optional()),
  postType: zfd.text(
    z.enum(['text', 'radio', 'scale'], { message: 'Invalid post type' }),
  ),
  pollConfig: zfd.text(json(pollConfigSchema).optional()),
})

export const actions: Actions = {
  updatePost: async ({ params, request, locals }) => {
    const postId = Number.parseInt(params.id)
    if (Number.isNaN(postId)) {
      return fail(400, { error: 'Invalid post ID' })
    }

    // Check authentication
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { title, content, postType, pollConfig } =
      updatePostSchema.parse(formData)

    // Validate content requirement for text posts
    if (postType === 'text' && (!content || content.length === 0)) {
      return fail(400, { error: 'Content is required for text posts' })
    }

    // Validate poll configuration for poll posts
    if (postType !== 'text' && !pollConfig) {
      return fail(400, { error: 'Poll configuration is required for polls' })
    }

    // Update the post
    const updatedPost = updatePost(
      postId,
      locals.user.id,
      title,
      content || null,
      postType,
      pollConfig,
    )

    // Redirect to feed with anchor to the updated post
    redirect(303, `/feed#post-${updatedPost.id}`)
  },
}
