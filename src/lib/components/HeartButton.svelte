<script lang="ts">
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

async function toggleHeart() {
  if (disabled || isSubmitting) return

  isSubmitting = true

  try {
    const response = await fetch('/api/hearts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetType, targetId }),
    })

    if (response.ok) {
      const data = await response.json()

      // Update the local state
      if (data.hearted && !userHearted) {
        heartCount += 1
        userHearted = true
      } else if (!data.hearted && userHearted) {
        heartCount -= 1
        userHearted = false
      }
    } else {
      console.error('Failed to toggle heart')
    }
  } catch (error) {
    console.error('Error toggling heart:', error)
  } finally {
    isSubmitting = false
  }
}
</script>

<button
  class="heart-button"
  class:hearted={userHearted}
  class:disabled={disabled || isSubmitting}
  onclick={toggleHeart}
  disabled={disabled || isSubmitting}
  title={userHearted ? 'Remove heart' : 'Add heart'}>
  <span class="heart-icon">
    {userHearted ? '❤️' : '🤍'}
  </span>
  {#if heartCount > 0}
    <span class="heart-count">{heartCount}</span>
  {/if}
</button>

<style>
  .heart-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: var(--color-text-secondary, #6b7280);
    transition: all 0.2s ease;
    user-select: none;
  }

  .heart-button:hover:not(.disabled) {
    background: var(--color-surface-alt, #f3f4f6);
    color: var(--color-text, #374151);
  }

  .heart-button.hearted {
    color: var(--color-accent, #dc2626);
  }

  .heart-button.hearted:hover:not(.disabled) {
    background: var(--color-accent-light, #fee2e2);
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