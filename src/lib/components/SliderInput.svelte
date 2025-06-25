<script lang="ts">
export let label: string
export let value: number | string = 0
export let min = 0
export let max = 100
export let minLabel = ''
export let maxLabel = ''
export let unit = '%'
export let allowPreferNotToAnswer = true

let isPreferNotToAnswer = false

$: {
  if (value === 'prefer-not-to-answer') {
    isPreferNotToAnswer = true
  } else {
    isPreferNotToAnswer = false
  }
}

function handlePreferNotToAnswer(checked: boolean) {
  if (checked) {
    value = 'prefer-not-to-answer'
    isPreferNotToAnswer = true
  } else {
    value = min
    isPreferNotToAnswer = false
  }
}

function handleSliderChange(event: Event) {
  if (!isPreferNotToAnswer) {
    value = Number((event.target as HTMLInputElement).value)
  }
}
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <div class="slider-container">
    <input
      type="range"
      {min}
      {max}
      value={isPreferNotToAnswer ? min : value}
      disabled={isPreferNotToAnswer}
      class="slider"
      class:disabled={isPreferNotToAnswer}
      on:input={handleSliderChange}
    />
    <div class="slider-labels">
      <span>{minLabel || `${min}${unit}`}</span>
      <span class="current-value">
        {isPreferNotToAnswer ? 'Prefer not to answer' : `${value}${unit}`}
      </span>
      <span>{maxLabel || `${max}${unit}`}</span>
    </div>
  </div>
  {#if allowPreferNotToAnswer}
    <div class="prefer-not-to-answer-section">
      <label class="prefer-checkbox">
        <input
          type="checkbox"
          checked={isPreferNotToAnswer}
          on:change={(e) => handlePreferNotToAnswer(e.currentTarget.checked)}
        />
        <span class="prefer-text">Prefer not to answer</span>
      </label>
    </div>
  {/if}
</div>

<style>
  .question {
    margin-bottom: 2rem;
  }

  .question-label {
    display: block;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
  }

  .slider-container {
    margin: 1rem 0;
  }

  .slider {
    width: 100%;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #2563eb;
    border-radius: 50%;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #2563eb;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #6b7280;
  }

  .current-value {
    font-weight: 600;
    color: #2563eb;
  }

  .slider.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .prefer-not-to-answer-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .prefer-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #6b7280;
    font-style: italic;
  }

  .prefer-text {
    font-size: 0.9rem;
  }
</style>