import { jwtDecode } from 'jwt-decode';

const tokenKey = 'auth_token';
const roleKey = 'user_role';

interface TokenPayload {
  userId: string;
  email: string;
  role?: 'root' | 'admin' | 'user';
}

export function getToken(): string | null {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string): void {
  localStorage.setItem(tokenKey, token);
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    if (decoded.role) {
      localStorage.setItem(roleKey, decoded.role);
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
}

export function removeToken(): void {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(roleKey);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUserRole(): 'root' | 'admin' | 'user' | null {
  const role = localStorage.getItem(roleKey);
  if (role && ['root', 'admin', 'user'].includes(role)) {
    return role as 'root' | 'admin' | 'user';
  }
  const token = getToken();
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (decoded.role) {
        localStorage.setItem(roleKey, decoded.role);
        return decoded.role;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  return null;
}

export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'root';
}

export function isRoot(): boolean {
  return getUserRole() === 'root';
}

export function getUserId(): string | null {
  const token = getToken();
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  return null;
}

