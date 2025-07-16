<script lang="ts">
import type { SubmitFunction } from '@sveltejs/kit'
import { enhance } from '$app/forms'
import type { PostWithDetails, ResponseData } from '$lib/types'
import PollPending from './PollPending.svelte'
import PollResults from './PollResults.svelte'
import PrimaryButton from './PrimaryButton.svelte'
import RadioPoll from './RadioPoll.svelte'
import ScalePoll from './ScalePoll.svelte'

interface Props {
  post: PostWithDetails
  currentUser?: {
    id: number
  } | null
}

const { post, currentUser }: Props = $props()

const userResponse = $derived(post.userResponse)
const isAnonymous = $derived(!currentUser)

let pollResponses = $state<ResponseData>({})
let editing = $state(false)

function editResponse() {
  editing = true

  // Populate form with current response
  if (userResponse) {
    pollResponses = { ...userResponse }
  }
}

const pollResponseData = $derived.by(() => {
  const response = pollResponses
  if (post.post_type === 'radio' && response?.selectedOption) {
    return { selectedOption: response.selectedOption }
  }
  if (post.post_type === 'scale') {
    if (response?.specialOption) {
      return { specialOption: response.specialOption }
    }
    if (response?.scaleValue) {
      return { scaleValue: response.scaleValue }
    }
  }
})

function isSubmitDisabled() {
  if (post.post_type === 'radio') {
    return !pollResponses?.selectedOption
  }
  if (post.post_type === 'scale') {
    return !pollResponses?.scaleValue && !pollResponses?.specialOption
  }
  return true
}

const handleSubmit: SubmitFunction = () => {
  editing = false
}

// Clear conflicting selections for scale polls
$effect(() => {
  if (post.post_type === 'scale' && pollResponses) {
    // If user selects a special option, clear scale value
    if (pollResponses.specialOption) {
      pollResponses.scaleValue = undefined
    }
    // If user changes scale value, clear special option
    else if (pollResponses.scaleValue !== undefined) {
      pollResponses.specialOption = null
    }
  }
})
</script>

{#if post.post_type !== 'text'}
  <div class="poll-section">
    {#if post.pollResults && !editing}
      <PollResults {post} onEditResponse={editResponse} />
    {:else if userResponse && !post.pollResults && !editing}
      <PollPending responseCount={post.response_count} onEditResponse={editResponse} />
    {:else if isAnonymous}
      <div class="anonymous-message">
        <p>🔐 <strong>Sign up to participate in this poll</strong></p>
        <p>Create an anonymous account to submit your response and see results.</p>
        <PrimaryButton href="/login">Sign Up / Login</PrimaryButton>
      </div>
    {:else}
      <div class="poll-form">
        <form
          method="POST"
          action="?/submitPollResponse"
          use:enhance={handleSubmit}>

          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="responseData" value={JSON.stringify(pollResponseData)} />

          {#if post.post_type === 'radio' && post.poll_config?.type === 'radio'}
            <RadioPoll postId={post.id} pollConfig={post.poll_config} bind:pollResponses />
          {:else if post.post_type === 'scale' && post.poll_config?.type === 'scale'}
            <ScalePoll postId={post.id} pollConfig={post.poll_config} bind:pollResponses />
          {/if}

          <PrimaryButton
            type="submit"
            disabled={isSubmitDisabled()}>
            Submit Response
          </PrimaryButton>
        </form>
      </div>
    {/if}
  </div>
{/if}

<style>
  .poll-section {
    margin-bottom: 1rem;
  }

  .poll-form {
    background: var(--color-surface-alt, #f9fafb);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .anonymous-message {
    background: var(--color-surface-alt, #f9fafb);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
  }

  .anonymous-message p {
    margin: 0 0 1rem 0;
    color: var(--color-text-secondary);
  }

  .anonymous-message p:last-of-type {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .poll-form {
      padding: 1rem;
    }
  }
</style>
