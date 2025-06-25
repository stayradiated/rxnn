import { getPostsForFeed } from '$lib/platform-database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  // Get posts for feed and user data from session
  const posts = getPostsForFeed()

  return {
    posts,
    user: locals.user,
    session: locals.session,
  }
}
