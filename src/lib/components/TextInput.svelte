<script lang="ts">
export let label: string
export let value = ''
export let placeholder = ''
export let rows = 4
export let maxLength: number | undefined = undefined
export let allowPreferNotToAnswer = true

let isPreferNotToAnswer = false
let actualValue = value

$: {
  if (value === 'prefer-not-to-answer') {
    isPreferNotToAnswer = true
    actualValue = ''
  } else {
    isPreferNotToAnswer = false
    actualValue = value
  }
}

function handlePreferNotToAnswer(checked: boolean) {
  if (checked) {
    value = 'prefer-not-to-answer'
    isPreferNotToAnswer = true
  } else {
    value = actualValue
    isPreferNotToAnswer = false
  }
}

function handleTextChange(event: Event) {
  if (!isPreferNotToAnswer) {
    const target = event.target as HTMLTextAreaElement
    value = target.value
    actualValue = target.value
  }
}
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <textarea
    value={isPreferNotToAnswer ? 'Prefer not to answer' : actualValue}
    placeholder={isPreferNotToAnswer ? '' : placeholder}
    {rows}
    maxlength={maxLength}
    disabled={isPreferNotToAnswer}
    class="text-input"
    class:disabled={isPreferNotToAnswer}
    on:input={handleTextChange}></textarea>
  {#if maxLength && !isPreferNotToAnswer}
    <div class="character-count">
      {actualValue.length}/{maxLength} characters
    </div>
  {/if}
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

  .text-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.2s;
  }

  .text-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .character-count {
    text-align: right;
    font-size: 0.8rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .text-input.disabled {
    background: #f9fafb;
    color: #6b7280;
    font-style: italic;
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