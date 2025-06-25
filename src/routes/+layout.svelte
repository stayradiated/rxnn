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
  :global(:root) {
    /* Light mode colors */
    --color-bg: #ffffff;
    --color-surface: #f8fafc;
    --color-surface-alt: #f1f5f9;
    --color-border: #e2e8f0;
    --color-border-accent: #bae6fd;
    --color-text: #0f172a;
    --color-text-secondary: #64748b;
    --color-text-muted: #94a3b8;
    --color-text-inverse: #ffffff;
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-primary-dark: #0c4a6e;
    --color-success: #059669;
    --color-warning: #d97706;
    --color-warning-light: #fef3c7;
    --color-warning-dark: #92400e;
    --color-error: #dc2626;
    --color-disabled: #9ca3af;
    --color-shadow: rgba(0, 0, 0, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    :global(:root) {
      /* Dark mode colors */
      --color-bg: #0f172a;
      --color-surface: #1e293b;
      --color-surface-alt: #334155;
      --color-border: #475569;
      --color-border-accent: #1e40af;
      --color-text: #f8fafc;
      --color-text-secondary: #cbd5e1;
      --color-text-muted: #94a3b8;
      --color-text-inverse: #0f172a;
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-primary-dark: #60a5fa;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-warning-light: #451a03;
      --color-warning-dark: #fbbf24;
      --color-error: #ef4444;
      --color-disabled: #6b7280;
      --color-shadow: rgba(0, 0, 0, 0.3);
    }
  }

  :global(body) {
    font-family: 'Open Sans', sans-serif;
    background-color: var(--color-bg);
    color: var(--color-text);
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  :global(*) {
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
</style>
