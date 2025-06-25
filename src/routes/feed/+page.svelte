<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import FeedHeader from '$lib/components/FeedHeader.svelte'
import LogoutModal from '$lib/components/LogoutModal.svelte'
import PostCard from '$lib/components/PostCard.svelte'
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
  <FeedHeader {currentUser} onStartLogout={startLogout} />

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
        <PostCard
          {post}
          {token}
          {currentUser}
          {formatTimeAgo}
          {getPostTypeIcon}
          {getPostTypeLabel}
        />
      {/each}
    {/if}
  </div>

  <!-- Logout Confirmation Modal -->
  <LogoutModal
    show={showLogoutModal}
    {token}
    bind:tokenConfirmation
    bind:logoutError
    onCancel={cancelLogout}
    onConfirm={confirmLogout}
  />
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
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

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .first-post-actions {
      flex-direction: column;
      gap: 0.75rem;
    }
  }
</style>