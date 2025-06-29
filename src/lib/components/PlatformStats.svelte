<script lang="ts">
import SecondaryButton from './SecondaryButton.svelte'

interface Props {
  stats: {
    activeUsers: number
    totalQuestions: number
    unansweredQuestions: number
    userHasAnsweredQuestions: boolean
    percentageCompletedAllPolls: number
  }
  onJumpToUnanswered?: () => void
}

let { stats, onJumpToUnanswered }: Props = $props()

function handleJumpToUnanswered() {
  if (onJumpToUnanswered) {
    onJumpToUnanswered()
  }
}
</script>

<div class="platform-stats">
  <div class="stat-item">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{stats.activeUsers}</div>
      <div class="stat-label">People</div>
    </div>
  </div>

  <div class="stat-item">
    <div class="stat-icon">📊</div>
    <div class="stat-content">
      <div class="stat-number">{stats.totalQuestions}</div>
      <div class="stat-label">Questions</div>
    </div>
  </div>

  <div class="stat-item">
    <div class="stat-icon">✅</div>
    <div class="stat-content">
      <div class="stat-number">{stats.percentageCompletedAllPolls}%</div>
      <div class="stat-label">Answered Everything</div>
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

<style>
  .platform-stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface-alt);
    border-radius: 6px;
    border: 1px solid var(--color-border);
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


  @media (max-width: 480px) {
    .platform-stats {
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
    }

    .stat-item {
      font-size: 0.8rem;
    }

    .unanswered-button {
      margin-left: 0;
      margin-top: 0.25rem;
      align-self: flex-start;
    }

  }
</style>
