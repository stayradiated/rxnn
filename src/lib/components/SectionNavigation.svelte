<script lang="ts">
export let currentStep: number
export let totalSteps: number
export let onStepChange: (step: number) => void

const sections = [
  { step: 1, title: 'Introduction', description: 'Welcome & overview' },
  { step: 2, title: 'Role Context', description: 'Department & tenure' },
  {
    step: 3,
    title: 'Four-Day Week Usage',
    description: 'Current usage & preferences',
  },
  {
    step: 4,
    title: 'Importance & Impact',
    description: 'Priority & job considerations',
  },
  {
    step: 5,
    title: 'Redundancy',
    description: 'Voluntary redundancy & finances',
  },
  {
    step: 6,
    title: 'Pay/Hours Trade-offs',
    description: 'Salary & time reductions',
  },
  {
    step: 7,
    title: 'Well-Being & Trust',
    description: 'Stress & leadership confidence',
  },
  {
    step: 8,
    title: 'Open Feedback',
    description: 'Missing questions & comments',
  },
  { step: 9, title: 'Complete', description: 'Finish & save responses' },
]

function jumpToSection(step: number) {
  onStepChange(step)
}

function getSectionStatus(step: number) {
  if (step < currentStep) return 'completed'
  if (step === currentStep) return 'current'
  return 'upcoming'
}
</script>

<div class="section-nav">
  <h3>Survey Sections</h3>
  <div class="sections">
    {#each sections as section (section.step)}
      <button
        class="section-item {getSectionStatus(section.step)}"
        on:click={() => jumpToSection(section.step)}
        disabled={section.step > totalSteps}>
        <div class="section-number">{section.step}</div>
        <div class="section-content">
          <div class="section-title">{section.title}</div>
          <div class="section-description">{section.description}</div>
        </div>
        <div class="section-status">
          {#if getSectionStatus(section.step) === 'completed'}
            ✓
          {:else if getSectionStatus(section.step) === 'current'}
            ➤
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .section-nav {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
  }

  .section-nav h3 {
    margin: 0 0 1rem 0;
    color: #374151;
    font-size: 1.1rem;
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .section-item:hover:not(:disabled) {
    border-color: #2563eb;
    background: #f8fafc;
  }

  .section-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .section-item.current {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .section-item.completed {
    border-color: #16a34a;
    background: #f0fdf4;
  }

  .section-number {
    background: #6b7280;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .current .section-number {
    background: #2563eb;
  }

  .completed .section-number {
    background: #16a34a;
  }

  .section-content {
    flex: 1;
  }

  .section-title {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .section-description {
    font-size: 0.85rem;
    color: #6b7280;
  }

  .section-status {
    color: #16a34a;
    font-weight: 600;
    flex-shrink: 0;
  }

  .current .section-status {
    color: #2563eb;
  }

  @media (max-width: 768px) {
    .section-item {
      padding: 0.5rem;
      gap: 0.75rem;
    }

    .section-description {
      display: none;
    }

    .section-number {
      width: 24px;
      height: 24px;
      font-size: 0.8rem;
    }
  }
</style>