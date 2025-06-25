import { getAggregatedResults } from '$lib/database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  try {
    const aggregatedData = getAggregatedResults()

    return {
      data: aggregatedData,
      hasMinimumResponses: aggregatedData.hasMinimumResponses,
    }
  } catch (error) {
    console.error('Error loading results:', error)

    // Return safe fallback data
    return {
      data: {
        totalResponses: 0,
        hasMinimumResponses: false,
        lastUpdated: new Date().toISOString(),
        responses: {},
      },
      hasMinimumResponses: false,
    }
  }
}
