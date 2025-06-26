<script lang="ts">
import { enhance } from '$app/forms'
import { page } from '$app/stores'
import type { PageData } from './$types'

export let data: PageData

$: adminKey = $page.url.searchParams.get('key')

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function getCommentCount(post: any) {
  return post.comments?.length || 0
}
</script>

<svelte:head>
  <title>Admin Panel - Content Moderation</title>
</svelte:head>

<div class="admin-panel">
  <header class="admin-header">
    <h1>🛡️ Admin Panel</h1>
    <p>Content Moderation Dashboard</p>
  </header>

  <div class="posts-section">
    <h2>All Posts ({data.posts.length})</h2>

    {#each data.posts as post (post.id)}
      <div class="post-item">
        <div class="post-header">
          <h3>{post.title}</h3>
          <div class="post-meta">
            <span class="post-type">{post.post_type}</span>
            <span class="post-author">by {post.username}</span>
            <span class="comment-count">{getCommentCount(post)} comments</span>
          </div>
        </div>

        {#if post.content}
          <div class="post-content">
            {post.content}
          </div>
        {/if}

        {#if post.poll_config}
          <div class="poll-config">
            <strong>Poll Options:</strong>
            {#if post.poll_config.options}
              <ul>
                {#each post.poll_config.options as option, index (index)}
                  <li>{option.label}</li>
                {/each}
              </ul>
            {:else if post.poll_config.min !== undefined}
              <p>Scale: {post.poll_config.min} to {post.poll_config.max}</p>
            {/if}
          </div>
        {/if}

        <div class="post-actions">
          <div class="action-buttons">
            <div class="reorder-buttons">
              <form method="POST" action="?/movePostDown&key={adminKey}" use:enhance>
                <input type="hidden" name="postId" value={post.id} />
                <button type="submit" class="move-btn move-up" title="Move post up">
                  ↑
                </button>
              </form>
              <form method="POST" action="?/movePostUp&key={adminKey}" use:enhance>
                <input type="hidden" name="postId" value={post.id} />
                <button type="submit" class="move-btn move-down" title="Move post down">
                  ↓
                </button>
              </form>
              <form method="POST" action="?/movePost&key={adminKey}" use:enhance>
                <input type="hidden" name="postId" value={post.id} />
                <input type="number" name="position" value={post.sort_order} />
                <button type="submit" class="move-btn" title="Set post position">
                  Set Position
                </button>
              </form>
            </div>
            <form method="POST" action="?/deletePost&key={adminKey}" use:enhance>
              <input type="hidden" name="postId" value={post.id} />
              <button type="submit" class="delete-btn" on:click={(e) => { if (!confirm('Are you sure you want to delete this post?')) e.preventDefault() }}>
                Delete Post
              </button>
            </form>
          </div>
        </div>

        {#if post.comments && post.comments.length > 0}
          <div class="comments-section">
            <h4>Comments:</h4>
            {#each post.comments as comment (comment.id)}
              <div class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">{comment.username}</span>
                </div>
                <div class="comment-content">{comment.content}</div>
                <div class="comment-actions">
                  <form method="POST" action="?/deleteComment&key={adminKey}" use:enhance>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button type="submit" class="delete-comment-btn" on:click={(e) => { if (!confirm('Are you sure you want to delete this comment?')) e.preventDefault() }}>
                      Delete Comment
                    </button>
                  </form>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}

    {#if data.posts.length === 0}
      <div class="no-posts">
        <p>No posts found.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .admin-panel {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .admin-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px solid #e74c3c;
  }

  .admin-header h1 {
    color: #e74c3c;
    margin: 0 0 10px 0;
  }

  .posts-section h2 {
    color: #333;
    border-bottom: 2px solid #ddd;
    padding-bottom: 10px;
  }

  .post-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
  }

  .post-header h3 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .post-meta {
    display: flex;
    gap: 15px;
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
  }

  .post-type {
    background: #3498db;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    text-transform: uppercase;
  }

  .post-content {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin: 15px 0;
    white-space: pre-wrap;
  }

  .poll-config {
    background: #e8f4fd;
    padding: 15px;
    border-radius: 4px;
    margin: 15px 0;
  }

  .poll-config ul {
    margin: 10px 0 0 20px;
  }

  .post-actions {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }

  .action-buttons {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .reorder-buttons {
    display: flex;
    gap: 5px;
  }

  .move-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .move-btn:hover {
    background: #2980b9;
  }

  .move-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }

  .delete-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .delete-btn:hover {
    background: #c0392b;
  }

  .comments-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  .comments-section h4 {
    color: #555;
    margin: 0 0 15px 0;
  }

  .comment-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 10px;
    border-left: 3px solid #ddd;
  }

  .comment-header {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }

  .comment-content {
    margin-bottom: 10px;
    white-space: pre-wrap;
  }

  .delete-comment-btn {
    background: #f39c12;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
  }

  .delete-comment-btn:hover {
    background: #e67e22;
  }

  .no-posts {
    text-align: center;
    padding: 40px;
    color: #666;
  }
</style>
