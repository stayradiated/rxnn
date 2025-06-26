<script lang="ts">
interface Props {
  post: any
  pollResponses?: any
  pollResults?: any
  userResponse?: any
  showResults?: boolean
  onSubmitResponse: (responseData: any) => void
  onEditResponse: () => void
}

let {
  post,
  pollResponses = $bindable({}),
  pollResults = null,
  userResponse = null,
  showResults = false,
  onSubmitResponse,
  onEditResponse,
}: Props = $props()

function submitResponse() {
  const response = pollResponses
  if (post.post_type === 'radio' && response?.selectedOption) {
    onSubmitResponse({ selectedOption: response.selectedOption })
  } else if (post.post_type === 'scale' && response?.scaleValue) {
    onSubmitResponse({ scaleValue: response.scaleValue })
  }
}

function editResponse() {
  onEditResponse()
}

function isSubmitDisabled() {
  if (post.post_type === 'radio') {
    return !pollResponses?.selectedOption
  }
  if (post.post_type === 'scale') {
    return !pollResponses?.scaleValue
  }
  return true
}

// Initialize pollResponses if not already done
if (!pollResponses) {
  pollResponses = {}
}

// Initialize scaleValue to the minimum value if not set
if (post.post_type === 'scale' && !pollResponses.scaleValue) {
  pollResponses.scaleValue = post.poll_config?.min || 1
}
</script>

