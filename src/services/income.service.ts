import { getToken } from './auth.service';

const apiBaseUrl = 'http://localhost:3000';

export interface Income {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeRequest {
  merchant: string;
  amount: number;
  category: string;
  date: string;
}

export async function createIncome(request: CreateIncomeRequest): Promise<Income> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/incomes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear el ingreso');
  }

  return data;
}

export async function listIncomes(year?: number, month?: number): Promise<Income[]> {
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

  const url = `${apiBaseUrl}/incomes${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al listar los ingresos');
  }

  return data;
}

export interface UpdateIncomeRequest {
  merchant: string;
  amount: number;
  category: string;
  date: string;
}

export async function updateIncome(id: string, request: UpdateIncomeRequest): Promise<Income> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/incomes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar el ingreso');
  }

  return data;
}

export async function deleteIncome(id: string): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(`${apiBaseUrl}/incomes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al eliminar el ingreso');
  }
}

