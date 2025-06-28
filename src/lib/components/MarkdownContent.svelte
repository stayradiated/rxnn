<script lang="ts">
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

interface Props {
  content: string
}

let { content }: Props = $props()

// Configure marked for safety and better rendering
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
})

// Configure DOMPurify with strict settings
const purifyConfig = {
  ALLOWED_TAGS: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'hr',
  ],
  ALLOWED_ATTR: ['href'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
  FORBID_ATTR: [
    'onclick',
    'onload',
    'onerror',
    'onmouseover',
    'onfocus',
    'onblur',
    'style',
  ],
  SANITIZE_DOM: true,
}

// Parse markdown to HTML and sanitize
const htmlContent = $derived.by(() => {
  try {
    const rawHtml = marked.parse(content) as string
    return DOMPurify.sanitize(rawHtml, purifyConfig)
  } catch (error) {
    console.error('Error parsing markdown:', error)
    return DOMPurify.sanitize(content) // Sanitize even the fallback
  }
})
</script>

<div class="markdown-content">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html htmlContent}
</div>

<style>
  .markdown-content {
    color: var(--color-text-secondary);
    line-height: 1.6;
    white-space: normal;
  }

  /* Markdown element styles */
  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4),
  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    color: var(--color-text);
    margin: 1em 0 0.5em 0;
    font-weight: 600;
  }

  .markdown-content :global(h1) { font-size: 1.5em; }
  .markdown-content :global(h2) { font-size: 1.3em; }
  .markdown-content :global(h3) { font-size: 1.1em; }

  .markdown-content :global(p) {
    margin: 0.5em 0;
  }

  .markdown-content :global(strong) {
    font-weight: 600;
    color: var(--color-text);
  }

  .markdown-content :global(em) {
    font-style: italic;
  }

  .markdown-content :global(code) {
    background: var(--color-surface-alt);
    padding: 0.15em 0.3em;
    border-radius: 3px;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.9em;
    color: var(--color-text);
  }

  .markdown-content :global(pre) {
    background: var(--color-surface-alt);
    padding: 0.75em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5em 0;
  }

  .markdown-content :global(pre code) {
    background: transparent;
    padding: 0;
  }

  .markdown-content :global(blockquote) {
    border-left: 3px solid var(--color-border);
    padding-left: 1em;
    margin: 0.5em 0;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  .markdown-content :global(li) {
    margin: 0.25em 0;
  }

  .markdown-content :global(a) {
    color: var(--color-primary);
    text-decoration: none;
  }

  .markdown-content :global(a:hover) {
    text-decoration: underline;
  }

  .markdown-content :global(hr) {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 1em 0;
  }

  /* First and last element margin cleanup */
  .markdown-content :global(*:first-child) {
    margin-top: 0;
  }

  .markdown-content :global(*:last-child) {
    margin-bottom: 0;
  }
</style>
