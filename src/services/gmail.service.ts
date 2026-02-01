import { getToken } from './auth.service';
import { apiBaseUrl } from '../config/api.config';

export interface GmailStatus {
  connected: boolean;
  gmailAddress?: string;
}

export async function getGmailStatus(): Promise<GmailStatus> {
  const token = getToken();
  const response = await fetch(`${apiBaseUrl}/gmail/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al obtener estado de Gmail');
  }

  return response.json();
}

export async function getGmailAuthUrl(): Promise<string> {
  const token = getToken();
  const response = await fetch(`${apiBaseUrl}/auth/gmail`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al obtener URL de autenticación');
  }

  const data = await response.json();
  return data.redirectUrl;
}

export async function disconnectGmail(): Promise<void> {
  const token = getToken();
  const response = await fetch(`${apiBaseUrl}/gmail/disconnect`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al desconectar Gmail');
  }
}
