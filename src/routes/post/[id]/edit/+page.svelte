<script lang="ts">
import { enhance } from '$app/forms'
import { goto } from '$app/navigation'
import PrimaryButton from '$lib/components/PrimaryButton.svelte'
import SecondaryButton from '$lib/components/SecondaryButton.svelte'
import type { SubmitFunction } from '@sveltejs/kit'
import { onMount } from 'svelte'
import type { ActionData, PageData } from './$types'

type Props = {
  data: PageData
  form?: ActionData
}

const { data, form }: Props = $props()

let title = $state(data.post.title)
let content = $state(data.post.content || '')
let postType = $state(data.post.post_type)
let isLoading = $state(false)
let error = $state('')

$effect(() => {
  if (form?.error) {
    error = form.error
    isLoading = false
  }
})

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

    if (postType === 'radio' && config.type === 'radio') {
      radioOptions = config.options.map((opt) => opt.label)
    } else if (postType === 'scale' && config.type === 'scale') {
      scaleMin = config.min
      scaleMax = config.max
      scaleMinLabel = config.minLabel
      scaleMaxLabel = config.maxLabel
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

function validateAndSubmit() {
  if (!title.trim()) {
    error = 'Title is required'
    return false
  }

  if (postType === 'text' && !content.trim()) {
    error = 'Content is required for text posts'
    return false
  }

  if (postType === 'radio') {
    const validOptions = radioOptions.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      error = 'Multiple choice polls need at least 2 options'
      return false
    }
  }

  isLoading = true
  error = ''
  return true
}

// Get the poll configuration as JSON
const pollConfigJson = $derived.by(() => {
  if (postType === 'radio') {
    const validOptions = radioOptions.filter((opt) => opt.trim())
    return JSON.stringify({
      type: 'radio',
      options: validOptions.map((opt, i) => ({
        id: `opt${i}`,
        label: opt.trim(),
      })),
    })
  }
  if (postType === 'scale') {
    return JSON.stringify({
      type: 'scale',
      min: scaleMin,
      max: scaleMax,
      minLabel: scaleMinLabel.trim(),
      maxLabel: scaleMaxLabel.trim(),
    })
  }
  return ''
})

const handleSubmit: SubmitFunction = async (event) => {
  if (!validateAndSubmit()) {
    return event.cancel()
  }
  return async ({ update }) => {
    isLoading = false
    update()
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
    </div>

    <form
      method="POST"
      action="?/updatePost"
      use:enhance={handleSubmit}>
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
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Options:</label>
          {#each radioOptions as _option, index (index)}
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
          <PrimaryButton onclick={addOption} size="small">+ Add Option</PrimaryButton>
        </div>

      {:else if postType === 'scale'}
        <div class="form-group">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Scale Configuration:</label>
          <div class="scale-config">
            <div class="config-row">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label>Min Label:</label>
              <input type="text" bind:value={scaleMinLabel} placeholder="e.g., Strongly Disagree" disabled={isLoading} />
            </div>
            <div class="config-row">
              <!-- svelte-ignore a11y_label_has_associated_control -->
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

      <!-- Hidden fields for form submission -->
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="postType" value={postType} />
      <input type="hidden" name="pollConfig" value={pollConfigJson} />

      <div class="form-actions">
        <SecondaryButton onclick={() => goto('/feed')} disabled={isLoading}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading} loading={isLoading} loadingText="Updating...">
          Update Post
        </PrimaryButton>
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
    background: var(--color-bg);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px var(--color-shadow);
    border: 1px solid var(--color-border);
  }

  h1 {
    color: var(--color-primary);
    margin-bottom: 1rem;
  }

  .post-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--color-surface-alt);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .post-type-badge {
    background: var(--color-primary-light);
    color: var(--color-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .form-group {
    margin-bottom: 2rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 1rem;
    background: var(--color-surface);
    color: var(--color-text);
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
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


  .scale-config {
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 1rem;
    background: var(--color-surface-alt);
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


  .error-message {
    background: var(--color-warning-light);
    border: 1px solid var(--color-error);
    border-radius: 6px;
    padding: 1rem;
    color: var(--color-error);
    margin-bottom: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
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
