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
    background: var(--color-surface, rgba(255, 255, 255, 0.8));
    color: var(--color-text-secondary, #6b7280);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 6px;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    text-decoration: none;
    backdrop-filter: blur(4px);
  }

  .secondary-button:hover:not(:disabled) {
    background: var(--color-surface-hover, rgba(249, 250, 251, 0.95));
    color: var(--color-text, #374151);
    border-color: var(--color-border-hover, #d1d5db);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--color-shadow, rgba(0, 0, 0, 0.1));
  }

  .secondary-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .secondary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button.danger {
    color: #dc2626;
    border-color: rgba(220, 38, 38, 0.2);
  }

  .secondary-button.danger:hover:not(:disabled) {
    background: rgba(254, 242, 242, 0.95);
    color: #b91c1c;
    border-color: rgba(185, 28, 28, 0.3);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
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
