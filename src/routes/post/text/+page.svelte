<script lang="ts">
import type { SubmitFunction } from '@sveltejs/kit'
import { enhance } from '$app/forms'
import { goto } from '$app/navigation'
import PrimaryButton from '$lib/components/PrimaryButton.svelte'
import SecondaryButton from '$lib/components/SecondaryButton.svelte'
import type { ActionData } from './$types'

interface Props {
  form?: ActionData
}

let { form }: Props = $props()

const error = $derived(form?.error)

let isLoading = $state(false)

const handleSubmit: SubmitFunction = async () => {
  isLoading = true
  return async ({ update }) => {
    isLoading = false
    update()
  }
}
</script>

<svelte:head>
  <title>Create Text Post - Anonymous Voice Platform</title>
</svelte:head>

<main class="container">
  <div class="composer-card">
    <h1>💬 Create Text Post</h1>

    <form
      method="POST"
      action="?/createPost"
      use:enhance={handleSubmit}>
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Ask your question or share your thought..."
          required
          disabled={isLoading}
        />
      </div>

      <div class="form-group">
        <label for="content">Content *</label>
        <textarea
          id="content"
          name="content"
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
        <SecondaryButton onclick={() => goto('/feed')} disabled={isLoading}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading} loading={isLoading} loadingText="Creating...">
          Create Post
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
    margin-bottom: 2rem;
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

    .form-actions {
      flex-direction: column;
    }
  }
</style>
