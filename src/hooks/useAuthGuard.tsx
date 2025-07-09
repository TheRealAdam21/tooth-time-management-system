import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAuthGuard = () => {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to access this feature");
    }
    
    if (!loading && user && userRole !== 'dentist') {
      toast.error("Unauthorized access - dentist role required");
    }
  }, [user, userRole, loading]);

  return {
    isAuthenticated: !!user,
    isDentist: userRole === 'dentist',
    isAuthorized: !!user && userRole === 'dentist',
    loading
  };
};