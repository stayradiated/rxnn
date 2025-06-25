import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Fetch aggregated data from database
	// For now, return mock data to demonstrate the structure
	
	const mockData = {
		totalResponses: 12,
		lastUpdated: new Date().toISOString(),
		demographics: {
			department: {
				engineering: 5,
				product: 3,
				marketing: 2,
				sales: 1,
				operations: 1
			},
			tenure: {
				'0-1': 3,
				'1-2': 4,
				'2-3': 3,
				'3+': 2
			}
		},
		fourDayWeek: {
			averageUsage: 75,
			likelihood: {
				1: 1,
				2: 2,
				3: 3,
				4: 4,
				5: 2
			}
		}
	};

	return {
		data: mockData,
		hasMinimumResponses: mockData.totalResponses >= 5
	};
};