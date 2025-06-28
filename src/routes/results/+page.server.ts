import {
  getAllRadioPollsForExport,
  getAllScalePollsForExport,
} from '$lib/platform-database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  try {
    const scalePolls = getAllScalePollsForExport()
    const radioPolls = getAllRadioPollsForExport()

    // Find specific polls by title to match the HTML template
    const stressPoll = scalePolls.find((p) => p.title === 'Stress Level')
    const trustPoll = scalePolls.find((p) => p.title === 'Trust in Leadership')
    const fourDayPoll = scalePolls.find(
      (p) => p.title === 'How often do you work a true four-day (32 h) week?',
    )
    const importancePoll = scalePolls.find(
      (p) => p.title === 'Importance of a Four-Day Week',
    )
    const redundancyPoll = scalePolls.find(
      (p) => p.title === 'How Likely Are You To Take Voluntary Redundancy?',
    )

    // Additional polls from CSV
    const financialDependencePoll = scalePolls.find(
      (p) => p.title === 'Financial Dependence on This Job',
    )
    const partTimePoll = scalePolls.find(
      (p) => p.title === 'How Likely Are You To Take Part Time?',
    )
    const leavingPoll = scalePolls.find(
      (p) =>
        p.title ===
        'Has the current change proposal made you start thinking about leaving Runn in the near future?',
    )
    const changeProcessPoll = scalePolls.find(
      (p) =>
        p.title === 'How would you rate the approach to the change process?',
    )
    const layoffDepartmentsPoll = scalePolls.find(
      (p) =>
        p.title ===
        'How do you feel about what departments the proposed layoffs are being suggested from',
    )

    // Pay cut polls for the line chart
    const payCut12Poll = radioPolls.find((p) => p.title === '12 Month Pay Cut')
    const payCut6Poll = radioPolls.find((p) => p.title === '6 Month Pay Cut')
    const payCut3Poll = radioPolls.find((p) => p.title === '3 Month Pay Cut')

    // Tenure poll
    const tenurePoll = radioPolls.find(
      (p) => p.title === 'How long have you worked at Runn?',
    )

    return {
      scalePolls,
      radioPolls,
      dashboardData: {
        stress: stressPoll,
        trust: trustPoll,
        fourDay: fourDayPoll,
        importance: importancePoll,
        redundancy: redundancyPoll,
        financialDependence: financialDependencePoll,
        partTime: partTimePoll,
        leaving: leavingPoll,
        changeProcess: changeProcessPoll,
        layoffDepartments: layoffDepartmentsPoll,
        payCut12: payCut12Poll,
        payCut6: payCut6Poll,
        payCut3: payCut3Poll,
        tenure: tenurePoll,
      },
    }
  } catch (error) {
    console.error('Error loading results data:', error)
    return {
      scalePolls: [],
      radioPolls: [],
      dashboardData: {},
    }
  }
}
