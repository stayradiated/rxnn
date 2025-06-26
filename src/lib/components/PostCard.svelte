<script lang="ts">
import { enhance } from '$app/forms'
import type { CommentWithDetails, PostWithDetails } from '$lib/types.js'
import type { SubmitFunction } from '@sveltejs/kit'
import HeartButton from './HeartButton.svelte'
import PollSection from './PollSection.svelte'

interface Props {
  post: PostWithDetails
  currentUser: {
    id: number
  }
}

let { post, currentUser }: Props = $props()

const postComments = $derived(post.comments)
const heartCount = $derived(post.heartCount || 0)
const userHearted = $derived(post.userHearted || false)

let showComments = $state(false)
let newComment = $state('')
let commentSubmitting = $state(false)
let editingCommentId = $state<number | null>(null)
let editingCommentContent = $state('')

// Delete post function
const handleDeletePost: SubmitFunction = (event) => {
  if (
    !confirm(
      'Are you sure you want to delete this post? This action cannot be undone.',
    )
  ) {
    return event.cancel()
  }
}

const handleDeleteComment: SubmitFunction = (event) => {
  if (
    !confirm(
      'Are you sure you want to delete this comment? This action cannot be undone.',
    )
  ) {
    return event.cancel()
  }
}

// Comments functions
function toggleComments() {
  // Comments are pre-loaded from server, just toggle visibility
  showComments = !showComments
}

// Comment edit/delete functions
function startEditingComment(comment: CommentWithDetails) {
  editingCommentId = comment.id
  editingCommentContent = comment.content
}

function cancelEditingComment() {
  editingCommentId = null
  editingCommentContent = ''
}

const handleUpdateComment: SubmitFunction = (event) => {
  if (!editingCommentContent?.trim()) {
    alert('Comment content cannot be empty.')
    return event.cancel()
  }

  // Reset editing state after submission
  editingCommentId = null
  editingCommentContent = ''
}
</script>

