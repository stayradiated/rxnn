import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import Database from 'better-sqlite3'
import { dropTimestampColumns } from './timestamp-migration'
import type {
  Comment,
  PollAggregates,
  PollResponse,
  Post,
  PostType,
  PostWithDetails,
  ResponseData,
  TargetType,
  User,
} from './types'

// Database setup and schema
let db: Database.Database

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
      username TEXT UNIQUE NOT NULL
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

  // Drop timestamp columns for privacy
  dropTimestampColumns(db)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_token ON users (token);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
    CREATE INDEX IF NOT EXISTS idx_posts_sort_order ON posts (sort_order DESC);
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
    .prepare<[string, string], User>(`
      INSERT INTO users (token, username)
      VALUES (?, ?)
      RETURNING *
    `)
    .get(token, username)

  if (!result) {
    throw new Error('Failed to create user')
  }

  return result
}

export function findUserByToken(token: string): User | undefined {
  const db = getDatabase()

  return db
    .prepare<[string], User>('SELECT * FROM users WHERE token = ?')
    .get(token)
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
  options: Pick<
    Post,
    'user_id' | 'title' | 'content' | 'post_type' | 'poll_config'
  >,
): Post {
  const {
    user_id: userId,
    title,
    content,
    post_type: postType,
    poll_config: pollConfig,
  } = options

  const db = getDatabase()

  const configJson = pollConfig ? JSON.stringify(pollConfig) : null

  // Get current max sort_order and increment by 1 for new posts
  const maxSortOrder = db
    .prepare<
      [],
      {
        max_order: number
      }
    >('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM posts')
    .get()

  if (!maxSortOrder) {
    throw new Error('Failed to retrieve max sort order')
  }

  const result = db
    .prepare<
      [
        number, // userId
        string, // title
        string | null, // content
        string, // postType
        string | null, // pollConfig (JSON string or null)
        number, // sortOrder
      ],
      {
        id: number
        user_id: number
        title: string
        content: string | null
        post_type: string
        poll_config: string | null
        sort_order: number
      }
    >(`
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

  if (!result) {
    throw new Error('Failed to create post')
  }

  return {
    ...result,
    post_type: result.post_type as PostType,
    poll_config: result.poll_config ? JSON.parse(result.poll_config) : null,
  }
}

export function getPostsForFeedWithDetails(userId?: number): PostWithDetails[] {
  const db = getDatabase()

  const posts = db
    .prepare<
      [],
      {
        id: number
        user_id: number
        title: string
        content: string
        post_type: string
        poll_config: string | null
        sort_order: number
        comment_count: number
        response_count: number
      }
    >(`
      SELECT
        p.*,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM poll_responses pr WHERE pr.post_id = p.id) as response_count
      FROM posts p
      ORDER BY p.sort_order ASC
    `)
    .all()

  const postIds = posts.map((post) => post.id)
  const postHearts = userId ? getHeartsForPosts(postIds, userId) : {}

  return posts.map((post) => {
    // Get comments for this post
    const comments = getCommentsForPost(post.id)
    const commentIds = comments.map((comment) => comment.id)
    const commentHearts = userId ? getHeartsForComments(commentIds, userId) : {}

    // Add heart data to comments
    const commentsWithDetails = comments.map((comment) => ({
      ...comment,
      heartCount: commentHearts[comment.id]?.count || 0,
      userHearted: commentHearts[comment.id]?.userHearted || false,
    }))

    // Add heart data to post
    const heartCount = postHearts[post.id]?.count || 0
    const userHearted = postHearts[post.id]?.userHearted || false

    const userResponse = userId ? getUserPollResponse(userId, post.id) : null

    // Show poll results if:
    // - User has submitted a response (logged in users), OR
    // - User is anonymous and there are at least 5 responses
    let pollResults: PollAggregates | null = null
    const rawPollResults = getPollAggregates(post.id)
    if (rawPollResults && rawPollResults.totalResponses >= 5) {
      if (userResponse || !userId) {
        pollResults = rawPollResults
      }
    }

    const postData = {
      ...post,
      post_type: post.post_type as PostType,
      content: post.content || '',
      poll_config: post.poll_config ? JSON.parse(post.poll_config) : null,

      comments: commentsWithDetails,
      heartCount,
      userHearted,
      pollResults: pollResults,
      userResponse,
    } as PostWithDetails

    return postData
  })
}

export function getPollAggregates(postId: number): PollAggregates | null {
  const db = getDatabase()

  // Get the post to understand the poll structure
  const post = getPostById(postId)
  if (!post || post.post_type === 'text') {
    return null
  }

  const pollConfig = post.poll_config
  if (!pollConfig) {
    return null
  }

  // Get all responses for aggregation
  const responses = db
    .prepare<
      [number],
      {
        response_data: string
      }
    >(`
      SELECT response_data
      FROM poll_responses
      WHERE post_id = ?
    `)
    .all(postId)

  const totalResponses = responses.length
  const responseData = responses.map(
    (r) => JSON.parse(r.response_data) as ResponseData,
  )

  if (post.post_type === 'radio' && pollConfig.type === 'radio') {
    // For radio polls, count votes for each option
    const optionCounts: { [key: string]: number } = {}
    const specialCounts = { prefer_not_to_say: 0, not_applicable: 0 }

    pollConfig.options.forEach((option) => {
      optionCounts[option.id] = 0
    })

    responseData.forEach((data) => {
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

    // Calculate responses excluding special options for percentage calculation
    const totalValidResponses =
      totalResponses -
      specialCounts.prefer_not_to_say -
      specialCounts.not_applicable

    return {
      totalResponses,
      type: 'radio',
      options: pollConfig.options.map((option) => ({
        option_id: option.id,
        label: option.label,
        count: optionCounts[option.id] || 0,
        percentage:
          totalValidResponses > 0
            ? Math.round((optionCounts[option.id] / totalValidResponses) * 100)
            : 0,
      })),
      specialOptions: [
        { type: 'prefer_not_to_say', count: specialCounts.prefer_not_to_say },
        { type: 'not_applicable', count: specialCounts.not_applicable },
      ],
    }
  }
  if (post.post_type === 'scale' && pollConfig.type === 'scale') {
    // For scale polls, calculate statistics
    const values = responseData
      .map((data) => data.scaleValue)
      .filter((val): val is number => typeof val === 'number')

    const specialCounts = { prefer_not_to_say: 0, not_applicable: 0 }

    // Count special options
    responseData.forEach((data) => {
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
        configMin: 0,
        configMax: 0,
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

    // Calculate responses excluding special options for percentage calculation
    const totalValidResponses = values.length

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
          totalValidResponses > 0
            ? Math.round((count / totalValidResponses) * 100)
            : 0,
      })),
      specialOptions: [
        { type: 'prefer_not_to_say', count: specialCounts.prefer_not_to_say },
        { type: 'not_applicable', count: specialCounts.not_applicable },
      ],
    }
  }

  throw new Error(
    `Unsupported post type for poll aggregation: ${post.post_type}`,
  )
}

export function getPostById(id: number): Post | null {
  const db = getDatabase()

  const post = db
    .prepare<
      [number],
      {
        id: number
        user_id: number
        title: string
        content: string | null
        post_type: string
        poll_config: string | null
        sort_order: number
      }
    >(`
      SELECT p.*
      FROM posts p
      WHERE p.id = ?
    `)
    .get(id)

  if (!post) {
    return null
  }

  return {
    ...post,
    post_type: post.post_type as PostType,
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
): Post {
  const db = getDatabase()

  // First check if the post exists and belongs to the user
  const existingPost = db
    .prepare<
      [number],
      {
        user_id: number
      }
    >('SELECT user_id FROM posts WHERE id = ?')
    .get(id)

  if (!existingPost) {
    throw new Error('Post not found')
  }

  if (existingPost.user_id !== userId) {
    throw new Error('Unauthorized: You can only edit your own posts')
  }

  const result = db
    .prepare<
      [
        string, // title
        string | null, // content
        string, // post_type
        string | null, // poll_config (JSON string or null)
        number, // id
        number, // userId
      ],
      {
        id: number
        user_id: number
        title: string
        content: string | null
        post_type: string
        poll_config: string | null
        sort_order: number
      }
    >(`
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
    post_type: result.post_type as PostType,
    poll_config: result.poll_config ? JSON.parse(result.poll_config) : null,
  }
}

