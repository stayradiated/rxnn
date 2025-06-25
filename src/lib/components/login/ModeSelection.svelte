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
    🆕 Create New Identity
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
    color: #374151;
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
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
    transform: translateY(-1px);
  }
</style>