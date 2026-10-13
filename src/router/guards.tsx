import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../hooks/useAuth';

export function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Array<'admin' | 'editor'> }) {
  const { role, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (role !== 'admin' && role !== 'editor') return <Navigate to="/admin/dashboard" replace />;
  if (!roles.includes(role)) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

export function RedirectIfAuth() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (session) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
