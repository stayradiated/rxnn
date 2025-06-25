<script lang="ts">
export let label: string
export let value = ''
export let placeholder = ''
export let rows = 4
export let maxLength: number | undefined = undefined
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <textarea
    bind:value
    {placeholder}
    {rows}
    maxlength={maxLength}
    class="text-input"></textarea>
  {#if maxLength}
    <div class="character-count">
      {value.length}/{maxLength} characters
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
</style>