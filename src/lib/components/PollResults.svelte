<script lang="ts">
import type { PostWithDetails } from '$lib/types'
import PollResultsHeader from './PollResultsHeader.svelte'
import RadioPollResults from './RadioPollResults.svelte'
import ScalePollResults from './ScalePollResults.svelte'
import SpecialOptionsResults from './SpecialOptionsResults.svelte'

interface Props {
  post: PostWithDetails
  onEditResponse: () => void
}

const { post, onEditResponse }: Props = $props()
</script>

<div class="poll-results">
  <PollResultsHeader {post} {onEditResponse} />
  {#if post.post_type === 'radio'}
    <RadioPollResults {post} {onEditResponse} />
  {:else if post.post_type === 'scale'}
    <ScalePollResults {post} {onEditResponse} />
  {/if}

  <!-- <SpecialOptionsResults {post} {onEditResponse} /> -->
</div>

<style>
  .poll-results {
    background: var(--color-surface-alt, #f0f9ff);
    border: 1px solid var(--color-border-accent, #bae6fd);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
</style>
