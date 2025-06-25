<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { clearTokenFromStorage, getTokenFromStorage } from '$lib/token-storage'
import { onMount } from 'svelte'
import type { PageData } from './$types'

export let data: PageData

let token = ''
let currentUser: any = null
let isLoading = false

// Logout confirmation flow
let showLogoutModal = false
let tokenConfirmation = ''
let logoutError = ''

onMount(async () => {
  token = getTokenFromStorage() || ''

  if (!token) {
    goto('/login')
    return
  }

  // Verify token and get user info
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (response.ok) {
      const authData = await response.json()
      if (authData.valid) {
        currentUser = authData.user
      } else {
        goto('/login')
      }
    } else {
      goto('/login')
    }
  } catch (error) {
    goto('/login')
  }
})

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  )

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

function getPostTypeIcon(postType: string) {
  switch (postType) {
    case 'text':
      return '💬'
    case 'radio':
      return '🔘'
    case 'scale':
      return '📊'
    case 'slider':
      return '🎚️'
    case 'checkbox':
      return '☑️'
    default:
      return '📝'
  }
}

function getPostTypeLabel(postType: string) {
  switch (postType) {
    case 'text':
      return 'Discussion'
    case 'radio':
      return 'Multiple Choice'
    case 'scale':
      return 'Rating Scale'
    case 'slider':
      return 'Slider Poll'
    case 'checkbox':
      return 'Multiple Select'
    default:
      return 'Post'
  }
}

function startLogout() {
  showLogoutModal = true
  tokenConfirmation = ''
  logoutError = ''
}

function cancelLogout() {
  showLogoutModal = false
  tokenConfirmation = ''
  logoutError = ''
}

function confirmLogout() {
  if (tokenConfirmation.trim() !== token) {
    logoutError =
      'Token does not match. Please copy and paste your token exactly.'
    return
  }

  clearTokenFromStorage()
  goto('/login')
}
</script>

