import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import Database from 'better-sqlite3'

// Database setup and schema
let db: Database.Database

type User = {
  id: number
  token: string
  username: string
  created_at: Date
  updated_at: Date
  last_seen: Date
}

export function initDatabase() {
  // Use data directory for production, local file for development
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'platform.db')

  // Ensure the directory exists for the database file
  const dbDir = dirname(dbPath)
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  console.log(`Initializing database at: ${dbPath}`)
  db = new Database(dbPath)

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')

  // Create tables
  createTables()

  return db
}

function createTables() {
  // Users table - anonymous users with generated usernames
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Posts table - text posts and polls
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      post_type TEXT NOT NULL,
      poll_config TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
    )
  `)

  // Poll responses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS poll_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      response_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      UNIQUE (user_id, post_id)
    )
  `)

  // Hearts table for likes on posts and comments
  db.exec(`
    CREATE TABLE IF NOT EXISTS hearts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL, -- 'post' or 'comment'
      target_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE (user_id, target_type, target_id)
    )
  `)

  // Sessions table for Lucia auth
  db.exec(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT NOT NULL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    )
  `)

  // Add sort_order column to existing posts if it doesn't exist
  try {
    db.exec('ALTER TABLE posts ADD COLUMN sort_order INTEGER DEFAULT 0')
  } catch {
    // Column already exists, ignore error
  }

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_token ON users (token);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_sort_order ON posts (sort_order DESC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);
    CREATE INDEX IF NOT EXISTS idx_poll_responses_post_id ON poll_responses (post_id);
    CREATE INDEX IF NOT EXISTS idx_poll_responses_user_id ON poll_responses (user_id);
    CREATE INDEX IF NOT EXISTS idx_hearts_target ON hearts (target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_hearts_user_id ON hearts (user_id);
    CREATE INDEX IF NOT EXISTS idx_session_user_id ON session (user_id);
  `)
}

export function getDatabase() {
  if (!db) {
    return initDatabase()
  }
  return db
}

// User operations
export function createUser(token: string, username: string): User {
  const db = getDatabase()

  const result = db
    .prepare(`
      INSERT INTO users (token, username)
      VALUES (?, ?)
      RETURNING *
    `)
    .get(token, username)

  return result as User
}

export function findUserByToken(token: string) {
  const db = getDatabase()

  return db.prepare('SELECT * FROM users WHERE token = ?').get(token)
}

export function updateLastSeen(userId: number) {
  const db = getDatabase()

  return db
    .prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?')
    .run(userId)
}

export function isUsernameAvailable(username: string, excludeUserId?: number) {
  const db = getDatabase()

  if (excludeUserId) {
    const result = db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(username, excludeUserId)
    return !result
  }

  const result = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get(username)
  return !result
}

