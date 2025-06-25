<script lang="ts">
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import ErrorMessage from '$lib/components/login/ErrorMessage.svelte'
import ExistingUserLogin from '$lib/components/login/ExistingUserLogin.svelte'

import LoginHeader from '$lib/components/login/LoginHeader.svelte'
import ModeSelection from '$lib/components/login/ModeSelection.svelte'
import TokenDisplay from '$lib/components/login/TokenDisplay.svelte'
import UsernameSelection from '$lib/components/login/UsernameSelection.svelte'
import { generateUsername } from '$lib/username-generator'
import { onMount } from 'svelte'

let mode: 'choose' | 'new' | 'existing' = $state('choose')
let existingToken = $state('')
let isLoading = $state(false)
let error = $state('')

// Multi-step registration flow
let registrationStep: 'username-selection' | 'token-display' =
  $state('username-selection')
let selectedUsername = $state('')
let generatedToken = $state('')

onMount(() => {
  // Check if user is already authenticated via server-side session
  if ($page.data?.user) {
    goto('/feed')
  }
})

function startUsernameSelection() {
  mode = 'new'
  registrationStep = 'username-selection'
  generateNewUsername()
}

function generateNewUsername() {
  selectedUsername = generateUsername()
  error = ''
}

async function confirmUsername() {
  isLoading = true
  error = ''

  try {
    const response = await fetch('/api/auth/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      generatedToken = data.token
      registrationStep = 'token-display'
    } else {
      const data = await response.json()
      error = data.error || 'Failed to create account'
    }
  } catch (err) {
    error = 'Network error. Please try again.'
  } finally {
    isLoading = false
  }
}

function completeRegistration() {
  // Session cookie is already set by the create endpoint
  goto('/feed')
}

function backToModeSelection() {
  mode = 'choose'
  registrationStep = 'username-selection'
  selectedUsername = ''
  generatedToken = ''
  error = ''
}

async function loginWithToken() {
  if (!existingToken.trim()) {
    error = 'Please enter your token'
    return
  }

  isLoading = true
  error = ''

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: existingToken.trim() }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.valid) {
        // Session cookie will be set automatically on server
        goto('/feed')
        return
      }
    }

    error = 'Invalid token. Please check and try again.'
  } catch (err) {
    error = 'Network error. Please try again.'
  } finally {
    isLoading = false
  }
}
</script>

<svelte:head>
  <title>Login - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="login-card">
    <LoginHeader />

    {#if mode === 'choose'}
      <ModeSelection
        {isLoading}
        onCreateNew={startUsernameSelection}
        onUseExisting={() => mode = 'existing'}
      />

    {:else if mode === 'new'}
      {#if registrationStep === 'username-selection'}
        <UsernameSelection
          username={selectedUsername}
          {isLoading}
          onGenerateNew={generateNewUsername}
          onConfirm={confirmUsername}
          onBack={backToModeSelection}
        />

      {:else if registrationStep === 'token-display'}
        <TokenDisplay
          username={selectedUsername}
          token={generatedToken}
          onComplete={completeRegistration}
        />
      {/if}

    {:else if mode === 'existing'}
      <ExistingUserLogin
        bind:token={existingToken}
        {isLoading}
        onLogin={loginWithToken}
        onBack={() => mode = 'choose'}
      />
    {/if}

    <ErrorMessage {error} />
  </div>
</main>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--color-bg);
  }

  .login-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 3rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 30px var(--color-shadow);
  }

  @media (max-width: 768px) {
    .login-card {
      padding: 2rem;
      margin: 1rem;
    }
  }
</style>
