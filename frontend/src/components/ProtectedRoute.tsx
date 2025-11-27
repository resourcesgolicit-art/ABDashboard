import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 🚀 IMPORTANT FIX:
  // If user is not loaded yet (null) but still authenticating, show loader
  if (loading || user === undefined) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // ❌ Only redirect to /auth if loading is finished AND user is really null
  if (!user) {
    return <Navigate to='/auth' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
