import { z } from 'zod/v4'

// Poll configuration schemas
export const radioPollConfigSchema = z.object({
  type: z.literal('radio'),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, 'Option label cannot be empty'),
      }),
    )
    .min(2, 'Radio polls need at least 2 options'),
})

export const scalePollConfigSchema = z
  .object({
    type: z.literal('scale'),
    min: z.number().int(),
    max: z.number().int(),
    minLabel: z.string().optional().default(''),
    maxLabel: z.string().optional().default(''),
  })
  .refine((data) => data.min < data.max, {
    message:
      'Scale polls need valid min and max values (min must be less than max)',
  })

export const pollConfigSchema = z.union([
  radioPollConfigSchema,
  scalePollConfigSchema,
])

// Poll response data schema
export const pollResponseDataSchema = z.record(z.string(), z.any())
