import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'root' | 'admin' | 'user';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = getUserRole();
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole === 'root' && userRole !== 'root') {
      return <Navigate to="/dashboard" replace />;
    }

    if (requiredRole === 'admin' && userRole !== 'admin' && userRole !== 'root') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

