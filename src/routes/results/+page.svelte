<script lang="ts">
import { onMount } from 'svelte'
import type { PageData } from './$types'

export let data: PageData

let refreshInterval: NodeJS.Timeout

onMount(() => {
  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(() => {
    window.location.reload()
  }, 30000)

  return () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  }
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function getPercentage(value: number, total: number) {
  return Math.round((value / total) * 100)
}
</script>

<svelte:head>
  <title>Survey Results Dashboard</title>
</svelte:head>

<main class="container">
  <div class="header">
    <h1>Anonymous Survey Results</h1>
    <div class="stats">
      <div class="stat">
        <span class="stat-number">{data.data.totalResponses}</span>
        <span class="stat-label">Total Responses</span>
      </div>
      <div class="stat">
        <span class="stat-number">Live</span>
        <span class="stat-label">Updates Every 30s</span>
      </div>
    </div>
  </div>

  {#if !data.hasMinimumResponses}
    <div class="privacy-notice">
      <h2>🔒 Privacy Protection Active</h2>
      <p>Results will be displayed once we have at least 5 responses to protect anonymity.</p>
      <p>Current responses: {data.data.totalResponses}/5</p>
    </div>
  {:else}
    <div class="results-grid">
      <!-- Show available response data -->
      {#if data.data.responses}
        {#each Object.entries(data.data.responses) as [questionId, answers] (questionId)}
          <div class="result-card">
            <h2>{questionId.charAt(0).toUpperCase() + questionId.slice(1).replace(/([A-Z])/g, ' $1')}</h2>
            <div class="chart-container">
              {#each Object.entries(answers) as [answer, count], index (index)}
                <div class="bar-item">
                  <span class="bar-label">{answer}</span>
                  <div class="bar">
                    <div class="bar-fill" style:width="{getPercentage(count, data.data.totalResponses)}%"></div>
                  </div>
                  <span class="bar-value">{count} ({getPercentage(count, data.data.totalResponses)}%)</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {:else}
        <div class="result-card">
          <h2>No Data Available</h2>
          <p>No survey responses have been recorded yet.</p>
        </div>
      {/if}
    </div>
  {/if}

  <div class="footer">
    <p>Last updated: {formatDate(data.data.lastUpdated)}</p>
    <div class="actions">
      <a href="/" class="btn-secondary">Back to Survey</a>
      <button on:click={() => window.location.reload()} class="btn-primary">Refresh Results</button>
    </div>
  </div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.stats {
		display: flex;
		gap: 2rem;
	}

	.stat {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-size: 2rem;
		font-weight: bold;
		color: #2563eb;
	}

	.stat-label {
		display: block;
		font-size: 0.9rem;
		color: #6b7280;
	}

	.privacy-notice {
		background: #fef3c7;
		padding: 2rem;
		border-radius: 8px;
		text-align: center;
		border-left: 4px solid #f59e0b;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.result-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.result-card h2 {
		margin-bottom: 1.5rem;
		color: #374151;
	}

	.chart-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.bar-item {
		display: grid;
		grid-template-columns: 120px 1fr 80px;
		gap: 1rem;
		align-items: center;
	}

	.bar-label {
		font-size: 0.9rem;
		color: #6b7280;
	}

	.bar {
		height: 20px;
		background: #e5e7eb;
		border-radius: 10px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: #2563eb;
		transition: width 0.3s ease;
	}

	.bar-value {
		font-size: 0.9rem;
		color: #374151;
		text-align: right;
	}

	.metric {
		text-align: center;
		padding: 2rem 0;
	}

	.metric-value {
		display: block;
		font-size: 3rem;
		font-weight: bold;
		color: #2563eb;
		margin-bottom: 0.5rem;
	}

	.metric-label {
		color: #6b7280;
	}

	.scale-labels {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
		font-size: 0.8rem;
		color: #6b7280;
	}

	.footer {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer p {
		margin: 0;
		color: #6b7280;
	}

	.actions {
		display: flex;
		gap: 1rem;
	}

	.btn-primary, .btn-secondary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		font-size: 0.9rem;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
	}

	.btn-secondary:hover {
		background: #4b5563;
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			text-align: center;
		}

		.results-grid {
			grid-template-columns: 1fr;
		}

		.bar-item {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.bar-value {
			text-align: left;
		}
	}
</style>
