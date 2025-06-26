import { createPost } from '$lib/platform-database'
import { pollConfigSchema } from '$lib/schemas'
import { json } from '$lib/zod-helpers'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod/v4'
import { zfd } from 'zod-form-data'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(303, '/login')
  }
}

const createPollSchema = zfd.formData({
  title: zfd.text(z.string().trim().min(1, 'Title is required')),
  content: zfd.text(z.string().trim().optional()),
  postType: zfd.text(
    z.enum(['radio', 'scale'], {
      message: 'Invalid poll type',
    }),
  ),
  pollConfig: zfd.text(json(pollConfigSchema)),
})

export const actions: Actions = {
  createPoll: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Authentication required' })
    }

    const formData = await request.formData()
    const { title, content, postType, pollConfig } =
      createPollSchema.parse(formData)

    if (
      (postType === 'scale' && pollConfig.type !== 'scale') ||
      (postType === 'radio' && pollConfig.type !== 'radio')
    ) {
      throw fail(400, {
        error: 'Poll type must be "scale" for scale polls',
      })
    }

    // Create the post
    createPost({
      user_id: locals.user.id,
      title,
      content: content || null,
      post_type: postType,
      poll_config: pollConfig,
    })

    // Redirect to feed after successful creation
    redirect(303, '/feed')
  },
}
