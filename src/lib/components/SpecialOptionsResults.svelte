<script lang="ts">
import type { PostWithDetails } from '$lib/types'

interface Props {
  post: PostWithDetails
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()

const userResponse = $derived(post.userResponse)
</script>

{#if post.pollResults?.specialOptions}
  <div class="special-stats">
    {#each post.pollResults.specialOptions as option, index (index)}
      {#if option.count > 0}
        <div class="special-stat">
          <span class="special-label">
            {option.type === 'prefer_not_to_say' ? 'Prefer Not To Say' : 'Not Applicable'}
            {#if userResponse?.specialOption === option.type || userResponse?.selectedOption === option.type}
              <button onclick={onEditResponse} class="radio-checkmark" title="Edit your response">
                ✓
              </button>
            {/if}
          </span>
          <span class="special-count">{option.count}</span>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .special-stats {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .special-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    background: var(--color-surface-alt, #f9fafb);
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .special-label {
    color: var(--color-text-secondary, #6b7280);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .special-count {
    color: var(--color-text, #374151);
    font-weight: 500;
  }

  .radio-checkmark {
    background: var(--color-primary, #2563eb);
    border: none;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .radio-checkmark:hover {
    background: var(--color-primary-dark, #1d4ed8);
    transform: scale(1.1);
  }
</style>