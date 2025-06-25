<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	function startSurvey() {
		if (browser) {
			goto('/survey');
		}
	}
</script>

<svelte:head>
	<title>Anonymous Employee Survey</title>
</svelte:head>

<main class="container">
	<h1>Anonymous Employee Survey</h1>
	
	<div class="intro">
		<p>This survey is anonymous and will stay open indefinitely.</p>
		<p>Responses (but not your identity) will be displayed live on a shared dashboard so everyone can see aggregate results as they come in.</p>
		
		<div class="features">
			<h2>Key Features</h2>
			<ul>
				<li>✅ Completely anonymous - no personal data collected</li>
				<li>✅ Return anytime to update your responses</li>
				<li>✅ Live results dashboard</li>
				<li>✅ Privacy protected - minimum thresholds apply</li>
			</ul>
		</div>
	</div>

	<div class="actions">
		<button on:click={startSurvey} class="btn-primary">Start Survey</button>
		<a href="/results" class="btn-secondary">View Results</a>
	</div>
</main>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		color: #2563eb;
		margin-bottom: 2rem;
	}

	.intro {
		background: #f8fafc;
		padding: 2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.features {
		margin-top: 1.5rem;
	}

	.features ul {
		list-style: none;
		padding: 0;
	}

	.features li {
		padding: 0.5rem 0;
		font-size: 1.1rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
		padding: 1rem 2rem;
		border: none;
		border-radius: 6px;
		font-size: 1.1rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
		padding: 1rem 2rem;
		border: none;
		border-radius: 6px;
		font-size: 1.1rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.btn-secondary:hover {
		background: #4b5563;
	}
</style>
