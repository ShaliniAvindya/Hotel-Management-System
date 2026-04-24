import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ScrollRestoration from './components/ScrollRestoration';
import { AuthProvider } from './components/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useContext } from 'react';
import { AuthContext } from './components/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const Login = lazy(() => import('./screens/Login'));
const Register = lazy(() => import('./screens/Register'));
const BillingInvoice = lazy(() => import('./screens/BillingInvoice'));
const Settings = lazy(() => import('./screens/Settings'));
const ReservationManagement = lazy(() => import('./screens/ReservationManagement/ReservationManagement'));
const RoomManagement = lazy(() => import('./screens/RoomManaagemnt/RoomManagement'));
const RestaurantBarManagement = lazy(() => import('./screens/Restaurant&BarManagement/RestaurantBarManagement'));
const RestaurantAnalytics = lazy(() => import('./screens/RestaurantAnalytics'));
const SpaAndWellnessManagement = lazy(() => import('./screens/SpaAndWellness/SpaAndWellnessManagement'));

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
        <Suspense
          fallback={
            <div className="hotel-page grid min-h-screen place-items-center p-6">
              <p className="text-gray-600">Opening application...</p>
            </div>
          }
        >
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
              <Route path="/spa-wellness" element={<ProtectedRoute><SpaAndWellnessManagement /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><RestaurantAnalytics /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
};

export default App;
