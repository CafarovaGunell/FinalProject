import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../home/context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles?.length && !roles.some((r) => user.roles?.includes(r)))
    return <Navigate to="/" replace />;

  return children;
}