export function deletePost(id: number, userId: number): { success: boolean } {
  const db = getDatabase()

  // First check if the post exists and belongs to the user
  const existingPost = db
    .prepare<
      [number],
      {
        user_id: number
      }
    >('SELECT user_id FROM posts WHERE id = ?')
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
export function createComment(
  userId: number,
  postId: number,
  content: string,
): Comment {
  const db = getDatabase()

  const result = db
    .prepare<[number, number, string], Comment>(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (?, ?, ?)
      RETURNING *
    `)
    .get(userId, postId, content)

  if (!result) {
    throw new Error('Failed to create comment')
  }

  return result
}

export function getCommentsForPost(postId: number): Comment[] {
  const db = getDatabase()

  const comments = db
    .prepare<[number], Comment>(`
      SELECT c.*
      FROM comments c
      WHERE c.post_id = ?
      ORDER BY c.id ASC
    `)
    .all(postId)

  return comments
}

export function updateComment(
  id: number,
  userId: number,
  content: string,
): Comment {
  const db = getDatabase()

  // First check if the comment exists and belongs to the user
  const existingComment = db
    .prepare<
      [number],
      {
        user_id: number
      }
    >('SELECT user_id FROM comments WHERE id = ?')
    .get(id)

  if (!existingComment) {
    throw new Error('Comment not found')
  }

  if (existingComment.user_id !== userId) {
    throw new Error('Unauthorized: You can only edit your own comments')
  }

  const result = db
    .prepare<[string, number, number], Comment>(`
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

export function deleteComment(
  id: number,
  userId: number,
): { success: boolean } {
  const db = getDatabase()

  // First check if the comment exists and belongs to the user
  const existingComment = db
    .prepare<
      [number],
      {
        user_id: number
      }
    >('SELECT user_id FROM comments WHERE id = ?')
    .get(id)

  if (!existingComment) {
    throw new Error('Comment not found')
  }

  if (existingComment.user_id !== userId) {
    throw new Error('Unauthorized: You can only delete your own comments')
  }

  // Delete the comment (cascading will handle hearts)
  const result = db
    .prepare<[number, number]>(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
    )
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
        response_data = excluded.response_data
    `)
    .run(userId, postId, dataJson)

  return {
    ...result,
    isNewResponse: !existingResponse,
  }
}

export function getUserPollResponse(
  userId: number,
  postId: number,
): ResponseData | null {
  const db = getDatabase()

  const response = db
    .prepare<[number, number], PollResponse>(`
      SELECT response_data
      FROM poll_responses
      WHERE user_id = ? AND post_id = ?
    `)
    .get(userId, postId)

  if (!response) {
    return null
  }

  return JSON.parse(response.response_data)
}

// Heart operations
export function toggleHeart(
  userId: number,
  targetType: TargetType,
  targetId: number,
): { hearted: boolean } {
  const db = getDatabase()

  // Check if heart already exists
  const existingHeart = db
    .prepare<
      [number, TargetType, number],
      {
        id: number
      }
    >(`
      SELECT id FROM hearts
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `)
    .get(userId, targetType, targetId)

  if (existingHeart) {
    // Remove heart
    db.prepare<[number, TargetType, number]>(`
      DELETE FROM hearts
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `).run(userId, targetType, targetId)
    return { hearted: false }
  }
  // Add heart
  db.prepare<[number, TargetType, number]>(`
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
    .prepare<
      number[],
      {
        target_id: number
        count: number
      }
    >(`
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
  counts.forEach((row) => {
    result[row.target_id].count = row.count
  })

  // Get user hearts if userId provided
  if (userId) {
    const userHearts = db
      .prepare<
        [...number[], number],
        {
          target_id: number
        }
      >(`
        SELECT target_id
        FROM hearts
        WHERE target_type = 'post' AND target_id IN (${placeholders}) AND user_id = ?
      `)
      .all(...postIds, userId)

    userHearts.forEach((row) => {
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
    .prepare<
      number[],
      {
        target_id: number
        count: number
      }
    >(`
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
  counts.forEach((row) => {
    result[row.target_id].count = row.count
  })

  // Get user hearts if userId provided
  if (userId) {
    const userHearts = db
      .prepare<
        [...number[], number],
        {
          target_id: number
        }
      >(`
        SELECT target_id
        FROM hearts
        WHERE target_type = 'comment' AND target_id IN (${placeholders}) AND user_id = ?
      `)
      .all(...commentIds, userId)

    userHearts.forEach((row) => {
      result[row.target_id].userHearted = true
    })
  }

  return result
}

export function getPlatformStats(userId?: number) {
  const db = getDatabase()

  // Get active users (all users who have posted, commented, or responded to polls)
  // Note: Timestamp columns removed for privacy - showing all users with activity
  const activeUsers = db
    .prepare<
      [],
      {
        count: number
      }
    >(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM posts
        UNION
        SELECT user_id FROM comments
        UNION
        SELECT user_id FROM poll_responses
      )
    `)
    .get()

  if (!activeUsers) {
    throw new Error('Failed to retrieve active user count')
  }

  // Get total questions (posts that are not text-only)
  const totalQuestions = db
    .prepare<
      [PostType],
      {
        count: number
      }
    >('SELECT COUNT(*) as count FROM posts WHERE post_type != ?')
    .get('text')

  if (!totalQuestions) {
    throw new Error('Failed to retrieve total question count')
  }

  // Get unanswered questions for the specific user (questions they haven't responded to)
  let unansweredQuestions = 0
  let userHasAnsweredQuestions = false
  if (userId) {
    const unanswered = db
      .prepare<
        [number],
        {
          count: number
        }
      >(`
        SELECT COUNT(*) as count FROM posts
        WHERE post_type != 'text'
        AND id NOT IN (
          SELECT DISTINCT post_id FROM poll_responses WHERE user_id = ?
        )
      `)
      .get(userId)

    if (!unanswered) {
      throw new Error('Failed to retrieve unanswered question count')
    }
    unansweredQuestions = unanswered.count

    // Check if user has answered at least one question
    const answeredCount = db
      .prepare<
        [number],
        {
          count: number
        }
      >(`
        SELECT COUNT(DISTINCT post_id) as count FROM poll_responses WHERE user_id = ?
      `)
      .get(userId)
    if (!answeredCount) {
      throw new Error('Failed to retrieve answered question count')
    }

    userHasAnsweredQuestions = answeredCount.count > 0
  }

  // Calculate percentage of active users who have responded to all polls
  let percentageCompletedAllPolls = 0
  if (totalQuestions.count > 0 && activeUsers.count > 0) {
    const usersCompletedAllPolls = db
      .prepare<
        [number],
        {
          count: number
        }
      >(`
        SELECT COUNT(*) as count FROM (
          SELECT user_id FROM poll_responses
          GROUP BY user_id
          HAVING COUNT(DISTINCT post_id) = ?
        )
      `)
      .get(totalQuestions.count)

    if (!usersCompletedAllPolls) {
      throw new Error('Failed to retrieve users who completed all polls count')
    }

    percentageCompletedAllPolls = Math.round(
      (usersCompletedAllPolls.count / activeUsers.count) * 100,
    )
  }

  // Get total heart count across all posts and comments
  const totalHearts = db
    .prepare<
      [],
      {
        count: number
      }
    >('SELECT COUNT(*) as count FROM hearts')
    .get()

  if (!totalHearts) {
    throw new Error('Failed to retrieve total heart count')
  }

  return {
    activeUsers: activeUsers.count,
    totalQuestions: totalQuestions.count,
    unansweredQuestions,
    userHasAnsweredQuestions,
    percentageCompletedAllPolls,
    totalHearts: totalHearts.count,
  }
}

// Export functions for CSV generation
export function getAllScalePollsForExport() {
  const db = getDatabase()

  // Get all scale polls
  const scalePosts = db
    .prepare<
      [],
      {
        id: number
        title: string
        content: string | null
        poll_config: string
      }
    >(`
      SELECT id, title, content, poll_config
      FROM posts
      WHERE post_type = 'scale'
      ORDER BY sort_order ASC
    `)
    .all()

  return scalePosts.map((post) => {
    const pollConfig = JSON.parse(post.poll_config)
    const aggregates = getPollAggregates(post.id)

    // Only return data if there are 5+ responses, otherwise return zeros
    if (!aggregates || aggregates.totalResponses < 5) {
      return {
        title: post.title,
        description: post.content || '',
        responseCount: 0,
        minLabel: pollConfig.minLabel || '',
        maxLabel: pollConfig.maxLabel || '',
        sums: Array.from(
          { length: pollConfig.max - pollConfig.min + 1 },
          () => 0,
        ),
        preferNotToSay: 0,
        notApplicable: 0,
        min: pollConfig.min,
        max: pollConfig.max,
      }
    }

    if (aggregates.type === 'scale') {
      // Create array of sums for each scale value
      const sums = Array.from(
        { length: pollConfig.max - pollConfig.min + 1 },
        () => 0,
      )
      aggregates.distribution.forEach((item) => {
        const index = item.value - pollConfig.min
        if (index >= 0 && index < sums.length) {
          sums[index] = item.count
        }
      })

      const preferNotToSay =
        aggregates.specialOptions.find(
          (opt) => opt.type === 'prefer_not_to_say',
        )?.count || 0
      const notApplicable =
        aggregates.specialOptions.find((opt) => opt.type === 'not_applicable')
          ?.count || 0

      return {
        title: post.title,
        description: post.content || '',
        responseCount: aggregates.totalResponses,
        minLabel: pollConfig.minLabel || '',
        maxLabel: pollConfig.maxLabel || '',
        sums,
        preferNotToSay,
        notApplicable,
        min: pollConfig.min,
        max: pollConfig.max,
      }
    }

    // Fallback for non-scale type (shouldn't happen)
    return {
      title: post.title,
      description: post.content || '',
      responseCount: 0,
      minLabel: pollConfig.minLabel || '',
      maxLabel: pollConfig.maxLabel || '',
      sums: Array.from(
        { length: pollConfig.max - pollConfig.min + 1 },
        () => 0,
      ),
      preferNotToSay: 0,
      notApplicable: 0,
      min: pollConfig.min,
      max: pollConfig.max,
    }
  })
}

export function getAllRadioPollsForExport() {
  const db = getDatabase()

  // Get all radio polls
  const radioPosts = db
    .prepare<
      [],
      {
        id: number
        title: string
        content: string | null
        poll_config: string
      }
    >(`
      SELECT id, title, content, poll_config
      FROM posts
      WHERE post_type = 'radio'
      ORDER BY sort_order ASC
    `)
    .all()

  return radioPosts.map((post) => {
    const pollConfig = JSON.parse(post.poll_config)
    const aggregates = getPollAggregates(post.id)

    // Only return data if there are 5+ responses, otherwise return zeros
    if (!aggregates || aggregates.totalResponses < 5) {
      return {
        title: post.title,
        description: post.content || '',
        responseCount: 0,
        options: pollConfig.options.map(
          (option: { id: string; label: string }) => ({
            label: option.label,
            count: 0,
          }),
        ),
        preferNotToSay: 0,
        notApplicable: 0,
      }
    }

    if (aggregates.type === 'radio') {
      const preferNotToSay =
        aggregates.specialOptions.find(
          (opt) => opt.type === 'prefer_not_to_say',
        )?.count || 0
      const notApplicable =
        aggregates.specialOptions.find((opt) => opt.type === 'not_applicable')
          ?.count || 0

      return {
        title: post.title,
        description: post.content || '',
        responseCount: aggregates.totalResponses,
        options: aggregates.options.map((option) => ({
          label: option.label,
          count: option.count,
        })),
        preferNotToSay,
        notApplicable,
      }
    }

    // Fallback for non-radio type (shouldn't happen)
    return {
      title: post.title,
      description: post.content || '',
      responseCount: 0,
      options: pollConfig.options.map(
        (option: { id: string; label: string }) => ({
          label: option.label,
          count: 0,
        }),
      ),
      preferNotToSay: 0,
      notApplicable: 0,
    }
  })
}

// Initialize database on module load in production
if (process.env.NODE_ENV === 'production') {
  initDatabase()
}
