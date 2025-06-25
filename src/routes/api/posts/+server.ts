import { authenticateRequest, requireAuth } from '$lib/auth-helper'
import { createPost, getPostsForFeed } from '$lib/platform-database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
  try {
    // Authentication is optional for viewing posts
    const user = await authenticateRequest(request)

    const posts = getPostsForFeed(user?.id)

    return json({
      success: true,
      posts,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const user = await authenticateRequest(request)
    requireAuth(user)

    const { title, content, postType, pollConfig } = await request.json()

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return json({ error: 'Title is required' }, { status: 400 })
    }

    if (!postType || typeof postType !== 'string') {
      return json({ error: 'Post type is required' }, { status: 400 })
    }

    // Validate post type
    const validPostTypes = ['text', 'radio', 'scale', 'slider', 'checkbox']
    if (!validPostTypes.includes(postType)) {
      return json({ error: 'Invalid post type' }, { status: 400 })
    }

    // For non-text posts, poll config is required
    if (postType !== 'text' && !pollConfig) {
      return json(
        { error: 'Poll configuration is required for poll posts' },
        { status: 400 },
      )
    }

    // Create the post
    const post = createPost(
      user?.id,
      title.trim(),
      content ? content.trim() : null,
      postType,
      pollConfig,
    )

    console.log('Created post:', post.id, 'by', user?.username)

    return json({
      success: true,
      post: {
        ...post,
        username: user?.username,
        poll_config: pollConfig,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return json({ error: 'Authentication required' }, { status: 401 })
    }

    console.error('Error creating post:', error)
    return json({ error: 'Failed to create post' }, { status: 500 })
  }
}
