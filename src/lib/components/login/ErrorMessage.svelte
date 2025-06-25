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
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
    color: #dc2626;
    text-align: center;
  }
</style>