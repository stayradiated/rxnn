import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/')
  }

  return {
    user: {
      id: locals.user.id,
      username: locals.user.username,
      avatar: locals.user.avatar,
      created_at: locals.user.created_at,
      updated_at: locals.user.updated_at,
    },
  }
}
