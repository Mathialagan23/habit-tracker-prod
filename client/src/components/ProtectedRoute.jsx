import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
