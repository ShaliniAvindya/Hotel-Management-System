import React, { useState, useContext } from 'react';
import { AuthContext } from '../components/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Utensils,
  FileText,
  BarChart3,
  Settings,
  ChefHat,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BedDouble,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  let sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'room', label: 'Rooms', icon: BedDouble, path: '/room-management' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/reservation-management' },
    { id: 'restaurant-bar', label: 'Restaurant & Bar', icon: Utensils, path: '/restaurant-bar-management' },
    { id: 'spa-wellness', label: 'Spa & Wellness', icon: Sparkles, path: '/spa-wellness' },
    { id: 'billing', label: 'Billing & Invoice', icon: FileText, path: '/billing-invoice' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];
  if (user) {
    sidebarItems.push({ id: 'logout', label: 'Logout', icon: LogOut, path: '/logout' });
  }

  const sidebarWidth = sidebarMinimized ? 'w-20' : 'w-72';

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-[#0f2742] text-white shadow-2xl transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:${sidebarWidth}`}
      onMouseEnter={() => setSidebarMinimized(false)}
      onMouseLeave={() => setSidebarMinimized(true)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_20%_0%,rgba(201,162,74,0.22),transparent_22rem)] pointer-events-none"></div>

      <div className="relative flex items-center justify-between h-20 px-4 sm:px-5 border-b border-white/10">
        {!sidebarMinimized && (
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-wide truncate">The Luxury</h1>
            <p className="text-xs text-white/60">Resort operations suite</p>
          </div>
        )}
        {sidebarMinimized && (
          <div className="mx-auto h-11 w-11 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-[#f4d891]" />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className="hidden lg:block text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
            aria-label={sidebarMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
            aria-label="Close navigation"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {!sidebarMinimized && (
        <div className="relative mx-4 mt-5 rounded-lg border border-white/10 bg-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f4d891]">Today</p>
          <p className="mt-1 text-sm text-white/85">Front desk, rooms, dining and billing in one place.</p>
        </div>
      )}

      <nav className="relative mt-5 px-3">
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
                setSidebarMinimized(true);
              }}
              className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 mb-1 rounded-lg group ${
                isActive
                  ? 'bg-white text-[#0f2742] shadow-lg'
                  : 'text-white/72 hover:bg-white/10 hover:text-white'
              }`}
              title={sidebarMinimized ? item.label : ''}
            >
              <Icon
                size={20}
                className={`${sidebarMinimized ? 'mx-auto' : 'mr-3'} ${
                  isActive ? 'text-[#c9a24a]' : 'text-white/70 group-hover:text-[#f4d891]'
                }`}
              />
              {!sidebarMinimized && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
        {!user && (
          <div className="mt-4 px-4">
            <button onClick={() => navigate('/login')} className="w-full text-left text-white/75 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg mb-2">Login</button>
            <button onClick={() => navigate('/register')} className="w-full text-left text-white/75 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg">Register</button>
          </div>
        )}
        
      </nav>
    </div>
  );
};

export default Sidebar;
