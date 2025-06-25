<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { getTokenFromStorage } from '$lib/token-storage'
import { onMount } from 'svelte'

onMount(() => {
  if (browser) {
    const token = getTokenFromStorage()
    if (token) {
      // User has a token, redirect to feed
      goto('/feed')
    } else {
      // No token, redirect to login
      goto('/login')
    }
  }
})
</script>

<svelte:head>
  <title>Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="loading">
    <h1>🗣️ Anonymous Voice</h1>
    <p>Redirecting...</p>
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
</style>
