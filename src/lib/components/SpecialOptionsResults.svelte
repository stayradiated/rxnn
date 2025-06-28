<script lang="ts">
import type { PostWithDetails } from '$lib/types'

interface Props {
  post: PostWithDetails
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()

const userResponse = $derived(post.userResponse)

const preferNotToSayCount = $derived(
  post.pollResults?.specialOptions?.find(
    (option) => option.type === 'prefer_not_to_say',
  )?.count || 0,
)
const notApplicableCount = $derived(
  post.pollResults?.specialOptions?.find(
    (option) => option.type === 'not_applicable',
  )?.count || 0,
)
const hasSpecialOptions = $derived(
  post.pollResults?.specialOptions?.some((option) => option.count > 0) || false,
)
</script>

{#if hasSpecialOptions}
  <div class="special-stats">
    {#if preferNotToSayCount > 0}
      <div class="special-stat">
        <span class="special-label">
          Prefer Not To Say
          {#if userResponse?.specialOption === 'prefer_not_to_say' || userResponse?.selectedOption === 'prefer_not_to_say'}
            <div class="radio-checkmark">✓</div>
          {/if}
        </span>
        <span class="special-count">{preferNotToSayCount}</span>
      </div>
    {/if}

    {#if notApplicableCount > 0}
      <div class="special-stat">
        <span class="special-label">
          Not Applicable
          {#if userResponse?.specialOption === 'not_applicable' || userResponse?.selectedOption === 'not_applicable'}
            <div class="radio-checkmark">✓</div>
          {/if}
        </span>
        <span class="special-count">{notApplicableCount}</span>
      </div>
    {/if}
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
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