// Post operations
export function createPost(
  userId: number,
  title: string,
  content: string | null,
  postType: string,
  pollConfig?: object,
) {
  const db = getDatabase()

  const configJson = pollConfig ? JSON.stringify(pollConfig) : null

  // Get current max sort_order and increment by 1 for new posts
  const maxSortOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM posts')
    .get() as { max_order: number }

  const result = db
    .prepare(`
      INSERT INTO posts (user_id, title, content, post_type, poll_config, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    .get(
      userId,
      title,
      content,
      postType,
      configJson,
      maxSortOrder.max_order + 1,
    )

  return result
}

export function getPostsForFeed(_userId?: number) {
  const db = getDatabase()

  const posts = db
    .prepare(`
      SELECT
        p.*,
        u.username,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM poll_responses pr WHERE pr.post_id = p.id) as response_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.sort_order DESC, p.created_at DESC
    `)
    .all()

  return posts.map((post: any) => ({
    ...post,
    poll_config: post.poll_config ? JSON.parse(post.poll_config) : null,
  }))
}

export function getPostsForFeedWithDetails(userId?: number) {
  const db = getDatabase()

  const posts = db
    .prepare(`
      SELECT
        p.*,
        u.username,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM poll_responses pr WHERE pr.post_id = p.id) as response_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.sort_order ASC, p.created_at ASC
    `)
    .all()

  const postIds = posts.map((post: any) => post.id)
  const postHearts = getHeartsForPosts(postIds, userId)

  return posts.map((post: any) => {
    const postData = {
      ...post,
      poll_config: post.poll_config ? JSON.parse(post.poll_config) : null,
    }

    // Get comments for this post
    const comments = getCommentsForPost(post.id)
    const commentIds = comments.map((comment: any) => comment.id)
    const commentHearts = getHeartsForComments(commentIds, userId)

    // Add heart data to comments
    postData.comments = comments.map((comment: any) => ({
      ...comment,
      heartCount: commentHearts[comment.id]?.count || 0,
      userHearted: commentHearts[comment.id]?.userHearted || false,
    }))

    // Add heart data to post
    postData.heartCount = postHearts[post.id]?.count || 0
    postData.userHearted = postHearts[post.id]?.userHearted || false

    // Get poll results if it's a poll
    if (post.post_type !== 'text') {
      // Get user's response if authenticated
      if (userId) {
        postData.userResponse = getUserPollResponse(userId, post.id)

        // Only show poll results if user has already submitted a response AND there are at least 5 total responses
        if (postData.userResponse) {
          const pollResults = getPollAggregates(post.id)
          if (pollResults && pollResults.totalResponses >= 5) {
            postData.pollResults = pollResults
          }
        }
      }
    }

    return postData
  })
}

export function getPollAggregates(postId: number) {
  const db = getDatabase()

  // Get the post to understand the poll structure
  const post = getPostById(postId)
  if (!post || post.post_type === 'text') {
    return null
  }

  const pollConfig = post.poll_config

  // Get all responses for aggregation
  const responses = db
    .prepare(`
      SELECT response_data
      FROM poll_responses
      WHERE post_id = ?
    `)
    .all(postId)

  const totalResponses = responses.length
  const responseData = responses.map((r: any) => JSON.parse(r.response_data))

  if (post.post_type === 'radio') {
    // For radio polls, count votes for each option
    const optionCounts: { [key: string]: number } = {}
    const specialCounts = { prefer_not_to_say: 0, not_applicable: 0 }

    pollConfig.options.forEach((option: any) => {
      optionCounts[option.id] = 0
    })

    responseData.forEach((data: any) => {
      if (
        data.selectedOption &&
        Object.hasOwn(optionCounts, data.selectedOption)
      ) {
        optionCounts[data.selectedOption]++
      } else if (data.selectedOption === 'prefer_not_to_say') {
        specialCounts.prefer_not_to_say++
      } else if (data.selectedOption === 'not_applicable') {
        specialCounts.not_applicable++
      }
    })

    return {
      totalResponses,
      type: 'radio',
      options: pollConfig.options.map((option: any) => ({
        option_id: option.id,
        label: option.label,
        count: optionCounts[option.id] || 0,
        percentage:
          totalResponses > 0
            ? Math.round((optionCounts[option.id] / totalResponses) * 100)
            : 0,
      })),
      specialOptions: [
        { type: 'prefer_not_to_say', count: specialCounts.prefer_not_to_say },
        { type: 'not_applicable', count: specialCounts.not_applicable },
      ],
    }
  }
  if (post.post_type === 'scale') {
    // For scale polls, calculate statistics
    const values = responseData
      .map((data: any) => data.scaleValue)
      .filter((val: any) => typeof val === 'number')

    const specialCounts = { prefer_not_to_say: 0, not_applicable: 0 }

    // Count special options
    responseData.forEach((data: any) => {
      if (data.specialOption === 'prefer_not_to_say') {
        specialCounts.prefer_not_to_say++
      } else if (data.specialOption === 'not_applicable') {
        specialCounts.not_applicable++
      }
    })

    if (values.length === 0) {
      return {
        totalResponses,
        type: 'scale',
        average: 0,
        min: pollConfig.min,
        max: pollConfig.max,
        distribution: [],
        specialOptions: [
          { type: 'prefer_not_to_say', count: specialCounts.prefer_not_to_say },
          { type: 'not_applicable', count: specialCounts.not_applicable },
        ],
      }
    }

    const average =
      values.reduce((sum: number, val: number) => sum + val, 0) / values.length

    // Count occurrences of each value
    const valueCounts: { [key: number]: number } = {}
    for (let i = pollConfig.min; i <= pollConfig.max; i++) {
      valueCounts[i] = 0
    }

    values.forEach((value: number) => {
      if (valueCounts[value] !== undefined) {
        valueCounts[value]++
      }
    })

    return {
      totalResponses,
      type: 'scale',
      average: Math.round(average * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
      configMin: pollConfig.min,
      configMax: pollConfig.max,
      distribution: Object.entries(valueCounts).map(([value, count]) => ({
        value: Number.parseInt(value),
        count,
        percentage:
          totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
      })),
      specialOptions: [
        { type: 'prefer_not_to_say', count: specialCounts.prefer_not_to_say },
        { type: 'not_applicable', count: specialCounts.not_applicable },
      ],
    }
  }

  return {
    totalResponses,
    type: post.post_type,
    responses: responseData,
  }
}

export function getPostById(id: number) {
  const db = getDatabase()

  const post = db
    .prepare(`
      SELECT
        p.*,
        u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `)
    .get(id)

  if (!post) return null

  return {
    ...post,
    poll_config: post.poll_config ? JSON.parse(post.poll_config) : null,
  }
}

export function updatePost(
  id: number,
  userId: number,
  title: string,
  content: string | null,
  postType: string,
  pollConfig?: object,
) {
  const db = getDatabase()

  // First check if the post exists and belongs to the user
  const existingPost = db
    .prepare('SELECT user_id FROM posts WHERE id = ?')
    .get(id)

  if (!existingPost) {
    throw new Error('Post not found')
  }

  if (existingPost.user_id !== userId) {
    throw new Error('Unauthorized: You can only edit your own posts')
  }

  const result = db
    .prepare(`
      UPDATE posts
      SET title = ?, content = ?, post_type = ?, poll_config = ?
      WHERE id = ? AND user_id = ?
      RETURNING *
    `)
    .get(
      title,
      content,
      postType,
      pollConfig ? JSON.stringify(pollConfig) : null,
      id,
      userId,
    )

  if (!result) {
    throw new Error('Failed to update post')
  }

  return {
    ...result,
    poll_config: result.poll_config ? JSON.parse(result.poll_config) : null,
  }
}

export function deletePost(id: number, userId: number) {
  const db = getDatabase()

  // First check if the post exists and belongs to the user
  const existingPost = db
    .prepare('SELECT user_id FROM posts WHERE id = ?')
    .get(id)

  if (!existingPost) {
    throw new Error('Post not found')
  }

  if (existingPost.user_id !== userId) {
    throw new Error('Unauthorized: You can only delete your own posts')
  }

  // Delete the post (cascading will handle comments, poll responses, and hearts)
  const result = db
    .prepare('DELETE FROM posts WHERE id = ? AND user_id = ?')
    .run(id, userId)

  if (result.changes === 0) {
    throw new Error('Failed to delete post')
  }

  return { success: true }
}

// Comment operations
export function createComment(userId: number, postId: number, content: string) {
  const db = getDatabase()

  const result = db
    .prepare(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (?, ?, ?)
      RETURNING *
    `)
    .get(userId, postId, content)

  return result
}

