import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ScrollRestoration from './components/ScrollRestoration';
import { AuthProvider } from './components/context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import BillingInvoice from './screens/BillingInvoice';
// import CustomerFeedback from './screens/CustomerFeedback';
// import InventoryStockManage from './screens/InventoryStockManage';
// import KitchenDisplay from './screens/KitchenDisplay';
// import LoyaltyPrograms from './screens/LoyaltyPrograms';
// import MenuManagement from './screens/MenuManagement';
// import POSsystem from './screens/POSsystem';
import RestaurantAnalytics from './screens/RestaurantAnalytics';
import Settings from './screens/Settings';
// import StaffManagement from './screens/StaffManagement';
import ReservationManagement from './screens/ReservationManagement/ReservationManagement';
// import WalkinManagement from './screens/WalkinManagement';
import RoomManagement from './screens/RoomManaagemnt/RoomManagement';
import RestaurantBarManagement from './screens/Restaurant&BarManagement/RestaurantBarManagement';

const Layout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <ScrollRestoration />
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/billing-invoice" element={<BillingInvoice />} />
            {/* <Route path="/customer-feedback" element={<CustomerFeedback />} />
            <Route path="/inventory-stock-manage" element={<InventoryStockManage />} />
            <Route path="/kitchen-display" element={<KitchenDisplay />} />
            <Route path="/loyalty-programs" element={<LoyaltyPrograms />} />
            <Route path="/menu-management" element={<MenuManagement />} />
            <Route path="/pos-system" element={<POSsystem />} /> */}
            <Route path="/analytics-reports" element={<RestaurantAnalytics />} />
            <Route path="/settings" element={<Settings />} />
            {/* <Route path="/staff-management" element={<StaffManagement />} /> */}
            <Route path="/reservation-management" element={<ReservationManagement />} />
            {/* <Route path="/walkin-management" element={<WalkinManagement />} /> */}
            {/* Room Management Route */}
            <Route path="/room-management" element={<RoomManagement />} />
            <Route path="/restaurant-bar-management" element={<RestaurantBarManagement />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;