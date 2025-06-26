<script lang="ts">
import { dev } from '$app/environment'
import { goto } from '$app/navigation'

interface Props {
  currentUser?: any
  onLogout: () => void
}

let { currentUser = null, onLogout }: Props = $props()

function createTextPost() {
  goto('/post/text')
}

function createPoll() {
  goto('/post/poll')
}
</script>

<header class="header">
  <div class="header-content">
    <h1>🗣️ Anonymous Voice</h1>
    {#if currentUser}
      <div class="user-info">
        <div class="user-profile">
          <span class="username">@{currentUser.username}</span>
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

  .username {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-profile {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .btn-profile:hover {
    background: var(--color-primary-hover);
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
</style>
