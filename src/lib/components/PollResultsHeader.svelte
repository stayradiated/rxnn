<script lang="ts">
import type { PostWithDetails } from '$lib/types'
import EditIcon from './EditIcon.svelte'
import SecondaryButton from './SecondaryButton.svelte'

interface Props {
  post: PostWithDetails
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()

const userResponse = $derived(post.userResponse)
</script>

<div class="poll-results-header">
  <h4>Poll Results</h4>
  {#if userResponse}
    <SecondaryButton onclick={onEditResponse} size="small" title="Edit your response">
      <EditIcon />
      Edit Response
    </SecondaryButton>
  {/if}
</div>

<style>
  .poll-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h4 {
    color: var(--color-primary-dark, #0c4a6e);
    margin: 0;
    font-size: 1.1rem;
  }
</style>