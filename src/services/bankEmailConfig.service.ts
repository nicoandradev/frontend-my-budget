import { getToken } from './auth.service';
import { apiBaseUrl } from '../config/api.config';

export interface BankEmailConfig {
  id: string;
  bankName: string;
  senderPatterns: string[];
  extractionInstructions: string;
  exampleImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankEmailConfigRequest {
  bankName: string;
  senderPatterns: string[];
  extractionInstructions: string;
  exampleImageUrl?: string;
}

export interface UpdateBankEmailConfigRequest {
  bankName: string;
  senderPatterns: string[];
  extractionInstructions: string;
  exampleImageUrl?: string;
}

export async function listBankEmailConfigs(): Promise<BankEmailConfig[]> {
  const token = getToken();
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/bank-email-configs`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al listar configuraciones');
  }

  return data;
}

export async function createBankEmailConfig(request: CreateBankEmailConfigRequest): Promise<BankEmailConfig> {
  const token = getToken();
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/bank-email-configs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al crear configuración');
  }

  return data;
}

export async function updateBankEmailConfig(id: string, request: UpdateBankEmailConfigRequest): Promise<BankEmailConfig> {
  const token = getToken();
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/bank-email-configs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar configuración');
  }

  return data;
}

export async function deleteBankEmailConfig(id: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/bank-email-configs/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al eliminar configuración');
  }
}
