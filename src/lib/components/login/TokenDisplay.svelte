<script lang="ts">
import PrimaryButton from '../PrimaryButton.svelte'

interface Props {
  username: string
  token: string
  onComplete: () => void
}

let { username, token, onComplete }: Props = $props()

function copyToken() {
  navigator.clipboard.writeText(token)
}
</script>

<div class="token-display">
  <h2>🎉 Welcome, @{username}!</h2>
  <p>Your account has been created. Here's your secret token:</p>

  <div class="important-notice">
    <h3>⚠️ Important!</h3>
    <p>This token is the only way to get back into your account. Copy it somewhere safe!</p>
  </div>

  <div class="token-card">
    <code class="token-text">{token}</code>
    <PrimaryButton
      onclick={copyToken}
      size="small">
      📋 Copy
    </PrimaryButton>
  </div>

  <PrimaryButton
    onclick={onComplete}
    size="large">
    Continue to Platform
  </PrimaryButton>
</div>

<style>
  .token-display {
    text-align: center;
  }

  h2 {
    color: #374151;
    margin-bottom: 1.5rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .important-notice {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: left;
  }

  .important-notice h3 {
    margin: 0 0 0.5rem 0;
    color: #92400e;
  }

  .important-notice p {
    margin: 0;
    color: #92400e;
  }

  .token-card {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    word-break: break-all;
  }

  .token-text {
    flex: 1;
    font-family: monospace;
    font-size: 0.9rem;
    color: #374151;
    background: none;
    border: none;
    padding: 0;
  }

</style>
