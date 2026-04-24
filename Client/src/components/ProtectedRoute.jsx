import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100">
        <div className="text-center">
          <p className="mt-4 text-lg text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in but not admin and trying to access admin route, redirect to shop
  if (!user.isAdmin && location.pathname.startsWith('/admin')) {
    return <Navigate to={`/shop/${user.id}`} replace />;
  }

  return children;
};

export default ProtectedRoute;