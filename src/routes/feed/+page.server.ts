import { getPostsForFeed } from '$lib/platform-database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  // Get posts for feed (auth will be handled client-side)
  const posts = getPostsForFeed()

  return {
    posts,
  }
}
