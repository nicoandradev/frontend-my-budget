import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense, listExpenses, updateExpense, deleteExpense } from '../services/expense.service';
import type { CreateExpenseRequest, Expense, UpdateExpenseRequest } from '../services/expense.service';
import { createIncome, listIncomes, updateIncome, deleteIncome } from '../services/income.service';
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../services/income.service';
import { getFinancialSummary } from '../services/summary.service';
import type { FinancialSummary } from '../services/summary.service';
import { isAdmin, removeToken } from '../services/auth.service';
import Profiles from './Profiles';
import MiPerfil from './MiPerfil';
import './Dashboard.css';

type TransactionType = 'expense' | 'income';
type ViewType = 'register' | 'records' | 'profiles' | 'miPerfil';

const categories = [
  'Deporte',
  'Ropa',
  'Recreacional',
  'TC',
  'Cursos',
  'Supermercado',
  'Transporte',
  'Vacaciones',
  'Ahorros',
  'Salud',
  'Hogar',
  'Otros'
] as const;

function Dashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('register');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<{ type: TransactionType; id: string; merchant: string; amount: number; category: string; date: string } | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editAmountDisplay, setEditAmountDisplay] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  useEffect(() => {
    if (currentView === 'records') {
      loadAllData();
    }
  }, [currentView, selectedYear, selectedMonth]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const loadAllData = async () => {
    setIsLoadingExpenses(true);
    setIsLoadingIncomes(true);
    setIsLoadingSummary(true);
    setError('');

    try {
      const [expensesList, incomesList, summaryData] = await Promise.all([
        listExpenses(selectedYear || undefined, selectedMonth || undefined),
        listIncomes(selectedYear || undefined, selectedMonth || undefined),
        getFinancialSummary(selectedYear || undefined, selectedMonth || undefined),
      ]);

      setExpenses(expensesList);
      setIncomes(incomesList);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los registros');
    } finally {
      setIsLoadingExpenses(false);
      setIsLoadingIncomes(false);
      setIsLoadingSummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const numericAmount = amount ? parseFloat(amount) : 0;
    if (numericAmount <= 0) {
      setError('El monto debe ser mayor a cero');
      return;
    }
    
    setIsLoading(true);

    try {
      if (transactionType === 'income') {
        const incomeData: CreateIncomeRequest = {
          merchant,
          amount: numericAmount,
          category: 'Ingreso', // Valor por defecto para ingresos
          date,
        };

        await createIncome(incomeData);
        setSuccess('Ingreso registrado exitosamente');
      } else {
        const expenseData: CreateExpenseRequest = {
          merchant,
          amount: numericAmount,
          category,
          date,
        };

        await createExpense(expenseData);
        setSuccess('Gasto registrado exitosamente');
      }

      setMerchant('');
      setAmount('');
      setAmountDisplay('');
      setCategory('');
      setDate(getCurrentDate());
      
      if (currentView === 'records') {
        loadAllData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la transacción');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAmountInput = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') return '';
    
    const number = parseInt(numericValue, 10);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const parseFormattedAmount = (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/\D/g, '');
    return numericValue === '' ? 0 : parseInt(numericValue, 10);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      setAmountDisplay('');
      setAmount('');
      return;
    }
    
    const formatted = formatAmountInput(inputValue);
    setAmountDisplay(formatted);
    
    const numericValue = parseFormattedAmount(formatted);
    setAmount(numericValue > 0 ? numericValue.toString() : '');
  };

  const allTransactions = [
    ...expenses.map(exp => ({ ...exp, type: 'expense' as const })),
    ...incomes.map(inc => ({ ...inc, type: 'income' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const handleYearChange = (value: string) => {
    if (value === '') {
      setSelectedYear(null);
      setSelectedMonth(null);
    } else {
      setSelectedYear(parseInt(value, 10));
    }
  };

  const handleMonthChange = (value: string) => {
    if (value === '') {
      setSelectedMonth(null);
    } else {
      setSelectedMonth(parseInt(value, 10));
    }
  };

  const handleEdit = (transaction: { type: TransactionType; id: string; merchant: string; amount: number; category: string; date: string }) => {
    setEditingTransaction(transaction);
    const formatted = formatAmountInput(transaction.amount.toString());
    setEditAmountDisplay(formatted);
    setEditAmount(transaction.amount.toString());
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditAmount('');
    setEditAmountDisplay('');
    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setError('');
    setIsLoading(true);

    try {
      const numericAmount = editAmount ? parseFloat(editAmount) : 0;
      if (numericAmount <= 0) {
        setError('El monto debe ser mayor a cero');
        setIsLoading(false);
        return;
      }

      if (editingTransaction.type === 'income') {
        const updateData: UpdateIncomeRequest = {
          merchant: editingTransaction.merchant,
          amount: numericAmount,
          category: editingTransaction.category,
          date: editingTransaction.date,
        };
        await updateIncome(editingTransaction.id, updateData);
      } else {
        const updateData: UpdateExpenseRequest = {
          merchant: editingTransaction.merchant,
          amount: numericAmount,
          category: editingTransaction.category,
          date: editingTransaction.date,
        };
        await updateExpense(editingTransaction.id, updateData);
      }

      handleCancelEdit();
      setSuccess('Registro actualizado exitosamente');
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: TransactionType, id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (type === 'income') {
        await deleteIncome(id);
      } else {
        await deleteExpense(id);
      }

      setSuccess('Registro eliminado exitosamente');
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      setEditAmountDisplay('');
      setEditAmount('');
      return;
    }
    
    const formatted = formatAmountInput(inputValue);
    setEditAmountDisplay(formatted);
    
    const numericValue = parseFormattedAmount(formatted);
    setEditAmount(numericValue > 0 ? numericValue.toString() : '');
  };

  const handleEditFieldChange = (field: 'merchant' | 'category' | 'date', value: string) => {
    if (editingTransaction) {
      setEditingTransaction({ ...editingTransaction, [field]: value });
    }
  };

  const setViewAndCloseMobileMenu = (view: ViewType) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-container">
      <button
        type="button"
        className="hamburger-button"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          role="presentation"
          aria-hidden
        />
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 20L70 20L80 35L80 80L20 80L20 35Z" fill="url(#logoGradient)" stroke="white" strokeWidth="2"/>
            <path d="M30 35L70 35L65 50L35 50Z" fill="rgba(255,255,255,0.2)"/>
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9B59B6" />
                <stop offset="100%" stopColor="#3498DB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-link ${currentView === 'register' ? 'active' : ''}`}
            onClick={() => setViewAndCloseMobileMenu('register')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>Registrar</span>
          </button>
          
          <button
            className={`nav-link ${currentView === 'records' ? 'active' : ''}`}
            onClick={() => setViewAndCloseMobileMenu('records')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <span>Registros</span>
          </button>
          
          <button
            className={`nav-link ${currentView === 'miPerfil' ? 'active' : ''}`}
            onClick={() => setViewAndCloseMobileMenu('miPerfil')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Mi Perfil</span>
          </button>
          
          {isAdmin() && (
            <button
              className={`nav-link ${currentView === 'profiles' ? 'active' : ''}`}
              onClick={() => setViewAndCloseMobileMenu('profiles')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Perfiles</span>
            </button>
          )}

          <button
            className="nav-link nav-link-logout"
            onClick={() => {
              setIsMobileMenuOpen(false);
              removeToken();
              navigate('/login', { replace: true });
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>
          
          {currentView === 'register' && (
            <div className="transaction-form-container">
              <h2 className="form-section-title">
                Registrar {transactionType === 'expense' ? 'Gasto' : 'Ingreso'}
              </h2>
              
              <div className="transaction-type-selector">
                <button
                  type="button"
                  className={`type-button ${transactionType === 'expense' ? 'active' : ''}`}
                  onClick={() => {
                    setTransactionType('expense');
                    setCategory(''); // Limpiar categoría al cambiar a gasto
                  }}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  className={`type-button ${transactionType === 'income' ? 'active' : ''}`}
                  onClick={() => {
                    setTransactionType('income');
                    setCategory(''); // Limpiar categoría al cambiar a ingreso
                  }}
                >
                  Ingreso
                </button>
              </div>
              
              <form className="transaction-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="merchant" className="form-label">Comercio</label>
                  <input
                    id="merchant"
                    type="text"
                    className="form-input"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Ej: Supermercado XYZ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount" className="form-label">Monto (CLP)</label>
                  <input
                    id="amount"
                    type="text"
                    className="form-input"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    placeholder="0"
                    required
                  />
                </div>

                {transactionType === 'expense' && (
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">Categoría</label>
                    <select
                      id="category"
                      className="form-input form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="date" className="form-label">Fecha</label>
                  <input
                    id="date"
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="success-message">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : `Registrar ${transactionType === 'expense' ? 'Gasto' : 'Ingreso'}`}
                </button>
              </form>
            </div>
          )}

          {currentView === 'records' && (
            <div className="records-container">
              <h2 className="form-section-title">Registros de Transacciones</h2>
              
              <div className="filters-container">
                <div className="filter-group">
                  <label htmlFor="year-filter" className="form-label">Año</label>
                  <select
                    id="year-filter"
                    className="form-input form-select"
                    value={selectedYear || ''}
                    onChange={(e) => handleYearChange(e.target.value)}
                  >
                    <option value="">Todo</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="month-filter" className="form-label">Mes</label>
                  <select
                    id="month-filter"
                    className="form-input form-select"
                    value={selectedMonth || ''}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    disabled={selectedYear === null}
                  >
                    <option value="">Todo</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingSummary ? (
                <div className="loading-message">Cargando resumen...</div>
              ) : summary && (
                <div className="summary-container">
                  <div className="summary-card">
                    <div className="summary-card-label">Ingresos</div>
                    <div className="summary-card-amount positive">
                      +{formatCurrency(summary.totalIncomes)}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card-label">Gastos</div>
                    <div className="summary-card-amount negative">
                      -{formatCurrency(summary.totalExpenses)}
                    </div>
                  </div>
                  <div className={`summary-card ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
                    <div className="summary-card-label">Balance</div>
                    <div className={`summary-card-amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(summary.balance)}
                    </div>
                  </div>
                </div>
              )}

              {isLoadingExpenses || isLoadingIncomes ? (
                <div className="loading-message">Cargando registros...</div>
              ) : allTransactions.length === 0 ? (
                <div className="empty-message">No hay registros disponibles</div>
              ) : (
                <div className="records-list">
                  {allTransactions.map((transaction) => (
                    <div key={`${transaction.type}-${transaction.id}`} className="record-item">
                      <div className="record-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <div className="record-details">
                        <div className="record-merchant" title={transaction.merchant}>
                          {transaction.merchant}
                        </div>
                        <div className="record-meta">
                          <span className="record-category">{transaction.category}</span>
                          <span className="record-date">{formatDate(transaction.date)}</span>
                        </div>
                      </div>
                      <div className={`record-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="record-actions">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEdit(transaction)}
                          title="Editar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDelete(transaction.type, transaction.id)}
                          title="Eliminar"
                          disabled={isLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {error && currentView === 'records' && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {success && currentView === 'records' && (
                <div className="success-message">
                  {success}
                </div>
              )}
            </div>
          )}

          {currentView === 'miPerfil' && (
            <MiPerfil />
          )}

          {currentView === 'profiles' && (
            <Profiles />
          )}

          {editingTransaction && (
            <div className="modal-overlay" onClick={handleCancelEdit}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="form-section-title">
                  Editar {editingTransaction.type === 'expense' ? 'Gasto' : 'Ingreso'}
                </h2>
                <form className="transaction-form" onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label htmlFor="edit-merchant" className="form-label">Comercio</label>
                    <input
                      id="edit-merchant"
                      type="text"
                      className="form-input"
                      value={editingTransaction.merchant}
                      onChange={(e) => handleEditFieldChange('merchant', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-amount" className="form-label">Monto (CLP)</label>
                    <input
                      id="edit-amount"
                      type="text"
                      className="form-input"
                      value={editAmountDisplay}
                      onChange={handleEditAmountChange}
                      required
                    />
                  </div>

                  {editingTransaction.type === 'expense' && (
                    <div className="form-group">
                      <label htmlFor="edit-category" className="form-label">Categoría</label>
                      <select
                        id="edit-category"
                        className="form-input form-select"
                        value={editingTransaction.category}
                        onChange={(e) => handleEditFieldChange('category', e.target.value)}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="edit-date" className="form-label">Fecha</label>
                    <input
                      id="edit-date"
                      type="date"
                      className="form-input"
                      value={editingTransaction.date}
                      onChange={(e) => handleEditFieldChange('date', e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
