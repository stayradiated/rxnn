import { authenticateRequest } from '$lib/auth-helper'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
  const user = await authenticateRequest(request)

  if (!user) {
    throw redirect(302, '/')
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  }
}
