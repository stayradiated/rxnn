<script lang="ts">
import * as EmojiMart from 'emoji-mart'
import { onDestroy, onMount } from 'svelte'

type Props = {
  onclose?: () => void
  onselect?: (emoji: { native: string }) => void
}

const { onclose, onselect }: Props = $props()

let emojiPickerEl = $state()
let picker = $state()
let mounted = $state(false)

const handleClick = (event: Event) => {
  event.stopPropagation()
  event.preventDefault()
}

onMount(() => {
  picker = new EmojiMart.Picker({
    theme: 'light',
    autoFocus: true,
    onClickOutside: () => {
      if (mounted) {
        onclose?.()
      }
    },
    onEmojiSelect: (emoji: { native: string }) => {
      onselect?.(emoji)
    },
  })
  emojiPickerEl.appendChild(picker)
  setTimeout(() => {
    // ensure click outside works
    mounted = true
  }, 1)
})

onDestroy(() => {
  // the clickoutside handler is not unregistered properly, so this is probably redundant
  picker = null
  emojiPickerEl = null
})
</script>

<div onclick={handleClick} bind:this={emojiPickerEl}></div>
