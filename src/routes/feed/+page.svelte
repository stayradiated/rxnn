<script lang="ts">
import { enhance } from '$app/forms'
import { goto } from '$app/navigation'
import FeedHeader from '$lib/components/FeedHeader.svelte'
import PlatformStats from '$lib/components/PlatformStats.svelte'
import PostCard from '$lib/components/PostCard.svelte'
import PrimaryButton from '$lib/components/PrimaryButton.svelte'
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

function performLogout() {
  const form = document.getElementById('logout-form') as HTMLFormElement
  if (form) {
    form.requestSubmit()
  }
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
          <PrimaryButton onclick={() => goto('/post/text')} size="large">
            💬 Create Text Post
          </PrimaryButton>
          <PrimaryButton onclick={() => goto('/post/poll')} size="large">
            📊 Create Poll
          </PrimaryButton>
        </div>
      </div>
    {:else}
      {#each data.posts as post (post.id)}
        <div id="post-{post.id}">
          <PostCard {post} {currentUser} />
        </div>
      {/each}
    {/if}
  </div>
</main>

<!-- Hidden form for logout -->
<form
  id="logout-form"
  method="POST"
  action="?/logout"
  style:display="none"
  use:enhance>
</form>

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
