<script lang="ts">
import { enhance } from '$app/forms'
import { invalidateAll } from '$app/navigation'
import type { SubmitFunction } from '@sveltejs/kit'

interface Props {
  targetType: 'post' | 'comment'
  targetId: number
  heartCount: number
  userHearted: boolean
  disabled?: boolean
}

let {
  targetType,
  targetId,
  heartCount = $bindable(0),
  userHearted = $bindable(false),
  disabled = false,
}: Props = $props()

let isSubmitting = $state(false)

// Form data for heart toggle
let heartData = $state({
  targetType: '',
  targetId: 0,
})

function toggleHeart() {
  if (disabled || isSubmitting) return

  // Set up form data for submission
  heartData = {
    targetType: targetType,
    targetId: targetId,
  }

  // Trigger form submission
  const form = document.getElementById(
    `heart-form-${targetType}-${targetId}`,
  ) as HTMLFormElement
  if (form) {
    isSubmitting = true
    form.requestSubmit()
  }
}

const handleSubmit: SubmitFunction = () => {
  isSubmitting = true
  return async ({ result }) => {
    isSubmitting = false
    if (result.type === 'success') {
      // Update the local state
      if (result.data?.hearted && !userHearted) {
        heartCount += 1
        userHearted = true
      } else if (!result.data?.hearted && userHearted) {
        heartCount -= 1
        userHearted = false
      }
      // Invalidate all data to refresh platform stats
      await invalidateAll()
    }
  }
}
</script>

<form
  method="POST"
  action="?/toggleHeart"
  use:enhance={handleSubmit}>

  <input type="hidden" name="targetType" value={heartData.targetType} />

  <input type="hidden" name="targetId" value={heartData.targetId} />

  <button
    class="heart-button"
    class:hearted={userHearted}
    class:disabled={disabled || isSubmitting}
    onclick={toggleHeart}
    disabled={disabled || isSubmitting}
    title={userHearted ? 'Remove heart' : 'Add heart'}>

    <span class="heart-icon">
      {heartCount > 0 ? '❤️' : '🤍'}
    </span>

    {#if heartCount > 0}
      <span class="heart-count" class:user-hearted={userHearted}>{heartCount}</span>
    {/if}
  </button>
</form>

<style>
  .heart-button {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    color: var(--color-text-secondary, #6b7280);
    transition: all 0.2s ease;
    user-select: none;
    min-width: 3rem;
    width: 3rem;
    backdrop-filter: blur(8px);
  }

  .heart-button:hover:not(.disabled) {
    background: var(--color-surface-alt, #f3f4f6);
    color: var(--color-text, #374151);
    backdrop-filter: blur(4px);
  }

  .heart-button.hearted {
    color: var(--color-accent, #dc2626);
  }

  .heart-button.hearted:hover:not(.disabled) {
    background: var(--color-accent-light, rgba(220, 38, 38, 0.1));
    backdrop-filter: blur(4px);
  }

  .heart-button.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .heart-icon {
    font-size: 1.1em;
    transition: transform 0.2s ease;
  }

  .heart-button:active:not(.disabled) .heart-icon {
    transform: scale(1.2);
  }

  .heart-count {
    font-size: 0.85em;
    font-weight: 500;
    min-width: 1em;
    text-align: center;
  }

  .heart-count.user-hearted {
    color: var(--color-accent, #dc2626);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 2px;
  }

  @media (max-width: 768px) {
    .heart-button {
      padding: 0.375rem 0.5rem;
      font-size: 0.85rem;
    }

    .heart-icon {
      font-size: 1em;
    }
  }
</style>
