import { redirect } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load = (async (_event) => {
  return redirect(302, '/feed')
}) satisfies PageServerLoad
