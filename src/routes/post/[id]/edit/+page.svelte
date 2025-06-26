<script lang="ts">
import { goto } from '$app/navigation'
import { onMount } from 'svelte'
import type { PageData } from './$types'

type Props = {
  data: PageData
}

const { data }: Props = $props()

let title = $state(data.post.title)
let content = $state(data.post.content || '')
let postType = $state(data.post.post_type)
let isLoading = $state(false)
let error = $state('')

// Poll configuration
let radioOptions = $state<string[]>([])
let scaleMin = $state(1)
let scaleMax = $state(5)
let scaleMinLabel = $state('')
let scaleMaxLabel = $state('')

onMount(() => {
  // Initialize poll configuration based on post type
  if (postType !== 'text' && data.post.poll_config) {
    const config = data.post.poll_config

    if (postType === 'radio' && config.options) {
      radioOptions = config.options.map((opt: any) => opt.label)
    } else if (postType === 'scale') {
      scaleMin = config.min || 1
      scaleMax = config.max || 5
      scaleMinLabel = config.minLabel || ''
      scaleMaxLabel = config.maxLabel || ''
    }
  }

  // Ensure radio options has at least one entry
  if (postType === 'radio' && radioOptions.length === 0) {
    radioOptions = ['']
  }
})

function addOption() {
  radioOptions = [...radioOptions, '']
}

function removeOption(index: number) {
  radioOptions = radioOptions.filter((_, i) => i !== index)
}

function updateOption(index: number, value: string) {
  radioOptions[index] = value
}

async function submitUpdate(event) {
  event.preventDefault()

  if (!title.trim()) {
    error = 'Title is required'
    return
  }

  isLoading = true
  error = ''

  try {
    let pollConfig = null

    // Build poll configuration based on post type
    if (postType === 'radio') {
      const validOptions = radioOptions.filter((opt) => opt.trim())
      if (validOptions.length < 2) {
        error = 'Multiple choice polls need at least 2 options'
        isLoading = false
        return
      }
      pollConfig = {
        type: 'radio',
        options: validOptions.map((opt, i) => ({
          id: `opt${i}`,
          label: opt.trim(),
        })),
      }
    } else if (postType === 'scale') {
      pollConfig = {
        type: 'scale',
        min: scaleMin,
        max: scaleMax,
        minLabel: scaleMinLabel.trim(),
        maxLabel: scaleMaxLabel.trim(),
      }
    }

    const response = await fetch(`/api/posts/${data.post.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim() || null,
        postType,
        pollConfig,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      goto('/feed')
    } else {
      const result = await response.json()
      error = result.error || 'Failed to update post'
    }
  } catch (err) {
    error = 'Network error. Please try again.'
  } finally {
    isLoading = false
  }
}
</script>

<svelte:head>
  <title>Edit Post - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="composer-card">
    <h1>Edit Post</h1>

    <div class="post-info">
      <span class="post-type-badge">
        {#if postType === 'text'}
          💬 Text Post
        {:else if postType === 'radio'}
          🔘 Multiple Choice Poll
        {:else if postType === 'scale'}
          📊 Rating Scale Poll
        {/if}
      </span>
      <span class="author-info">@{data.post.username} asked</span>
    </div>

    <form onsubmit={submitUpdate}>
      <!-- Title -->
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Ask your question or describe your poll..."
          required
          disabled={isLoading}
        />
      </div>

      <!-- Content (optional for polls) -->
      <div class="form-group">
        <label for="content">Additional Details {postType === 'text' ? '(Required)' : '(Optional)'}</label>
        <textarea
          id="content"
          bind:value={content}
          rows="3"
          placeholder="Provide more context or details..."
          required={postType === 'text'}
          disabled={isLoading}></textarea>
      </div>

      <!-- Poll Configuration -->
      {#if postType === 'radio'}
        <div class="form-group">
          <label>Options:</label>
          {#each radioOptions as option, index (index)}
            <div class="option-input">
              <input
                type="text"
                bind:value={radioOptions[index]}
                oninput={(e) => updateOption(index, e.currentTarget.value)}
                placeholder="Option {index + 1}"
                disabled={isLoading}
              />
              {#if radioOptions.length > 1}
                <button type="button" onclick={() => removeOption(index)} class="btn-remove">×</button>
              {/if}
            </div>
          {/each}
          <button type="button" onclick={addOption} class="btn-add">+ Add Option</button>
        </div>

      {:else if postType === 'scale'}
        <div class="form-group">
          <label>Scale Configuration:</label>
          <div class="scale-config">
            <div class="config-row">
              <label>Range:</label>
              <input
                type="number"
                bind:value={scaleMin}
                min="1"
                max="10"
                disabled={isLoading}
              />
              <span>to</span>
              <input
                type="number"
                bind:value={scaleMax}
                min="2"
                max="10"
                disabled={isLoading}
              />
            </div>
            <div class="config-row">
              <label>Min Label:</label>
              <input type="text" bind:value={scaleMinLabel} placeholder="e.g., Strongly Disagree" disabled={isLoading} />
            </div>
            <div class="config-row">
              <label>Max Label:</label>
              <input type="text" bind:value={scaleMaxLabel} placeholder="e.g., Strongly Agree" disabled={isLoading} />
            </div>
          </div>
        </div>
      {/if}

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
          {isLoading ? 'Updating...' : 'Update Post'}
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
    margin-bottom: 1rem;
  }

  .post-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .post-type-badge {
    background: #eff6ff;
    color: #2563eb;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .author-info {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
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

  .option-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  .option-input input {
    flex: 1;
  }

  .btn-remove {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-weight: bold;
  }

  .btn-add {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .scale-config {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    background: #f9fafb;
  }

  .config-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .config-row:last-child {
    margin-bottom: 0;
  }

  .config-row label {
    min-width: 80px;
    margin-bottom: 0;
    font-weight: normal;
  }

  .config-row input {
    flex: 1;
  }

  .config-row span {
    color: #6b7280;
    font-size: 0.9rem;
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

    .post-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .config-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .config-row label {
      min-width: auto;
    }
  }
</style>