export function getCommentsForPost(postId: number) {
  const db = getDatabase()

  const comments = db
    .prepare(`
      SELECT
        c.*,
        u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `)
    .all(postId)

  return comments
}

export function updateComment(id: number, userId: number, content: string) {
  const db = getDatabase()

  // First check if the comment exists and belongs to the user
  const existingComment = db
    .prepare('SELECT user_id FROM comments WHERE id = ?')
    .get(id)

  if (!existingComment) {
    throw new Error('Comment not found')
  }

  if (existingComment.user_id !== userId) {
    throw new Error('Unauthorized: You can only edit your own comments')
  }

  const result = db
    .prepare(`
      UPDATE comments
      SET content = ?
      WHERE id = ? AND user_id = ?
      RETURNING *
    `)
    .get(content, id, userId)

  if (!result) {
    throw new Error('Failed to update comment')
  }

  return result
}

export function deleteComment(id: number, userId: number) {
  const db = getDatabase()

  // First check if the comment exists and belongs to the user
  const existingComment = db
    .prepare('SELECT user_id FROM comments WHERE id = ?')
    .get(id)

  if (!existingComment) {
    throw new Error('Comment not found')
  }

  if (existingComment.user_id !== userId) {
    throw new Error('Unauthorized: You can only delete your own comments')
  }

  // Delete the comment (cascading will handle hearts)
  const result = db
    .prepare('DELETE FROM comments WHERE id = ? AND user_id = ?')
    .run(id, userId)

  if (result.changes === 0) {
    throw new Error('Failed to delete comment')
  }

  return { success: true }
}

