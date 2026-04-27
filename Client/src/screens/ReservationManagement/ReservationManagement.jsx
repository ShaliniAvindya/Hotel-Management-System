import React, { Suspense, lazy, useEffect, useState } from 'react';
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
const BookingManagement = lazy(() => import('./BookingManagement'));
const GuestManagement = lazy(() => import('./GuestManagement'));
const CheckInOut = lazy(() => import('./CheckInOut'));
const CancellationsNoShows = lazy(() => import('./CancellationsNoShows'));
const SpecialRequests = lazy(() => import('./SpecialRequests'));

const ReservationManagement = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  useEffect(() => {
    const preloadTabs = async () => {
      await Promise.all([
        import('./BookingManagement'),
        import('./GuestManagement'),
        import('./CheckInOut'),
        import('./CancellationsNoShows'),
        import('./SpecialRequests'),
      ]);
    };
    preloadTabs();
  }, []);

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
    return isActive
      ? 'bg-[#0f2742] text-white border-[#c9a24a] shadow-sm'
      : 'bg-white text-slate-600 border-slate-200 hover:text-[#0f2742] hover:border-[#c9a24a] hover:bg-[#fffaf0]';
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72';
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveTabComponent = activeTabConfig.component;

  return (
    <div className="hotel-page flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        <div className="bg-[#0f2742] shadow-sm border-b border-[#c9a24a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-white/10 p-3 rounded-lg shadow-lg">
                  <Calendar className="h-8 w-8 text-[#c9a24a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#c9a24a] font-medium">Front Desk</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Reservation Management</h1>
                  <p className="text-white/60">Fast booking, check-in, guest requests and cancellations.</p>
                </div>
              </div>
              {/* <div className="grid grid-cols-2 sm:flex gap-2 text-sm">
                <button onClick={() => setActiveTab('booking')} className="bg-[#c9a24a] text-[#0f2742] rounded-lg font-medium hover:bg-[#d4b55f] transition-colors shadow-sm border border-[#c9a24a] px-4 py-2">New Booking</button>
                <button onClick={() => setActiveTab('checkinout')} className="px-4 py-2 rounded-lg border border-[#c9a24a]/30 bg-white/10 hover:bg-white/20 text-white">Check-In Desk</button>
              </div> */}
            </div>
          </div>

          <div className="px-4 sm:px-6 pt-2 pb-5 overflow-x-auto">
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
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="h-40 rounded-xl bg-white shadow-sm" />
                <div className="h-40 rounded-xl bg-white shadow-sm" />
                <div className="h-40 rounded-xl bg-white shadow-sm" />
              </div>
            }
          >
            <div>
              <ActiveTabComponent />
            </div>
          </Suspense>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#0f2742]/45 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement;
