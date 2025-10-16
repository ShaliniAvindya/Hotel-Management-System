import React, { useState, useContext } from 'react';
import { AuthContext } from '../components/context/AuthContext';
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
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  let sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'room', label: 'Rooms', icon: Home, path: '/room-management' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/reservation-management' },
    { id: 'restaurant-bar', label: 'Restaurant & Bar', icon: Utensils, path: '/restaurant-bar-management' },
    { id: 'billing', label: 'Billing & Invoice', icon: FileText, path: '/billing-invoice' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];
  if (user) {
    sidebarItems.push({ id: 'logout', label: 'Logout', icon: LogOut, path: '/logout' });
  }

  const sidebarWidth = sidebarMinimized ? 'w-16' : 'w-64';

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-slate-800 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:${sidebarWidth}`}
      onMouseEnter={() => setSidebarMinimized(false)}
      onMouseLeave={() => setSidebarMinimized(true)}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900">
        {!sidebarMinimized && (
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">Hotel Management</h1>
        )}
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
            className="lg:hidden text-white hover:text-gray-300 p-2"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <nav className="mt-6 sm:mt-8">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'logout') {
                  logout();
                  navigate('/login');
                  setSidebarOpen(false);
                  setSidebarMinimized(true);
                  return;
                }
                navigate(item.path);
                setSidebarOpen(false);
                setSidebarMinimized(true); // Minimize sidebar after selecting a tab
              }}
              className={`w-full flex items-center px-4 sm:px-6 py-2 sm:py-3 text-left transition-colors duration-200 mb-1 ${
                isActive
                  ? 'bg-slate-700 text-white border-r-4 border-blue-500'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={sidebarMinimized ? item.label : ''}
            >
              <Icon size={20} className={sidebarMinimized ? 'mx-auto' : 'mr-3'} />
              {!sidebarMinimized && (
                <span className="text-sm sm:text-base truncate">{item.label}</span>
              )}
            </button>
          );
        })}
        {!user && (
          <div className="mt-4 px-4">
            <button onClick={() => navigate('/login')} className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md mb-2">Login</button>
            <button onClick={() => navigate('/register')} className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md">Register</button>
          </div>
        )}
        
      </nav>
    </div>
  );
};

export default Sidebar;