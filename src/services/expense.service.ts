import { getToken } from './auth.service';
import { apiBaseUrl } from '../config/api.config';

export interface Expense {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  merchant: string;
  amount: number;
  category: string;
  date: string;
}

export async function createExpense(request: CreateExpenseRequest): Promise<Expense> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear el gasto');
  }

  return data;
}

export async function listExpenses(year?: number, month?: number): Promise<Expense[]> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const params = new URLSearchParams();
  if (year !== undefined) {
    params.append('year', year.toString());
  }
  if (month !== undefined) {
    params.append('month', month.toString());
  }

  const url = `${apiBaseUrl}/expenses${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al listar los gastos');
  }

  return data;
}

export interface UpdateExpenseRequest {
  merchant: string;
  amount: number;
  category: string;
  date: string;
}

export async function updateExpense(id: string, request: UpdateExpenseRequest): Promise<Expense> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar el gasto');
  }

  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/expenses/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al eliminar el gasto');
  }
}

