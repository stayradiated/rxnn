<script lang="ts">
import { Chart, registerables, type TooltipItem } from 'chart.js'
import { onMount } from 'svelte'
import type { PageData } from './$types'

export let data: PageData

onMount(() => {
  Chart.register(...registerables)

  // Chart defaults
  Chart.defaults.color = '#888'
  Chart.defaults.borderColor = '#333'
  Chart.defaults.font.family =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  // Create specific charts matching the HTML template
  if (data.dashboardData.stress) createStressChart()
  if (data.dashboardData.trust) createTrustChart()
  if (data.dashboardData.fourDay) createFourDayChart()
  if (
    data.dashboardData.payCut12 &&
    data.dashboardData.payCut6 &&
    data.dashboardData.payCut3
  )
    createPayCutChart()
  if (data.dashboardData.redundancy) createRedundancyChart()
  if (data.dashboardData.tenure) createTenureChart()

  // Additional charts from CSV data
  if (data.dashboardData.financialDependence) createFinancialDependenceChart()
  if (data.dashboardData.partTime) createPartTimeChart()
  if (data.dashboardData.leaving) createLeavingChart()
  if (data.dashboardData.changeProcess) createChangeProcessChart()
  if (data.dashboardData.layoffDepartments) createLayoffDepartmentsChart()
  if (data.dashboardData.importance) createImportanceChart()
})

function createStressChart() {
  const canvas = document.getElementById('stressChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.stress) return

  const poll = data.dashboardData.stress

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1 - Minimal', '2', '3', '4', '5 - Severe'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(168, 218, 220, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(230, 57, 70, 0.8)',
          ],
          borderColor: [
            'rgb(168, 218, 220)',
            'rgb(129, 204, 206)',
            'rgb(241, 250, 238)',
            'rgb(230, 134, 92)',
            'rgb(230, 57, 70)',
          ],
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.parsed.y
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${value} employees (${percentage}%)`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#333' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  })
}

function createTrustChart() {
  const canvas = document.getElementById('trustChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.trust) return

  const poll = data.dashboardData.trust

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Very Little', 'Low', 'Moderate', 'High', 'Complete Trust'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(230, 57, 70, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(69, 123, 157, 0.8)',
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => {
              const value = context.parsed
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${context.label}: ${value} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

function createFourDayChart() {
  const canvas = document.getElementById('fourDayChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.fourDay) return

  const poll = data.dashboardData.fourDay

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Every Week'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(230, 57, 70, 0.7)',
            'rgba(230, 134, 92, 0.7)',
            'rgba(241, 250, 238, 0.7)',
            'rgba(129, 204, 206, 0.7)',
            'rgba(69, 123, 157, 0.7)',
          ],
          borderWidth: 2,
          borderColor: '#1a1a1a',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 15 },
        },
      },
      scales: {
        r: {
          grid: { color: '#333' },
          ticks: { display: false },
        },
      },
    },
  })
}

function createPayCutChart() {
  const canvas = document.getElementById('payCutChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (
    !ctx ||
    !data.dashboardData.payCut12 ||
    !data.dashboardData.payCut6 ||
    !data.dashboardData.payCut3
  )
    return

  // Extract data for 0%, 10%, and 20% options across the three time periods
  const poll12 = data.dashboardData.payCut12
  const poll6 = data.dashboardData.payCut6
  const poll3 = data.dashboardData.payCut3

  // Map the option counts - assuming the options are in order: 0%, 5%, 10%, 15%, 20%
  const data0Percent = [
    poll12.options.find(
      (o: { label: string; count: number }) => o.label === '0%',
    )?.count || 0,
    poll6.options.find(
      (o: { label: string; count: number }) => o.label === '0%',
    )?.count || 0,
    poll3.options.find(
      (o: { label: string; count: number }) => o.label === '0%',
    )?.count || 0,
  ]

  const data5Percent = [
    poll12.options.find(
      (o: { label: string; count: number }) => o.label === '5%',
    )?.count || 0,
    poll6.options.find(
      (o: { label: string; count: number }) => o.label === '5%',
    )?.count || 0,
    poll3.options.find(
      (o: { label: string; count: number }) => o.label === '5%',
    )?.count || 0,
  ]

  const data10Percent = [
    poll12.options.find(
      (o: { label: string; count: number }) => o.label === '10%',
    )?.count || 0,
    poll6.options.find(
      (o: { label: string; count: number }) => o.label === '10%',
    )?.count || 0,
    poll3.options.find(
      (o: { label: string; count: number }) => o.label === '10%',
    )?.count || 0,
  ]

  const data15Percent = [
    poll12.options.find(
      (o: { label: string; count: number }) => o.label === '15%',
    )?.count || 0,
    poll6.options.find(
      (o: { label: string; count: number }) => o.label === '15%',
    )?.count || 0,
    poll3.options.find(
      (o: { label: string; count: number }) => o.label === '15%',
    )?.count || 0,
  ]

  const data20Percent = [
    poll12.options.find(
      (o: { label: string; count: number }) => o.label === '20%',
    )?.count || 0,
    poll6.options.find(
      (o: { label: string; count: number }) => o.label === '20%',
    )?.count || 0,
    poll3.options.find(
      (o: { label: string; count: number }) => o.label === '20%',
    )?.count || 0,
  ]

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['12 Months', '6 Months', '3 Months'],
      datasets: [
        {
          label: '0%',
          data: data0Percent,
          borderColor: 'rgba(230, 57, 70, 0.8)',
          backgroundColor: 'rgba(230, 57, 70, 0.1)',
          tension: 0.4,
        },
        {
          label: '5%',
          data: data5Percent,
          borderColor: 'rgba(230, 134, 92, 0.8)',
          backgroundColor: 'rgba(230, 134, 92, 0.1)',
          tension: 0.4,
        },
        {
          label: '10%',
          data: data10Percent,
          borderColor: 'rgba(241, 250, 238, 0.8)',
          backgroundColor: 'rgba(241, 250, 238, 0.1)',
          tension: 0.4,
        },
        {
          label: '15%',
          data: data15Percent,
          borderColor: 'rgba(129, 204, 206, 0.8)',
          backgroundColor: 'rgba(129, 204, 206, 0.1)',
          tension: 0.4,
        },
        {
          label: '20%',
          data: data20Percent,
          borderColor: 'rgba(69, 123, 157, 0.8)',
          backgroundColor: 'rgba(69, 123, 157, 0.1)',
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20 },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            labelColor: (context: TooltipItem<'line'>) => {
              return {
                borderColor: context.dataset.borderColor as string,
                backgroundColor: context.dataset.borderColor as string,
              }
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#333' },
          title: {
            display: true,
            text: 'Number of Employees',
          },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  })
}

function createRedundancyChart() {
  const canvas = document.getElementById('redundancyChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.redundancy) return

  const poll = data.dashboardData.redundancy

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Not At All', 'Unlikely', 'Neutral', 'Likely', 'Very Likely'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: 'rgba(69, 123, 157, 0.8)',
          borderColor: 'rgb(69, 123, 157)',
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.parsed.x
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${value} employees (${percentage}%)`
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: '#333' },
        },
        y: {
          grid: { display: false },
        },
      },
    },
  })
}

