<script lang="ts">
import PrimaryButton from '../PrimaryButton.svelte'

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

  <PrimaryButton
    onclick={onLogin}
    size="large"
    disabled={isLoading || !token.trim()}
    loading={isLoading}
    loadingText="Verifying...">
    Access My Account
  </PrimaryButton>

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
    color: var(--color-text);
    margin-bottom: 1.5rem;
  }

  p {
    color: var(--color-text-secondary);
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
    color: var(--color-text);
    font-weight: 500;
  }

  .token-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: monospace;
    box-sizing: border-box;
    background: var(--color-bg);
    color: var(--color-text);
  }

  .token-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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