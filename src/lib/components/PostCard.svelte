<script lang="ts">
import { goto } from '$app/navigation'
import CommentsSection from './CommentsSection.svelte'
import PollSection from './PollSection.svelte'

interface Props {
  post: any
  token: string
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
  token,
  currentUser = null,
  formatTimeAgo,
  getPostTypeIcon,
  getPostTypeLabel,
  pollResponses = $bindable({}),
  pollResults = $bindable(null),
  userResponse = $bindable(null),
  showPollResults = $bindable(false),
  showComments = $bindable(false),
  postComments = $bindable([]),
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId: post.id, responseData }),
    })

    if (response.ok) {
      const data = await response.json()
      pollResults = data.pollResults
      userResponse = responseData
      showPollResults = true
      pollResponses = {} // Clear form
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
async function toggleComments() {
  if (!showComments) {
    // Load comments if not already loaded
    if (!postComments || postComments.length === 0) {
      await loadComments()
    }
  }
  showComments = !showComments
}

async function loadComments() {
  try {
    const response = await fetch(`/api/posts/${post.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      postComments = data.comments || []

      // Also load poll results and user response if it's a poll
      if (data.post.post_type !== 'text') {
        if (data.pollResults) {
          pollResults = data.pollResults
          showPollResults = true
        }
        if (data.userResponse) {
          userResponse = data.userResponse
          showPollResults = true
        }
      }
    }
  } catch (error) {
    console.error('Error loading comments:', error)
  }
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
        Authorization: `Bearer ${token}`,
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .post-author-avatar {
    font-size: 1rem;
    background: #f3f4f6;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
  }

  .post-time {
    color: #9ca3af;
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
    color: #6b7280;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-edit-post {
    background: #f59e0b;
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
    background: #d97706;
    transform: translateY(-1px);
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
