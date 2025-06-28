import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Navigate } from 'react-router-dom';
import { Staff } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthorized?: (user: Staff) => boolean;
}

export function ProtectedRoute({ children, isAuthorized }: ProtectedRouteProps) {
  const { user, loading } = useSecureAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthorized && !isAuthorized(user)) {
    // If user is not authorized, redirect to the home page.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}