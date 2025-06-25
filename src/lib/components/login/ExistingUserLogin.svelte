<script lang="ts">
interface Props {
  token: string
  isLoading: boolean
  onLogin: () => void
  onBack: () => void
}

let { token = $bindable(''), isLoading, onLogin, onBack }: Props = $props()
</script>

<div class="existing-user-flow">
  <h2>Welcome Back!</h2>
  <p>Enter your token to access your anonymous identity:</p>

  <div class="token-input-group">
    <label for="token">Your Token:</label>
    <input
      id="token"
      type="text"
      bind:value={token}
      placeholder="Enter your token..."
      class="token-input"
      disabled={isLoading}
    />
  </div>

  <button
    onclick={onLogin}
    class="btn-primary btn-large"
    disabled={isLoading || !token.trim()}>
    {isLoading ? 'Verifying...' : 'Access My Account'}
  </button>

  <button
    onclick={onBack}
    class="btn-link"
    disabled={isLoading}>
    ← Back
  </button>
</div>

<style>
  .existing-user-flow {
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

  .token-input-group {
    text-align: left;
    margin: 2rem 0;
  }

  .token-input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 500;
  }

  .token-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: monospace;
    box-sizing: border-box;
  }

  .token-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s;
  }

  .btn-large {
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
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