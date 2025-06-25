<script lang="ts">
import { goto } from '$app/navigation'

interface Props {
  currentUser?: any
  onStartLogout: () => void
}

let { currentUser = null, onStartLogout }: Props = $props()

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
          <span class="user-avatar">{currentUser.avatar || '😊'}</span>
          <span class="username">@{currentUser.username}</span>
        </div>
        <div class="user-actions">
          <a href="/profile" class="btn-profile">Profile</a>
          <button onclick={onStartLogout} class="btn-logout">Logout</button>
        </div>
      </div>
    {/if}
  </div>

  <div class="header-actions">
    <button onclick={createTextPost} class="btn-primary btn-text">
      💬 Create Text Post
    </button>
    <button onclick={createPoll} class="btn-primary btn-poll">
      📊 Create Poll
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
    border-bottom: 1px solid #e5e7eb;
  }

  .header-content h1 {
    color: #2563eb;
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
    gap: 0.5rem;
  }

  .user-avatar {
    font-size: 1.2rem;
    background: #f3f4f6;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #e5e7eb;
  }

  .username {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-profile {
    background: #3b82f6;
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
    background: #2563eb;
  }

  .btn-logout {
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .btn-logout:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-primary {
    background: #2563eb;
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
    background: #1d4ed8;
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