<script lang="ts">
import type { SubmitFunction } from '@sveltejs/kit'
import { enhance } from '$app/forms'
import type { CommentWithDetails, PostWithDetails } from '$lib/types.js'
import DeleteIcon from './DeleteIcon.svelte'
import EditIcon from './EditIcon.svelte'
import HeartButton from './HeartButton.svelte'
import MarkdownContent from './MarkdownContent.svelte'
import PollSection from './PollSection.svelte'
import PrimaryButton from './PrimaryButton.svelte'
import SecondaryButton from './SecondaryButton.svelte'

interface Props {
  post: PostWithDetails
  currentUser?: {
    id: number
  } | null
}

let { post, currentUser }: Props = $props()

const postComments = $derived(post.comments)
const heartCount = $derived(post.heartCount || 0)
const userHearted = $derived(post.userHearted || false)

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
    <h2 class="post-title" id="post-{post.id}">
      <a href="#post-{post.id}" class="post-title-link">
        <span class="link-icon" aria-hidden="true">#</span>
        {post.title}
      </a>
    </h2>

    {#if currentUser && currentUser.id === post.user_id}
      <div class="post-owner-actions">
        <SecondaryButton size="small" href="/post/{post.id}/edit" title="Edit this post">
          <EditIcon size={14} /> Edit Post
        </SecondaryButton>
        <form
          method="POST"
          action="?/deletePost"
          use:enhance={handleDeletePost}>
          <input type="hidden" name="postId" value={post.id} />
          <SecondaryButton type="submit" size="small" variant="danger" title="Delete this post">
            <DeleteIcon size={14} /> Delete Post
          </SecondaryButton>
        </form>
      </div>
    {/if}
  </header>

  {#if post.content}
    {#if post.post_type === 'text'}
      <div class="post-content">
        <MarkdownContent content={post.content} />
      </div>
    {:else}
      <div class="post-content">
        <p class="poll-content">{post.content}</p>
      </div>
    {/if}
  {/if}

  <!-- Interactive Poll Section -->
  <PollSection {post} {currentUser} />

  <!-- Post Footer with Actions -->
  <div class="post-footer">
    <span class="action-stat">
      💬 {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
    </span>

    {#if post.post_type !== 'text'}
      <span class="action-stat">
        📊 {post.response_count} responses
      </span>
    {/if}

    <div class="spacer"></div>

    {#if post.post_type === 'text'}
      <div class="post-hearts">
        <HeartButton
          targetType="post"
          targetId={post.id}
          {heartCount}
          {userHearted}
          disabled={!currentUser}
        />
      </div>
    {/if}
  </div>

  <!-- Comments Section -->
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
                    <PrimaryButton
                      type="submit"
                      size="small"
                      disabled={!editingCommentContent?.trim()}>
                      Save
                    </PrimaryButton>
                    <SecondaryButton
                      onclick={cancelEditingComment}
                      size="small">
                      Cancel
                    </SecondaryButton>
                  </div>
                </form>
              </div>
            {:else}
              <div class="comment-main">
                <div class="comment-content">
                  <MarkdownContent content={comment.content} />
                </div>

                <HeartButton
                  targetType="comment"
                  targetId={comment.id}
                  heartCount={comment.heartCount || 0}
                  userHearted={comment.userHearted || false}
                  disabled={!currentUser}
                />
              </div>

              {#if currentUser && currentUser.id === comment.user_id}
                <div class="comment-owner-actions">
                  <SecondaryButton
                    size="small"
                    onclick={() => startEditingComment(comment)}
                    title="Edit comment"><EditIcon size={14} /> Edit</SecondaryButton>
                  <form
                    method="POST"
                    action="?/deleteComment"
                    use:enhance={handleDeleteComment}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <SecondaryButton size="small" type="submit" variant="danger" title="Delete comment">
                      <DeleteIcon size={14} /> Delete
                    </SecondaryButton>
                  </form>
                </div>
              {/if}
            {/if}
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
          use:enhance
          class="comment-form-inner">
          <input type="hidden" name="postId" value={post.id} />
          <textarea
            name="content"
            bind:value={newComment}
            placeholder="Leave a comment…"
            rows="1"
            disabled={commentSubmitting}></textarea>
          <PrimaryButton
            type="submit"
            size="small"
            disabled={!newComment?.trim() || commentSubmitting}
            loading={commentSubmitting}
            loadingText="Send…">
            Send
          </PrimaryButton>
        </form>
      </div>
    {:else}
      <div class="anonymous-comment-message">
        <p>🔐 <a href="/login">Sign up or login</a> to leave a comment</p>
      </div>
    {/if}
  </div>
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

  .post-title {
    color: var(--color-text);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    margin-top: 0;
    line-height: 1.4;
  }

  .post-title-link {
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }

  .post-title-link:hover {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .link-icon {
    opacity: 0;
    font-size: 1.3rem;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
    position: absolute;
    left: -1rem;
    color: var(--color-text-secondary);
  }

  .post-title-link:hover .link-icon {
    opacity: 0.8;
  }

  .post-content {
    margin-bottom: 1rem;
  }

  /* Styles for non-markdown post content (polls) */
  .poll-content {
    color: var(--color-text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
    margin: 0;
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
    margin-bottom: 0.5rem;
    padding-right: 3rem;
    font-size: 0.95rem;
  }

  /* Override MarkdownContent styles for comments */
  .comment-content :global(.markdown-content) {
    font-size: 0.95rem;
    line-height: 1.5;
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

  .anonymous-comment-message {
    text-align: center;
    padding: 1rem;
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .anonymous-comment-message p {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .anonymous-comment-message a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .anonymous-comment-message a:hover {
    text-decoration: underline;
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


    .comment-form {
      padding: 0.75rem;
    }

    .comment-form-inner {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

  }
</style>
