<script lang="ts">
interface Props {
  isLoading: boolean
  onCreateNew: () => void
  onUseExisting: () => void
}

let { isLoading, onCreateNew, onUseExisting }: Props = $props()
</script>

<div class="mode-selection">
  <h2>How would you like to proceed?</h2>

  <button
    onclick={onCreateNew}
    class="btn-primary btn-large"
    disabled={isLoading}>
    🦊 Create Identity
  </button>

  <button
    onclick={onUseExisting}
    class="btn-secondary btn-large"
    disabled={isLoading}>
    🔑 I Have a Token
  </button>
</div>

<style>
  .mode-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 {
    color: var(--color-text);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .btn-large {
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: block;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    background: var(--color-text-muted);
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    background: var(--color-surface-alt);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-border);
    transform: translateY(-1px);
  }
</style>