// Poll response operations
export function submitPollResponse(
  userId: number,
  postId: number,
  responseData: object,
) {
  const db = getDatabase()

  const dataJson = JSON.stringify(responseData)

  // Check if user already has a response for this poll
  const existingResponse = db
    .prepare('SELECT id FROM poll_responses WHERE user_id = ? AND post_id = ?')
    .get(userId, postId)

  const result = db
    .prepare(`
      INSERT INTO poll_responses (user_id, post_id, response_data)
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, post_id)
      DO UPDATE SET
        response_data = excluded.response_data,
        updated_at = CURRENT_TIMESTAMP
    `)
    .run(userId, postId, dataJson)

  return {
    ...result,
    isNewResponse: !existingResponse,
  }
}

export function getUserPollResponse(userId: number, postId: number) {
  const db = getDatabase()

  const response = db
    .prepare(`
      SELECT response_data
      FROM poll_responses
      WHERE user_id = ? AND post_id = ?
    `)
    .get(userId, postId)

  if (!response) return null

  return JSON.parse(response.response_data)
}

// Heart operations
export function toggleHeart(
  userId: number,
  targetType: 'post' | 'comment',
  targetId: number,
) {
  const db = getDatabase()

  // Check if heart already exists
  const existingHeart = db
    .prepare(`
      SELECT id FROM hearts
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `)
    .get(userId, targetType, targetId)

  if (existingHeart) {
    // Remove heart
    db.prepare(`
      DELETE FROM hearts
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `).run(userId, targetType, targetId)
    return { hearted: false }
  }
  // Add heart
  db.prepare(`
      INSERT INTO hearts (user_id, target_type, target_id)
      VALUES (?, ?, ?)
    `).run(userId, targetType, targetId)
  return { hearted: true }
}

export function getHeartsForPosts(postIds: number[], userId?: number) {
  if (postIds.length === 0) return {}

  const db = getDatabase()
  const placeholders = postIds.map(() => '?').join(',')

  // Get heart counts for all posts
  const counts = db
    .prepare(`
      SELECT target_id, COUNT(*) as count
      FROM hearts
      WHERE target_type = 'post' AND target_id IN (${placeholders})
      GROUP BY target_id
    `)
    .all(...postIds)

  const result: { [postId: number]: { count: number; userHearted: boolean } } =
    {}

  // Initialize with zero counts
  postIds.forEach((id) => {
    result[id] = { count: 0, userHearted: false }
  })

  // Set actual counts
  counts.forEach((row: any) => {
    result[row.target_id].count = row.count
  })

  // Get user hearts if userId provided
  if (userId) {
    const userHearts = db
      .prepare(`
        SELECT target_id
        FROM hearts
        WHERE target_type = 'post' AND target_id IN (${placeholders}) AND user_id = ?
      `)
      .all(...postIds, userId)

    userHearts.forEach((row: any) => {
      result[row.target_id].userHearted = true
    })
  }

  return result
}

