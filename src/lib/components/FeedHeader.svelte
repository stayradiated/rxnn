<script lang="ts">
import { dev } from '$app/environment'
import { goto } from '$app/navigation'

interface Props {
  currentUser?: any
  onLogout: () => void
}

let { currentUser = null, onLogout }: Props = $props()
let showTokenModal = $state(false)
let copySuccess = $state(false)

function createTextPost() {
  goto('/post/text')
}

function createPoll() {
  goto('/post/poll')
}

function showToken() {
  showTokenModal = true
  copySuccess = false
}

function hideToken() {
  showTokenModal = false
  copySuccess = false
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(currentUser.token)
    copySuccess = true
    setTimeout(() => {
      copySuccess = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy token:', err)
  }
}
</script>

<header class="header">
  <div class="header-content">
    <h1>🗣️ Anonymous Voice</h1>
    {#if currentUser}
      <div class="user-info">
        <div class="user-profile">
          <button class="username-btn" onclick={showToken}>@{currentUser.username}</button>
        </div>
        <div class="user-actions">
          {#if dev}
            <button onclick={onLogout} class="btn-logout">Logout</button>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <div class="header-actions">
    <button onclick={createTextPost} class="btn-primary btn-text">
      💬 Share a Message
    </button>
    <button onclick={createPoll} class="btn-primary btn-poll">
      📊 Ask a Question
    </button>
  </div>
</header>

{#if showTokenModal}
  <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={hideToken}>
    <div class="modal">
      <div class="modal-header">
        <h3>Your Login Token</h3>
        <button class="close-btn" onclick={hideToken}>×</button>
      </div>
      <div class="modal-content">
        <p class="token-explanation">
          This token allows you to log in on different devices or recover your account if your cookies are deleted.
          Keep it safe and don't share it with others.
        </p>
        <div class="token-display">
          <code class="token-text">{currentUser.token}</code>
          <button class="copy-btn" onclick={copyToken}>
            {copySuccess ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .header-content h1 {
    color: var(--color-primary);
    margin: 0;
    font-size: 1.8rem;
  }

  .user-info {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-profile {
    display: flex;
    align-items: center;
  }

  .username-btn {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-decoration-style: dotted;
    transition: color 0.2s;
  }

  .username-btn:hover {
    color: var(--color-primary);
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-logout {
    background: var(--color-surface-alt);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .btn-logout:hover {
    background: var(--color-border);
    color: var(--color-text);
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary:hover {
    background: var(--color-primary-hover);
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .header-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .header-content {
      text-align: center;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    border: 1px solid var(--color-border);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h3 {
    margin: 0;
    color: var(--color-text);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: var(--color-text);
  }

  .modal-content {
    padding: 1rem;
  }

  .token-explanation {
    margin: 0 0 1rem 0;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .token-display {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .token-text {
    flex: 1;
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.75rem;
    font-family: monospace;
    font-size: 0.85rem;
    word-break: break-all;
    line-height: 1.4;
    color: var(--color-text);
  }

  .copy-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    transition: background 0.2s;
  }

  .copy-btn:hover {
    background: var(--color-primary-hover);
  }
</style>
