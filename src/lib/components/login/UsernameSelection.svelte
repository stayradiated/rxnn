<script lang="ts">
import PrimaryButton from '../PrimaryButton.svelte'
import SecondaryButton from '../SecondaryButton.svelte'

interface Props {
  username: string
  isLoading: boolean
  onGenerateNew: () => void
  onConfirm: () => void
  onBack: () => void
}

let { username, isLoading, onGenerateNew, onConfirm, onBack }: Props = $props()
</script>

<div class="username-selection">
  <h2>Your Anonymous Identity</h2>
  <p>Here's your randomly generated username. You can regenerate it until you find one you like!</p>

  <div class="username-display">
    <div class="username-card">
      <span class="username-text">@{username}</span>
    </div>
  </div>

  <div class="username-actions">
    <SecondaryButton
      onclick={onGenerateNew}
      disabled={isLoading}>
      🎲 Try Another Name
    </SecondaryButton>

    <PrimaryButton
      onclick={onConfirm}
      disabled={isLoading}
      loading={isLoading}
      loadingText="Creating Account...">
      ✅ Create Account
    </PrimaryButton>
  </div>

  <button
    onclick={onBack}
    class="btn-link"
    disabled={isLoading}>
    ← Back
  </button>
</div>

<style>
  .username-selection {
    text-align: center;
  }

  h2 {
    color: var(--color-text);
    margin-bottom: 1.5rem;
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .username-display {
    margin: 2rem 0;
  }

  .username-card {
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
    border-radius: 12px;
    padding: 2rem;
    margin: 1rem 0;
  }

  .username-text {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-primary);
    font-family: monospace;
  }

  .username-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 1.5rem 0;
  }


  .btn-link {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .btn-link:hover:not(:disabled) {
    color: var(--color-text);
  }
</style>
