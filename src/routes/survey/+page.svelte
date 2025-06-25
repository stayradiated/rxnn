<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { page } from '$app/state'
import CheckboxGroup from '$lib/components/CheckboxGroup.svelte'
import RadioGroup from '$lib/components/RadioGroup.svelte'
import ScaleInput from '$lib/components/ScaleInput.svelte'
import SliderInput from '$lib/components/SliderInput.svelte'
import TextInput from '$lib/components/TextInput.svelte'
import { saveTokenToStorage } from '$lib/token-storage'
import { onMount } from 'svelte'
import type { PageData } from './$types'

export let data: PageData

let responses = data.responses || {}
let currentStep = 1
const totalSteps = 9

onMount(() => {
  // Save token to localStorage when survey loads
  if (data.token) {
    saveTokenToStorage(data.token)
  }
})

async function nextStep() {
  if (currentStep < totalSteps) {
    await handleStepChange()
    currentStep++
  }
}

async function prevStep() {
  if (currentStep > 1) {
    await handleStepChange()
    currentStep--
  }
}

function goToResults() {
  if (browser) {
    goto('/results')
  }
}

async function saveResponses() {
  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.token,
        responses,
      }),
    })

    if (response.ok) {
      return true
    }
    console.error('Failed to save responses:', await response.text())
    return false
  } catch (error) {
    console.error('Error saving responses:', error)
    return false
  }
}

async function saveAndExit() {
  const saved = await saveResponses()
  if (saved) {
    alert(
      'Your responses have been saved. You can return anytime using this URL to update them.',
    )
  } else {
    alert('There was an error saving your responses. Please try again.')
  }
}

async function handleStepChange() {
  // Auto-save responses when moving between steps
  await saveResponses()
}
</script>

<svelte:head>
  <title>Employee Survey - Step {currentStep} of {totalSteps}</title>
</svelte:head>

