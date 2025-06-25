<script lang="ts">
import { goto } from '$app/navigation'
import { preventDefault } from 'svelte/legacy'

let title = $state('')
let content = $state('')
let isLoading = $state(false)
let error = $state('')

async function submitPost() {
  if (!title.trim()) {
    error = 'Title is required'
    return
  }

  if (!content.trim()) {
    error = 'Content is required for text posts'
    return
  }

  isLoading = true
  error = ''

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        postType: 'text',
        pollConfig: null,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      goto('/feed')
    } else {
      const data = await response.json()
      error = data.error || 'Failed to create post'
    }
  } catch (err) {
    error = 'Network error. Please try again.'
  } finally {
    isLoading = false
  }
}
</script>

<svelte:head>
  <title>Create Text Post - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="composer-card">
    <h1>💬 Create Text Post</h1>

    <form onsubmit={preventDefault(submitPost)}>
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Ask your question or share your thought..."
          required
          disabled={isLoading}
        />
      </div>

      <div class="form-group">
        <label for="content">Content *</label>
        <textarea
          id="content"
          bind:value={content}
          rows="6"
          placeholder="Share your thoughts, ask a question, or start a discussion..."
          required
          disabled={isLoading}></textarea>
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="form-actions">
        <button type="button" onclick={() => goto('/feed')} class="btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" class="btn-primary" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </form>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .composer-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h1 {
    color: #2563eb;
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 2rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 1rem;
    color: #dc2626;
    margin-bottom: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .composer-card {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>