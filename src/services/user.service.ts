import { getToken } from './auth.service';
import { apiBaseUrl } from '../config/api.config';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'root' | 'admin' | 'user';
  pendingActive: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteUserRequest {
  email: string;
}

export async function inviteUser(email: string): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/users/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al invitar usuario');
  }
}

export async function listUsers(includePending: boolean = false): Promise<User[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const url = `${apiBaseUrl}/users${includePending ? '?includePending=true' : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al listar usuarios');
  }

  return data;
}

export async function listPendingUsers(): Promise<User[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/users/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al listar usuarios pendientes');
  }

  return data;
}

export async function toggleUserActive(userId: string, active: boolean): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/users/${userId}/active`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ active }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar estado del usuario');
  }
}

export async function updateUserRole(userId: string, role: 'root' | 'admin' | 'user'): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar rol del usuario');
  }
}
