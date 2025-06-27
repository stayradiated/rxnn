<script lang="ts">
import PrimaryButton from '../PrimaryButton.svelte'
import SecondaryButton from '../SecondaryButton.svelte'

interface Props {
  isLoading: boolean
  onCreateNew: () => void
  onUseExisting: () => void
}

let { isLoading, onCreateNew, onUseExisting }: Props = $props()
</script>

<div class="mode-selection">
  <h2>How would you like to proceed?</h2>

  <PrimaryButton
    onclick={onCreateNew}
    size="large"
    disabled={isLoading}>
    🦊 Create Anonymous Identity
  </PrimaryButton>

  <SecondaryButton
    onclick={onUseExisting}
    size="large"
    disabled={isLoading}>
    🔑 Edit Previous Responses
  </SecondaryButton>
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

</style>
