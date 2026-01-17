import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../services/auth.service';
import './Register.css';

const apiBaseUrl = 'http://localhost:3000';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrar usuario');
        setIsLoading(false);
        return;
      }

      setToken(data.token);
      navigate('/dashboard');
    } catch (error) {
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
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

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <Link to="/login" className="login-link">
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
      </div>
    </div>
  );
}

export default Register;

