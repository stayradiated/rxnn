<script lang="ts">
import EditIcon from './EditIcon.svelte'
import SecondaryButton from './SecondaryButton.svelte'

interface Props {
  responseCount: number
  onEditResponse: () => void
}

const { responseCount, onEditResponse }: Props = $props()
</script>

<div class="poll-pending">
  <div class="pending-message">
    <h4>Response Submitted</h4>
    <p>Thank you for your response! Poll results will be shown once we have at least 5 responses.</p>
    <div class="response-count">
      Current responses: {responseCount}
    </div>
    <div class="pending-actions">
      <SecondaryButton onclick={onEditResponse} size="small">
        <EditIcon size={14} /> Edit Response
      </SecondaryButton>
    </div>
  </div>
</div>

<style>
  .poll-pending {
    background: var(--color-surface-alt, #f9fafb);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .pending-message h4 {
    color: var(--color-text, #374151);
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }

  .pending-message p {
    color: var(--color-text-secondary, #6b7280);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .response-count {
    background: var(--color-primary-light, #eff6ff);
    color: var(--color-primary-dark, #1e40af);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    display: inline-block;
  }

  .pending-actions {
    margin-top: 1rem;
  }
</style>