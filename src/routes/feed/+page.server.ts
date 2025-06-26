import {
  getPlatformStats,
  getPostsForFeedWithDetails,
} from '$lib/platform-database'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

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
