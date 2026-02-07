import { useState, useEffect } from 'react';
import { getGmailStatus, getGmailAuthUrl, disconnectGmail } from '../services/gmail.service';
import type { GmailStatus } from '../services/gmail.service';
import './Profiles.css';

function MiPerfil() {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false });
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadGmailStatus();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadGmailStatus = async () => {
    try {
      const status = await getGmailStatus();
      setGmailStatus(status);
    } catch (err) {
      console.error('Error al cargar estado de Gmail:', err);
    }
  };

  const handleConnectGmail = async () => {
    setIsLoadingGmail(true);
    setError('');
    try {
      const authUrl = await getGmailAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar Gmail');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm('¿Estás seguro de que quieres desconectar Gmail?')) {
      return;
    }

    setIsLoadingGmail(true);
    setError('');
    try {
      await disconnectGmail();
      setGmailStatus({ connected: false });
      setSuccess('Gmail desconectado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desconectar Gmail');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  return (
    <div className="profiles-container">
      <h1 className="profiles-title">Mi Perfil</h1>

      <div className="gmail-section">
        <h2 className="section-title">Integración Gmail</h2>
        <p className="gmail-description">
          Conecta tu Gmail para importar automáticamente los gastos desde los correos del Banco de Chile.
        </p>
        {gmailStatus.connected ? (
          <div className="gmail-connected">
            <div className="gmail-status">
              <span className="gmail-icon">✓</span>
              <span>Conectado: {gmailStatus.gmailAddress}</span>
            </div>
            <button
              className="disconnect-button"
              onClick={handleDisconnectGmail}
              disabled={isLoadingGmail}
            >
              {isLoadingGmail ? 'Desconectando...' : 'Desconectar Gmail'}
            </button>
          </div>
        ) : (
          <button
            className="connect-gmail-button"
            onClick={handleConnectGmail}
            disabled={isLoadingGmail}
          >
            {isLoadingGmail ? 'Conectando...' : 'Conectar Gmail'}
          </button>
        )}
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
    </div>
  );
}

export default MiPerfil;
