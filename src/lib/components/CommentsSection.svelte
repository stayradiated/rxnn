<script lang="ts">
export let postId: number
export let commentCount: number
export let showComments = false
export let comments: any[] = []
export let newComment = ''
export let isSubmitting = false
export let onToggleComments: () => void
export let onSubmitComment: () => void
export let formatTimeAgo: (dateString: string) => string

function toggleComments() {
  onToggleComments()
}

function submitComment() {
  onSubmitComment()
}
</script>

<div class="comments-section">
  <button
    on:click={toggleComments}
    class="comments-toggle">
    💬 {commentCount} comment{commentCount !== 1 ? 's' : ''}
    <span class="toggle-icon">{showComments ? '▼' : '▶'}</span>
  </button>

  {#if showComments}
    <div class="comments-content">
      <!-- Existing Comments -->
      {#if comments && comments.length > 0}
        <div class="comments-list">
          {#each comments as comment (comment.id)}
            <div class="comment">
              <div class="comment-header">
                <div class="comment-author">
                  <span class="comment-avatar">{comment.avatar || '😊'}</span>
                  <span class="comment-username">{comment.username}</span>
                </div>
                <span class="comment-time">{formatTimeAgo(comment.created_at)}</span>
              </div>
              <div class="comment-content">{comment.content}</div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- New Comment Form -->
      <div class="comment-form">
        <textarea
          bind:value={newComment}
          placeholder="Write a comment..."
          rows="2"
          disabled={isSubmitting}></textarea>
        <button
          on:click={submitComment}
          class="btn-primary btn-small"
          disabled={!newComment?.trim() || isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Comments Styles */
  .comments-section {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .comments-toggle {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .comments-toggle:hover {
    color: #374151;
  }

  .toggle-icon {
    font-size: 0.7rem;
    color: #9ca3af;
  }

  .comments-content {
    margin-top: 1rem;
  }

  .comments-list {
    margin-bottom: 1rem;
  }

  .comment {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
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

  .comment-author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .comment-avatar {
    font-size: 0.9rem;
    background: #f3f4f6;
    border-radius: 50%;
    width: 1.2rem;
    height: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
  }

  .comment-username {
    color: #2563eb;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .comment-time {
    color: #9ca3af;
    font-size: 0.8rem;
  }

  .comment-content {
    color: #374151;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .comment-form {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
  }

  .comment-form textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    resize: vertical;
    min-height: 60px;
  }

  .comment-form textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .comment-form {
      padding: 0.75rem;
    }
  }
</style>
