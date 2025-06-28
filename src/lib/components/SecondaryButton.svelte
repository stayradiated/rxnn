<script lang="ts">
import type { Snippet } from 'svelte'

interface Props {
  variant?: 'default' | 'danger'
  size?: 'small' | 'normal' | 'large'
  disabled?: boolean
  href?: string
  type?: 'button' | 'submit'
  title?: string
  onclick?: () => void
  children?: Snippet
}

let {
  variant = 'default',
  size = 'normal',
  disabled = false,
  href,
  type = 'button',
  title,
  onclick,
  children,
}: Props = $props()
</script>

{#if href}
  <a {href} class="secondary-button {variant} {size === 'small' ? 'btn-small' : size === 'large' ? 'btn-large' : ''}" {title}>
    {@render children?.()}
  </a>
{:else}
  <button
    class="secondary-button {variant} {size === 'small' ? 'btn-small' : size === 'large' ? 'btn-large' : ''}"
    {type}
    {disabled}
    {title}
    {onclick}>
    {@render children?.()}
  </button>
{/if}

<style>
  .secondary-button {
    background: var(--color-surface);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    backdrop-filter: blur(4px);
    min-height: 2.5rem;
    box-sizing: border-box;
    line-height: 1;
    vertical-align: top;
    font-family: inherit;
  }

  .secondary-button:hover:not(:disabled) {
    background: var(--color-surface-alt);
    color: var(--color-text);
    border-color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .secondary-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .secondary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button.danger {
    color: var(--color-error);
    border-color: var(--color-error);
  }

  .secondary-button.danger:hover:not(:disabled) {
    background: var(--color-warning-light);
    color: var(--color-error);
    border-color: var(--color-error);
    box-shadow: 0 2px 8px var(--color-shadow);
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
