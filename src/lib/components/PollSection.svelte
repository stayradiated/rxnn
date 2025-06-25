<script lang="ts">
export let post: any
export let pollResponses: any = {}
export let pollResults: any = null
export let userResponse: any = null
export let showResults = false
export let onSubmitResponse: (responseData: any) => void
export let onEditResponse: () => void

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
            <div class="poll-result-item">
              <div class="result-header">
                <span class="option-label">{option.label}</span>
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
            {#each Array.from({length: post.poll_config.max - post.poll_config.min + 1}, (_, i) => post.poll_config.min + i) as value, index (index)}
              {@const result = pollResults.distribution?.find(r => r.value === value)}
              {@const percentage = result ? Math.round((result.count / pollResults.totalResponses) * 100) : 0}
              <div class="poll-result-item">
                <div class="result-header">
                  <span class="option-label">{value}</span>
                  <span class="result-stats">{result?.count || 0} votes ({percentage}%)</span>
                </div>
                <div class="result-bar">
                  <div class="result-fill" style:width="{percentage}%"></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if userResponse}
          <div class="user-response">
            <strong>Your response:</strong>
            {#if post.post_type === 'radio'}
              {post.poll_config.options.find(opt => opt.id === userResponse.selectedOption)?.label}
            {:else if post.post_type === 'scale'}
              {userResponse.scaleValue}
            {/if}
            <button on:click={editResponse} class="btn-edit">
              Edit Response
            </button>
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
          on:click={submitResponse}
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
    background: #f9fafb;
    border: 1px solid #e5e7eb;
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
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .poll-option:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .poll-option input {
    margin-right: 0.75rem;
  }

  .option-text {
    flex: 1;
    color: #374151;
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
    color: #6b7280;
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
    background: #e5e7eb;
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
    background: #2563eb;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }

  .scale-slider::-webkit-slider-thumb:hover {
    background: #1d4ed8;
    transform: scale(1.1);
  }

  .scale-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #2563eb;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }

  .scale-slider::-moz-range-thumb:hover {
    background: #1d4ed8;
    transform: scale(1.1);
  }

  .scale-slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
    background: #e5e7eb;
  }

  .scale-slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: #e5e7eb;
    border: none;
  }

  .slider-value {
    position: absolute;
    top: -2.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: #2563eb;
    color: white;
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
    border-top-color: #2563eb;
  }

  .slider-ticks {
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
  }

  .tick-mark {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
  }

  .poll-submit {
    width: 100%;
    margin-top: 1rem;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  /* Poll Results Styles */
  .poll-results {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .poll-results h4 {
    color: #0c4a6e;
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
    color: #374151;
    font-weight: 500;
  }

  .result-stats {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .result-bar {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  }

  .result-fill {
    background: #2563eb;
    height: 100%;
    transition: width 0.3s ease;
  }

  .scale-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
    color: #0c4a6e;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .user-response {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 6px;
    color: #92400e;
  }

  .btn-edit {
    background: #f59e0b;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    margin-left: 1rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .btn-edit:hover {
    background: #d97706;
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
  }
</style>
