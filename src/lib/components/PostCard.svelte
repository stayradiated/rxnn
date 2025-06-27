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

// show the comment section by default for text posts or if there is at least
// one comment
let showComments = $state(post.post_type === 'text' || post.comment_count > 0)
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

    {#if currentUser.id === post.user_id}
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

    <div class="post-hearts">
      <HeartButton
        targetType="post"
        targetId={post.id}
        {heartCount}
        {userHearted}
      />
    </div>
  </div>

  <!-- Comments Section -->
  {#if showComments}
    <div class="comments-content">
      {#if postComments && postComments.length > 0}
        <div class="comments-list">
          {#each postComments as comment, index (comment.id)}
            <div class="comment comment-color-{index % 7}">

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
                <div class="comment-main">
                  <div class="comment-content">{comment.content}</div>

                  <HeartButton
                    targetType="comment"
                    targetId={comment.id}
                    heartCount={comment.heartCount || 0}
                    userHearted={comment.userHearted || false}
                  />
                </div>

                {#if currentUser && currentUser.id === comment.user_id}
                  <div class="comment-owner-actions">
                    <button
                      onclick={() => startEditingComment(comment)}
                      class="comment-edit-btn"
                      title="Edit comment">
                      <span class="edit-icon">✏️</span>
                      Edit
                    </button>
                    <form
                      method="POST"
                      action="?/deleteComment"
                      use:enhance={handleDeleteComment}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button class="comment-delete-btn" title="Delete comment">
                        <span class="delete-icon">🗑️</span>
                        Delete
                      </button>
                    </form>
                  </div>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- New Comment Form -->
      <div class="comment-form">
        <form
          method="POST"
          action="?/createComment"
          use:enhance
          class="comment-form-inner">
          <input type="hidden" name="postId" value={post.id} />
          <textarea
            name="content"
            bind:value={newComment}
            placeholder="Leave a comment…"
            rows="1"
            disabled={commentSubmitting}></textarea>
          <button
            class="btn-primary btn-small"
            disabled={!newComment?.trim() || commentSubmitting}>
            {commentSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
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

  .post-hearts {
    margin-right: 0.75rem;
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
    padding-top: 1rem;
  }

  .comments-list {
    margin-bottom: 1rem;
  }

  .comment {
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .comment-main {
    display: flex;
    justify-content: space-between;
  }

  /* Pastel color variations */
  .comment-color-0 {
    background: linear-gradient(135deg, rgba(255, 182, 193, 0.08), rgba(255, 218, 185, 0.08));
    border: 1px solid rgba(255, 182, 193, 0.15);
  }

  .comment-color-1 {
    background: linear-gradient(135deg, rgba(173, 216, 230, 0.08), rgba(221, 160, 221, 0.08));
    border: 1px solid rgba(173, 216, 230, 0.15);
  }

  .comment-color-2 {
    background: linear-gradient(135deg, rgba(152, 251, 152, 0.08), rgba(255, 255, 224, 0.08));
    border: 1px solid rgba(152, 251, 152, 0.15);
  }

  .comment-color-3 {
    background: linear-gradient(135deg, rgba(255, 218, 185, 0.08), rgba(255, 192, 203, 0.08));
    border: 1px solid rgba(255, 218, 185, 0.15);
  }

  .comment-color-4 {
    background: linear-gradient(135deg, rgba(230, 230, 250, 0.08), rgba(255, 240, 245, 0.08));
    border: 1px solid rgba(230, 230, 250, 0.15);
  }

  .comment-color-5 {
    background: linear-gradient(135deg, rgba(175, 238, 238, 0.08), rgba(240, 248, 255, 0.08));
    border: 1px solid rgba(175, 238, 238, 0.15);
  }

  .comment-color-6 {
    background: linear-gradient(135deg, rgba(255, 228, 225, 0.08), rgba(255, 239, 213, 0.08));
    border: 1px solid rgba(255, 228, 225, 0.15);
  }

  .comment-content {
    color: var(--color-text);
    line-height: 1.5;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    padding-right: 3rem;
    white-space: pre-wrap;
  }


  .comment-owner-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .comment-owner-actions {
    display: flex;
    gap: 0.375rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .comment-edit-btn {
    background: var(--color-surface, rgba(255, 255, 255, 0.8));
    color: var(--color-text-secondary, #6b7280);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    backdrop-filter: blur(4px);
  }

  .comment-edit-btn:hover {
    background: var(--color-surface-hover, rgba(249, 250, 251, 0.95));
    color: var(--color-text, #374151);
    border-color: var(--color-border-hover, #d1d5db);
    transform: translateY(-1px);
    box-shadow: 0 1px 4px var(--color-shadow, rgba(0, 0, 0, 0.1));
  }

  .comment-delete-btn {
    background: var(--color-surface, rgba(255, 255, 255, 0.8));
    color: #dc2626;
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    backdrop-filter: blur(4px);
  }

  .comment-delete-btn:hover {
    background: rgba(254, 242, 242, 0.95);
    color: #b91c1c;
    border-color: rgba(185, 28, 28, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 1px 4px rgba(220, 38, 38, 0.15);
  }

  .comment-edit-form {
    margin: 0.75rem 0;
  }

  .comment-edit-textarea {
    box-sizing: border-box;
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
    padding: 0.75rem;
  }

  .comment-form-inner {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .comment-form textarea {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    resize: vertical;
    height: 36px;
    min-height: 36px;
    max-height: 120px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.4;
    box-sizing: border-box;
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
    white-space: nowrap;
    align-self: flex-start;
  }

  .comment-form .btn-small {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
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

    .comment-form-inner {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .comment-form .btn-small {
      align-self: flex-end;
      height: auto;
    }
  }
</style>
