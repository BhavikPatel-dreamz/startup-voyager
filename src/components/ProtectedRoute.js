'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const { verifyToken } = await import('../lib/auth');
        const result = await verifyToken(token);

        if (result.success) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;