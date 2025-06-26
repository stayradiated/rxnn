import { z } from 'zod/v4'

/**
 * Helper function to parse stringified JSON within form data
 * Accepts both objects and JSON strings, validates against the provided schema
 */
export const json = <T extends z.ZodTypeAny>(
  type: T,
): z.ZodPipe<z.ZodTransform<unknown, unknown>, T> =>
  z.preprocess((input, ctx) => {
    if (typeof input !== 'string') return input
    try {
      return JSON.parse(input)
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON', input })
      return z.NEVER
    }
  }, type)