function createTenureChart() {
  const canvas = document.getElementById('tenureChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.tenure) return

  const poll = data.dashboardData.tenure

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: poll.options.map(
        (o: { label: string; count: number }) => o.label,
      ),
      datasets: [
        {
          data: poll.options.map(
            (o: { label: string; count: number }) => o.count,
          ),
          backgroundColor: [
            'rgba(230, 57, 70, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(69, 123, 157, 0.8)',
          ],
          borderWidth: 2,
          borderColor: '#1a1a1a',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { padding: 15 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'pie'>) => {
              const value = context.parsed
              const total = poll.options.reduce(
                (a: number, b: { label: string; count: number }) => a + b.count,
                0,
              )
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${context.label}: ${value} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

function createFinancialDependenceChart() {
  const canvas = document.getElementById(
    'financialDependenceChart',
  ) as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.financialDependence) return

  const poll = data.dashboardData.financialDependence

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1 - Manageable', '2', '3', '4', "5 - Can't do without"],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(168, 218, 220, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(230, 57, 70, 0.8)',
          ],
          borderColor: [
            'rgb(168, 218, 220)',
            'rgb(129, 204, 206)',
            'rgb(241, 250, 238)',
            'rgb(230, 134, 92)',
            'rgb(230, 57, 70)',
          ],
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.parsed.y
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${value} employees (${percentage}%)`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#333' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  })
}

function createPartTimeChart() {
  const canvas = document.getElementById('partTimeChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.partTime) return

  const poll = data.dashboardData.partTime

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Not At All', 'Unlikely', 'Neutral', 'Likely', 'Very Likely'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(230, 57, 70, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(69, 123, 157, 0.8)',
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => {
              const value = context.parsed
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${context.label}: ${value} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

function createLeavingChart() {
  const canvas = document.getElementById('leavingChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.leaving) return

  const poll = data.dashboardData.leaving

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Not at all', 'Slightly', 'Somewhat', 'Quite a bit', 'A lot'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: 'rgba(230, 57, 70, 0.8)',
          borderColor: 'rgb(230, 57, 70)',
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.parsed.x
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${value} employees (${percentage}%)`
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: '#333' },
        },
        y: {
          grid: { display: false },
        },
      },
    },
  })
}

