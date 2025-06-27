<script lang="ts">
import type { ResponseData, ScalePollConfig } from '$lib/types'

interface Props {
  postId: number
  pollConfig: ScalePollConfig
  pollResponses: ResponseData
}

const { postId, pollConfig, pollResponses }: Props = $props()

const min = $derived(pollConfig.min || 1)
const max = $derived(pollConfig.max || 5)
</script>

<div class="scale-poll">
  <div class="scale-labels">
    {#if pollConfig.minLabel}
      <span class="scale-label">{pollConfig.minLabel}</span>
    {/if}
    {#if pollConfig.maxLabel}
      <span class="scale-label">{pollConfig.maxLabel}</span>
    {/if}
  </div>
  <div class="slider-container">
    <div class="slider-wrapper">
      <input
        type="range"
        bind:value={pollResponses.scaleValue}
        {min}
        {max}
        step="1"
        class="scale-slider"
        oninput={() => {
          pollResponses.specialOption = null
        }}
      />
    </div>
    <div class="slider-ticks">
      {#each Array.from({length: max - min + 1}, (_, i) => min + i) as value, index (index)}
        <span class="tick-mark" class:selected={pollResponses.scaleValue === value}>{value}</span>
      {/each}
    </div>
  </div>

  <div class="special-options">
    <label class="poll-option special-option">
      <input
        type="radio"
        bind:group={pollResponses.specialOption}
        value="prefer_not_to_say"
        name="poll-special-{postId}"
        onchange={() => {
          pollResponses.scaleValue = undefined
        }}
      />
      <span class="option-text">Prefer Not To Say</span>
    </label>
    <label class="poll-option special-option">
      <input
        type="radio"
        bind:group={pollResponses.specialOption}
        value="not_applicable"
        name="poll-special-{postId}"
        onchange={() => {
          pollResponses.scaleValue = undefined
        }}
      />
      <span class="option-text">Not Applicable</span>
    </label>
  </div>
</div>

<style>
  .scale-poll {
    margin-bottom: 1rem;
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--color-text, #374151);
    font-weight: 600;
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

  .slider-ticks {
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
  }

  .tick-mark {
    font-size: 0.8rem;
    color: var(--color-text-muted, #6b7280);
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
  }

  .tick-mark.selected {
    background: var(--color-primary, #2563eb);
    color: var(--color-text-inverse, white);
    font-weight: 600;
    transform: scale(1.1);
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

  .special-options {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .special-option {
    background: var(--color-surface-alt, #f9fafb);
    border-color: var(--color-border-light, #f3f4f6);
  }

  @media (max-width: 768px) {
    .slider-ticks {
      padding: 0 8px;
    }

    .tick-mark {
      font-size: 0.7rem;
    }
  }
</style>