{#if post.post_type !== 'text'}
  <div class="poll-section">
    {#if showResults && pollResults}
      <!-- Show Poll Results -->
      <div class="poll-results">
        <h4>Poll Results</h4>
        {#if post.post_type === 'radio'}
          {#each post.poll_config.options as option (option.id)}
            {@const result = pollResults.options?.find(r => r.option_id === option.id)}
            {@const percentage = result ? Math.round((result.count / pollResults.totalResponses) * 100) : 0}
            {@const isUserChoice = userResponse?.selectedOption === option.id}
            <div class="poll-result-item" class:user-selected={isUserChoice}>
              <div class="result-header">
                <span class="option-label">
                  {option.label}
                  {#if isUserChoice}
                    <button onclick={editResponse} class="radio-checkmark" title="Edit your response">
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
        {:else if post.post_type === 'scale'}
          <div class="scale-results">
            <div class="scale-stats">
              <span>Average: {pollResults.average?.toFixed(1) || 'N/A'}</span>
              <span>Total responses: {pollResults.totalResponses || 0}</span>
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
              {#each Array.from({length: post.poll_config.max - post.poll_config.min + 1}, (_, i) => post.poll_config.min + i) as value, index (index)}
                {@const result = pollResults.distribution?.find(r => r.value === value)}
                {@const count = result?.count || 0}
                {@const percentage = result ? Math.round((result.count / pollResults.totalResponses) * 100) : 0}
                {@const isUserChoice = userResponse?.scaleValue === value}
                {@const maxCount = Math.max(...pollResults.distribution?.map(d => d.count) || [1])}
                {@const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0}

                <div class="scale-bar-container" class:user-selected={isUserChoice}>
                  <div class="scale-bar-wrapper">
                    <div class="scale-bar" style:height="{barHeight}%">
                      <div class="bar-count">{count}</div>
                    </div>
                  </div>
                  <div class="scale-value">
                    {value}
                    {#if isUserChoice}
                      <button onclick={editResponse} class="scale-checkmark" title="Edit your response">
                        ✓
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

      </div>
    {:else}
      <!-- Show Poll Form -->
      <div class="poll-form">
        {#if post.post_type === 'radio' && post.poll_config}
          <div class="radio-poll">
            {#each post.poll_config.options as option (option.id)}
              <label class="poll-option">
                <input
                  type="radio"
                  bind:group={pollResponses.selectedOption}
                  value={option.id}
                  name="poll-{post.id}"
                />
                <span class="option-text">{option.label}</span>
              </label>
            {/each}
          </div>
        {:else if post.post_type === 'scale' && post.poll_config}
          <div class="scale-poll">
            <div class="scale-labels">
              {#if post.poll_config.minLabel}
                <span class="scale-label">{post.poll_config.minLabel}</span>
              {/if}
              {#if post.poll_config.maxLabel}
                <span class="scale-label">{post.poll_config.maxLabel}</span>
              {/if}
            </div>
            <div class="slider-container">
              <div class="slider-wrapper">
                <input
                  type="range"
                  bind:value={pollResponses.scaleValue}
                  min={post.poll_config.min}
                  max={post.poll_config.max}
                  step="1"
                  class="scale-slider"
                />
                <div class="slider-value">
                  {pollResponses.scaleValue || post.poll_config.min}
                </div>
              </div>
              <div class="slider-ticks">
                {#each Array.from({length: post.poll_config.max - post.poll_config.min + 1}, (_, i) => post.poll_config.min + i) as value, index (index)}
                  <span class="tick-mark">{value}</span>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <button
          onclick={submitResponse}
          class="btn-primary poll-submit"
          disabled={isSubmitDisabled()}>
          Submit Response
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Interactive Poll Styles */
  .poll-section {
    margin-bottom: 1rem;
  }

  .poll-form {
    background: var(--color-surface-alt, #f9fafb);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .radio-poll {
    margin-bottom: 1rem;
  }

  .poll-option {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 6px;
    background: var(--color-surface, white);
    cursor: pointer;
    transition: all 0.2s;
  }

  .poll-option:hover {
    border-color: var(--color-primary, #2563eb);
    background: var(--color-surface-alt, #eff6ff);
  }

  .poll-option input {
    margin-right: 0.75rem;
  }

  .option-text {
    flex: 1;
    color: var(--color-text, #374151);
    font-size: 0.95rem;
  }

  .scale-poll {
    margin-bottom: 1rem;
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .slider-container {
    padding: 1rem 0;
  }

  .slider-wrapper {
    position: relative;
    margin-bottom: 1rem;
  }

  .scale-slider {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: var(--color-border, #e5e7eb);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .scale-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-primary, #2563eb);
    cursor: pointer;
    border: 2px solid var(--color-surface, white);
    box-shadow: 0 2px 4px var(--color-shadow, rgba(0, 0, 0, 0.2));
    transition: all 0.2s;
  }

  .scale-slider::-webkit-slider-thumb:hover {
    background: var(--color-primary-dark, #1d4ed8);
    transform: scale(1.1);
  }

  .scale-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-primary, #2563eb);
    cursor: pointer;
    border: 2px solid var(--color-surface, white);
    box-shadow: 0 2px 4px var(--color-shadow, rgba(0, 0, 0, 0.2));
    transition: all 0.2s;
  }

  .scale-slider::-moz-range-thumb:hover {
    background: var(--color-primary-dark, #1d4ed8);
    transform: scale(1.1);
  }

  .scale-slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
    background: var(--color-border, #e5e7eb);
  }

  .scale-slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: var(--color-border, #e5e7eb);
    border: none;
  }

  .slider-value {
    position: absolute;
    top: -2.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary, #2563eb);
    color: var(--color-text-inverse, white);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    pointer-events: none;
  }

  .slider-value::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--color-primary, #2563eb);
  }

  .slider-ticks {
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
  }

  .tick-mark {
    font-size: 0.8rem;
    color: var(--color-text-muted, #6b7280);
    font-weight: 500;
  }

  .poll-submit {
    width: 100%;
    margin-top: 1rem;
  }

  .btn-primary {
    background: var(--color-primary, #2563eb);
    color: var(--color-text-inverse, white);
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-dark, #1d4ed8);
  }

  .btn-primary:disabled {
    background: var(--color-disabled, #9ca3af);
    cursor: not-allowed;
  }

  /* Poll Results Styles */
  .poll-results {
    background: var(--color-surface-alt, #f0f9ff);
    border: 1px solid var(--color-border-accent, #bae6fd);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .poll-results h4 {
    color: var(--color-primary-dark, #0c4a6e);
    margin-bottom: 1rem;
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
    font-size: 0.85rem;
    color: var(--color-text-secondary, #6b7280);
    font-style: italic;
  }

  .scale-chart {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 1.5rem 0;
    padding: 1rem 0.5rem 0.5rem;
    min-height: 120px;
  }

  .scale-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 60px;
    margin: 0 2px;
  }

  .scale-bar-container.user-selected {
    background: var(--color-primary-light, #eff6ff);
    border-radius: 6px;
    padding: 0.25rem;
    margin: -0.25rem 2px;
  }

  .scale-bar-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 80px;
    width: 100%;
    margin-bottom: 0.5rem;
    position: relative;
  }

  .scale-bar {
    background: var(--color-primary, #2563eb);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .scale-bar-container.user-selected .scale-bar {
    background: var(--color-primary-dark, #1d4ed8);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
  }

  .bar-count {
    position: absolute;
    top: -1.5rem;
    color: var(--color-text, #374151);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .scale-value {
    text-align: center;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text, #374151);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-height: 2.5rem;
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

    .user-response {
      text-align: center;
    }

    .btn-edit {
      margin-left: 0;
      margin-top: 0.5rem;
    }

    .poll-form {
      padding: 1rem;
    }

    .slider-ticks {
      padding: 0 8px;
    }

    .tick-mark {
      font-size: 0.7rem;
    }

    .slider-value {
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
    }

    .scale-chart {
      min-height: 100px;
      margin: 1rem 0;
    }

    .scale-bar-wrapper {
      height: 60px;
    }

    .scale-bar-container {
      max-width: 50px;
      margin: 0 1px;
    }

    .scale-value {
      font-size: 0.75rem;
    }

    .bar-count {
      font-size: 0.7rem;
      top: -1.25rem;
    }
  }
</style>
