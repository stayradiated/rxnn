<script lang="ts">
import PrimaryButton from '$lib/components/PrimaryButton.svelte'
import SecondaryButton from '$lib/components/SecondaryButton.svelte'
import type { PageData } from './$types'

type Props = {
  data: PageData
}

const { data }: Props = $props()

let copyStatus = $state<string>('')

function copyToClipboard(text: string, type: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copyStatus = `${type} CSV copied to clipboard!`
      setTimeout(() => {
        copyStatus = ''
      }, 3000)
    })
    .catch(() => {
      copyStatus = 'Failed to copy to clipboard'
      setTimeout(() => {
        copyStatus = ''
      }, 3000)
    })
}
</script>

<svelte:head>
  <title>Data Export - RXNN</title>
</svelte:head>

<main class="container">
  <header class="page-header">
    <h1>Data Export</h1>
    <p class="description">
      Export poll data in CSV format. Only polls with 5+ responses are included with actual data.
    </p>
  </header>

  <div class="export-sections">
    <section class="export-section">
      <div class="section-header">
        <h2>Scale Polls CSV</h2>
        {#if data.scaleCount > 0}
          <span class="poll-count">{data.scaleCount} polls</span>
        {/if}
      </div>

      {#if data.scaleCount > 0}
        <div class="csv-container">
          <div class="csv-preview">
            <textarea
              readonly
              value={data.scaleCsv}
              placeholder="No scale poll data available"></textarea>
          </div>
          <div class="button-group">
            <PrimaryButton
              disabled={!data.scaleCsv}
              onclick={() => copyToClipboard(data.scaleCsv, 'Scale Polls')}>
              📋 Copy Scale CSV
            </PrimaryButton>
            {#if copyStatus && copyStatus.includes('Scale Polls')}
              <div class="copy-notification" class:success={copyStatus.includes('copied')}>
                {copyStatus}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <p>No scale polls found in the database.</p>
        </div>
      {/if}
    </section>

    <section class="export-section">
      <div class="section-header">
        <h2>Radio Polls CSV</h2>
        {#if data.radioCount > 0}
          <span class="poll-count">{data.radioCount} polls</span>
        {/if}
      </div>

      {#if data.radioCount > 0}
        <div class="csv-container">
          <div class="csv-preview">
            <textarea
              readonly
              value={data.radioCsv}
              placeholder="No radio poll data available"></textarea>
          </div>
          <div class="button-group">
            <PrimaryButton
              disabled={!data.radioCsv}
              onclick={() => copyToClipboard(data.radioCsv, 'Radio Polls')}>
              📋 Copy Radio CSV
            </PrimaryButton>
            {#if copyStatus && copyStatus.includes('Radio Polls')}
              <div class="copy-notification" class:success={copyStatus.includes('copied')}>
                {copyStatus}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <p>No radio polls found in the database.</p>
        </div>
      {/if}
    </section>
  </div>

  <nav class="bottom-nav">
    <SecondaryButton href="/feed">
      ← Back to Feed
    </SecondaryButton>
  </nav>
</main>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1rem;
    min-height: 100vh;
  }

  .page-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .page-header h1 {
    color: var(--color-primary);
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .description {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto 1rem;
    line-height: 1.6;
  }

  .copy-notification {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: var(--color-warning-light);
    color: var(--color-warning-dark);
    border: 1px solid var(--color-warning);
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    z-index: 10;
    animation: slideIn 0.3s ease-out;
  }

  .copy-notification.success {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    border-color: var(--color-primary);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  .export-sections {
    display: grid;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .export-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .section-header h2 {
    color: var(--color-text);
    font-size: 1.5rem;
    margin: 0;
    font-weight: 600;
  }

  .poll-count {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .csv-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .csv-preview {
    position: relative;
  }

  textarea {
    width: 100%;
    min-height: 300px;
    max-height: 500px;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    line-height: 1.4;
    padding: 1.5rem;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-bg);
    color: var(--color-text);
    resize: vertical;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }

  textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .button-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    position: relative;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
  }

  .empty-state p {
    font-size: 1.1rem;
    margin: 0;
  }

  .bottom-nav {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.5rem;
    }

    .page-header h1 {
      font-size: 2rem;
    }

    .export-section {
      padding: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    textarea {
      min-height: 250px;
      font-size: 0.8rem;
      padding: 1rem;
    }

    .button-group {
      flex-direction: column;
      align-items: stretch;
    }

    .copy-notification {
      position: static;
      transform: none;
      margin: 0.5rem 0 0 0;
      text-align: center;
    }
  }
</style>