function createChangeProcessChart() {
  const canvas = document.getElementById(
    'changeProcessChart',
  ) as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.changeProcess) return

  const poll = data.dashboardData.changeProcess

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Poor', 'Below Average', 'Average', 'Good', 'Great'],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(230, 57, 70, 0.7)',
            'rgba(230, 134, 92, 0.7)',
            'rgba(241, 250, 238, 0.7)',
            'rgba(129, 204, 206, 0.7)',
            'rgba(69, 123, 157, 0.7)',
          ],
          borderWidth: 2,
          borderColor: '#1a1a1a',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 15 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'polarArea'>) => {
              const value = context.parsed.r
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${context.label}: ${value} (${percentage}%)`
            },
          },
        },
      },
      scales: {
        r: {
          grid: { color: '#333' },
          ticks: { display: false },
        },
      },
    },
  })
}

function createLayoffDepartmentsChart() {
  const canvas = document.getElementById(
    'layoffDepartmentsChart',
  ) as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.layoffDepartments) return

  const poll = data.dashboardData.layoffDepartments

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Strongly Disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly Agree',
      ],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(230, 57, 70, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(69, 123, 157, 0.8)',
          ],
          borderColor: [
            'rgb(230, 57, 70)',
            'rgb(230, 134, 92)',
            'rgb(241, 250, 238)',
            'rgb(129, 204, 206)',
            'rgb(69, 123, 157)',
          ],
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.parsed.y
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${value} employees (${percentage}%)`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#333' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  })
}

