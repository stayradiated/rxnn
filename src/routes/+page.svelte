<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { getTokenFromStorage, hasStoredToken } from '$lib/token-storage'
import { onMount } from 'svelte'

let hasExistingResponse = false

onMount(() => {
  hasExistingResponse = hasStoredToken()
})

function startSurvey() {
  if (browser) {
    goto('/survey')
  }
}

function editResponse() {
  if (browser) {
    const token = getTokenFromStorage()
    if (token) {
      goto(`/survey?token=${token}`)
    } else {
      goto('/survey')
    }
  }
}
</script>

<svelte:head>
  <title>Anonymous Employee Survey</title>
</svelte:head>

<main class="container">
  <h1>Anonymous Employee Survey</h1>

  <div class="intro">
    <p>This survey is anonymous and will stay open indefinitely.</p>
    <p>Responses (but not your identity) will be displayed live on a shared dashboard so everyone can see aggregate results as they come in.</p>

    {#if !hasExistingResponse}
      <div class="important-notice">
        <h3>⚠️ Important Notice</h3>
        <p><strong>Please only complete this survey once.</strong> After starting, you can return anytime to update your responses using the "Update Survey" button or by bookmarking your unique survey URL.</p>
      </div>
    {:else}
      <div class="returning-user-notice">
        <h3>👋 Welcome Back!</h3>
        <p>You've already started this survey. Click "Update Survey" below to continue or modify your responses.</p>
      </div>
    {/if}

    <div class="features">
      <h2>Key Features</h2>
      <ul>
        <li>✅ Completely anonymous - no personal data collected</li>
        <li>✅ Return anytime to update your responses</li>
        <li>✅ Live results dashboard</li>
        <li>✅ Privacy protected - minimum thresholds apply</li>
      </ul>
    </div>
  </div>

  <div class="actions">
    {#if hasExistingResponse}
      <button on:click={editResponse} class="btn-primary">Update Survey</button>
    {:else}
      <button on:click={startSurvey} class="btn-primary">Start Survey</button>
    {/if}
    <a href="/results" class="btn-secondary">View Results</a>
  </div>
</main>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		color: #2563eb;
		margin-bottom: 2rem;
	}

	.intro {
		background: #f8fafc;
		padding: 2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.features {
		margin-top: 1.5rem;
	}

	.features ul {
		list-style: none;
		padding: 0;
	}

	.features li {
		padding: 0.5rem 0;
		font-size: 1.1rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
		padding: 1rem 2rem;
		border: none;
		border-radius: 6px;
		font-size: 1.1rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
		padding: 1rem 2rem;
		border: none;
		border-radius: 6px;
		font-size: 1.1rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.btn-secondary:hover {
		background: #4b5563;
	}

	.important-notice {
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}

	.important-notice h3 {
		margin: 0 0 0.5rem 0;
		color: #92400e;
	}

	.important-notice p {
		margin: 0;
		color: #92400e;
	}

	.returning-user-notice {
		background: #f0fdf4;
		border: 1px solid #22c55e;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}

	.returning-user-notice h3 {
		margin: 0 0 0.5rem 0;
		color: #15803d;
	}

	.returning-user-notice p {
		margin: 0;
		color: #15803d;
	}
</style>
