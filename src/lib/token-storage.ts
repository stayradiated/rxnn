const TOKEN_KEY = 'survey-token'

export function saveTokenToStorage(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getTokenFromStorage(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function clearTokenFromStorage(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// TODO: unused
export function hasStoredToken(): boolean {
  const token = getTokenFromStorage()
  return token !== null && token.length === 64
}
