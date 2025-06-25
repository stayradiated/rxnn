<script lang="ts">
export let label: string
export let name: string
export let options: Array<{ value: string; label: string }>
export let value: string | undefined = undefined

$: value = value || undefined
</script>

<div class="question">
  <label class="question-label">{label}</label>
  <div class="options">
    {#each options as option (option.value)}
      <label class="option">
        <input
          type="radio"
          {name}
          value={option.value}
          bind:group={value}
        />
        {option.label}
      </label>
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
</style>