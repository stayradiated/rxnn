import {
  getAllRadioPollsForExport,
  getAllScalePollsForExport,
} from '$lib/platform-database'
import { writeToString } from '@fast-csv/format'

export async function load() {
  // Get poll data for export
  const scalePolls = getAllScalePollsForExport()
  const radioPolls = getAllRadioPollsForExport()

  // Get original radio posts to access option IDs
  const { getDatabase } = await import('$lib/platform-database')
  const db = getDatabase()
  const radioPosts = db
    .prepare<
      [],
      {
        id: number
        title: string
        poll_config: string
      }
    >(`
      SELECT id, title, poll_config
      FROM posts
      WHERE post_type = 'radio'
      ORDER BY sort_order ASC
    `)
    .all()

  // Generate CSV for scale polls
  let scaleCsvData = ''
  if (scalePolls.length > 0) {
    const maxScaleValues = Math.max(
      ...scalePolls.map((poll) => poll.max - poll.min + 1),
    )

    // Create headers array for scale values
    const scaleHeaders: string[] = []
    for (let i = 1; i <= maxScaleValues; i++) {
      scaleHeaders.push(`${i}`)
    }

    const headers = [
      'Title',
      'Description',
      'Response Count',
      'Meta',
      'Min Label',
      ...scaleHeaders,
      'Max Label',
      'Prefer not to say',
      'Not applicable',
    ]

    // Convert polls to objects
    const rows = scalePolls.map((poll) => {
      const maxValues = Math.max(...scalePolls.map((p) => p.max - p.min + 1))
      const paddedSums = [...poll.sums]

      // Pad with zeros if this poll has fewer scale values than the max
      while (paddedSums.length < maxValues) {
        paddedSums.push(0)
      }

      const metaInfo = poll.responseCount === 0 ? 'Censored (<5 responses)' : ''

      const row: Record<string, string | number> = {
        Title: poll.title,
        Description: poll.description,
        'Response Count': poll.responseCount,
        Meta: metaInfo,
        'Min Label': poll.minLabel,
        'Max Label': poll.maxLabel,
        'Prefer not to say': poll.preferNotToSay,
        'Not applicable': poll.notApplicable,
      }

      // Add scale values dynamically
      paddedSums.forEach((sum, index) => {
        row[`${index + 1}`] = sum
      })

      return row
    })

    scaleCsvData = await writeToString(rows, { headers })
  }

  // Generate CSV for radio polls
  let radioCsvData = ''
  if (radioPolls.length > 0) {
    // Find the maximum number of options across all polls
    const maxOptions = Math.max(
      ...radioPosts.map((post) => {
        const config = JSON.parse(post.poll_config)
        return config.options.length
      }),
    )

    // Create headers for the maximum number of options
    const optionHeaders: string[] = []
    for (let i = 0; i < maxOptions; i++) {
      const optionLetter = String.fromCharCode(65 + i) // A, B, C, D, etc.
      optionHeaders.push(`Label ${optionLetter}`, optionLetter)
    }

    const headers = [
      'Title',
      'Description',
      'Response Count',
      'Meta',
      ...optionHeaders,
      'Prefer not to say',
      'Not applicable',
    ]

    // Convert polls to objects
    const rows = radioPolls.map((poll) => {
      const originalPoll = radioPosts.find((p) => p.title === poll.title)
      const config = originalPoll ? JSON.parse(originalPoll.poll_config) : null

      const metaInfo = poll.responseCount === 0 ? 'Censored (<5 responses)' : ''

      const row: Record<string, string | number> = {
        Title: poll.title,
        Description: poll.description,
        'Response Count': poll.responseCount,
        Meta: metaInfo,
        'Prefer not to say': poll.preferNotToSay,
        'Not applicable': poll.notApplicable,
      }

      // Fill data for each option slot
      for (let i = 0; i < maxOptions; i++) {
        const optionLetter = String.fromCharCode(65 + i) // A, B, C, D, etc.
        const configOption = config?.options[i]

        if (configOption) {
          // Find the matching poll option by label
          const pollOption = poll.options.find(
            (o: { label: string; count: number }) =>
              o.label === configOption.label,
          )
          row[`Label ${optionLetter}`] = configOption.label
          row[optionLetter] = pollOption?.count || 0
        } else {
          // Empty slots for polls with fewer options
          row[`Label ${optionLetter}`] = ''
          row[optionLetter] = 0
        }
      }

      return row
    })

    radioCsvData = await writeToString(rows, { headers })
  }

  return {
    scaleCsv: scaleCsvData,
    radioCsv: radioCsvData,
    scaleCount: scalePolls.length,
    radioCount: radioPolls.length,
  }
}
