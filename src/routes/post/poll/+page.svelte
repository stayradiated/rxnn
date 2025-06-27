<script lang="ts">
import { enhance } from '$app/forms'
import { goto } from '$app/navigation'
import PrimaryButton from '$lib/components/PrimaryButton.svelte'
import SecondaryButton from '$lib/components/SecondaryButton.svelte'
import type { SubmitFunction } from '@sveltejs/kit'
import type { ActionData } from './$types'

type PollType = 'radio' | 'scale'

let title = $state('')
let content = $state('')
let pollType: PollType = $state('radio')
let isLoading = $state(false)
let error = $state('')

interface Props {
  form?: ActionData
}

let { form }: Props = $props()

$effect(() => {
  if (form?.error) {
    error = form.error
    isLoading = false
  }
})

let radioOptions: string[] = $state([''])
let scaleMin = $state(1)
let scaleMax = $state(5)
let scaleMinLabel = $state('')
let scaleMaxLabel = $state('')

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

  if (pollType === 'radio') {
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
  if (pollType === 'radio') {
    const validOptions = radioOptions.filter((opt) => opt.trim())
    return JSON.stringify({
      type: 'radio',
      options: validOptions.map((opt, i) => ({
        id: `opt${i}`,
        label: opt.trim(),
      })),
    })
  }
  if (pollType === 'scale') {
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

const handleSubmit: SubmitFunction = async () => {
  if (!validateAndSubmit()) {
    isLoading = false
    return
  }

  return async ({ update }) => {
    isLoading = false
    update()
  }
}
</script>

<svelte:head>
  <title>Create Poll - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="composer-card">
    <h1>📊 Create Poll</h1>

    <form
      method="POST"
      action="?/createPoll"
      use:enhance={handleSubmit}>
      <div class="form-group">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label>Poll Type:</label>
        <div class="poll-type-grid">
          <label class="poll-type-option" class:selected={pollType === 'radio'}>
            <input type="radio" bind:group={pollType} value="radio" />
            <div class="option-content">
              <strong>🔘 Multiple Choice</strong>
              <span>Single selection from options</span>
            </div>
          </label>

          <label class="poll-type-option" class:selected={pollType === 'scale'}>
            <input type="radio" bind:group={pollType} value="scale" />
            <div class="option-content">
              <strong>📊 Rating Scale</strong>
              <span>1-5 scale with labels</span>
            </div>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Ask your poll question..."
          required
          disabled={isLoading}
        />
      </div>

      <div class="form-group">
        <label for="content">Additional Details (Optional)</label>
        <textarea
          id="content"
          bind:value={content}
          rows="3"
          placeholder="Provide more context or details..."
          disabled={isLoading}></textarea>
      </div>

      {#if pollType === 'radio'}
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

      {:else if pollType === 'scale'}
        <div class="form-group">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Scale Configuration:</label>
          <div class="scale-config">
            <div class="config-row">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label>Range:</label>
              <input
                type="number"
                bind:value={scaleMin}
                min="1"
                max="9"
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
      <input type="hidden" name="postType" value={pollType} />
      <input type="hidden" name="pollConfig" value={pollConfigJson} />

      <div class="form-actions">
        <SecondaryButton onclick={() => goto('/feed')} disabled={isLoading}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading} loading={isLoading} loadingText="Creating...">
          Create Poll
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

  .poll-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .poll-type-option {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .poll-type-option:hover {
    border-color: #2563eb;
  }

  .poll-type-option.selected {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .poll-type-option input {
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


  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .composer-card {
      padding: 1.5rem;
    }

    .poll-type-grid {
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