export function getHeartsForComments(commentIds: number[], userId?: number) {
  if (commentIds.length === 0) return {}

  const db = getDatabase()
  const placeholders = commentIds.map(() => '?').join(',')

  // Get heart counts for all comments
  const counts = db
    .prepare(`
      SELECT target_id, COUNT(*) as count
      FROM hearts
      WHERE target_type = 'comment' AND target_id IN (${placeholders})
      GROUP BY target_id
    `)
    .all(...commentIds)

  const result: {
    [commentId: number]: { count: number; userHearted: boolean }
  } = {}

  // Initialize with zero counts
  commentIds.forEach((id) => {
    result[id] = { count: 0, userHearted: false }
  })

  // Set actual counts
  counts.forEach((row: any) => {
    result[row.target_id].count = row.count
  })

  // Get user hearts if userId provided
  if (userId) {
    const userHearts = db
      .prepare(`
        SELECT target_id
        FROM hearts
        WHERE target_type = 'comment' AND target_id IN (${placeholders}) AND user_id = ?
      `)
      .all(...commentIds, userId)

    userHearts.forEach((row: any) => {
      result[row.target_id].userHearted = true
    })
  }

  return result
}

// Post reordering functions for admin
export function movePostUp(postId: number) {
  const db = getDatabase()

  // Get current post and its sort_order
  const currentPost = db
    .prepare('SELECT id, sort_order FROM posts WHERE id = ?')
    .get(postId) as { id: number; sort_order: number } | undefined

  if (!currentPost) {
    throw new Error('Post not found')
  }

  // Get the post directly above this one (higher sort_order)
  const higherPost = db
    .prepare(`
      SELECT id, sort_order FROM posts 
      WHERE sort_order > ? 
      ORDER BY sort_order ASC 
      LIMIT 1
    `)
    .get(currentPost.sort_order) as
    | { id: number; sort_order: number }
    | undefined

  if (!higherPost) {
    // Already at top
    return { success: false, message: 'Post is already at the top' }
  }

  // Swap sort_orders
  db.prepare('UPDATE posts SET sort_order = ? WHERE id = ?').run(
    higherPost.sort_order,
    currentPost.id,
  )
  db.prepare('UPDATE posts SET sort_order = ? WHERE id = ?').run(
    currentPost.sort_order,
    higherPost.id,
  )

  return { success: true }
}

export function movePostDown(postId: number) {
  const db = getDatabase()

  // Get current post and its sort_order
  const currentPost = db
    .prepare('SELECT id, sort_order FROM posts WHERE id = ?')
    .get(postId) as { id: number; sort_order: number } | undefined

  if (!currentPost) {
    throw new Error('Post not found')
  }

  // Get the post directly below this one (lower sort_order)
  const lowerPost = db
    .prepare(`
      SELECT id, sort_order FROM posts 
      WHERE sort_order < ? 
      ORDER BY sort_order DESC 
      LIMIT 1
    `)
    .get(currentPost.sort_order) as
    | { id: number; sort_order: number }
    | undefined

  if (!lowerPost) {
    // Already at bottom
    return { success: false, message: 'Post is already at the bottom' }
  }

  // Swap sort_orders
  db.prepare('UPDATE posts SET sort_order = ? WHERE id = ?').run(
    lowerPost.sort_order,
    currentPost.id,
  )
  db.prepare('UPDATE posts SET sort_order = ? WHERE id = ?').run(
    currentPost.sort_order,
    lowerPost.id,
  )

  return { success: true }
}

// Initialize database on module load in production
if (process.env.NODE_ENV === 'production') {
  initDatabase()
}
