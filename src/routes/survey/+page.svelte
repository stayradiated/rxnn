<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let data: PageData;

	let responses = data.responses || {};
	let currentStep = 1;
	const totalSteps = 8;

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function goToResults() {
		if (browser) {
			goto('/results');
		}
	}

	function saveAndExit() {
		// TODO: Save responses to database
		alert('Your responses have been saved. You can return anytime using this URL to update them.');
	}
</script>

<svelte:head>
	<title>Employee Survey - Step {currentStep} of {totalSteps}</title>
</svelte:head>

<main class="container">
	<div class="header">
		<h1>Anonymous Employee Survey</h1>
		<div class="progress">
			<div class="progress-bar" style="width: {(currentStep / totalSteps) * 100}%"></div>
		</div>
		<p class="step-info">Step {currentStep} of {totalSteps}</p>
	</div>

	<div class="survey-content">
		{#if currentStep === 1}
			<div class="intro-step">
				<h2>Survey Introduction</h2>
				<p>This survey is anonymous and will stay open indefinitely.</p>
				<p>Responses (but not your identity) will be displayed live on a shared dashboard so everyone can see aggregate results as they come in.</p>
				<p><strong>Your unique URL:</strong> <code>{window?.location?.href || ''}</code></p>
				<p class="bookmark-notice">📌 Bookmark this page to return and update your responses anytime!</p>
			</div>
		{:else if currentStep === 2}
			<div class="step">
				<h2>Role Context</h2>
				
				<div class="question">
					<label>1. Which department are you in?</label>
					<div class="options">
						<label><input type="radio" name="department" value="engineering" bind:group={responses.department}> Engineering</label>
						<label><input type="radio" name="department" value="product" bind:group={responses.department}> Product</label>
						<label><input type="radio" name="department" value="marketing" bind:group={responses.department}> Marketing</label>
						<label><input type="radio" name="department" value="sales" bind:group={responses.department}> Sales</label>
						<label><input type="radio" name="department" value="customer-success" bind:group={responses.department}> Customer Success</label>
						<label><input type="radio" name="department" value="operations" bind:group={responses.department}> Operations</label>
						<label><input type="radio" name="department" value="leadership" bind:group={responses.department}> Leadership</label>
						<label><input type="radio" name="department" value="board" bind:group={responses.department}> Board</label>
						<label><input type="radio" name="department" value="prefer-not-to-say" bind:group={responses.department}> Prefer not to say</label>
					</div>
				</div>

				<div class="question">
					<label>2. How long have you worked at Runn?</label>
					<div class="options">
						<label><input type="radio" name="tenure" value="0-1" bind:group={responses.tenure}> 0–1 year</label>
						<label><input type="radio" name="tenure" value="1-2" bind:group={responses.tenure}> 1–2 years</label>
						<label><input type="radio" name="tenure" value="2-3" bind:group={responses.tenure}> 2–3 years</label>
						<label><input type="radio" name="tenure" value="3+" bind:group={responses.tenure}> 3+ years</label>
						<label><input type="radio" name="tenure" value="prefer-not-to-say" bind:group={responses.tenure}> Prefer not to say</label>
					</div>
				</div>
			</div>
		{:else if currentStep === 3}
			<div class="step">
				<h2>Four-Day Week Usage</h2>
				
				<div class="question">
					<label>3. Roughly what % of weeks do you work a four-day (32h) week?</label>
					<div class="slider-container">
						<input type="range" min="0" max="100" bind:value={responses.fourDayWeekPercentage} class="slider">
						<div class="slider-labels">
							<span>0% - Never</span>
							<span>{responses.fourDayWeekPercentage || 0}%</span>
							<span>100% - Every week</span>
						</div>
					</div>
				</div>

				<div class="question">
					<label>4. If four-day remains optional, how likely are you to choose it?</label>
					<div class="scale">
						{#each [1, 2, 3, 4, 5] as value}
							<label class="scale-item">
								<input type="radio" name="fourDayLikelihood" {value} bind:group={responses.fourDayLikelihood}>
								<span>{value}</span>
							</label>
						{/each}
					</div>
					<div class="scale-labels">
						<span>1 = Not at all</span>
						<span>5 = Absolutely</span>
					</div>
				</div>
			</div>
		{:else}
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

	.question {
		margin-bottom: 2rem;
	}

	.question label {
		display: block;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #374151;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.options label {
		font-weight: normal;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.slider-container {
		margin: 1rem 0;
	}

	.slider {
		width: 100%;
		height: 6px;
		background: #e5e7eb;
		border-radius: 3px;
		outline: none;
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: #6b7280;
	}

	.scale {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin: 1rem 0;
	}

	.scale-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.scale-item input {
		margin-bottom: 0.5rem;
	}

	.scale-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		color: #6b7280;
		margin-top: 1rem;
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

	code {
		background: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		word-break: break-all;
	}
</style>