import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Package, 
  DollarSign, 
  Settings, 
  Menu,
  Briefcase,
  Heart 
} from 'lucide-react';
import Sidebar from '../Sidebar';
import AppointmentTracker from './AppointmentTracker';
import ServiceCatalog from './ServiceCatalog';
import TherapistScheduling from './TherapistScheduling';
import SpaRoomBooking from './SpaRoomBooking';
import PackageManagement from './PackageManagement';
import PackageBilling from './PackageBilling';

const SpaAndWellnessManagement = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const tabs = [
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: Calendar,
      component: AppointmentTracker,
      color: 'blue'
    },
    { 
      id: 'services', 
      label: 'Service Catalog', 
      icon: Sparkles,
      component: ServiceCatalog,
      color: 'purple'
    },
    { 
      id: 'therapists', 
      label: 'Therapists', 
      icon: Users,
      component: TherapistScheduling,
      color: 'pink'
    },
    { 
      id: 'rooms', 
      label: 'Spa Rooms', 
      icon: Settings,
      component: SpaRoomBooking,
      color: 'teal'
    },
    { 
      id: 'packages', 
      label: 'Packages', 
      icon: Package,
      component: PackageManagement,
      color: 'orange'
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: DollarSign,
      component: PackageBilling,
      color: 'green'
    },
  ];

  const getTabStyles = (tab, isActive) => {
    const colorMap = {
      blue: isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
      purple: isActive ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
      pink: isActive ? 'border-pink-500 text-pink-600 bg-pink-50' : 'border-transparent text-gray-500 hover:text-pink-600 hover:border-pink-300',
      teal: isActive ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-teal-600 hover:border-teal-300',
      orange: isActive ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300',
      green: isActive ? 'border-green-500 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300',
      indigo: isActive ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-indigo-600 hover:border-indigo-300',
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
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 rounded-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Spa & Wellness Management</h1>
                  <p className="text-gray-600">Comprehensive spa services and wellness management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6">
            <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${getTabStyles(tab, isActive)} 
                      flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm 
                      transition-all duration-200 rounded-t-lg whitespace-nowrap`}
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
            <div
              key={tab.id}
              className={activeTab === tab.id ? 'animate-fadeIn block' : 'hidden'}
            >
              <tab.component sidebarOpen={sidebarOpen} />
            </div>
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

export default SpaAndWellnessManagement;
