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
  Info,
  Briefcase,
} from 'lucide-react';
import Sidebar from '../Sidebar';
import RoomInventory from './RoomInventory';
import AvailabilityCalendar from './AvailabilityCalender';
import RoomStatus from './RoomStatus';
import RoomRate from './RoomRate';
import Maintenance from './Maintenance';
import ConciergeServices from './Concierge/ConciergeServices';

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
    { 
      id: 'concierge', 
      label: 'Concierge Services', 
      icon: Briefcase,
      component: ConciergeServices,
      color: 'red'
    },
  ];

  const getTabStyles = (tab, isActive) => {
    return isActive
      ? 'bg-[#0f2742] text-white border-[#c9a24a] shadow-sm'
      : 'bg-white text-slate-600 border-slate-200 hover:text-[#0f2742] hover:border-[#c9a24a] hover:bg-[#fffaf0]';
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72';

  return (
    <div className="hotel-page flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        <div className="bg-white/88 backdrop-blur-xl shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-slate-100"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-[#0f2742] p-3 rounded-lg shadow-lg">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#9a7624] font-semibold">Rooms Division</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Room Management</h1>
                  <p className="text-gray-600">Inventory, rates, housekeeping status and maintenance control.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2 text-sm">
                <button onClick={() => setActiveTab('inventory')} className="hotel-button-primary px-4 py-2">Manage Rooms</button>
                <button onClick={() => setActiveTab('status')} className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-[#fffaf0] text-slate-700">Room Status</button>
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-4 overflow-x-auto">
            <nav className="flex gap-2 min-w-max" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${getTabStyles(tab, isActive)} 
                      hotel-tab flex items-center space-x-2 px-4 py-3 border font-medium text-sm`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
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
            className="fixed inset-0 bg-[#0f2742]/45 backdrop-blur-sm z-40 lg:hidden"
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
