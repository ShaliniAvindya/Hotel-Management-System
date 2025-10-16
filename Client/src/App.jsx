import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ScrollRestoration from './components/ScrollRestoration';
import { AuthProvider } from './components/context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import BillingInvoice from './screens/BillingInvoice';
import Settings from './screens/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import ReservationManagement from './screens/ReservationManagement/ReservationManagement';
import RoomManagement from './screens/RoomManaagemnt/RoomManagement';
import RestaurantBarManagement from './screens/Restaurant&BarManagement/RestaurantBarManagement';
import RestaurantAnalytics from './screens/RestaurantAnalytics';
import { useContext } from 'react';
import { AuthContext } from './components/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

const App = () => {
  const Redirector = () => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null; 
    return user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
  };
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />
        <ScrollRestoration />
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/billing-invoice" element={<ProtectedRoute><BillingInvoice /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reservation-management" element={<ProtectedRoute><ReservationManagement /></ProtectedRoute>} />
            <Route path="/room-management" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
            <Route path="/restaurant-bar-management" element={<ProtectedRoute><RestaurantBarManagement /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><RestaurantAnalytics /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;