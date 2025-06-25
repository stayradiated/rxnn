import { redirect } from '@sveltejs/kit';
import { randomBytes } from 'crypto';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	
	if (!token) {
		const newToken = randomBytes(32).toString('hex');
		throw redirect(302, `/survey?token=${newToken}`);
	}

	// TODO: Validate token format and load existing responses
	return {
		token,
		responses: {} // Will be populated from database
	};
};