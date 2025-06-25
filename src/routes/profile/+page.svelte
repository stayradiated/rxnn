<script lang="ts">
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import EmojiPicker from '$lib/components/EmojiPicker.svelte'
import { generateRandomEmoji } from '$lib/username-generator'
import { preventDefault } from 'svelte/legacy'
import type { PageData } from './$types'

interface Props {
  data: PageData
}

let { data }: Props = $props()

let username = $state(data.user.username)
let avatar = $state(data.user.avatar)
let isSubmitting = $state(false)
let message = $state('')
let messageType = $state('') // 'success' or 'error'
let showEmojiPicker = $state(false)

async function updateProfile() {
  if (!browser) return

  // Validate inputs
  if (!username.trim()) {
    message = 'Username is required'
    messageType = 'error'
    return
  }

  isSubmitting = true
  message = ''

  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        avatar: avatar.trim(),
      }),
    })

    const responseData = await response.json()

    if (response.ok) {
      message = 'Profile updated successfully!'
      messageType = 'success'

      // Update the data to reflect changes
      username = responseData.user.username
      avatar = responseData.user.avatar
    } else {
      message = responseData.error || 'Failed to update profile'
      messageType = 'error'
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    message = 'Failed to update profile'
    messageType = 'error'
  } finally {
    isSubmitting = false
  }
}

function generateRandomAvatarEmoji() {
  avatar = generateRandomEmoji()
}

function openEmojiPicker() {
  showEmojiPicker = true
}

function closeEmojiPicker() {
  showEmojiPicker = false
}

function selectEmoji(emoji: { native: string }) {
  avatar = emoji.native
  closeEmojiPicker()
}

function goBack() {
  goto('/feed')
}
</script>

<div class="profile-page">
  <div class="profile-container">
    <div class="profile-header">
      <button class="btn-back" onclick={goBack}>
        ← Back to Feed
      </button>
      <h1>Profile Settings</h1>
    </div>

    <div class="profile-form">
      <div class="user-info">
        <h2>Account Information</h2>
        <p class="account-created">
          Account created: {new Date(data.user.created_at).toLocaleDateString()}
        </p>
        {#if data.user.updated_at !== data.user.created_at}
          <p class="last-updated">
            Last updated: {new Date(data.user.updated_at).toLocaleDateString()}
          </p>
        {/if}
      </div>

      <form onsubmit={preventDefault(updateProfile)}>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            bind:value={username}
            placeholder="Enter your username"
            required
            minlength="2"
            maxlength="30"
            pattern="[a-zA-Z0-9_-]+"
            title="Username can only contain letters, numbers, underscores, and hyphens"
            disabled={isSubmitting}
          />
          <small class="help-text">
            2-30 characters. Letters, numbers, underscores, and hyphens only.
          </small>
        </div>

        <div class="form-group">
          <label for="avatar">Avatar Emoji</label>
          <div class="avatar-input-container">
            <input
              type="text"
              id="avatar"
              bind:value={avatar}
              placeholder="😊"
              maxlength="10"
              disabled={isSubmitting}
              class="avatar-input"
            />
            <button
              type="button"
              onclick={openEmojiPicker}
              class="btn-emoji-picker"
              disabled={isSubmitting}
              title="Pick an emoji">
              😀
            </button>
            <button
              type="button"
              onclick={generateRandomAvatarEmoji}
              class="btn-random-emoji"
              disabled={isSubmitting}
              title="Generate random emoji">
              🎲
            </button>
          </div>
          <small class="help-text">
            Choose an emoji or short text (max 10 characters) to represent you.
          </small>
        </div>

        {#if message}
          <div class="message" class:success={messageType === 'success'} class:error={messageType === 'error'}>
            {message}
          </div>
        {/if}

        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

{#if showEmojiPicker}
  <div class="emoji-picker-overlay">
    <EmojiPicker onclose={closeEmojiPicker} onselect={selectEmoji} />
  </div>
{/if}

<style>
  .profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 1rem;
  }

  .profile-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .profile-header {
    background: #f8fafc;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-back {
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .btn-back:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }

  .profile-header h1 {
    color: #111827;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .profile-form {
    padding: 2rem;
  }

  .user-info {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
  }

  .user-info h2 {
    color: #111827;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .account-created,
  .last-updated {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0.25rem 0;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-group input:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }

  .help-text {
    display: block;
    color: #6b7280;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .message {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .message.success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .avatar-input-container {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .avatar-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .avatar-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .avatar-input:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }

  .btn-emoji-picker,
  .btn-random-emoji {
    background: #f3f4f6;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    min-width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-emoji-picker:hover:not(:disabled),
  .btn-random-emoji:hover:not(:disabled) {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  .btn-emoji-picker:disabled,
  .btn-random-emoji:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .emoji-picker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .profile-page {
      padding: 1rem 0.5rem;
    }

    .profile-header {
      padding: 1rem;
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .btn-back {
      align-self: flex-start;
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }

    .profile-form {
      padding: 1.5rem 1rem;
    }

    .form-actions {
      justify-content: stretch;
    }

    .btn-primary {
      width: 100%;
    }

    .avatar-input-container {
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-emoji-picker,
    .btn-random-emoji {
      min-width: auto;
      width: 100%;
    }
  }
</style>
