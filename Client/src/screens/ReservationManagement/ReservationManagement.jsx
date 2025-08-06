import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Edit,
  Plus,
  Search,
  Filter,
  Upload,
  Camera,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Eye,
  X,
  Save,
  RefreshCw,
  Grid,
  List,
  ChevronDown,
  Menu,
  ImageIcon,
  AlertCircle,
  Shield,
  Thermometer,
  Volume2,
  Baby,
  Accessibility,
  PawPrint,
  Mountain,
  Waves,
  TreePine,
  Sparkles,
  Sofa,
  Microwave,
  Refrigerator,
  WashingMachine,
  Shirt,
  Wind,
  Sun,
  ChevronLeft,
  ChevronRight,
  Settings,
  AlertTriangle,
  Wrench,
  Info,
  FileText,
  Heart,
  Gift,
  Bell
} from 'lucide-react';
import Sidebar from '../Sidebar';
import BookingManagement from './BookingManagement';
import GuestManagement from './GuestManagement';
import CheckInOut from './CheckInOut';
import CancellationsNoShows from './CancellationsNoShows';
import SpecialRequests from './SpecialRequests';

const ReservationManagement = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const tabs = [
    { 
      id: 'booking', 
      label: 'Booking Management', 
      icon: Calendar,
      component: BookingManagement,
      color: 'blue'
    },
    { 
      id: 'guests', 
      label: 'Guest Management', 
      icon: Users,
      component: GuestManagement,
      color: 'purple'
    },
    { 
      id: 'checkinout', 
      label: 'Check-In / Check-Out', 
      icon: UserCheck,
      component: CheckInOut,
      color: 'teal'
    },
    { 
      id: 'cancellations', 
      label: 'Cancellations & No-Shows', 
      icon: XCircle,
      component: CancellationsNoShows,
      color: 'red'
    },
    { 
      id: 'requests', 
      label: 'Special Requests', 
      icon: Heart,
      component: SpecialRequests,
      color: 'pink'
    },
  ];

  const getTabStyles = (tab, isActive) => {
    const colorMap = {
      blue: isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
      green: isActive ? 'border-green-500 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300',
      purple: isActive ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
      teal: isActive ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-teal-600 hover:border-teal-300',
      red: isActive ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-300',
      pink: isActive ? 'border-pink-500 text-pink-600 bg-pink-50' : 'border-transparent text-gray-500 hover:text-pink-600 hover:border-pink-300',
    };
    return colorMap[tab.color];
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        {/* Header with Tabs */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Reservation Management</h1>
                  <p className="text-gray-600">Comprehensive reservation and guest management system</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-5">
          <div className="px-6">
            <nav className="flex space-x-1" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${getTabStyles(tab, isActive)} 
                      flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm 
                      transition-all duration-200 rounded-t-lg`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {tabs.map((tab) => (
            activeTab === tab.id && (
              <div key={tab.id} className="animate-fadeIn">
                <tab.component />
              </div>
            )
          ))}
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReservationManagement;