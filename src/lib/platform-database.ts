import { join } from 'node:path'
import Database from 'better-sqlite3'

// Database setup and schema
let db: Database.Database

export function initDatabase() {
  // Use data directory for production, local file for development
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'platform.db')

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

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_token ON users (token);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);
    CREATE INDEX IF NOT EXISTS idx_poll_responses_post_id ON poll_responses (post_id);
    CREATE INDEX IF NOT EXISTS idx_poll_responses_user_id ON poll_responses (user_id);
  `)
}

export function getDatabase() {
  if (!db) {
    return initDatabase()
  }
  return db
}

// User operations
export function createUser(token: string, username: string) {
  const db = getDatabase()

  const result = db
    .prepare(`
      INSERT INTO users (token, username) 
      VALUES (?, ?) 
      RETURNING *
    `)
    .get(token, username)

  return result
}

export function findUserByToken(token: string) {
  const db = getDatabase()

  return db.prepare('SELECT * FROM users WHERE token = ?').get(token)
}

// TODO: unused
export function findUserById(id: number) {
  const db = getDatabase()

  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

// TOOD: unused
export function updateUsername(userId: number, username: string) {
  const db = getDatabase()

  return db
    .prepare(
      'UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    )
    .run(username, userId)
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

  const result = db
    .prepare(`
      INSERT INTO posts (user_id, title, content, post_type, poll_config) 
      VALUES (?, ?, ?, ?, ?) 
      RETURNING *
    `)
    .get(userId, title, content, postType, configJson)

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
      ORDER BY p.created_at DESC
    `)
    .all()

  return posts.map((post: any) => ({
    ...post,
    poll_config: post.poll_config ? JSON.parse(post.poll_config) : null,
  }))
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

// Poll response operations
export function submitPollResponse(
  userId: number,
  postId: number,
  responseData: object,
) {
  const db = getDatabase()

  const dataJson = JSON.stringify(responseData)

  return db
    .prepare(`
      INSERT INTO poll_responses (user_id, post_id, response_data) 
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, post_id) 
      DO UPDATE SET 
        response_data = excluded.response_data,
        updated_at = CURRENT_TIMESTAMP
    `)
    .run(userId, postId, dataJson)
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

export function getPollResults(postId: number) {
  const db = getDatabase()

  const responses = db
    .prepare(`
      SELECT response_data 
      FROM poll_responses 
      WHERE post_id = ?
    `)
    .all(postId)

  const results = responses.map((r: any) => JSON.parse(r.response_data))

  return {
    totalResponses: results.length,
    responses: results,
  }
}

// Initialize database on module load in production
if (process.env.NODE_ENV === 'production') {
  initDatabase()
}
