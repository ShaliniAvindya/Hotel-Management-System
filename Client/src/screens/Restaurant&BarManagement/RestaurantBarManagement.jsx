import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Utensils,
  ClipboardList,
  Wine,
  Monitor,
  Menu,
} from 'lucide-react';
import Sidebar from '../Sidebar';
const MenuManagement = lazy(() => import('./MenuManagement'));
const OrderManagement = lazy(() => import('./OrderManagement'));
const BarOperations = lazy(() => import('./BarOperations'));
const KitchenDisplay = lazy(() => import('./KitchenDisplay'));

const RestaurantBarManagement = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  useEffect(() => {
    const preloadTabs = async () => {
      await Promise.all([
        import('./MenuManagement'),
        import('./OrderManagement'),
        import('./BarOperations'),
        import('./KitchenDisplay'),
      ]);
    };

    preloadTabs();
  }, []);

  const tabs = [
    {
      id: 'menu',
      label: 'Menu Management',
      icon: Utensils,
      component: MenuManagement,
      description: 'Manage dishes, beverages, pricing & categories',
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ClipboardList,
      component: OrderManagement,
      description: 'Handle dine-in, room service & takeaway orders',
    },
    {
      id: 'bar',
      label: 'Bar Operations',
      icon: Wine,
      component: BarOperations,
      description: 'Bar stock, cocktails & mini-bar management',
    },
    {
      id: 'kitchen',
      label: 'Kitchen Display (KDS)',
      icon: Monitor,
      component: KitchenDisplay,
      description: 'Kitchen order tickets & status tracking',
    },
  ];

  const getTabStyles = (isActive) =>
    isActive
      ? 'bg-[#0f2742] text-white border-[#c9a24a] shadow-sm'
      : 'bg-white text-slate-600 border-slate-200 hover:text-[#0f2742] hover:border-[#c9a24a] hover:bg-[#fffaf0]';

  const mainMargin = sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72';

  return (
    <div className="hotel-page flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 ${mainMargin} transition-all duration-300 overflow-auto`}>
        {/* Unified sticky header + tabs */}
        <div className="bg-[#0f2742] shadow-sm border-b border-[#c9a24a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-white/10 p-3 rounded-lg shadow-lg">
                  <UtensilsCrossed className="h-7 w-7 text-[#c9a24a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#c9a24a] font-medium">Food & Beverage</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Restaurant & Bar</h1>
                  <p className="text-sm text-white/60">Complete F&amp;B operations dashboard.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-4 pt-2 overflow-x-auto">
            <nav className="flex gap-2 min-w-max" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${getTabStyles(isActive)} hotel-tab flex items-center space-x-2 px-4 py-2.5 border font-medium text-sm group relative`}
                    title={tab.description}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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
                <div className="h-40 rounded-xl hotel-skeleton" />
                <div className="h-40 rounded-xl hotel-skeleton" />
                <div className="h-40 rounded-xl hotel-skeleton" />
              </div>
            }
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={activeTab === tab.id ? 'block' : 'hidden'}
              >
                {activeTab === tab.id ? <tab.component /> : null}
              </div>
            ))}
          </Suspense>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#0f2742]/45 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RestaurantBarManagement;
