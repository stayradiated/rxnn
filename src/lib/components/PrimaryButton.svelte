<script lang="ts">
import type { Snippet } from 'svelte'

interface Props {
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  size?: 'small' | 'normal' | 'large'
  type?: 'button' | 'submit'
  href?: string
  title?: string
  onclick?: () => void
  children?: Snippet
}

let {
  disabled = false,
  loading = false,
  loadingText,
  size = 'normal',
  type = 'button',
  href,
  title,
  onclick,
  children,
}: Props = $props()

const isDisabled = $derived(disabled || loading)
</script>

{#if href}
  <a {href} class="btn-primary {size === 'small' ? 'btn-small' : size === 'large' ? 'btn-large' : ''}" {title}>
    {#if loading && loadingText}
      {loadingText}
    {:else}
      {@render children?.()}
    {/if}
  </a>
{:else}
  <button
    class="btn-primary {size === 'small' ? 'btn-small' : size === 'large' ? 'btn-large' : ''}"
    {type}
    disabled={isDisabled}
    {title}
    {onclick}>
    {#if loading && loadingText}
      {loadingText}
    {:else}
      {@render children?.()}
    {/if}
  </button>
{/if}

<style>
  .btn-primary {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    min-height: 2.5rem;
    box-sizing: border-box;
    line-height: 1;
    vertical-align: top;
    font-family: inherit;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    background: var(--color-disabled);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    min-height: 2rem;
  }

  .btn-large {
    padding: 1.25rem 2rem;
    font-size: 1rem;
    border-radius: 8px;
  }
</style>
