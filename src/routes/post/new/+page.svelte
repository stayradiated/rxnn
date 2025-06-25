<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { getTokenFromStorage } from '$lib/token-storage'
import { onMount } from 'svelte'

onMount(() => {
  const token = getTokenFromStorage() || ''

  if (!token) {
    goto('/login')
    return
  }

  // Redirect to feed since we now have separate pages for text and poll creation
  goto('/feed')
})
</script>

<svelte:head>
  <title>Redirecting - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="loading">
    <h1>🗣️ Anonymous Voice</h1>
    <p>Redirecting to feed...</p>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  .loading {
    text-align: center;
  }

  h1 {
    color: #2563eb;
    margin-bottom: 1rem;
  }

  p {
    color: #6b7280;
  }
</style>
