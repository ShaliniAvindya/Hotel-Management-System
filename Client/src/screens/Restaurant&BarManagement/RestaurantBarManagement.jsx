import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Camera,
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
  Wine,
  ChefHat,
  ClipboardList,
  Monitor,
  Receipt
} from 'lucide-react';
import Sidebar from '../Sidebar';
import MenuManagement from './MenuManagement';
import OrderManagement from './OrderManagement';
import BarOperations from './BarOperations';
import KitchenDisplay from './KitchenDisplay';

const RestaurantBarManagement = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const tabs = [
    { 
      id: 'menu', 
      label: 'Menu Management', 
      icon: Utensils,
      component: MenuManagement,
      color: 'blue',
      description: 'Manage dishes, beverages, pricing & categories'
    },
    { 
      id: 'orders', 
      label: 'Order Management', 
      icon: ClipboardList,
      component: OrderManagement,
      color: 'green',
      description: 'Handle dine-in, room service & takeaway orders'
    },
    { 
      id: 'bar', 
      label: 'Bar Operations', 
      icon: Wine,
      component: BarOperations,
      color: 'purple',
      description: 'Bar stock, cocktails & mini-bar management'
    },
    { 
      id: 'kitchen', 
      label: 'Kitchen Display (KDS)', 
      icon: Monitor,
      component: KitchenDisplay,
      color: 'orange',
      description: 'Kitchen order tickets & status tracking'
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

      <div className={`flex-1 ${mainMargin} transition-all duration-300 overflow-auto`}>
        {/* Header with Restaurant/Bar Info */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 sm:p-3 rounded-xl flex-shrink-0">
                  <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Restaurant & Bar Management</h1>
                  <p className="text-sm sm:text-base text-gray-600">Complete F&B operations dashboard</p>
                </div>
              </div>
              
             </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 overflow-x-auto">
            <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${getTabStyles(tab, isActive)} 
                      flex items-center space-x-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-medium text-sm 
                      transition-all duration-200 rounded-t-lg group relative`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      {tab.description}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 sm:p-6">
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

export default RestaurantBarManagement;