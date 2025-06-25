<script lang="ts">
import { goto } from '$app/navigation'
import CommentsSection from './CommentsSection.svelte'
import PollSection from './PollSection.svelte'

interface Props {
  post: any
  currentUser?: any
  formatTimeAgo: (dateString: string) => string
  getPostTypeIcon: (postType: string) => string
  getPostTypeLabel: (postType: string) => string
  // Interactive poll state for this post
  pollResponses?: any
  pollResults?: any
  userResponse?: any
  showPollResults?: boolean
  // Comments state for this post
  showComments?: boolean
  postComments?: any[]
  newComment?: string
  commentSubmitting?: boolean
}

let {
  post = $bindable(),
  currentUser = null,
  formatTimeAgo,
  getPostTypeIcon,
  getPostTypeLabel,
  pollResponses = $bindable({}),
  pollResults = $bindable(post.pollResults || null),
  userResponse = $bindable(post.userResponse || null),
  showPollResults = $bindable(!!post.pollResults),
  showComments = $bindable(false),
  postComments = $bindable(post.comments || []),
  newComment = $bindable(''),
  commentSubmitting = $bindable(false),
}: Props = $props()

// Poll interaction functions
async function submitPollResponse(responseData: any) {
  try {
    const response = await fetch('/api/poll-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId: post.id, responseData }),
    })

    if (response.ok) {
      const data = await response.json()
      pollResults = data.pollResults
      userResponse = responseData
      showPollResults = true
      pollResponses = {} // Clear form

      // Update response count
      post.response_count += 1
    } else {
      console.error('Failed to submit poll response')
    }
  } catch (error) {
    console.error('Error submitting poll response:', error)
  }
}

function editPollResponse() {
  showPollResults = false
  pollResponses = userResponse
}

// Comments functions
function toggleComments() {
  // Comments are pre-loaded from server, just toggle visibility
  showComments = !showComments
}

async function submitComment() {
  const content = newComment?.trim()
  if (!content) return

  commentSubmitting = true

  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId: post.id, content }),
    })

    if (response.ok) {
      const data = await response.json()
      if (!postComments) {
        postComments = []
      }
      postComments = [...postComments, data.comment]
      newComment = ''

      // Update comment count
      post.comment_count += 1
    }
  } catch (error) {
    console.error('Error submitting comment:', error)
  } finally {
    commentSubmitting = false
  }
}
</script>

<article class="post-card">
  <div class="post-header">
    <div class="post-meta">
      <span class="post-type">
        {getPostTypeIcon(post.post_type)} {getPostTypeLabel(post.post_type)}
      </span>
      <span class="post-author">
        <span class="post-author-avatar">{post.avatar || '😊'}</span>
        by {post.username}
      </span>
      <span class="post-time">{formatTimeAgo(post.created_at)}</span>
    </div>

    <div class="post-actions-header">
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

      {#if currentUser && currentUser.id === post.user_id}
        <a
          href="/post/{post.id}/edit"
          class="btn-edit-post"
          title="Edit this post">
          ✏️ Edit
        </a>
      {/if}
    </div>
  </div>

  <h2 class="post-title">{post.title}</h2>

  {#if post.content}
    <p class="post-content">{post.content}</p>
  {/if}

  <!-- Interactive Poll Section -->
  <PollSection
    {post}
    bind:pollResponses
    {pollResults}
    {userResponse}
    showResults={showPollResults}
    onSubmitResponse={submitPollResponse}
    onEditResponse={editPollResponse}
  />

  <!-- Comments Section -->
  <CommentsSection
    postId={post.id}
    commentCount={post.comment_count}
    bind:showComments
    comments={postComments}
    bind:newComment
    isSubmitting={commentSubmitting}
    onToggleComments={toggleComments}
    onSubmitComment={submitComment}
    {formatTimeAgo}
  />
</article>

<style>
  .post-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--color-shadow);
    transition: box-shadow 0.2s;
  }

  .post-card:hover {
    box-shadow: 0 4px 12px var(--color-shadow);
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
    background: var(--color-surface-alt);
    color: var(--color-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .post-author {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .post-author-avatar {
    font-size: 1rem;
    background: var(--color-surface-alt);
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
  }

  .post-time {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  .post-actions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .engagement-stats {
    display: flex;
    gap: 1rem;
  }

  .stat {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-edit-post {
    background: var(--color-warning);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-edit-post:hover {
    background: var(--color-warning);
    filter: brightness(0.9);
    transform: translateY(-1px);
  }

  .post-title {
    color: var(--color-text);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .post-content {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
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

    .post-actions-header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .engagement-stats {
      justify-content: center;
    }

    .btn-edit-post {
      align-self: center;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
    }
  }
</style>
