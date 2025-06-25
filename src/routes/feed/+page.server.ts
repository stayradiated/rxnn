import { getPostsForFeedWithDetails } from '$lib/platform-database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  // Get posts for feed with comments and poll aggregates
  const posts = getPostsForFeedWithDetails(locals.user?.id)

  return {
    posts,
    user: locals.user,
    session: locals.session,
  }
}
