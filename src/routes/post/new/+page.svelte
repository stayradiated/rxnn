<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { getTokenFromStorage } from '$lib/token-storage'
import { onMount } from 'svelte'

type PostType = 'text' | 'radio' | 'scale' | 'slider' | 'checkbox'

let token = ''
let title = ''
let content = ''
let postType: PostType = 'text'
let isLoading = false
let error = ''

// Poll configuration
let radioOptions: string[] = ['']
let scaleMin = 1
let scaleMax = 5
let scaleMinLabel = ''
let scaleMaxLabel = ''
let sliderMin = 0
let sliderMax = 100
let sliderUnit = '%'
let sliderMinLabel = ''
let sliderMaxLabel = ''
let checkboxOptions: string[] = ['']

onMount(() => {
  token = getTokenFromStorage() || ''

  if (!token) {
    goto('/login')
  }
})

function addOption(type: 'radio' | 'checkbox') {
  if (type === 'radio') {
    radioOptions = [...radioOptions, '']
  } else {
    checkboxOptions = [...checkboxOptions, '']
  }
}

function removeOption(type: 'radio' | 'checkbox', index: number) {
  if (type === 'radio') {
    radioOptions = radioOptions.filter((_, i) => i !== index)
  } else {
    checkboxOptions = checkboxOptions.filter((_, i) => i !== index)
  }
}

function updateOption(
  type: 'radio' | 'checkbox',
  index: number,
  value: string,
) {
  if (type === 'radio') {
    radioOptions[index] = value
  } else {
    checkboxOptions[index] = value
  }
}

async function submitPost() {
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
        error = 'Radio polls need at least 2 options'
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
    } else if (postType === 'slider') {
      pollConfig = {
        type: 'slider',
        min: sliderMin,
        max: sliderMax,
        step: Math.floor((sliderMax - sliderMin) / 4), // 5 discrete values
        unit: sliderUnit,
        minLabel: sliderMinLabel.trim(),
        maxLabel: sliderMaxLabel.trim(),
      }
    } else if (postType === 'checkbox') {
      const validOptions = checkboxOptions.filter((opt) => opt.trim())
      if (validOptions.length < 2) {
        error = 'Checkbox polls need at least 2 options'
        isLoading = false
        return
      }
      pollConfig = {
        type: 'checkbox',
        options: validOptions.map((opt, i) => ({
          id: `opt${i}`,
          label: opt.trim(),
        })),
      }
    }

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim() || null,
        postType,
        pollConfig,
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
  <title>Create Post - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="composer-card">
    <h1>Create New Post</h1>

    <form on:submit|preventDefault={submitPost}>
      <!-- Post Type Selection -->
      <div class="form-group">
        <label>Post Type:</label>
        <div class="post-type-grid">
          <label class="post-type-option" class:selected={postType === 'text'}>
            <input type="radio" bind:group={postType} value="text" />
            <div class="option-content">
              <strong>💬 Text Post</strong>
              <span>Ask a question or share a thought</span>
            </div>
          </label>

          <label class="post-type-option" class:selected={postType === 'radio'}>
            <input type="radio" bind:group={postType} value="radio" />
            <div class="option-content">
              <strong>🔘 Multiple Choice</strong>
              <span>Single selection from options</span>
            </div>
          </label>

          <label class="post-type-option" class:selected={postType === 'scale'}>
            <input type="radio" bind:group={postType} value="scale" />
            <div class="option-content">
              <strong>📊 Rating Scale</strong>
              <span>1-5 scale with labels</span>
            </div>
          </label>

          <label class="post-type-option" class:selected={postType === 'slider'}>
            <input type="radio" bind:group={postType} value="slider" />
            <div class="option-content">
              <strong>🎚️ Slider</strong>
              <span>Percentage or range selector</span>
            </div>
          </label>

          <label class="post-type-option" class:selected={postType === 'checkbox'}>
            <input type="radio" bind:group={postType} value="checkbox" />
            <div class="option-content">
              <strong>☑️ Multiple Select</strong>
              <span>Multiple options allowed</span>
            </div>
          </label>
        </div>
      </div>

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
                bind:value={option}
                on:input={(e) => updateOption('radio', index, e.currentTarget.value)}
                placeholder="Option {index + 1}"
                disabled={isLoading}
              />
              {#if radioOptions.length > 1}
                <button type="button" on:click={() => removeOption('radio', index)} class="btn-remove">×</button>
              {/if}
            </div>
          {/each}
          <button type="button" on:click={() => addOption('radio')} class="btn-add">+ Add Option</button>
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

      {:else if postType === 'slider'}
        <div class="form-group">
          <label>Slider Configuration:</label>
          <div class="scale-config">
            <div class="config-row">
              <label>Range:</label>
              <input type="number" bind:value={sliderMin} disabled={isLoading} />
              <span>to</span>
              <input type="number" bind:value={sliderMax} disabled={isLoading} />
              <input
                type="text"
                bind:value={sliderUnit}
                placeholder="%"
                maxlength="5"
                disabled={isLoading}
              />
            </div>
            <div class="config-row">
              <label>Min Label:</label>
              <input type="text" bind:value={sliderMinLabel} placeholder="e.g., Never" disabled={isLoading} />
            </div>
            <div class="config-row">
              <label>Max Label:</label>
              <input type="text" bind:value={sliderMaxLabel} placeholder="e.g., Always" disabled={isLoading} />
            </div>
          </div>
        </div>

      {:else if postType === 'checkbox'}
        <div class="form-group">
          <label>Options:</label>
          {#each checkboxOptions as option, index (index)}
            <div class="option-input">
              <input
                type="text"
                bind:value={option}
                on:input={(e) => updateOption('checkbox', index, e.currentTarget.value)}
                placeholder="Option {index + 1}"
                disabled={isLoading}
              />
              {#if checkboxOptions.length > 1}
                <button type="button" on:click={() => removeOption('checkbox', index)} class="btn-remove">×</button>
              {/if}
            </div>
          {/each}
          <button type="button" on:click={() => addOption('checkbox')} class="btn-add">+ Add Option</button>
        </div>
      {/if}

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="form-actions">
        <button type="button" on:click={() => goto('/feed')} class="btn-secondary" disabled={isLoading}>
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

  .post-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .post-type-option {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .post-type-option:hover {
    border-color: #2563eb;
  }

  .post-type-option.selected {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .post-type-option input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .option-content strong {
    color: #374151;
  }

  .option-content span {
    color: #6b7280;
    font-size: 0.9rem;
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

    .post-type-grid {
      grid-template-columns: 1fr;
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
