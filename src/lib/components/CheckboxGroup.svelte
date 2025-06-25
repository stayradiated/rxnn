<script lang="ts">
export let label: string
export let options: Array<{ value: string; label: string }>
export let value: string[] = []
export let allowNone = false
export let noneLabel = 'None of these'

function handleChange(optionValue: string, checked: boolean) {
  if (checked) {
    value = [...value, optionValue]
  } else {
    value = value.filter((v) => v !== optionValue)
  }
}

function handleNoneChange(checked: boolean) {
  if (checked) {
    value = ['none']
  } else {
    value = []
  }
}

$: noneSelected = value.includes('none')
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <div class="options">
    {#each options as option (option.value)}
      <label class="option">
        <input
          type="checkbox"
          value={option.value}
          checked={value.includes(option.value) && !noneSelected}
          disabled={noneSelected}
          on:change={(e) => handleChange(option.value, e.currentTarget.checked)}
        />
        {option.label}
      </label>
    {/each}

    {#if allowNone}
      <label class="option none-option">
        <input
          type="checkbox"
          value="none"
          checked={noneSelected}
          on:change={(e) => handleNoneChange(e.currentTarget.checked)}
        />
        {noneLabel}
      </label>
    {/if}
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

  .option input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .none-option {
    border-top: 1px solid #e5e7eb;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
</style>