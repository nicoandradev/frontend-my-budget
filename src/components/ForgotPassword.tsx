import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../config/api.config';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al solicitar recuperación');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-content">
          <div className="logo-container">
            <div className="logo-icon">
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
            <h1 className="logo-text">BudgetApp</h1>
          </div>
          <p className="forgot-success-message">
            Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link to="/login" className="forgot-password-link">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-container">
          <div className="logo-icon">
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
          <h1 className="logo-text">BudgetApp</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <Link to="/login" className="forgot-password-link">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
