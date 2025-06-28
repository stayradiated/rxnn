<script lang="ts">
import type { PostWithDetails } from '$lib/types'

interface Props {
  post: Extract<PostWithDetails, { post_type: 'scale' }>
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()

const userResponse = $derived(post.userResponse)

const min = $derived(post.poll_config.min || 1)
const max = $derived(post.poll_config.max || 5)
const distribution = $derived(post.pollResults?.distribution || [])
const totalValidResponses = $derived(
  distribution?.reduce((sum, item) => sum + item.count, 0) || 0,
)
const maxCount = $derived(
  Math.max(...(distribution.map((d) => d.count) || [1])),
)
const totalResponses = $derived(post.pollResults?.totalResponses || 0)
const average = $derived(post.pollResults?.average || 0)
</script>

<div class="scale-results">
  <div class="scale-stats">
    <span>Average: {average.toFixed(1) || 'N/A'}</span>
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
      {@const result = distribution.find(r => r.value === value)}
      {@const count = result?.count || 0}
      {@const percentage = result ? Math.round((result.count / totalResponses) * 100) : 0}
      {@const isUserChoice = userResponse?.scaleValue === value}
      {@const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0}

      <div class="scale-bar-container">
        <div class="scale-bar-wrapper">
          <div class="scale-bar" style:height="{barHeight}%"></div>
        </div>
        <div class="scale-value">{value}</div>
        <div class="bar-count">{count} ({percentage}%)</div>
        {#if isUserChoice}
          <div class="scale-checkmark">✓</div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .scale-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
    color: var(--color-primary-dark, #0c4a6e);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .scale-checkmark {
    flex-shrink: 0;
    background: var(--color-primary, #2563eb);
    border: none;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .scale-chart {
    display: flex;
    justify-content: space-between;
    margin: 1.5rem 0 4.5rem;
    height: 120px;
    border-bottom: 2px solid var(--color-border, #e5e7eb);
    gap: 1rem;

  }

  .scale-bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-height: 180px;
  }

  .scale-bar-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    min-height: 120px;
    width: 100%;
  }

  .scale-bar {
    border-radius: 8px 8px 0 0;
    min-height: 4px;
    border: 1px solid var(--color-primary-dark, #1d4ed8);
    background: var(--color-primary, #3b82f6);
    box-sizing: border-box;
    transition: height 0.3s ease;
  }

  .bar-count {
    flex-shrink: 0;
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.75rem;
    line-height: 2;
    font-weight: 500;
    white-space: nowrap;
    text-align: center;
  }

  .scale-value {
    color: var(--color-text, #374151);
    flex-shrink: 0;
    text-align: center;
    font-size: 0.85rem;
    line-height: 2;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .scale-chart {
      gap: 0.25rem;
    }
    .scale-value {
      font-size: 0.75rem;
      line-height: 1.8;
    }
    .bar-count {
      font-size: 0.7rem;
      line-height: 1.8;
    }
  }
</style>
