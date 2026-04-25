const routePreloaders = {
  '/': () => import('../screens/HomeScreen'),
  '/room-management': () => import('../screens/RoomManaagemnt/RoomManagement'),
  '/reservation-management': () => import('../screens/ReservationManagement/ReservationManagement'),
  '/restaurant-bar-management': () => import('../screens/Restaurant&BarManagement/RestaurantBarManagement'),
  '/spa-wellness': () => import('../screens/SpaAndWellness/SpaAndWellnessManagement'),
  '/billing-invoice': () => import('../screens/BillingInvoice'),
  '/analytics': () => import('../screens/RestaurantAnalytics'),
  '/settings': () => import('../screens/Settings'),
  '/login': () => import('../screens/Login'),
  '/register': () => import('../screens/Register'),
};

export const preloadRoute = (path) => routePreloaders[path]?.();

export const preloadCriticalRoutes = () =>
  Promise.all([
    preloadRoute('/'),
    preloadRoute('/room-management'),
    preloadRoute('/reservation-management'),
    preloadRoute('/restaurant-bar-management'),
    preloadRoute('/spa-wellness'),
    preloadRoute('/billing-invoice'),
    preloadRoute('/analytics'),
  ]);
