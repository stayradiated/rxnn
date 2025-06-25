<script lang="ts">
export let label: string
export let value = 0
export let min = 0
export let max = 100
export let minLabel = ''
export let maxLabel = ''
export let unit = '%'
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <div class="slider-container">
    <input
      type="range"
      {min}
      {max}
      bind:value
      class="slider"
    />
    <div class="slider-labels">
      <span>{minLabel || `${min}${unit}`}</span>
      <span class="current-value">{value}{unit}</span>
      <span>{maxLabel || `${max}${unit}`}</span>
    </div>
  </div>
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
</style>