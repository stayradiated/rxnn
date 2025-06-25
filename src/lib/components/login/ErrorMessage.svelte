<script lang="ts">
interface Props {
  error: string
}

let { error }: Props = $props()
</script>

{#if error}
  <div class="error-message">
    {error}
  </div>
{/if}

<style>
  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-error);
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
    color: var(--color-error);
    text-align: center;
  }
</style>