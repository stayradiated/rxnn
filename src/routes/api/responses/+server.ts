import {
  findOrCreateUser,
  getAggregatedResults,
  saveMultipleResponses,
} from '$lib/database'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  try {
    const aggregatedData = getAggregatedResults()

    // Privacy check: only return data if minimum threshold met
    if (!aggregatedData.hasMinimumResponses) {
      return json(
        {
          error: 'Insufficient responses for privacy protection',
          minimumRequired: 5,
          currentCount: aggregatedData.totalResponses,
        },
        { status: 403 },
      )
    }

    return json(aggregatedData)
  } catch (error) {
    console.error('Error fetching aggregated results:', error)
    return json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { token, responses } = await request.json()

    if (!token || typeof token !== 'string') {
      return json({ error: 'Valid token required' }, { status: 400 })
    }

    if (!responses || typeof responses !== 'object') {
      return json({ error: 'Valid responses required' }, { status: 400 })
    }

    // Validate token format (64 hex characters)
    const tokenRegex = /^[a-f0-9]{64}$/
    if (!tokenRegex.test(token)) {
      return json({ error: 'Invalid token format' }, { status: 400 })
    }

    // Find or create user and save responses
    const user = findOrCreateUser(token)
    saveMultipleResponses(user.id, responses)

    console.log('Saved responses for token:', `${token.substring(0, 8)}...`)

    return json({
      success: true,
      message: 'Responses saved successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error saving responses:', error)
    return json({ error: 'Failed to save responses' }, { status: 500 })
  }
}

export const PUT: RequestHandler = async ({ request }) => {
  // Alias for POST - allows updating existing responses
  return POST({ request } as any)
}
