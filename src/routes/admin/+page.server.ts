import { env } from '$env/dynamic/private'
import {
  getPostsForFeed,
  movePost,
  movePostDown,
  movePostUp,
} from '$lib/platform-database'
import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
  const adminKey = url.searchParams.get('key')
  const secretKey = env.SECRET_ADMIN_KEY

  if (!adminKey || !secretKey || adminKey !== secretKey) {
    throw redirect(302, '/')
  }

  const posts = getPostsForFeed()

  return {
    posts,
    isAdmin: true,
  }
}

export const actions: Actions = {
  deletePost: async ({ request, url }) => {
    const adminKey = url.searchParams.get('key')
    const secretKey = env.SECRET_ADMIN_KEY

    if (!adminKey || !secretKey || adminKey !== secretKey) {
      throw redirect(302, '/')
    }

    const data = await request.formData()
    const postId = data.get('postId')

    if (!postId) {
      return { success: false, error: 'Post ID is required' }
    }

    // Admin delete - bypass user ownership check by directly using SQL
    const { getDatabase } = await import('$lib/platform-database')
    const db = getDatabase()

    const result = db
      .prepare('DELETE FROM posts WHERE id = ?')
      .run(Number(postId))

    if (result.changes === 0) {
      return { success: false, error: 'Post not found' }
    }

    return { success: true }
  },

  deleteComment: async ({ request, url }) => {
    const adminKey = url.searchParams.get('key')
    const secretKey = env.SECRET_ADMIN_KEY

    if (!adminKey || !secretKey || adminKey !== secretKey) {
      throw redirect(302, '/')
    }

    const data = await request.formData()
    const commentId = data.get('commentId')

    if (!commentId) {
      return { success: false, error: 'Comment ID is required' }
    }

    // Admin delete - bypass user ownership check by directly using SQL
    const { getDatabase } = await import('$lib/platform-database')
    const db = getDatabase()

    const result = db
      .prepare('DELETE FROM comments WHERE id = ?')
      .run(Number(commentId))

    if (result.changes === 0) {
      return { success: false, error: 'Comment not found' }
    }

    return { success: true }
  },

  movePostUp: async ({ request, url }) => {
    const adminKey = url.searchParams.get('key')
    const secretKey = env.SECRET_ADMIN_KEY

    if (!adminKey || !secretKey || adminKey !== secretKey) {
      throw redirect(302, '/')
    }

    const data = await request.formData()
    const postId = data.get('postId')

    if (!postId) {
      return { success: false, error: 'Post ID is required' }
    }

    const result = movePostUp(Number(postId))
    return result
  },

  movePostDown: async ({ request, url }) => {
    const adminKey = url.searchParams.get('key')
    const secretKey = env.SECRET_ADMIN_KEY

    if (!adminKey || !secretKey || adminKey !== secretKey) {
      throw redirect(302, '/')
    }

    const data = await request.formData()
    const postId = data.get('postId')

    if (!postId) {
      return { success: false, error: 'Post ID is required' }
    }

    const result = movePostDown(Number(postId))
    return result
  },

  movePost: async ({ request, url }) => {
    const adminKey = url.searchParams.get('key')
    const secretKey = env.SECRET_ADMIN_KEY

    if (!adminKey || !secretKey || adminKey !== secretKey) {
      throw redirect(302, '/')
    }

    const data = await request.formData()
    const postId = data.get('postId')
    const position = data.get('position')

    if (!postId || !position) {
      return { success: false, error: 'Post ID and position are required' }
    }

    const result = movePost(Number(postId), Number(position))
    return result
  },
}
