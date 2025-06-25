import { getPostById } from '$lib/platform-database'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, request }) => {
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
      username: post.username,
      created_at: post.created_at,
    },
  }
}
