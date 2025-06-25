<script lang="ts">
import 'normalize.css'
import type { Snippet } from 'svelte'

type Props = {
  children?: Snippet
}

let { children }: Props = $props()
</script>

{@render children?.()}

<style>
  :global(body) {
    font-family: 'Open Sans', sans-serif;
  }
</style>
