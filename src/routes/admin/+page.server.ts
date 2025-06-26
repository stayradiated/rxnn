import { env } from '$env/dynamic/private'
import {
  getPostsForFeed,
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

    try {
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
    } catch (error) {
      console.error('Error deleting post:', error)
      return { success: false, error: 'Failed to delete post' }
    }
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

    try {
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
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: 'Failed to delete comment' }
    }
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

    try {
      const result = movePostUp(Number(postId))
      return result
    } catch (error) {
      console.error('Error moving post up:', error)
      return { success: false, error: 'Failed to move post up' }
    }
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

    try {
      const result = movePostDown(Number(postId))
      return result
    } catch (error) {
      console.error('Error moving post down:', error)
      return { success: false, error: 'Failed to move post down' }
    }
  },
}
