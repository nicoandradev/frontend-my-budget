import { getToken } from './auth.service';

const apiBaseUrl = 'http://localhost:3000';

export interface FinancialSummary {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
}

export async function getFinancialSummary(year?: number, month?: number): Promise<FinancialSummary> {
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

  const url = `${apiBaseUrl}/summary${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener el resumen financiero');
  }

  return data;
}

