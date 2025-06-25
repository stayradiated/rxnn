<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import {
  clearTokenFromStorage,
  getTokenFromStorage,
  saveTokenToStorage,
} from '$lib/token-storage'
import { generateUsername } from '$lib/username-generator'
import { onMount } from 'svelte'

let mode: 'choose' | 'new' | 'existing' = 'choose'
let existingToken = ''
let isLoading = false
let error = ''

// Multi-step registration flow
let registrationStep: 'username-selection' | 'token-display' =
  'username-selection'
let selectedUsername = ''
let generatedToken = ''

onMount(() => {
  // Check if user already has a token
  const storedToken = getTokenFromStorage()
  if (storedToken) {
    // Verify token is still valid and redirect to feed
    verifyAndRedirect(storedToken)
  }
})

async function verifyAndRedirect(token: string) {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.valid) {
        goto('/feed')
        return
      }
    }

    // Token invalid, clear it
    clearTokenFromStorage()
  } catch (err) {
    clearTokenFromStorage()
  }
}

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
  saveTokenToStorage(generatedToken)
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
        saveTokenToStorage(existingToken.trim())
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
    <h1>Anonymous Voice</h1>
    <p class="subtitle">Ask questions, share polls, engage anonymously</p>

    {#if mode === 'choose'}
      <div class="mode-selection">
        <h2>How would you like to proceed?</h2>

        <button
          on:click={startUsernameSelection}
          class="btn-primary btn-large"
          disabled={isLoading}>
          🆕 Create New Identity
        </button>

        <button
          on:click={() => mode = 'existing'}
          class="btn-secondary btn-large"
          disabled={isLoading}>
          🔑 I Have a Token
        </button>
      </div>

    {:else if mode === 'new'}
      {#if registrationStep === 'username-selection'}
        <div class="username-selection">
          <h2>Your Anonymous Identity</h2>
          <p>Here's your randomly generated username. You can regenerate it until you find one you like!</p>

          <div class="username-display">
            <div class="username-card">
              <span class="username-text">@{selectedUsername}</span>
            </div>
          </div>

          <div class="username-actions">
            <button
              on:click={generateNewUsername}
              class="btn-secondary"
              disabled={isLoading}>
              🎲 Try Another Name
            </button>

            <button
              on:click={confirmUsername}
              class="btn-primary"
              disabled={isLoading}>
              {isLoading ? 'Creating Account...' : '✓ I Like This Name'}
            </button>
          </div>

          <button
            on:click={backToModeSelection}
            class="btn-link"
            disabled={isLoading}>
            ← Back
          </button>
        </div>

      {:else if registrationStep === 'token-display'}
        <div class="token-display">
          <h2>🎉 Welcome, @{selectedUsername}!</h2>
          <p>Your account has been created. Here's your secret token:</p>

          <div class="important-notice">
            <h3>⚠️ Important - Save This Token!</h3>
            <p>This is your only way to access your account from other devices. Copy it somewhere safe!</p>
          </div>

          <div class="token-card">
            <code class="token-text">{generatedToken}</code>
            <button
              on:click={() => navigator.clipboard.writeText(generatedToken)}
              class="btn-copy">
              📋 Copy
            </button>
          </div>

          <button
            on:click={completeRegistration}
            class="btn-primary btn-large">
            Continue to Platform
          </button>
        </div>
      {/if}

    {:else if mode === 'existing'}
      <div class="existing-user-flow">
        <h2>Welcome Back!</h2>
        <p>Enter your token to access your anonymous identity:</p>

        <div class="token-input-group">
          <label for="token">Your Token:</label>
          <input
            id="token"
            type="text"
            bind:value={existingToken}
            placeholder="Enter your 64-character token..."
            class="token-input"
            disabled={isLoading}
          />
        </div>

        <button
          on:click={loginWithToken}
          class="btn-primary btn-large"
          disabled={isLoading || !existingToken.trim()}>
          {isLoading ? 'Verifying...' : 'Access My Account'}
        </button>

        <button
          on:click={() => mode = 'choose'}
          class="btn-link"
          disabled={isLoading}>
          ← Back
        </button>
      </div>
    {/if}

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
  </div>
</main>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #253382 0%, #253382 100%);
  }

  .login-card {
    background: white;
    border-radius: 12px;
    padding: 3rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  h1 {
    color: #2563eb;
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }

  .subtitle {
    color: #6b7280;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  h2 {
    color: #374151;
    margin-bottom: 1.5rem;
  }

  .mode-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .btn-large {
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: block;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
    transform: translateY(-1px);
  }

  .btn-link {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .btn-link:hover:not(:disabled) {
    color: #374151;
  }

  .token-input-group {
    text-align: left;
    margin: 2rem 0;
  }

  .token-input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 500;
  }

  .token-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: monospace;
  }

  .token-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .success-message {
    background: #f0fdf4;
    border: 1px solid #22c55e;
    border-radius: 8px;
    padding: 2rem;
    margin: 2rem 0;
  }

  .success-message h3 {
    color: #15803d;
    margin-bottom: 0.5rem;
  }

  .success-message p {
    color: #15803d;
    margin: 0;
  }

  .username-display {
    margin: 2rem 0;
  }

  .username-card {
    background: #f8fafc;
    border: 2px solid #2563eb;
    border-radius: 12px;
    padding: 2rem;
    margin: 1rem 0;
  }

  .username-text {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2563eb;
    font-family: monospace;
  }

  .username-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 1.5rem 0;
  }

  .token-card {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    word-break: break-all;
  }

  .token-text {
    flex: 1;
    font-family: monospace;
    font-size: 0.9rem;
    color: #374151;
    background: none;
    border: none;
    padding: 0;
  }

  .btn-copy {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .btn-copy:hover {
    background: #059669;
  }

  .important-notice {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: left;
  }

  .important-notice h3 {
    margin: 0 0 0.5rem 0;
    color: #92400e;
  }

  .important-notice p {
    margin: 0;
    color: #92400e;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
    color: #dc2626;
  }

  @media (max-width: 768px) {
    .login-card {
      padding: 2rem;
      margin: 1rem;
    }

    h1 {
      font-size: 1.5rem;
    }
  }
</style>
