<script lang="ts">
import { enhance } from '$app/forms'
import { goto } from '$app/navigation'
import ErrorMessage from '$lib/components/login/ErrorMessage.svelte'
import ExistingUserLogin from '$lib/components/login/ExistingUserLogin.svelte'

import LoginHeader from '$lib/components/login/LoginHeader.svelte'
import ModeSelection from '$lib/components/login/ModeSelection.svelte'
import TokenDisplay from '$lib/components/login/TokenDisplay.svelte'
import UsernameSelection from '$lib/components/login/UsernameSelection.svelte'
import { generateUsername } from '$lib/username-generator'
import type { ActionData } from './$types'

let mode: 'choose' | 'new' | 'existing' = $state('choose')
let existingToken = $state('')
let isLoading = $state(false)
let error = $state('')

// Multi-step registration flow
let registrationStep: 'username-selection' | 'token-display' =
  $state('username-selection')
let selectedUsername = $state('')
let generatedToken = $state('')

let createAccountForm = $state<HTMLFormElement>()
let verifyTokenForm = $state<HTMLFormElement>()

function startUsernameSelection() {
  mode = 'new'
  registrationStep = 'username-selection'
  generateNewUsername()
}

function generateNewUsername() {
  selectedUsername = generateUsername()
  error = ''
}

function confirmUsername() {
  createAccountForm?.requestSubmit()
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

function loginWithToken() {
  if (!existingToken.trim()) {
    error = 'Please enter your token'
    return
  }

  verifyTokenForm?.requestSubmit()
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

  <!-- Hidden forms for server actions -->
  <form
    id="create-account-form"
    bind:this={createAccountForm}
    method="POST"
    action="?/createAccount"
    style:display="none"
    use:enhance={() => {
      isLoading = true
      return async ({ result, update }) => {
        if (result.type === 'success') {
          generatedToken = String(result.data?.token || '')
          registrationStep = 'token-display'
        } else {
          update()
        }
      }
    }}>
    <input type="hidden" name="username" value={selectedUsername} />
  </form>

  <form
    id="verify-token-form"
    bind:this={verifyTokenForm}
    method="POST"
    action="?/verifyToken"
    style:display="none"
    use:enhance={() => {
      isLoading = true
      return async ({ update }) => {
        isLoading = false
        update()
      }
    }}>
    <input type="hidden" name="token" value={existingToken} />
  </form>
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
