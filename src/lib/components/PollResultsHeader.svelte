<script lang="ts">
import type { PostWithDetails } from '$lib/types'
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
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
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