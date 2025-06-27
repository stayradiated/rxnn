<script lang="ts">
import type { RadioPollConfig, ResponseData } from '$lib/types'

interface Props {
  postId: number
  pollConfig: RadioPollConfig
  pollResponses: ResponseData
}

const { postId, pollConfig, pollResponses }: Props = $props()
</script>

<div class="radio-poll">
  {#each pollConfig.options as option (option.id)}
    <label class="poll-option">
      <input
        type="radio"
        bind:group={pollResponses.selectedOption}
        value={option.id}
        name="poll-{postId}"
      />
      <span class="option-text">{option.label}</span>
    </label>
  {/each}

  <div class="special-options">
    <label class="poll-option special-option">
      <input
        type="radio"
        bind:group={pollResponses.selectedOption}
        value="prefer_not_to_say"
        name="poll-{postId}"
      />
      <span class="option-text">Prefer Not To Say</span>
    </label>
    <label class="poll-option special-option">
      <input
        type="radio"
        bind:group={pollResponses.selectedOption}
        value="not_applicable"
        name="poll-{postId}"
      />
      <span class="option-text">Not Applicable</span>
    </label>
  </div>
</div>

<style>
  .radio-poll {
    margin-bottom: 1rem;
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
</style>