<script lang="ts">
export let label: string
export let name: string
export let options: Array<{ value: string; label: string }>
export let value: string | undefined = undefined
export let allowPreferNotToAnswer = true

$: value = value || undefined
$: allOptions = allowPreferNotToAnswer
  ? [
      ...options,
      { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
    ]
  : options
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <div class="options">
    {#each allOptions as option, index (option.value)}
      <label class="option" class:prefer-not-to-answer={option.value === 'prefer-not-to-answer'}>
        <input
          type="radio"
          {name}
          value={option.value}
          bind:group={value}
        />
        {option.label}
      </label>
      {#if allowPreferNotToAnswer && index === options.length - 1}
        <div class="separator"></div>
      {/if}
    {/each}
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

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option {
    font-weight: normal;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .option:hover {
    background: #f9fafb;
    border-radius: 4px;
    padding: 0.25rem;
    margin: -0.25rem;
  }

  .separator {
    height: 1px;
    background: #e5e7eb;
    margin: 0.5rem 0;
  }

  .prefer-not-to-answer {
    color: #6b7280;
    font-style: italic;
  }
</style>