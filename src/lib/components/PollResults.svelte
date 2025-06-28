<script lang="ts">
import type { PostWithDetails } from '$lib/types'
import SecondaryButton from './SecondaryButton.svelte'

interface Props {
  post: PostWithDetails
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()

const userResponse = $derived(post.userResponse)
</script>

<div class="poll-results">
  <div class="poll-results-header">
    <h4>Poll Results</h4>
    {#if userResponse}
      <SecondaryButton onclick={onEditResponse} size="small" title="Edit your response">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Response
      </SecondaryButton>
    {/if}
  </div>

  {#if post.post_type === 'radio' && post.poll_config?.type === 'radio' && post.pollResults?.type === 'radio'}
    {#each post.poll_config.options as option (option.id)}
      {@const result = post.pollResults.options.find(r => r.option_id === option.id)}
      {@const percentage = result ? Math.round((result.count / post.pollResults.totalResponses) * 100) : 0}
      {@const isUserChoice = userResponse?.selectedOption === option.id}
      <div class="poll-result-item" class:user-selected={isUserChoice}>
        <div class="result-header">
          <span class="option-label">
            {option.label}
            {#if isUserChoice}
              <button onclick={onEditResponse} class="radio-checkmark" title="Edit your response">
                ✓
              </button>
            {/if}
          </span>
          <span class="result-stats">{result?.count || 0} votes ({percentage}%)</span>
        </div>
        <div class="result-bar">
          <div class="result-fill" style:width="{percentage}%"></div>
        </div>
      </div>
    {/each}
  {:else if post.post_type === 'scale' && post.poll_config?.type === 'scale' && post.pollResults?.type === 'scale'}
    {@const min = post.poll_config.min || 1}
    {@const max = post.poll_config.max || 5}
    {@const totalValidResponses = post.pollResults.distribution?.reduce((sum, item) => sum + item.count, 0) || 0}
    <div class="scale-results">
      <div class="scale-stats">
        <span>Average: {post.pollResults.average?.toFixed(1) || 'N/A'}</span>
        <span>Votes cast: {totalValidResponses}</span>
      </div>

      {#if post.poll_config.minLabel || post.poll_config.maxLabel}
        <div class="scale-labels">
          {#if post.poll_config.minLabel}
            <span class="scale-label">{post.poll_config.minLabel}</span>
          {/if}
          {#if post.poll_config.maxLabel}
            <span class="scale-label">{post.poll_config.maxLabel}</span>
          {/if}
        </div>
      {/if}

      <div class="scale-chart">
        {#each Array.from({length: max - min + 1}, (_, i) => min + i) as value, index (index)}
          {@const result = post.pollResults.distribution.find(r => r.value === value)}
          {@const count = result?.count || 0}
          {@const percentage = result ? Math.round((result.count / post.pollResults.totalResponses) * 100) : 0}
          {@const isUserChoice = userResponse?.scaleValue === value}
          {@const maxCount = Math.max(...post.pollResults.distribution?.map(d => d.count) || [1])}
          {@const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0}

          <div class="scale-bar-container">
            <div class="scale-bar-wrapper">
              <div class="scale-bar" style:height="{barHeight}%">
                <div class="bar-count">{count} ({percentage}%)</div>
              </div>
            </div>
            <div class="scale-value">
              {value}
              {#if isUserChoice}
                <button onclick={onEditResponse} class="scale-checkmark" title="Edit your response">
                  ✓
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

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
</div>

<style>
  .poll-results {
    background: var(--color-surface-alt, #f0f9ff);
    border: 1px solid var(--color-border-accent, #bae6fd);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .poll-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .poll-results h4 {
    color: var(--color-primary-dark, #0c4a6e);
    margin: 0;
    font-size: 1.1rem;
  }

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
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  }

  .result-fill {
    background: var(--color-primary, #2563eb);
    height: 100%;
    transition: width 0.3s ease;
  }

  .scale-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
    color: var(--color-primary-dark, #0c4a6e);
    font-weight: 500;
    font-size: 0.95rem;
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

  .scale-checkmark {
    background: var(--color-primary, #2563eb);
    border: none;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 0.25rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scale-checkmark:hover {
    background: var(--color-primary-dark, #1d4ed8);
    transform: scale(1.1);
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    padding: 0 0.5rem;
    font-size: 0.9rem;
    color: var(--color-text, #374151);
    font-weight: 600;
  }

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

  .scale-chart {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 1.5rem 0;
    padding: 1rem 1rem 5rem;
    min-height: 180px;
    border-radius: 8px;
    position: relative;
  }

  .scale-chart::before {
    content: '';
    position: absolute;
    bottom: 5rem;
    left: 1rem;
    right: 1rem;
    height: 2px;
    background: var(--color-border, #e5e7eb);
    border-radius: 1px;
    z-index: 1;
  }

  .scale-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 80px;
    margin: 0 4px;
    position: relative;
  }

  .scale-bar-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 120px;
    width: 100%;
    position: relative;
  }

  .scale-bar {
    background: var(--color-primary, #3b82f6);
    border-radius: 4px 4px 0 0;
    min-height: 8px;
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    border: 1px solid var(--color-primary-dark, #1d4ed8);
  }

  .bar-count {
    position: absolute;
    bottom: -3rem;
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-text, #374151);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    text-align: center;
  }

  .scale-value {
    position: absolute;
    bottom: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text, #374151);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-height: 2rem;
  }

  @media (max-width: 768px) {
    .scale-stats {
      flex-direction: column;
      gap: 0.5rem;
    }

    .result-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .scale-chart {
      min-height: 110px;
      margin: 1rem 0;
      padding: 0.75rem 0.5rem 3.5rem;
    }

    .scale-chart::before {
      bottom: 3.5rem;
      left: 0.5rem;
      right: 0.5rem;
    }

    .scale-bar-wrapper {
      height: 70px;
    }

    .scale-bar-container {
      max-width: 60px;
      margin: 0 2px;
    }

    .scale-value {
      bottom: -2rem;
      gap: 0.25rem;
    }

    .scale-value {
      font-size: 0.75rem;
    }

    .bar-count {
      font-size: 0.7rem;
      bottom: -2.5rem;
    }
  }
</style>