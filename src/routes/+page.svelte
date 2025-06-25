<script lang="ts">
import { goto } from '$app/navigation'
import { onMount } from 'svelte'

onMount(() => {
  // Redirect to feed - auth is now handled server-side
  goto('/feed')
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
		color: var(--color-primary);
		margin-bottom: 2rem;
	}
</style>
