<script lang="ts">
import { goto } from '$app/navigation'
import FeedHeader from '$lib/components/FeedHeader.svelte'
import PlatformStats from '$lib/components/PlatformStats.svelte'
import PostCard from '$lib/components/PostCard.svelte'
import type { PageData } from './$types'

interface Props {
  data: PageData
}

let { data }: Props = $props()

// Get user from server-side data
let currentUser = $state(data.user)

function jumpToNextUnanswered() {
  // Find the first unanswered question (poll that user hasn't responded to)
  const unansweredPost = data.posts.find((post) => {
    // Must be a poll (not text)
    if (post.post_type === 'text') return false

    // Must not have been answered by the user (check userResponse property)
    return !post.userResponse
  })

  if (unansweredPost) {
    // Scroll to the post
    const postElement = document.getElementById(`post-${unansweredPost.id}`)
    if (postElement) {
      postElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      // Add a brief highlight effect
      postElement.style.outline = '3px solid var(--color-primary)'
      postElement.style.borderRadius = '8px'
      setTimeout(() => {
        postElement.style.outline = ''
        postElement.style.borderRadius = ''
      }, 2000)
    }
  }
}

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

async function performLogout() {
  try {
    // Call logout API to invalidate session cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  } catch (error) {
    console.error('Error during logout:', error)
    // Continue with logout even if API call fails
  }

  // Redirect to login page
  goto('/login')
}
</script>

<svelte:head>
  <title>Feed - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <!-- Header -->
  <FeedHeader {currentUser} onLogout={performLogout} />

  <!-- Platform Statistics -->
  <PlatformStats stats={data.stats} onJumpToUnanswered={jumpToNextUnanswered} />

  <!-- Feed -->
  <div class="feed">
    {#if data.posts.length === 0}
      <div class="empty-state">
        <h2>👋 Welcome to Anonymous Voice!</h2>
        <p>No posts yet. Be the first to start a conversation!</p>
        <div class="first-post-actions">
          <button onclick={() => goto('/post/text')} class="btn-primary btn-large">
            💬 Create Text Post
          </button>
          <button onclick={() => goto('/post/poll')} class="btn-primary btn-large">
            📊 Create Poll
          </button>
        </div>
      </div>
    {:else}
      {#each data.posts as post (post.id)}
        <div id="post-{post.id}">
          <PostCard
            {post}
            {currentUser}
            {formatTimeAgo}
            {getPostTypeIcon}
            {getPostTypeLabel}
          />
        </div>
      {/each}
    {/if}
  </div>
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
    background: var(--color-surface);
    border-radius: 12px;
    border: 1px solid var(--color-border);
  }

  .empty-state h2 {
    color: var(--color-text);
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
  }

  .first-post-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
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
