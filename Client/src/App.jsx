import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ScrollRestoration from './components/ScrollRestoration';
import { AuthProvider } from './components/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useContext } from 'react';
import { AuthContext } from './components/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { preloadCriticalRoutes } from './lib/routePreloaders';
import BillingInvoice from './screens/BillingInvoice';
import Settings from './screens/Settings';
import LeadsManagement from './screens/LeadsManagement';
import ReservationManagement from './screens/ReservationManagement/ReservationManagement';
import RoomManagement from './screens/RoomManaagemnt/RoomManagement';
import RestaurantBarManagement from './screens/Restaurant&BarManagement/RestaurantBarManagement';
import RestaurantAnalytics from './screens/RestaurantAnalytics';
import SpaAndWellnessManagement from './screens/SpaAndWellness/SpaAndWellnessManagement';
import ApaleoIntegration from './screens/ChannelManager/ApaleoIntegration';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const Login = lazy(() => import('./screens/Login'));
const Register = lazy(() => import('./screens/Register'));

const Layout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

const AppShellFallback = () => (
  <div className="hotel-page min-h-screen bg-slate-50">
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="hidden h-[calc(100vh-3rem)] w-72 shrink-0 rounded-2xl bg-[#0f2742] lg:block" />
      <div className="flex-1 space-y-6">
        <div className="h-20 rounded-2xl bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-80 rounded-2xl bg-white shadow-sm xl:col-span-2" />
          <div className="h-80 rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  useEffect(() => {
    const preload = () => {
      preloadCriticalRoutes().catch((error) => {
        console.warn('Route preload skipped', error);
      });
    };

    if (typeof window === 'undefined') return undefined;

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeoutId = window.setTimeout(preload, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const Redirector = () => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null; 
    return user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
  };
  return (
    <AuthProvider>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
            },
          }}
          containerStyle={{
            top: 20,
            right: 20,
          }}
          gutter={10}
        />
        <ScrollRestoration />
        <Suspense fallback={<AppShellFallback />}>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
              <Route path="/billing-invoice" element={<ProtectedRoute><BillingInvoice /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/leads-management" element={<ProtectedRoute><LeadsManagement /></ProtectedRoute>} />
              <Route path="/reservation-management" element={<ProtectedRoute><ReservationManagement /></ProtectedRoute>} />
              <Route path="/room-management" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
              <Route path="/restaurant-bar-management" element={<ProtectedRoute><RestaurantBarManagement /></ProtectedRoute>} />
              <Route path="/spa-wellness" element={<ProtectedRoute><SpaAndWellnessManagement /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><RestaurantAnalytics /></ProtectedRoute>} />
              <Route path="/channel-manager" element={<ProtectedRoute><ApaleoIntegration /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
};

export default App;
