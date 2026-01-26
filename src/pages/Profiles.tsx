import { useState, useEffect } from 'react';
import { inviteUser, listUsers, listPendingUsers, toggleUserActive, updateUserRole } from '../services/user.service';
import type { User } from '../services/user.service';
import { isAdmin, isRoot, getUserId } from '../services/auth.service';
import './Profiles.css';

function Profiles() {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const currentUserId = getUserId();
  const canInvite = isAdmin();
  const canChangeRoles = isRoot();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [allUsers, pending] = await Promise.all([
        listUsers(false),
        listPendingUsers(),
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!inviteEmail) {
      setError('Email es requerido');
      return;
    }

    setIsInviting(true);
    try {
      await inviteUser(inviteEmail);
      setSuccess('Invitación enviada exitosamente');
      setInviteEmail('');
      setShowInviteForm(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar invitación');
    } finally {
      setIsInviting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    if (!confirm(`¿Estás seguro de que quieres ${currentActive ? 'desactivar' : 'activar'} este usuario?`)) {
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await toggleUserActive(userId, !currentActive);
      setSuccess(`Usuario ${!currentActive ? 'activado' : 'desactivado'} exitosamente`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'root' | 'admin' | 'user') => {
    if (!confirm(`¿Estás seguro de que quieres cambiar el rol a ${newRole}?`)) {
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await updateUserRole(userId, newRole);
      setSuccess('Rol actualizado exitosamente');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar rol');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      root: 'Root',
      admin: 'Admin',
      user: 'Usuario',
    };
    return labels[role] || role;
  };

  return (
    <div className="profiles-container">
      <h1 className="profiles-title">Gestión de Perfiles</h1>

      {canInvite && (
        <div className="invite-section">
          <button
            className="invite-button"
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            {showInviteForm ? 'Cancelar' : '+ Invitar Usuario'}
          </button>

          {showInviteForm && (
            <form className="invite-form" onSubmit={handleInvite}>
              <div className="form-group">
                <label htmlFor="invite-email" className="form-label">Email</label>
                <input
                  id="invite-email"
                  type="email"
                  className="form-input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={isInviting}
              >
                {isInviting ? 'Enviando...' : 'Enviar Invitación'}
              </button>
            </form>
          )}
        </div>
      )}

      {pendingUsers.length > 0 && (
        <div className="pending-section">
          <h2 className="section-title">Invitaciones Pendientes</h2>
          <div className="users-list">
            {pendingUsers.map((user) => (
              <div key={user.id} className="user-card pending">
                <div className="user-info">
                  <div className="user-email">{user.email}</div>
                  <div className="user-meta">
                    <span className="user-status pending">Pendiente</span>
                    <span className="user-date">Invitado: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="users-section">
        <h2 className="section-title">Usuarios</h2>
        {isLoading ? (
          <div className="loading-message">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="empty-message">No hay usuarios registrados</div>
        ) : (
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className={`user-card ${!user.active ? 'inactive' : ''}`}>
                <div className="user-info">
                  <div className="user-name">{user.name || user.email}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-meta">
                    <span className={`user-role role-${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <span className={`user-status ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="user-date">Registrado: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <div className="user-actions">
                  {canInvite && (
                    <button
                      className={`toggle-button ${user.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(user.id, user.active)}
                      disabled={isLoading || user.id === currentUserId}
                      title={user.active ? 'Desactivar' : 'Activar'}
                    >
                      {user.active ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                  {canChangeRoles && (
                    <select
                      className="role-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'root' | 'admin' | 'user')}
                      disabled={isLoading || user.id === currentUserId}
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                      <option value="root">Root</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
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

export default Profiles;