<svelte:head>
  <title>Feed - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <h1>🗣️ Anonymous Voice</h1>
      {#if currentUser}
        <div class="user-info">
          <span class="username">@{currentUser.username}</span>
          <button on:click={startLogout} class="btn-logout">Logout</button>
        </div>
      {/if}
    </div>

    <div class="header-actions">
      <button on:click={() => goto('/post/text')} class="btn-primary btn-text">
        💬 Create Text Post
      </button>
      <button on:click={() => goto('/post/poll')} class="btn-primary btn-poll">
        📊 Create Poll
      </button>
    </div>
  </header>

  <!-- Feed -->
  <div class="feed">
    {#if data.posts.length === 0}
      <div class="empty-state">
        <h2>👋 Welcome to Anonymous Voice!</h2>
        <p>No posts yet. Be the first to start a conversation!</p>
        <div class="first-post-actions">
          <button on:click={() => goto('/post/text')} class="btn-primary btn-large">
            💬 Create Text Post
          </button>
          <button on:click={() => goto('/post/poll')} class="btn-primary btn-large">
            📊 Create Poll
          </button>
        </div>
      </div>
    {:else}
      {#each data.posts as post (post.id)}
        <article class="post-card">
          <div class="post-header">
            <div class="post-meta">
              <span class="post-type">
                {getPostTypeIcon(post.post_type)} {getPostTypeLabel(post.post_type)}
              </span>
              <span class="post-author">by {post.username}</span>
              <span class="post-time">{formatTimeAgo(post.created_at)}</span>
            </div>

            {#if post.post_type !== 'text'}
              <div class="engagement-stats">
                <span class="stat">
                  📊 {post.response_count} responses
                </span>
                <span class="stat">
                  💬 {post.comment_count} comments
                </span>
              </div>
            {:else}
              <div class="engagement-stats">
                <span class="stat">
                  💬 {post.comment_count} comments
                </span>
              </div>
            {/if}
          </div>

          <h2 class="post-title">{post.title}</h2>

          {#if post.content}
            <p class="post-content">{post.content}</p>
          {/if}

          {#if post.post_type !== 'text'}
            <div class="poll-preview">
              {#if post.post_type === 'radio' && post.poll_config}
                <div class="poll-options-preview">
                  {#each post.poll_config.options.slice(0, 3) as option, index (index)}
                    <div class="option-preview">• {option.label}</div>
                  {/each}
                  {#if post.poll_config.options.length > 3}
                    <div class="option-preview">... and {post.poll_config.options.length - 3} more</div>
                  {/if}
                </div>
              {:else if post.post_type === 'scale' && post.poll_config}
                <div class="scale-preview">
                  Scale: {post.poll_config.min} to {post.poll_config.max}
                  {#if post.poll_config.minLabel && post.poll_config.maxLabel}
                    <br /><small>{post.poll_config.minLabel} → {post.poll_config.maxLabel}</small>
                  {/if}
                </div>
              {:else if post.post_type === 'slider' && post.poll_config}
                <div class="slider-preview">
                  Range: {post.poll_config.min}{post.poll_config.unit} to {post.poll_config.max}{post.poll_config.unit}
                </div>
              {:else if post.post_type === 'checkbox' && post.poll_config}
                <div class="poll-options-preview">
                  {#each post.poll_config.options.slice(0, 3) as option, index (index)}
                    <div class="option-preview">☐ {option.label}</div>
                  {/each}
                  {#if post.poll_config.options.length > 3}
                    <div class="option-preview">... and {post.poll_config.options.length - 3} more</div>
                  {/if}
                </div>
              {/if}
            </div>
          {/if}

          <div class="post-actions">
            <button on:click={() => goto(`/post/${post.id}`)} class="btn-secondary">
              {post.post_type === 'text' ? 'Join Discussion' : 'View & Respond'}
            </button>
          </div>
        </article>
      {/each}
    {/if}
  </div>

  <!-- Logout Confirmation Modal -->
  {#if showLogoutModal}
    <div class="modal-overlay" on:click={cancelLogout}>
      <div class="modal-content" on:click|stopPropagation>
        <h2>Confirm Logout</h2>
        <p>Before logging out, please ensure you have a copy of your secret token:</p>

        <div class="token-display-box">
          <code class="token-text">{token}</code>
          <button
            on:click={() => navigator.clipboard.writeText(token)}
            class="btn-copy-small">
            📋
          </button>
        </div>

        <p>To continue, please paste your token below to confirm you have it saved:</p>

        <input
          type="text"
          bind:value={tokenConfirmation}
          placeholder="Paste your token here to confirm..."
          class="token-confirmation-input"
        />

        {#if logoutError}
          <div class="error-message-modal">
            {logoutError}
          </div>
        {/if}

        <div class="modal-actions">
          <button on:click={cancelLogout} class="btn-secondary">
            Cancel
          </button>
          <button
            on:click={confirmLogout}
            class="btn-danger"
            disabled={!tokenConfirmation.trim()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

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
    align-items: center;
    gap: 1rem;
  }

  .username {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
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

  .first-post-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
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

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .feed {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .empty-state h2 {
    color: #374151;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .post-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s;
  }

  .post-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .post-type {
    background: #eff6ff;
    color: #2563eb;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .post-author {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .post-time {
    color: #9ca3af;
    font-size: 0.8rem;
  }

  .engagement-stats {
    display: flex;
    gap: 1rem;
  }

  .stat {
    color: #6b7280;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .post-title {
    color: #111827;
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .post-content {
    color: #4b5563;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .poll-preview {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .poll-options-preview {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .option-preview {
    margin-bottom: 0.25rem;
  }

  .scale-preview,
  .slider-preview {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .post-actions {
    display: flex;
    justify-content: flex-end;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    margin: 1rem;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    color: #dc2626;
    margin-bottom: 1rem;
  }

  .modal-content p {
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .token-display-box {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    word-break: break-all;
  }

  .token-display-box .token-text {
    flex: 1;
    font-family: monospace;
    font-size: 0.8rem;
    color: #374151;
  }

  .btn-copy-small {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .btn-copy-small:hover {
    background: #059669;
  }

  .token-confirmation-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .token-confirmation-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .error-message-modal {
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 0.75rem;
    margin: 1rem 0;
    color: #dc2626;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  .btn-danger:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .header-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .first-post-actions {
      flex-direction: column;
      gap: 0.75rem;
    }

    .header-content {
      text-align: center;
    }

    .post-card {
      padding: 1rem;
    }

    .post-header {
      flex-direction: column;
      align-items: stretch;
    }

    .post-meta {
      justify-content: center;
    }

    .engagement-stats {
      justify-content: center;
    }

    .modal-content {
      padding: 1.5rem;
      margin: 0.5rem;
    }

    .modal-actions {
      flex-direction: column;
    }

    .username-actions {
      flex-direction: column;
    }
  }
</style>
