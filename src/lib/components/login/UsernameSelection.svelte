<script lang="ts">
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
    <button
      onclick={onGenerateNew}
      class="btn-secondary"
      disabled={isLoading}>
      🎲 Try Another Name
    </button>

    <button
      onclick={onConfirm}
      class="btn-primary"
      disabled={isLoading}>
      {isLoading ? 'Creating Account...' : '✓ I Like This Name'}
    </button>
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
    color: #374151;
    margin-bottom: 1.5rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .username-display {
    margin: 2rem 0;
  }

  .username-card {
    background: #f8fafc;
    border: 2px solid #2563eb;
    border-radius: 12px;
    padding: 2rem;
    margin: 1rem 0;
  }

  .username-text {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2563eb;
    font-family: monospace;
  }

  .username-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 1.5rem 0;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
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
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
    transform: translateY(-1px);
  }

  .btn-link {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .btn-link:hover:not(:disabled) {
    color: #374151;
  }
</style>