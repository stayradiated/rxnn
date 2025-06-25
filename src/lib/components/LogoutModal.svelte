<script lang="ts">
interface Props {
  show?: boolean
  token?: string
  tokenConfirmation?: string
  logoutError?: string
  onCancel: () => void
  onConfirm: () => void
}

let {
  show = false,
  token = '',
  tokenConfirmation = $bindable(''),
  logoutError = '',
  onCancel,
  onConfirm,
}: Props = $props()

function handleOverlayClick() {
  onCancel()
}

function handleModalClick(event: Event) {
  event.stopPropagation()
}

function copyToken() {
  navigator.clipboard.writeText(token)
}
</script>

{#if show}
  <div class="modal-overlay" onclick={handleOverlayClick}>
    <div class="modal-content" onclick={handleModalClick}>
      <h2>Confirm Logout</h2>
      <p>Before logging out, please ensure you have a copy of your secret token:</p>

      <div class="token-display-box">
        <code class="token-text">{token}</code>
        <button onclick={copyToken} class="btn-copy-small">📋</button>
      </div>

      <p>To continue, please paste your token below to confirm you have it saved:</p>

      <input
        type="text"
        bind:value={tokenConfirmation}
        placeholder="Paste your token here to confirm..."
        class="token-confirmation-input"
      />

      {#if logoutError}
        <div class="error-message-modal">
          {logoutError}
        </div>
      {/if}

      <div class="modal-actions">
        <button onclick={onCancel} class="btn-secondary">Cancel</button>
        <button
          onclick={onConfirm}
          class="btn-danger"
          disabled={!tokenConfirmation.trim()}>
          Logout
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    margin: 1rem;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    color: #dc2626;
    margin-bottom: 1rem;
  }

  .modal-content p {
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .token-display-box {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    word-break: break-all;
  }

  .token-display-box .token-text {
    flex: 1;
    font-family: monospace;
    font-size: 0.8rem;
    color: #374151;
  }

  .btn-copy-small {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .btn-copy-small:hover {
    background: #059669;
  }

  .token-confirmation-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .token-confirmation-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .error-message-modal {
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 0.75rem;
    margin: 1rem 0;
    color: #dc2626;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  .btn-danger:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .modal-content {
      padding: 1.5rem;
      margin: 0.5rem;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
</style>