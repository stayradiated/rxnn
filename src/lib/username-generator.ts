// Username generator - creates adjective + animal combinations
// TODO: Implement with proper word lists (1000+ combinations)

const ADJECTIVES = [
  'Curious',
  'Wise',
  'Friendly',
  'Creative',
  'Brave',
  'Clever',
  'Gentle',
  'Happy',
  'Thoughtful',
  'Kind',
  'Bold',
  'Calm',
  'Cheerful',
  'Bright',
  'Swift',
]

const ANIMALS = [
  'Penguin',
  'Otter',
  'Dolphin',
  'Fox',
  'Owl',
  'Bear',
  'Wolf',
  'Eagle',
  'Tiger',
  'Lion',
  'Deer',
  'Rabbit',
  'Turtle',
  'Elephant',
  'Whale',
]

export function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]

  return `${adjective}${animal}`
}

export function generateUniqueUsername(
  isUsernameAvailable: (username: string) => boolean,
): string {
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops

  while (attempts < maxAttempts) {
    const username = generateUsername()

    if (isUsernameAvailable(username)) {
      return username
    }

    attempts++
  }

  // Fallback: Add random number if we can't find a unique combination
  const baseUsername = generateUsername()
  const randomSuffix = Math.floor(Math.random() * 1000)

  return `${baseUsername}${randomSuffix}`
}

// Get total possible combinations (for info/debugging)
export function getTotalCombinations(): number {
  return ADJECTIVES.length * ANIMALS.length
}
