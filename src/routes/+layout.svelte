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
    --color-text: #0f172a;
    --color-text-secondary: #64748b;
    --color-text-muted: #94a3b8;
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-success: #059669;
    --color-warning: #d97706;
    --color-error: #dc2626;
    --color-shadow: rgba(0, 0, 0, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    :global(:root) {
      /* Dark mode colors */
      --color-bg: #0f172a;
      --color-surface: #1e293b;
      --color-surface-alt: #334155;
      --color-border: #475569;
      --color-text: #f8fafc;
      --color-text-secondary: #cbd5e1;
      --color-text-muted: #94a3b8;
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-error: #ef4444;
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
