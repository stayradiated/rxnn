<script lang="ts">
import type { PostType, PostWithDetails } from '$lib/types'
import { flushSync } from 'svelte'
import SecondaryButton from './SecondaryButton.svelte'

interface Props {
  stats: {
    activeUsers: number
    totalQuestions: number
    unansweredQuestions: number
    userHasAnsweredQuestions: boolean
    percentageCompletedAllPolls: number
    totalHearts: number
  }
  posts: PostWithDetails[]
  activeFilters: PostType[]
  onFiltersChange: (filters: PostType[]) => void
  onJumpToUnanswered?: () => void
}

let {
  stats,
  posts,
  activeFilters,
  onFiltersChange,
  onJumpToUnanswered,
}: Props = $props()

// Helper functions to check filter states
const showingAll = $derived(
  activeFilters.includes('text') &&
    activeFilters.includes('radio') &&
    activeFilters.includes('scale'),
)

const showingOnlyQuestions = $derived(
  !activeFilters.includes('text') &&
    activeFilters.includes('radio') &&
    activeFilters.includes('scale'),
)

const showingOnlyMessages = $derived(
  activeFilters.includes('text') &&
    !activeFilters.includes('radio') &&
    !activeFilters.includes('scale'),
)

function setFilterAll() {
  onFiltersChange(['text', 'radio', 'scale'])
}

function setFilterQuestions() {
  onFiltersChange(['radio', 'scale'])
}

function setFilterMessages() {
  onFiltersChange(['text'])
}

function handleJumpToUnanswered() {
  // Only switch to "All" tab if currently showing only Messages
  if (showingOnlyMessages) {
    setFilterAll()
    // Flush pending updates to ensure filteredPosts is updated
    flushSync()
  }

  if (onJumpToUnanswered) {
    onJumpToUnanswered()
  }
}
</script>

<div class="platform-stats">
  <div class="stats-row">
    <div class="stat-item">
      <div class="stat-icon">👥</div>
      <div class="stat-content">
        <div class="stat-number">{stats.activeUsers}</div>
        <div class="stat-label">People</div>
      </div>
    </div>

    <div class="stat-item">
      <div class="stat-icon">✅</div>
      <div class="stat-content">
        <div class="stat-number">{stats.percentageCompletedAllPolls}%</div>
        <div class="stat-label">Answered Everything</div>
      </div>
    </div>

    <div class="stat-item">
      <div class="stat-icon">❤️</div>
      <div class="stat-content">
        <div class="stat-number">{stats.totalHearts}</div>
        <div class="stat-label">Hearts</div>
      </div>
    </div>

    <div class="spacer"></div>

    {#if stats.unansweredQuestions > 0 && stats.userHasAnsweredQuestions}
      <button class="unanswered-button" onclick={handleJumpToUnanswered}>
        <div class="unanswered-content">
          <div class="unanswered-number">{stats.unansweredQuestions}</div>
          <div class="unanswered-label">Unanswered</div>
        </div>
      </button>
    {/if}

    <SecondaryButton href="/export" size="small" title="Export poll data as CSV">
      📦 Export
    </SecondaryButton>
  </div>

  <div class="filter-buttons">
    <button
      class="filter-btn"
      class:active={showingAll}
      onclick={setFilterAll}>
      <span class="filter-label">All</span>
      <span class="filter-badge">{posts.length}</span>
    </button>
    <button
      class="filter-btn"
      class:active={showingOnlyQuestions}
      onclick={setFilterQuestions}>
      <span class="filter-label">Questions</span>
      <span class="filter-badge">{posts.filter(p => p.post_type !== 'text').length}</span>
    </button>
    <button
      class="filter-btn"
      class:active={showingOnlyMessages}
      onclick={setFilterMessages}>
      <span class="filter-label">Messages</span>
      <span class="filter-badge">{posts.filter(p => p.post_type === 'text').length}</span>
    </button>
  </div>
</div>

<style>
  .platform-stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface-alt);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .stats-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .stat-icon {
    font-size: 1.1rem;
  }

  .stat-content {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .stat-number {
    font-weight: 600;
    color: var(--color-text);
  }

  .stat-label {
    color: var(--color-text-secondary);
    font-weight: 400;
  }

  .spacer {
    flex-grow: 1;
  }

  .unanswered-button {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
    color: var(--color-text-inverse);
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    animation: pulse 2s infinite, wiggle 0.3s ease-in-out 0.5s;
    margin-left: 0.5rem;
  }

  .unanswered-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary-dark));
  }

  .unanswered-button:active {
    transform: translateY(0);
  }

  .unanswered-content {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .unanswered-number {
    font-weight: 700;
    font-size: 1rem;
  }

  .unanswered-label {
    font-weight: 500;
    opacity: 0.9;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
    50% {
      box-shadow: 0 2px 12px rgba(37, 99, 235, 0.5);
    }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
  }

  /* Filter tabs */
  .filter-buttons {
    display: flex;
    gap: 0;
    background: var(--color-surface);
    border-radius: 8px;
    padding: 0.25rem;
    border: 1px solid var(--color-border);
  }

  .filter-btn {
    flex: 1;
    background: transparent;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    color: var(--color-text-secondary);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
  }

  .filter-label {
    flex-shrink: 0;
  }

  .filter-badge {
    background: var(--color-surface-alt);
    color: var(--color-text-muted);
    border-radius: 10px;
    padding: 0.15rem 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .filter-btn:hover {
    color: var(--color-text);
    background: var(--color-surface-hover);
  }

  .filter-btn:hover .filter-badge {
    background: var(--color-border);
    color: var(--color-text-secondary);
  }

  .filter-btn.active {
    background: var(--color-bg);
    color: var(--color-text);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .filter-btn.active .filter-badge {
    background: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .filter-btn.active:hover {
    background: var(--color-bg);
  }

  .filter-btn.active:hover .filter-badge {
    background: var(--color-primary-hover);
  }

  @media (max-width: 480px) {
    .platform-stats {
      gap: 0.75rem;
      padding: 0.75rem;
    }

    .stats-row {
      flex-direction: column;
      gap: 0.5rem;
      align-items: stretch;
    }

    .stat-item {
      font-size: 0.8rem;
    }

    .unanswered-button {
      margin-left: 0;
      margin-top: 0.25rem;
      align-self: flex-start;
    }

    .filter-buttons {
      padding: 0.2rem;
    }

    .filter-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      gap: 0.375rem;
    }

    .filter-badge {
      font-size: 0.65rem;
      padding: 0.1rem 0.35rem;
      min-width: 1.1rem;
    }
  }
</style>