function createImportanceChart() {
  const canvas = document.getElementById('importanceChart') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!ctx || !data.dashboardData.importance) return

  const poll = data.dashboardData.importance

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'Not Important',
        'Slightly Important',
        'Moderately Important',
        'Very Important',
        'Critical',
      ],
      datasets: [
        {
          data: poll.sums,
          backgroundColor: [
            'rgba(230, 57, 70, 0.8)',
            'rgba(230, 134, 92, 0.8)',
            'rgba(241, 250, 238, 0.8)',
            'rgba(129, 204, 206, 0.8)',
            'rgba(69, 123, 157, 0.8)',
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => {
              const value = context.parsed
              const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${context.label}: ${value} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

// Calculate statistics for insights
function calculateHighStress() {
  if (!data.dashboardData.stress) return 0
  const poll = data.dashboardData.stress
  const highStress = poll.sums
    .slice(-2)
    .reduce((a: number, b: number) => a + b, 0)
  const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
  return total > 0 ? Math.round((highStress / total) * 100) : 0
}

function calculateLowTrust() {
  if (!data.dashboardData.trust) return 0
  const poll = data.dashboardData.trust
  const lowTrust = poll.sums
    .slice(0, 2)
    .reduce((a: number, b: number) => a + b, 0)
  const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
  return total > 0 ? Math.round((lowTrust / total) * 100) : 0
}

function calculateEveryWeek() {
  if (!data.dashboardData.fourDay) return 0
  const poll = data.dashboardData.fourDay
  const everyWeek = poll.sums[poll.sums.length - 1] || 0
  const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
  return total > 0 ? Math.round((everyWeek / total) * 100) : 0
}

function calculateNotInterested() {
  if (!data.dashboardData.redundancy) return 0
  const poll = data.dashboardData.redundancy
  const notInterested = poll.sums[0] || 0
  const total = poll.sums.reduce((a: number, b: number) => a + b, 0)
  return total > 0 ? Math.round((notInterested / total) * 100) : 0
}
</script>

<svelte:head>
  <title>Runn Employee Survey Dashboard - RXNN</title>
</svelte:head>

<div class="container">
  <header>
    <h1>Runn Employee Survey Dashboard</h1>
    <p class="subtitle">Understanding Team Sentiment During Organizational Changes</p>
  </header>

  <div class="insight-card">
    <h3>Key Insights</h3>
    <ul>
      <li><strong>{calculateHighStress()}% of employees</strong> are experiencing high stress levels (4-5 rating)</li>
      <li><strong>{calculateLowTrust()}% have low trust</strong> in leadership's handling of changes</li>
      <li><strong>{calculateEveryWeek()}% work</strong> a true four-day week every week</li>
      <li><strong>{calculateNotInterested()}% are not interested</strong> in voluntary redundancy</li>
      {#if data.dashboardData.financialDependence}
        <li><strong>{Math.round(((data.dashboardData.financialDependence.sums[data.dashboardData.financialDependence.sums.length - 1] || 0) / data.dashboardData.financialDependence.sums.reduce((a, b) => a + b, 0)) * 100)}% can't do without</strong> their current salary</li>
      {/if}
      {#if data.dashboardData.leaving}
        <li><strong>{Math.round(((data.dashboardData.leaving.sums.slice(-2).reduce((a, b) => a + b, 0)) / data.dashboardData.leaving.sums.reduce((a, b) => a + b, 0)) * 100)}% are considering leaving</strong> due to the changes</li>
      {/if}
    </ul>
  </div>

  <div class="grid">
    {#if data.dashboardData.stress && data.dashboardData.stress.responseCount >= 5}
      <div class="card">
        <h2>Employee Stress Levels</h2>
        <p>Current stress and anxiety about proposed changes</p>
        <div class="chart-container">
          <canvas id="stressChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{calculateHighStress()}%</div>
            <div class="stat-label">High Stress</div>
          </div>
          <div class="stat">
            <div class="stat-value">{data.dashboardData.stress.responseCount}</div>
            <div class="stat-label">Responses</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.trust && data.dashboardData.trust.responseCount >= 5}
      <div class="card">
        <h2>Trust in Leadership</h2>
        <p>Confidence in fair and transparent change management</p>
        <div class="chart-container">
          <canvas id="trustChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{calculateLowTrust()}%</div>
            <div class="stat-label">Low Trust</div>
          </div>
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.trust.sums.slice(-2).reduce((a, b) => a + b, 0)) / data.dashboardData.trust.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">High Trust</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.fourDay && data.dashboardData.fourDay.responseCount >= 5}
      <div class="card">
        <h2>Four-Day Work Week Usage</h2>
        <p>How often employees actually work a 32-hour week</p>
        <div class="chart-container">
          <canvas id="fourDayChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{calculateEveryWeek()}%</div>
            <div class="stat-label">Every Week</div>
          </div>
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.fourDay.sums[0] || 0) / data.dashboardData.fourDay.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Never</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.payCut12 && data.dashboardData.payCut6 && data.dashboardData.payCut3}
      <div class="card">
        <h2>Pay Cut Acceptance</h2>
        <p>Willingness to accept pay cuts to avoid layoffs</p>
        <div class="chart-container">
          <canvas id="payCutChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.payCut12.responseCount - (data.dashboardData.payCut12.options.find((o: any) => o.label === '0%')?.count || 0)) / data.dashboardData.payCut12.responseCount) * 100)}%</div>
            <div class="stat-label">Accept Some Cut</div>
          </div>
          <div class="stat">
            <div class="stat-value">{Math.round((((data.dashboardData.payCut12.options.find((o: any) => o.label === '10%')?.count || 0) + (data.dashboardData.payCut12.options.find((o: any) => o.label === '15%')?.count || 0) + (data.dashboardData.payCut12.options.find((o: any) => o.label === '20%')?.count || 0)) / data.dashboardData.payCut12.responseCount) * 100)}%</div>
            <div class="stat-label">Accept 10%+</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.redundancy && data.dashboardData.redundancy.responseCount >= 5}
      <div class="card">
        <h2>Voluntary Redundancy Interest</h2>
        <p>Likelihood of taking voluntary redundancy</p>
        <div class="chart-container">
          <canvas id="redundancyChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{calculateNotInterested()}%</div>
            <div class="stat-label">Not Interested</div>
          </div>
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.redundancy.sums[data.dashboardData.redundancy.sums.length - 1] || 0) / data.dashboardData.redundancy.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Very Likely</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.tenure && data.dashboardData.tenure.responseCount >= 5}
      <div class="card">
        <h2>Tenure Distribution</h2>
        <p>How long employees have been at Runn</p>
        <div class="chart-container">
          <canvas id="tenureChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.tenure.options.slice(-3).reduce((a: number, b: { label: string; count: number }) => a + b.count, 0)) / data.dashboardData.tenure.responseCount) * 100)}%</div>
            <div class="stat-label">2+ Years</div>
          </div>
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.tenure.options[data.dashboardData.tenure.options.length - 1]?.count || 0) / data.dashboardData.tenure.responseCount) * 100)}%</div>
            <div class="stat-label">4+ Years</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.financialDependence && data.dashboardData.financialDependence.responseCount >= 5}
      <div class="card">
        <h2>Financial Dependence on Job</h2>
        <p>How critical is your salary to your household over the next 12 months?</p>
        <div class="chart-container">
          <canvas id="financialDependenceChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.financialDependence.sums[data.dashboardData.financialDependence.sums.length - 1] || 0) / data.dashboardData.financialDependence.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Can't Do Without</div>
          </div>
          <div class="stat">
            <div class="stat-value">{data.dashboardData.financialDependence.responseCount}</div>
            <div class="stat-label">Responses</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.importance && data.dashboardData.importance.responseCount >= 5}
      <div class="card">
        <h2>Four-Day Week Importance</h2>
        <p>How important is a permanent four-day week to you?</p>
        <div class="chart-container">
          <canvas id="importanceChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.importance.sums[data.dashboardData.importance.sums.length - 1] || 0) / data.dashboardData.importance.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Critical</div>
          </div>
          <div class="stat">
            <div class="stat-value">{data.dashboardData.importance.responseCount}</div>
            <div class="stat-label">Responses</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.partTime && data.dashboardData.partTime.responseCount >= 5}
      <div class="card">
        <h2>Part-Time Interest</h2>
        <p>Considering 20% pay cut to continue working 4 days a week?</p>
        <div class="chart-container">
          <canvas id="partTimeChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.partTime.sums[data.dashboardData.partTime.sums.length - 1] || 0) / data.dashboardData.partTime.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Very Likely</div>
          </div>
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.partTime.sums[0] || 0) / data.dashboardData.partTime.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Not At All</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.leaving && data.dashboardData.leaving.responseCount >= 5}
      <div class="card">
        <h2>Considering Leaving</h2>
        <p>Has the change proposal made you think about leaving?</p>
        <div class="chart-container">
          <canvas id="leavingChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.leaving.sums[data.dashboardData.leaving.sums.length - 1] || 0) / data.dashboardData.leaving.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">A Lot</div>
          </div>
          <div class="stat">
            <div class="stat-value">{data.dashboardData.leaving.responseCount}</div>
            <div class="stat-label">Responses</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.changeProcess && data.dashboardData.changeProcess.responseCount >= 5}
      <div class="card">
        <h2>Change Process Rating</h2>
        <p>Communication around proposed changes and townhalls</p>
        <div class="chart-container">
          <canvas id="changeProcessChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.changeProcess.sums[0] || 0) / data.dashboardData.changeProcess.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Poor</div>
          </div>
          <div class="stat">
            <div class="stat-value">{data.dashboardData.changeProcess.responseCount}</div>
            <div class="stat-label">Responses</div>
          </div>
        </div>
      </div>
    {/if}

    {#if data.dashboardData.layoffDepartments && data.dashboardData.layoffDepartments.responseCount >= 5}
      <div class="card">
        <h2>Layoff Department Decisions</h2>
        <p>How do you feel about what departments are being targeted?</p>
        <div class="chart-container">
          <canvas id="layoffDepartmentsChart"></canvas>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{Math.round(((data.dashboardData.layoffDepartments.sums.slice(0, 2).reduce((a, b) => a + b, 0)) / data.dashboardData.layoffDepartments.sums.reduce((a, b) => a + b, 0)) * 100)}%</div>
            <div class="stat-label">Disagree</div>
          </div>
          <div class="stat">
            <div class="stat-value">{data.dashboardData.layoffDepartments.responseCount}</div>
            <div class="stat-label">Responses</div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0a;
    color: #e0e0e0;
    line-height: 1.6;
    overflow-x: hidden;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    padding: 3rem 0;
    margin-bottom: 3rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    position: relative;
    overflow: hidden;
  }

  header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
    animation: pulse 15s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(120deg, #ffffff 0%, #a8dadc 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #a8dadc;
    position: relative;
    z-index: 1;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .card {
    background: linear-gradient(145deg, #1a1a1a, #252525);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    position: relative;
    overflow: hidden;
  }

  .card h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #a8dadc;
  }

  .card p {
    color: #888;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .chart-container {
    position: relative;
    height: 300px;
    margin-top: 1rem;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #333;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #a8dadc;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .insight-card {
    background: linear-gradient(135deg, #457b9d, #1d3557);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
  }

  .insight-card::after {
    content: '💡';
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 2rem;
    opacity: 0.3;
  }

  .insight-card h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #f1faee;
  }

  .insight-card ul {
    list-style: none;
    padding: 0;
  }

  .insight-card li {
    padding: 0.5rem 0;
    padding-left: 2rem;
    position: relative;
    color: #e0e0e0;
  }

  .insight-card li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #a8dadc;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }

    h1 {
      font-size: 2rem;
    }
  }
</style>