import { sha256 } from '@oslojs/crypto/sha2'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'
import type { RequestEvent } from '@sveltejs/kit'
import { getDatabase } from './platform-database.js'

export interface Session {
  id: string
  userId: number
  expiresAt: Date
}

export interface User {
  id: number
  token: string
  username: string
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

export function createSession(token: string, userId: number): Session {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  }

  const db = getDatabase()
  db.prepare(
    'INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)',
  ).run(
    session.id,
    session.userId,
    Math.floor(session.expiresAt.getTime() / 1000),
  )

  return session
}

export function validateSessionToken(token: string): SessionValidationResult {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const db = getDatabase()

  const row = db
    .prepare(`
    SELECT session.id, session.user_id, session.expires_at, 
           users.id as user_id, users.token, users.username
    FROM session 
    INNER JOIN users ON users.id = session.user_id 
    WHERE session.id = ?
  `)
    .get(sessionId) as any

  if (row === undefined) {
    return { session: null, user: null }
  }

  const session: Session = {
    id: row.id,
    userId: row.user_id,
    expiresAt: new Date(row.expires_at * 1000),
  }

  const user: User = {
    id: row.user_id,
    token: row.token,
    username: row.username,
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    deleteSession(sessionId)
    return { session: null, user: null }
  }

  return { session, user }
}

export function invalidateSession(sessionId: string): void {
  deleteSession(sessionId)
}

export function deleteSession(sessionId: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM session WHERE id = ?').run(sessionId)
}

// Cookie management functions
export function setSessionTokenCookie(
  event: RequestEvent,
  token: string,
  expiresAt: Date,
): void {
  event.cookies.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
  event.cookies.set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })
}
