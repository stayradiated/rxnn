import type { Database } from 'better-sqlite3'

export function dropTimestampColumns(db: Database) {
  // Production-safe migration to remove timestamp columns by recreating tables
  // Uses batch approach: create all tables, copy all data, drop old tables, rename new tables

  try {
    // Check if migration already completed by looking for a marker

    const migrationCheck = db
      .prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='migration_timestamps_dropped'
    `)
      .get()

    if (migrationCheck) {
      return
    }

    // Check current foreign key setting
    db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number }

    // Batch migration approach: create all tables, copy all data, drop old tables, rename new tables

    db.exec('BEGIN TRANSACTION')

    // PHASE 1: Create all new tables without timestamp columns

    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL
      )
    `)

    db.exec(`
      CREATE TABLE posts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        post_type TEXT NOT NULL,
        poll_config TEXT,
        sort_order INTEGER DEFAULT 0
      )
    `)

    db.exec(`
      CREATE TABLE comments_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        content TEXT NOT NULL
      )
    `)

    db.exec(`
      CREATE TABLE poll_responses_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        response_data TEXT NOT NULL,
        UNIQUE (user_id, post_id)
      )
    `)

    db.exec(`
      CREATE TABLE hearts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_type TEXT NOT NULL,
        target_id INTEGER NOT NULL,
        UNIQUE (user_id, target_type, target_id)
      )
    `)

    // PHASE 2: Copy all data from old tables to new tables

    const userCount = db
      .prepare('SELECT COUNT(*) as count FROM users')
      .get() as { count: number }

    db.exec(
      'INSERT INTO users_new (id, token, username) SELECT id, token, username FROM users',
    )

    const postCount = db
      .prepare('SELECT COUNT(*) as count FROM posts')
      .get() as { count: number }

    db.exec(
      'INSERT INTO posts_new (id, user_id, title, content, post_type, poll_config, sort_order) SELECT id, user_id, title, content, post_type, poll_config, sort_order FROM posts',
    )

    const commentCount = db
      .prepare('SELECT COUNT(*) as count FROM comments')
      .get() as { count: number }

    db.exec(
      'INSERT INTO comments_new (id, user_id, post_id, content) SELECT id, user_id, post_id, content FROM comments',
    )

    const responseCount = db
      .prepare('SELECT COUNT(*) as count FROM poll_responses')
      .get() as { count: number }

    db.exec(
      'INSERT INTO poll_responses_new (id, user_id, post_id, response_data) SELECT id, user_id, post_id, response_data FROM poll_responses',
    )

    const heartCount = db
      .prepare('SELECT COUNT(*) as count FROM hearts')
      .get() as { count: number }

    db.exec(
      'INSERT INTO hearts_new (id, user_id, target_type, target_id) SELECT id, user_id, target_type, target_id FROM hearts',
    )

    // PHASE 3: Verify data was copied correctly

    const newUserCount = db
      .prepare('SELECT COUNT(*) as count FROM users_new')
      .get() as { count: number }
    const newPostCount = db
      .prepare('SELECT COUNT(*) as count FROM posts_new')
      .get() as { count: number }
    const newCommentCount = db
      .prepare('SELECT COUNT(*) as count FROM comments_new')
      .get() as { count: number }
    const newResponseCount = db
      .prepare('SELECT COUNT(*) as count FROM poll_responses_new')
      .get() as { count: number }
    const newHeartCount = db
      .prepare('SELECT COUNT(*) as count FROM hearts_new')
      .get() as { count: number }

    if (userCount.count !== newUserCount.count) {
      throw new Error(
        `User data copy failed: ${userCount.count} -> ${newUserCount.count}`,
      )
    }
    if (postCount.count !== newPostCount.count) {
      throw new Error(
        `Post data copy failed: ${postCount.count} -> ${newPostCount.count}`,
      )
    }
    if (commentCount.count !== newCommentCount.count) {
      throw new Error(
        `Comment data copy failed: ${commentCount.count} -> ${newCommentCount.count}`,
      )
    }
    if (responseCount.count !== newResponseCount.count) {
      throw new Error(
        `Poll response data copy failed: ${responseCount.count} -> ${newResponseCount.count}`,
      )
    }
    if (heartCount.count !== newHeartCount.count) {
      throw new Error(
        `Heart data copy failed: ${heartCount.count} -> ${newHeartCount.count}`,
      )
    }

    // Commit the data copy transaction first

    db.exec('COMMIT')

    // PHASE 4: Drop old tables in reverse dependency order (children first)

    // Temporarily disable foreign keys to allow dropping users table (session table references it)
    db.exec('PRAGMA foreign_keys = OFF')

    // Start new transaction for table drops and renames

    db.exec('BEGIN TRANSACTION')
    db.exec('DROP TABLE hearts')
    db.exec('DROP TABLE poll_responses')
    db.exec('DROP TABLE comments')
    db.exec('DROP TABLE posts')
    db.exec('DROP TABLE users')

    // PHASE 5: Rename new tables to final names

    db.exec('ALTER TABLE users_new RENAME TO users')
    db.exec('ALTER TABLE posts_new RENAME TO posts')
    db.exec('ALTER TABLE comments_new RENAME TO comments')
    db.exec('ALTER TABLE poll_responses_new RENAME TO poll_responses')
    db.exec('ALTER TABLE hearts_new RENAME TO hearts')

    db.exec('PRAGMA foreign_keys = ON')

    // Create migration marker table

    db.exec(`
      CREATE TABLE migration_timestamps_dropped (
        id INTEGER PRIMARY KEY,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    db.exec('INSERT INTO migration_timestamps_dropped (id) VALUES (1)')

    // PHASE 6: Verify foreign key integrity

    const fkViolations = db.prepare('PRAGMA foreign_key_check').all()

    if (fkViolations.length > 0) {
      console.error('[MIGRATION] Foreign key violations found:', fkViolations)
      throw new Error(
        `Foreign key integrity check failed: ${fkViolations.length} violations found`,
      )
    }

    // Commit the table drops/renames transaction
    db.exec('COMMIT')
  } catch (error) {
    console.error('[MIGRATION] ERROR occurred during migration:', error)
    console.error('[MIGRATION] Stack trace:', (error as Error).stack)

    // Rollback on error
    try {
      db.exec('ROLLBACK')
    } catch (rollbackError) {
      console.error(
        '[MIGRATION] Failed to rollback transaction:',
        rollbackError,
      )
    }

    throw error
  }
}
