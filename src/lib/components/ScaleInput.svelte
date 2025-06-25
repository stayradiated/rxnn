<script lang="ts">
export let label: string
export let name: string
export let value: number | string | undefined = undefined
export let min = 1
export let max = 5
export let minLabel = ''
export let maxLabel = ''
export let allowPreferNotToAnswer = true

$: options = Array.from({ length: max - min + 1 }, (_, i) => min + i)
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <div class="scale">
    {#each options as option (option)}
      <label class="scale-item">
        <input
          type="radio"
          {name}
          value={option}
          bind:group={value}
        />
        <span class="scale-number">{option}</span>
      </label>
    {/each}
  </div>
  {#if minLabel || maxLabel}
    <div class="scale-labels">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  {/if}
  {#if allowPreferNotToAnswer}
    <div class="prefer-not-to-answer-section">
      <div class="separator"></div>
      <label class="scale-item prefer-not-to-answer">
        <input
          type="radio"
          {name}
          value="prefer-not-to-answer"
          bind:group={value}
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

  .scale {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 1rem 0;
    flex-wrap: wrap;
  }

  .scale-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .scale-item:hover {
    background: #f3f4f6;
  }

  .scale-item input {
    margin-bottom: 0.5rem;
  }

  .scale-number {
    font-weight: 600;
    color: #374151;
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: 1rem;
  }

  .prefer-not-to-answer-section {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .separator {
    width: 100%;
    height: 1px;
    background: #e5e7eb;
    margin-bottom: 1rem;
  }

  .prefer-not-to-answer {
    color: #6b7280;
    font-style: italic;
  }

  .prefer-text {
    font-weight: normal;
    color: #6b7280;
  }
</style>