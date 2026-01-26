import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiBaseUrl } from '../config/api.config';
import './Login.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!tokenFromUrl) {
      setError('Token no encontrado');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: tokenFromUrl,
          password,
          passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al restablecer contraseña');
        setIsLoading(false);
        return;
      }

      navigate('/login', { state: { message: 'Contraseña actualizada correctamente' }, replace: true });
    } catch {
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      setIsLoading(false);
    }
  };

  if (!tokenFromUrl) {
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
          <p className="reset-invalid-message">
            Enlace inválido o expirado. Solicita uno nuevo desde la pantalla de recuperación.
          </p>
          <Link to="/forgot-password" className="forgot-password-link">
            Solicitar nuevo enlace
          </Link>
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
            <label htmlFor="password" className="form-label">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">Confirmar contraseña</label>
            <input
              id="passwordConfirm"
              type="password"
              className="form-input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
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
            {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <Link to="/login" className="forgot-password-link">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
