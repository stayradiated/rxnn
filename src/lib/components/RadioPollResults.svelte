<script lang="ts">
import type { PostWithDetails } from '$lib/types'

interface Props {
  post: Extract<PostWithDetails, { post_type: 'radio' }>
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()

const userResponse = $derived(post.userResponse)

const pollConfigOptions = $derived(post.poll_config.options || [])
const pollResultOptions = $derived(post.pollResults?.options || [])
const totalResponses = $derived(post.pollResults?.totalResponses || 0)
</script>

{#each pollConfigOptions as option (option.id)}
  {@const result = pollResultOptions.find(r => r.option_id === option.id)}
  {@const percentage = result ? Math.round((result.count / totalResponses) * 100) : 0}
  {@const isUserChoice = userResponse?.selectedOption === option.id}
  <div class="poll-result-item" class:user-selected={isUserChoice}>
    <div class="result-header">
      <span class="option-label">
        {option.label}
        {#if isUserChoice}
          <div class="radio-checkmark">✓</div>
        {/if}
      </span>
      <span class="result-stats">{result?.count || 0} votes ({percentage}%)</span>
    </div>
    <div class="result-bar">
      <div class="result-fill" style:width="{percentage}%"></div>
    </div>
  </div>
{/each}

<style>
  .poll-result-item {
    margin-bottom: 1rem;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .option-label {
    color: var(--color-text, #374151);
    font-weight: 500;
  }

  .result-stats {
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.9rem;
  }

  .result-bar {
    background: var(--color-border, #e5e7eb);
    height: 16px;
    border-radius: 8px;
    overflow: hidden;
  }

  .result-fill {
    background: var(--color-primary, #2563eb);
    height: 100%;
    transition: width 0.3s ease;
  }

  .user-selected {
    background: var(--color-primary-light, #eff6ff);
    border-color: var(--color-primary, #2563eb);
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

  @media (max-width: 768px) {
    .result-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }
</style>
