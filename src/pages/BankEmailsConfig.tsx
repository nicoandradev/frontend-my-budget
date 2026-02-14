import { useState, useEffect } from 'react';
import {
  listBankEmailConfigs,
  createBankEmailConfig,
  updateBankEmailConfig,
  deleteBankEmailConfig
} from '../services/bankEmailConfig.service';
import type { BankEmailConfig } from '../services/bankEmailConfig.service';
import './BankEmailsConfig.css';

function BankEmailsConfig() {
  const [configs, setConfigs] = useState<BankEmailConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [senderPatternsText, setSenderPatternsText] = useState('');
  const [extractionInstructions, setExtractionInstructions] = useState('');
  const [exampleImageUrl, setExampleImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadConfigs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const list = await listBankEmailConfigs();
      setConfigs(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const parseSenderPatterns = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
  };

  const handleEdit = (config: BankEmailConfig) => {
    setEditingId(config.id);
    setBankName(config.bankName);
    setSenderPatternsText(config.senderPatterns.join(', '));
    setExtractionInstructions(config.extractionInstructions);
    setExampleImageUrl(config.exampleImageUrl || '');
    setShowForm(true);
    setError('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setBankName('');
    setSenderPatternsText('');
    setExtractionInstructions('');
    setExampleImageUrl('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const patterns = parseSenderPatterns(senderPatternsText);
    if (patterns.length === 0) {
      setError('Debes agregar al menos un patrón de remitente (dominio o email)');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateBankEmailConfig(editingId, {
          bankName: bankName.trim(),
          senderPatterns: patterns,
          extractionInstructions: extractionInstructions.trim(),
          exampleImageUrl: exampleImageUrl.trim() || undefined
        });
        setSuccess('Configuración actualizada exitosamente');
      } else {
        await createBankEmailConfig({
          bankName: bankName.trim(),
          senderPatterns: patterns,
          extractionInstructions: extractionInstructions.trim(),
          exampleImageUrl: exampleImageUrl.trim() || undefined
        });
        setSuccess('Configuración creada exitosamente');
      }
      handleCancelForm();
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la configuración de "${name}"?`)) {
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await deleteBankEmailConfig(id);
      setSuccess('Configuración eliminada exitosamente');
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bank-emails-container">
      <h1 className="bank-emails-title">Correos Bancarios</h1>
      <p className="bank-emails-description">
        Configura los bancos cuyos correos de transacciones se procesarán automáticamente.
      </p>

      <div className="bank-emails-actions">
        <button
          className="add-button"
          onClick={() => {
            handleCancelForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : '+ Agregar Banco'}
        </button>
      </div>

      {showForm && (
        <form className="bank-email-form" onSubmit={handleSubmit}>
          <h2 className="form-section-title">
            {editingId ? 'Editar configuración' : 'Nueva configuración'}
          </h2>
          <div className="form-group">
            <label htmlFor="bank-name" className="form-label">Nombre del banco</label>
            <input
              id="bank-name"
              type="text"
              className="form-input"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ej: Banco de Chile"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sender-patterns" className="form-label">
              Patrones de remitente (dominios o emails, separados por coma)
            </label>
            <input
              id="sender-patterns"
              type="text"
              className="form-input"
              value={senderPatternsText}
              onChange={(e) => setSenderPatternsText(e.target.value)}
              placeholder="bancochile.cl, notificaciones.bancochile.cl"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="extraction-instructions" className="form-label">
              Instrucciones de extracción (para el prompt de OpenAI)
            </label>
            <textarea
              id="extraction-instructions"
              className="form-input form-textarea"
              value={extractionInstructions}
              onChange={(e) => setExtractionInstructions(e.target.value)}
              placeholder="Describe cómo extraer las transacciones del correo..."
              rows={6}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="example-image-url" className="form-label">
              URL de imagen de ejemplo (opcional)
            </label>
            <input
              id="example-image-url"
              type="url"
              className="form-input"
              value={exampleImageUrl}
              onChange={(e) => setExampleImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancelForm}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={isSaving}>
              {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      <div className="bank-configs-section">
        <h2 className="section-title">Bancos configurados</h2>
        {isLoading && !showForm ? (
          <div className="loading-message">Cargando configuraciones...</div>
        ) : configs.length === 0 ? (
          <div className="empty-message">No hay bancos configurados</div>
        ) : (
          <div className="bank-configs-list">
            {configs.map((config) => (
              <div key={config.id} className="bank-config-card">
                <div className="bank-config-info">
                  <div className="bank-config-name">{config.bankName}</div>
                  <div className="bank-config-patterns">
                    {config.senderPatterns.join(', ')}
                  </div>
                  {config.exampleImageUrl && (
                    <a
                      href={config.exampleImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bank-config-image-link"
                    >
                      Ver imagen de ejemplo
                    </a>
                  )}
                </div>
                <div className="bank-config-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(config)}
                    disabled={isLoading}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(config.id, config.bankName)}
                    disabled={isLoading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}

export default BankEmailsConfig;