<article class="post-card">
  <header class="post-header">
    <h2 class="post-title">{post.title}</h2>

    {#if currentUser && currentUser.id === post.user_id}
      <div class="post-owner-actions">
        <a
          href="/post/{post.id}/edit"
          class="edit-button"
          title="Edit this post">
          <span class="edit-icon">✏️</span>
          Edit
        </a>
        <form
          method="POST"
          action="?/deletePost"
          use:enhance={handleDeletePost}>
          <input type="hidden" name="postId" value={post.id} />
          <button class="delete-button" title="Delete this post">
            <span class="delete-icon">🗑️</span>
            Delete
          </button>
        </form>
      </div>
    {/if}
  </header>

  {#if post.content}
    <p class="post-content">{post.content}</p>
  {/if}

  <!-- Interactive Poll Section -->
  <PollSection {post} />

  <!-- Post Footer with Actions -->
  <div class="post-footer">
    <button
      onclick={toggleComments}
      class="action-button comments-button"
      title="Toggle comments">
      💬 {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
      <span class="toggle-icon">{showComments ? '▼' : '▶'}</span>
    </button>

    {#if post.post_type !== 'text'}
      <span class="action-stat">
        📊 {post.response_count} responses
      </span>
    {/if}

    <div class="spacer"></div>

    {#if currentUser}
      <HeartButton
        targetType="post"
        targetId={post.id}
        {heartCount}
        {userHearted}
      />
    {:else if heartCount > 0}
      <span class="action-stat">❤️ {heartCount}</span>
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
              </div>

              {#if editingCommentId === comment.id}
                <!-- Edit Comment Form -->
                <div class="comment-edit-form">
                  <form
                    method="POST"
                    action="?/updateComment"
                    use:enhance={handleUpdateComment}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <textarea
                      name="content"
                      bind:value={editingCommentContent}
                      rows="3"
                      class="comment-edit-textarea"></textarea>
                    <div class="comment-edit-actions">
                      <button
                        type="submit"
                        class="btn-primary btn-small"
                        disabled={!editingCommentContent?.trim()}>
                        Save
                      </button>
                      <button
                        type="button"
                        onclick={cancelEditingComment}
                        class="btn-secondary btn-small">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              {:else}
                <!-- Normal Comment Display -->
                <div class="comment-content">{comment.content}</div>
              {/if}

              <div class="comment-actions">
                <div class="comment-hearts">
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

                {#if currentUser && currentUser.id === comment.user_id && editingCommentId !== comment.id}
                  <div class="comment-owner-actions">
                    <button
                      onclick={() => startEditingComment(comment)}
                      class="comment-edit-btn"
                      title="Edit comment">
                      ✏️
                    </button>
                    <form
                      method="POST"
                      action="?/deleteComment"
                      use:enhance={handleDeleteComment}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button class="comment-delete-btn" title="Delete comment">🗑️</button>
                    </form>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- New Comment Form -->
      {#if currentUser}
        <div class="comment-form">
          <form
            method="POST"
            action="?/createComment"
            use:enhance>
            <input type="hidden" name="postId" value={post.id} />
            <textarea
              name="content"
              bind:value={newComment}
              placeholder="Write a comment..."
              rows="2"
              disabled={commentSubmitting}></textarea>
            <button
              class="btn-primary btn-small"
              disabled={!newComment?.trim() || commentSubmitting}>
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
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

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
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

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .post-title {
    flex: 1;
    margin: 0;
  }

  .post-owner-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
  }

  .edit-button {
    background: var(--color-surface, rgba(255, 255, 255, 0.8));
    color: var(--color-text-secondary, #6b7280);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 6px;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    text-decoration: none;
    backdrop-filter: blur(4px);
  }

  .edit-button:hover {
    background: var(--color-surface-hover, rgba(249, 250, 251, 0.95));
    color: var(--color-text, #374151);
    border-color: var(--color-border-hover, #d1d5db);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--color-shadow, rgba(0, 0, 0, 0.1));
  }

  .delete-button {
    background: var(--color-surface, rgba(255, 255, 255, 0.8));
    color: #dc2626;
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 6px;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    backdrop-filter: blur(4px);
  }

  .delete-button:hover {
    background: rgba(254, 242, 242, 0.95);
    color: #b91c1c;
    border-color: rgba(185, 28, 28, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
  }

  .edit-icon {
    font-size: 0.9rem;
  }

  .delete-icon {
    font-size: 0.9rem;
  }

  .post-title {
    color: var(--color-text);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    margin-top: 0;
    line-height: 1.4;
  }

  .post-content {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
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

  .comment-content {
    color: var(--color-text);
    line-height: 1.5;
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
    white-space: pre-wrap;
  }

  .comment-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .comment-hearts {
    display: flex;
    align-items: center;
  }

  .comment-owner-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .comment-edit-btn,
  .comment-delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
  }

  .comment-edit-btn {
    color: var(--color-text-secondary);
  }

  .comment-edit-btn:hover {
    background: var(--color-surface-alt);
    color: var(--color-primary);
  }

  .comment-delete-btn {
    color: var(--color-text-secondary);
  }

  .comment-delete-btn:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .comment-edit-form {
    margin: 0.75rem 0;
  }

  .comment-edit-textarea {
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    resize: vertical;
    min-height: 60px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: inherit;
  }

  .comment-edit-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .comment-edit-actions {
    display: flex;
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

  .btn-secondary {
    background: var(--color-surface-alt);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-border);
    border-color: var(--color-text-secondary);
  }

  .btn-secondary:disabled {
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .spacer {
    flex-grow: 1;
  }

  @media (max-width: 768px) {
    .post-card {
      padding: 1rem;
    }

    .post-header {
      flex-direction: column;
      gap: 0;
    }

    .post-owner-actions {
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .edit-button,
    .delete-button {
      font-size: 0.75rem;
      padding: 0.375rem 0.625rem;
    }

    .comment-form {
      padding: 0.75rem;
    }
  }
</style>
