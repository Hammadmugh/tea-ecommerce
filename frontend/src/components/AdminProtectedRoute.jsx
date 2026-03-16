import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('🔍 Admin Check - Token exists:', !!token);
        console.log('🔍 Admin Check - User data:', userStr);

        if (!token) {
          console.warn('❌ No token found');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const user = userStr ? JSON.parse(userStr) : {};
        console.log('🔍 Admin Check - Parsed user:', user);
        console.log('🔍 Admin Check - User role:', user.role);

        // Check if user is admin or superadmin
        if (user.role === 'admin' || user.role === 'superadmin') {
          console.log('✅ Admin access granted for role:', user.role);
          setIsAuthorized(true);
        } else {
          console.warn('❌ User is not admin. Role:', user.role);
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('❌ Error checking admin access:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    console.log('🚫 Redirecting to login - Admin access denied');
    return <Navigate to="/login" replace />;
  }

  return children;
}
