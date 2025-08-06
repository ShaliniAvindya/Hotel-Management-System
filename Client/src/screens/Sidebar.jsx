import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Utensils,
  ShoppingCart,
  Monitor,
  FileText,
  Package,
  UserCheck,
  Heart,
  Star,
  BarChart3,
  Settings,
  ChefHat,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'room', label: 'Rooms', icon: Home, path: '/room-management' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/reservation-management' },
    { id: 'restaurant-bar', label: 'Restaurant & Bar', icon: Utensils, path: '/restaurant-bar-management' },
    // { id: 'walkin', label: 'Walk-in Management', icon: Users, path: '/walkin-management' },
    // { id: 'menu', label: 'Menu Management', icon: Utensils, path: '/menu-management' },
    // { id: 'pos', label: 'POS System', icon: ShoppingCart, path: '/pos-system' },
    // { id: 'kitchen', label: 'Kitchen Display', icon: Monitor, path: '/kitchen-display' },
    { id: 'billing', label: 'Billing & Invoice', icon: FileText, path: '/billing-invoice' },
    // { id: 'inventory', label: 'Inventory & Stock', icon: Package, path: '/inventory-stock-manage' },
    // { id: 'staff', label: 'Staff Management', icon: UserCheck, path: '/staff-management' },
    // { id: 'feedback', label: 'Customer Feedback', icon: Heart, path: '/customer-feedback' },
    // { id: 'loyalty', label: 'Loyalty Programs', icon: Star, path: '/loyalty-programs' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/analytics-reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const sidebarWidth = sidebarMinimized ? 'w-16' : 'w-64';

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-slate-800 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
      onMouseEnter={() => setSidebarMinimized(false)}
      onMouseLeave={() => setSidebarMinimized(true)}
    >
      <div className="flex items-center justify-between h-16 px-6 bg-slate-900">
        {!sidebarMinimized && <h1 className="text-xl font-bold text-white">RestaurantPro</h1>}
        {sidebarMinimized && <ChefHat className="h-8 w-8 text-white mx-auto" />}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className="hidden lg:block text-white hover:text-gray-300 p-1"
          >
            {sidebarMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <nav className="mt-8">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
                setSidebarMinimized(true); // Minimize sidebar after selecting a tab
              }}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 mb-1 ${
                isActive
                  ? 'bg-slate-700 text-white border-r-4 border-blue-500'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={sidebarMinimized ? item.label : ''}
            >
              <Icon size={20} className={sidebarMinimized ? 'mx-auto' : 'mr-3'} />
              {!sidebarMinimized && item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;