<main class="container">
  <div class="header">
    <h1>Anonymous Employee Survey</h1>
    <div class="progress">
      <div class="progress-bar" style:width="{(currentStep / totalSteps) * 100}%"></div>
    </div>
    <p class="step-info">Step {currentStep} of {totalSteps}</p>
  </div>

  <div class="survey-content">
    {#if currentStep === 1}
      <div class="intro-step">
        <h2>Survey Introduction</h2>
        <p>This survey is anonymous and will stay open indefinitely.</p>
        <p>Responses (but not your identity) will be displayed live on a shared dashboard so everyone can see aggregate results as they come in.</p>

        <div class="url-info">
          <p><strong>Your unique URL:</strong></p>
          <code class="survey-url">{page.url.href}</code>
          <p class="bookmark-notice">📌 <strong>Bookmark this page</strong> to return and update your responses anytime!</p>
          <p class="storage-notice">💾 Your survey token is also saved locally on this device for easy access.</p>
        </div>
      </div>
    {:else if currentStep === 2}
      <div class="step">
        <h2>Role Context</h2>

        <RadioGroup
          label="1. Which department are you in?"
          name="department"
          bind:value={responses.department}
          options={[
            { value: 'engineering', label: 'Engineering' },
            { value: 'product', label: 'Product' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
            { value: 'customer-success', label: 'Customer Success' },
            { value: 'operations', label: 'Operations' },
            { value: 'leadership', label: 'Leadership' },
            { value: 'board', label: 'Board' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' }
          ]}
        />

        <RadioGroup
          label="2. How long have you worked at Runn?"
          name="tenure"
          bind:value={responses.tenure}
          options={[
            { value: '0-1', label: '0–1 year' },
            { value: '1-2', label: '1–2 years' },
            { value: '2-3', label: '2–3 years' },
            { value: '3+', label: '3+ years' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' }
          ]}
        />
      </div>
    {:else if currentStep === 3}
      <div class="step">
        <h2>Four-Day Week Usage</h2>

        <SliderInput
          label="3. Roughly what % of weeks do you work a four-day (32h) week?"
          bind:value={responses.fourDayWeekPercentage}
          min={0}
          max={100}
          minLabel="0% - Never"
          maxLabel="100% - Every week"
          unit="%"
        />

        <ScaleInput
          label="4. If four-day remains optional, how likely are you to choose it?"
          name="fourDayLikelihood"
          bind:value={responses.fourDayLikelihood}
          min={1}
          max={5}
          minLabel="1 = Not at all"
          maxLabel="5 = Absolutely"
        />
      </div>
    {:else if currentStep === 4}
      <div class="step">
        <h2>Importance & Impact</h2>

        <ScaleInput
          label="5. How important is a permanent four-day week to you?"
          name="fourDayImportance"
          bind:value={responses.fourDayImportance}
          min={1}
          max={5}
          minLabel="1 = Not important"
          maxLabel="5 = Critical"
        />

        <ScaleInput
          label="6. If it ends, how likely are you to look for a new role?"
          name="newRoleLikelihood"
          bind:value={responses.newRoleLikelihood}
          min={1}
          max={5}
          minLabel="1 = Very unlikely"
          maxLabel="5 = Already looking"
        />
      </div>
    {:else if currentStep === 5}
      <div class="step">
        <h2>Redundancy Consideration</h2>

        <SliderInput
          label="7. Right now, how strongly are you considering voluntary redundancy?"
          bind:value={responses.redundancyConsideration}
          min={0}
          max={100}
          minLabel="0% - Not at all"
          maxLabel="100% - Already signed up"
          unit="%"
        />

        <ScaleInput
          label="8. How critical is this paycheck to your household?"
          name="paycheckCriticality"
          bind:value={responses.paycheckCriticality}
          min={1}
          max={5}
          minLabel="1 = Manageable"
          maxLabel="5 = Can't do without it"
        />
      </div>
    {:else if currentStep === 6}
      <div class="step">
        <h2>Pay-/Hours-Cut Trade-offs</h2>

        <RadioGroup
          label="9. What % pay-cut would you accept over 12 months to avoid any layoffs?"
          name="payCut12Months"
          bind:value={responses.payCut12Months}
          options={[
            { value: '0', label: '0%' },
            { value: '5', label: '5%' },
            { value: '10', label: '10%' },
            { value: '15', label: '15%' },
            { value: '20', label: '20%' },
            { value: '>20', label: '>20%' }
          ]}
        />

        <RadioGroup
          label="10. If the cut were only 6 months, would your answer change?"
          name="payCut6Months"
          bind:value={responses.payCut6Months}
          options={[
            { value: '0', label: '0%' },
            { value: '5', label: '5%' },
            { value: '10', label: '10%' },
            { value: '15', label: '15%' },
            { value: '20', label: '20%' },
            { value: '>20', label: '>20%' }
          ]}
        />

        <RadioGroup
          label="11. If only 3 months?"
          name="payCut3Months"
          bind:value={responses.payCut3Months}
          options={[
            { value: '0', label: '0%' },
            { value: '5', label: '5%' },
            { value: '10', label: '10%' },
            { value: '15', label: '15%' },
            { value: '20', label: '20%' },
            { value: '>20', label: '>20%' }
          ]}
        />

        <CheckboxGroup
          label="12. Could you reduce hours to preserve a 4-day pattern?"
          bind:value={responses.hoursReduction}
          allowNone={true}
          noneLabel="None of these"
          options={[
            { value: '32-30', label: '32h→30h (≈ 6% cut)' },
            { value: '32-28', label: '32h→28h (≈ 13% cut)' },
            { value: '32-24', label: '32h→24h (≈ 25% cut)' }
          ]}
        />
      </div>
    {:else if currentStep === 7}
      <div class="step">
        <h2>Well-Being & Trust</h2>

        <ScaleInput
          label="13. Current stress level about these changes"
          name="stressLevel"
          bind:value={responses.stressLevel}
          min={1}
          max={5}
          minLabel="1 = Low"
          maxLabel="5 = Severe"
        />

        <ScaleInput
          label="14. Trust in leadership right now"
          name="trustInLeadership"
          bind:value={responses.trustInLeadership}
          min={1}
          max={5}
          minLabel="1 = None"
          maxLabel="5 = Total"
        />
      </div>
    {:else if currentStep === 8}
      <div class="step">
        <h2>Meta & Open Feedback</h2>

        <TextInput
          label="15. What's missing? What other questions should we ask?"
          bind:value={responses.missingQuestions}
          placeholder="Share any questions you think we should have included..."
          rows={4}
          maxLength={500}
        />

        <TextInput
          label="16. Anything else you want colleagues to know?"
          bind:value={responses.additionalFeedback}
          placeholder="Any other thoughts, concerns, or suggestions..."
          rows={4}
          maxLength={500}
        />
      </div>
    {:else if currentStep === 9}
      <div class="step">
        <h2>Survey Complete</h2>
        <p>Thank you for participating in our anonymous survey!</p>
        <p>Your responses have been recorded. You can return to this URL anytime to update your answers.</p>

        <div class="final-actions">
          <button on:click={goToResults} class="btn-primary">View Results Dashboard</button>
          <button on:click={saveAndExit} class="btn-secondary">Save & Bookmark</button>
        </div>
      </div>
    {/if}
  </div>

  <div class="navigation">
    {#if currentStep > 1}
      <button on:click={prevStep} class="btn-nav">← Previous</button>
    {/if}

    {#if currentStep < totalSteps}
      <button on:click={nextStep} class="btn-nav btn-primary">Next →</button>
    {/if}
  </div>
</main>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
	}

	.progress {
		width: 100%;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		margin: 1rem 0;
	}

	.progress-bar {
		height: 100%;
		background: #2563eb;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.step-info {
		color: #6b7280;
		margin: 0;
	}

	.survey-content {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
		min-height: 400px;
	}


	.navigation {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.btn-nav, .btn-primary, .btn-secondary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		text-decoration: none;
		display: inline-block;
	}

	.btn-nav {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-nav:hover {
		background: #e5e7eb;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
	}

	.btn-secondary:hover {
		background: #4b5563;
	}

	.bookmark-notice {
		background: #fef3c7;
		padding: 1rem;
		border-radius: 6px;
		border-left: 4px solid #f59e0b;
		margin: 1rem 0;
	}

	.final-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	.url-info {
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}

	.survey-url {
		display: block;
		background: #f3f4f6;
		padding: 0.75rem;
		border-radius: 4px;
		font-family: monospace;
		word-break: break-all;
		margin: 0.5rem 0 1rem 0;
		border: 1px solid #d1d5db;
	}

	.bookmark-notice {
		color: #0f766e;
		font-weight: 500;
		margin: 0.5rem 0;
	}

	.storage-notice {
		color: #0f766e;
		font-size: 0.9rem;
		margin: 0.5rem 0 0 0;
	}
</style>
