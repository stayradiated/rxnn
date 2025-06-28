import { createPost } from '$lib/platform-database'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod/v4'
import { zfd } from 'zod-form-data'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(303, '/login')
  }
}

const createPostSchema = zfd.formData({
  title: zfd.text(z.string().trim().min(1, 'Title is required')),
  content: zfd.text(
    z.string().trim().min(1, 'Content is required for text posts'),
  ),
})

export const actions: Actions = {
  createPost: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { title, content } = createPostSchema.parse(formData)

    // Create the post
    const newPost = createPost({
      user_id: locals.user.id,
      title,
      content,
      post_type: 'text',
      poll_config: null,
    })

    // Redirect to feed with anchor to the new post
    redirect(303, `/feed#post-${newPost.id}`)
  },
}
