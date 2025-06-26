<script lang="ts">
import { goto } from '$app/navigation'
import CommentsSection from './CommentsSection.svelte'
import HeartButton from './HeartButton.svelte'
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
  editingPollResponse?: boolean
  // Comments state for this post
  showComments?: boolean
  postComments?: any[]
  newComment?: string
  commentSubmitting?: boolean
  // Heart state for this post
  heartCount?: number
  userHearted?: boolean
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
  editingPollResponse = $bindable(false),
  showComments = $bindable(false),
  postComments = $bindable(post.comments || []),
  newComment = $bindable(''),
  commentSubmitting = $bindable(false),
  heartCount = $bindable(post.heartCount || 0),
  userHearted = $bindable(post.userHearted || false),
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
      userResponse = responseData
      pollResponses = {} // Clear form
      editingPollResponse = false // Exit edit mode

      // Only show results if they were returned (minimum threshold met)
      if (data.pollResults) {
        pollResults = data.pollResults
        showPollResults = true
      } else {
        pollResults = null
        showPollResults = false
      }

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
  editingPollResponse = true
  showPollResults = false

  // Populate form with current response
  if (userResponse) {
    pollResponses = { ...userResponse }
  }
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
      <span class="post-author">@{post.username}</span>
      <span class="post-time">{formatTimeAgo(post.created_at)}</span>
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
    editing={editingPollResponse}
    onSubmitResponse={submitPollResponse}
    onEditResponse={editPollResponse}
  />

  <!-- Post Footer with Actions -->
  <div class="post-footer">
    <div class="post-actions">
      {#if post.post_type !== 'text'}
        <span class="action-stat">
          📊 {post.response_count} responses
        </span>
      {/if}

      <button
        onclick={toggleComments}
        class="action-button comments-button"
        title="Toggle comments">
        💬 {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
        <span class="toggle-icon">{showComments ? '▼' : '▶'}</span>
      </button>

      {#if currentUser}
        <HeartButton
          targetType="post"
          targetId={post.id}
          bind:heartCount
          bind:userHearted
        />
      {:else if heartCount > 0}
        <span class="action-stat">❤️ {heartCount}</span>
      {/if}
    </div>

    {#if currentUser && currentUser.id === post.user_id}
      <a
        href="/post/{post.id}/edit"
        class="edit-button"
        title="Edit this post">
        <span class="edit-icon">✏️</span>
        Edit
      </a>
    {/if}
  </div>

  <!-- Comments Section -->
  {#if showComments}
    <div class="comments-content">
      {#if postComments && postComments.length > 0}
        <div class="comments-list">
          {#each postComments as comment (comment.id)}
            <div class="comment">
              <div class="comment-header">
                <span class="comment-username">@{comment.username}</span>
                <span class="comment-time">{formatTimeAgo(comment.created_at)}</span>
              </div>
              <div class="comment-content">{comment.content}</div>
              <div class="comment-actions">
                {#if currentUser}
                  <HeartButton
                    targetType="comment"
                    targetId={comment.id}
                    heartCount={comment.heartCount || 0}
                    userHearted={comment.userHearted || false}
                  />
                {:else if comment.heartCount > 0}
                  <span class="heart-count">❤️ {comment.heartCount}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- New Comment Form -->
      {#if currentUser}
        <div class="comment-form">
          <textarea
            bind:value={newComment}
            placeholder="Write a comment..."
            rows="2"
            disabled={commentSubmitting}></textarea>
          <button
            onclick={submitComment}
            class="btn-primary btn-small"
            disabled={!newComment?.trim() || commentSubmitting}>
            {commentSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      {/if}
    </div>
  {/if}
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
    margin-bottom: 1rem;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .post-author {
    color: var(--color-primary);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .post-time {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
    gap: 1rem;
  }

  .post-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .action-stat {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .action-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    transition: all 0.2s ease;
  }

  .action-button:hover {
    background: var(--color-surface-alt);
    color: var(--color-text);
  }

  .toggle-icon {
    font-size: 0.7rem;
    margin-left: 0.25rem;
  }

  .edit-button {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .edit-button:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .edit-icon {
    font-size: 0.9rem;
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

  /* Comments Styles */
  .comments-content {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  .comments-list {
    margin-bottom: 1rem;
  }

  .comment {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .comment-username {
    color: var(--color-primary);
    font-weight: 500;
    font-size: 0.9rem;
  }

  .comment-time {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  .comment-content {
    color: var(--color-text);
    line-height: 1.5;
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .comment-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .heart-count {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .comment-form {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 1rem;
  }

  .comment-form textarea {
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    resize: vertical;
    min-height: 60px;
    background: var(--color-bg);
    color: var(--color-text);
  }

  .comment-form textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }

  .btn-primary:disabled {
    background: var(--color-text-muted);
    cursor: not-allowed;
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .post-card {
      padding: 1rem;
    }

    .post-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .post-footer {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .post-actions {
      justify-content: center;
      flex-wrap: wrap;
    }

    .edit-button {
      align-self: center;
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }

    .comment-form {
      padding: 0.75rem;
    }
  }
</style>
