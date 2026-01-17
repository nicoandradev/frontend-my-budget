const tokenKey = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string): void {
  localStorage.setItem(tokenKey, token);
}

export function removeToken(): void {
  localStorage.removeItem(tokenKey);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

