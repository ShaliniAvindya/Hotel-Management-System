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
  Globe,
  Users,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  let sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'room', label: 'Rooms', icon: BedDouble, path: '/room-management' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/reservation-management' },
    { id: 'leads', label: 'Leads Management', icon: Users, path: '/leads-management' },
    { id: 'restaurant-bar', label: 'Restaurant & Bar', icon: Utensils, path: '/restaurant-bar-management' },
    { id: 'spa-wellness', label: 'Spa & Wellness', icon: Sparkles, path: '/spa-wellness' },
    { id: 'billing', label: 'Billing & Invoice', icon: FileText, path: '/billing-invoice' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/analytics' },
    { id: 'channel-manager', label: 'Channel Manager', icon: Globe, path: '/channel-manager' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];
  if (user) {
    sidebarItems.push({ id: 'logout', label: 'Logout', icon: LogOut, path: '/logout' });
  }

  const sidebarWidth = sidebarMinimized ? 'w-20' : 'w-72';

  const userInitials = (user?.name || 'G').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-[#0f2742] text-white shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:${sidebarWidth}`}
      onMouseEnter={() => setSidebarMinimized(false)}
      onMouseLeave={() => setSidebarMinimized(true)}
    >
      {/* Background decorative overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_34%),radial-gradient(circle_at_18%_0%,rgba(201,162,74,0.20),transparent_20rem)] pointer-events-none" />

      {/* Logo header */}
      <div className="relative flex items-center justify-between h-20 px-4 sm:px-5 border-b border-white/10 flex-shrink-0">
        {!sidebarMinimized && (
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-[#c9a24a]/20 border border-[#c9a24a]/30 flex items-center justify-center flex-shrink-0">
              <ChefHat className="h-5 w-5 text-[#f4d891]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide text-white leading-tight">The Luxury</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.14em]">Resort Operations Suite</p>
            </div>
          </div>
        )}
        {sidebarMinimized && (
          <div className="flex-1 flex justify-center h-10 w-10 rounded-lg bg-[#c9a24a]/20 border border-[#c9a24a]/30 flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-[#f4d891] flex-shrink-0" />
          </div>
        )}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className="hidden lg:flex h-7 w-7 items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            aria-label={sidebarMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex h-7 w-7 items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation — scrollable middle section */}
      <nav className="relative flex-1 overflow-y-auto mt-3 px-2.5 pb-3 space-y-2.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isLogout = item.id === 'logout';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isLogout) {
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
              className={`w-full flex items-center py-2.5 text-left transition-all duration-200 rounded-lg group relative overflow-hidden ${
                sidebarMinimized ? 'justify-center px-2' : 'px-3'
              } ${
                isActive
                  ? 'bg-white text-[#0f2742] shadow-md'
                  : isLogout
                  ? 'text-rose-300/80 hover:bg-rose-500/15 hover:text-rose-200'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={sidebarMinimized ? item.label : ''}
            >
              {/* Gold active pip */}
              {isActive && (
                <span className="absolute left-0 inset-y-[6px] w-[3px] rounded-r-full bg-[#c9a24a]" />
              )}
              <Icon
                size={18}
                className={`flex-shrink-0 ${sidebarMinimized ? '' : 'mr-3'} ${
                  isActive
                    ? 'text-[#c9a24a]'
                    : isLogout
                    ? 'text-rose-300/80 group-hover:text-rose-200'
                    : 'text-white/60 group-hover:text-[#f4d891]'
                }`}
              />
              {!sidebarMinimized && (
                <span className={`text-sm font-medium truncate ${isActive ? 'text-[#0f2742]' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {!user && (
          <div className="mt-3 space-y-1">
            <div className="hotel-divider-gold mx-2 my-2" />
            <button
              onClick={() => navigate('/login')}
              className="w-full text-left text-white/70 hover:text-white hover:bg-white/10 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full text-left text-white/70 hover:text-white hover:bg-white/10 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Register
            </button>
          </div>
        )}
      </nav>

      {/* User profile footer */}
      {user && (
        <div className="relative flex-shrink-0 border-t border-white/10 p-3">
          <div
            className={`flex items-center rounded-xl bg-white/8 hover:bg-white/12 transition-all duration-200 cursor-default p-2.5 ${
              sidebarMinimized ? 'justify-center' : 'space-x-3'
            }`}
          >
            <div className="h-8 w-8 rounded-lg bg-[#c9a24a] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold leading-none">{userInitials}</span>
            </div>
            {!sidebarMinimized && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">{user.name || 'User'}</p>
                <p className="text-[11px] text-white/50 truncate capitalize leading-tight mt-0.5">
                  {user.role === 'admin' ? 'Administrator' : user.role || 'Staff'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
