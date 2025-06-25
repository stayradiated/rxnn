import { join } from 'node:path'
import Database from 'better-sqlite3'

// Database setup and schema
let db: Database.Database

export function initDatabase() {
  // Use data directory for production, local file for development
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'survey.db')

  db = new Database(dbPath)

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')

  // Create tables
  createTables()

  return db
}

function createTables() {
  // Users table - stores anonymous tokens
  db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT UNIQUE NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)

  // Responses table - stores survey answers
  db.exec(`
		CREATE TABLE IF NOT EXISTS responses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			question_id TEXT NOT NULL,
			answer TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
			UNIQUE (user_id, question_id)
		)
	`)

  // Create indexes for better performance
  db.exec(`
		CREATE INDEX IF NOT EXISTS idx_users_token ON users (token);
		CREATE INDEX IF NOT EXISTS idx_responses_user_question ON responses (user_id, question_id);
		CREATE INDEX IF NOT EXISTS idx_responses_question ON responses (question_id);
	`)
}

export function getDatabase() {
  if (!db) {
    return initDatabase()
  }
  return db
}

// User operations
export function findOrCreateUser(token: string) {
  const db = getDatabase()

  // Try to find existing user
  const existingUser = db
    .prepare('SELECT * FROM users WHERE token = ?')
    .get(token)

  if (existingUser) {
    // Update last access time
    db.prepare(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ).run(existingUser.id)
    return existingUser
  }

  // Create new user
  const result = db
    .prepare(`
		INSERT INTO users (token) 
		VALUES (?) 
		RETURNING *
	`)
    .get(token)

  return result
}

// Response operations
export function saveResponse(userId: number, questionId: string, answer: any) {
  const db = getDatabase()

  const answerJson = JSON.stringify(answer)

  // Use UPSERT to handle both insert and update
  return db
    .prepare(`
		INSERT INTO responses (user_id, question_id, answer) 
		VALUES (?, ?, ?)
		ON CONFLICT (user_id, question_id) 
		DO UPDATE SET 
			answer = excluded.answer,
			updated_at = CURRENT_TIMESTAMP
	`)
    .run(userId, questionId, answerJson)
}

export function saveMultipleResponses(
  userId: number,
  responses: Record<string, any>,
) {
  const db = getDatabase()

  // Use a transaction for atomicity
  const saveTransaction = db.transaction(
    (userId: number, responses: Record<string, any>) => {
      for (const [questionId, answer] of Object.entries(responses)) {
        if (answer !== undefined && answer !== null && answer !== '') {
          saveResponse(userId, questionId, answer)
        }
      }
    },
  )

  return saveTransaction(userId, responses)
}

export function getUserResponses(userId: number) {
  const db = getDatabase()

  const responses = db
    .prepare(`
		SELECT question_id, answer 
		FROM responses 
		WHERE user_id = ?
	`)
    .all(userId)

  // Convert back to object format
  const result: Record<string, any> = {}
  for (const row of responses as any[]) {
    result[row.question_id] = JSON.parse(row.answer)
  }

  return result
}

// Aggregated data for public results
export function getAggregatedResults() {
  const db = getDatabase()

  // Get total response count
  const totalUsers = db
    .prepare('SELECT COUNT(*) as count FROM users')
    .get() as { count: number }

  // Privacy check
  if (totalUsers.count < 5) {
    return {
      totalResponses: totalUsers.count,
      hasMinimumResponses: false,
    }
  }

  // Get aggregated responses by question
  const responses = db
    .prepare(`
		SELECT question_id, answer, COUNT(*) as count 
		FROM responses 
		GROUP BY question_id, answer
		ORDER BY question_id, answer
	`)
    .all() as Array<{ question_id: string; answer: string; count: number }>

  // Group by question
  const aggregated: Record<string, Record<string, number>> = {}
  for (const row of responses) {
    if (!aggregated[row.question_id]) {
      aggregated[row.question_id] = {}
    }

    const answer = JSON.parse(row.answer)
    const key =
      typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
    aggregated[row.question_id][key] = row.count
  }

  return {
    totalResponses: totalUsers.count,
    hasMinimumResponses: true,
    lastUpdated: new Date().toISOString(),
    responses: aggregated,
  }
}

// Demographic filtering for privacy
export function getFilteredDemographics() {
  const db = getDatabase()

  // Only show demographic combinations with 3+ responses
  const demographics = db
    .prepare(`
		SELECT u.id, 
			   JSON_EXTRACT(r1.answer, '$') as department,
			   JSON_EXTRACT(r2.answer, '$') as tenure
		FROM users u
		LEFT JOIN responses r1 ON u.id = r1.user_id AND r1.question_id = 'department'
		LEFT JOIN responses r2 ON u.id = r2.user_id AND r2.question_id = 'tenure'
		WHERE r1.answer IS NOT NULL AND r2.answer IS NOT NULL
	`)
    .all() as Array<{ id: number; department: string; tenure: string }>

  // Count combinations
  const combinations: Record<string, number> = {}
  for (const row of demographics) {
    const key = `${row.department}-${row.tenure}`
    combinations[key] = (combinations[key] || 0) + 1
  }

  // Filter out combinations with < 3 responses
  const filtered = Object.entries(combinations)
    .filter(([_, count]) => count >= 3)
    .reduce(
      (acc, [key, count]) => {
        acc[key] = count
        return acc
      },
      {} as Record<string, number>,
    )

  return filtered
}

// Initialize database on module load in production
if (process.env.NODE_ENV === 'production') {
  initDatabase()
}
