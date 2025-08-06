import React, { useState } from 'react';
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Camera,
  Bed,
  Users,
  Wifi,
  Tv,
  Car,
  Coffee,
  Bath,
  AirVent,
  Phone,
  Utensils,
  Star,
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
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
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
  Info
} from 'lucide-react';
import Sidebar from '../Sidebar';
import RoomInventory from './RoomInventory';
import AvailabilityCalendar from './AvailabilityCalender';
import RoomStatus from './RoomStatus';
import RoomRate from './RoomRate';
import Maintenance from './Maintenance';

const RoomManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const tabs = [
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Bed,
      component: RoomInventory,
      color: 'blue'
    },
    { 
      id: 'calendar', 
      label: 'Availability Calendar', 
      icon: Calendar,
      component: AvailabilityCalendar,
      color: 'green'
    },
    { 
      id: 'status', 
      label: 'Status', 
      icon: CheckCircle,
      component: RoomStatus,
      color: 'yellow'
    },
    { 
      id: 'rates', 
      label: 'Rates', 
      icon: DollarSign,
      component: RoomRate,
      color: 'purple'
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench,
      component: Maintenance,
      color: 'orange'
    },
  ];

  const getTabStyles = (tab, isActive) => {
    const colorMap = {
      blue: isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
      green: isActive ? 'border-green-500 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300',
      yellow: isActive ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 'border-transparent text-gray-500 hover:text-yellow-600 hover:border-yellow-300',
      purple: isActive ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
      orange: isActive ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300',
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                  <p className="text-gray-600">Comprehensive room management dashboard</p>
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

        {/* Mobile sidebar overlay */}
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

export default RoomManagement;