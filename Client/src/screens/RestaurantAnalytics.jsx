import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  Star, 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  Utensils,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Package,
  UserCheck,
  Eye,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  Salad,
  Wine,
  Pizza,
  Menu,
  X
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const RestaurantAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const periods = [
    { value: '1day', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$48,562',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      previous: '$43,210',
      target: '$50,000'
    },
    {
      title: 'Total Orders',
      value: '1,247',
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      previous: '1,152',
      target: '1,300'
    },
    {
      title: 'Average Order Value',
      value: '$38.95',
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
      previous: '$37.75',
      target: '$40.00'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7/5',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'bg-orange-500',
      previous: '4.5/5',
      target: '4.8/5'
    },
    {
      title: 'Table Turnover',
      value: '3.2',
      change: '+0.3',
      trend: 'up',
      icon: Clock,
      color: 'bg-indigo-500',
      previous: '2.9',
      target: '3.5'
    },
    {
      title: 'Food Cost %',
      value: '28.5%',
      change: '-1.2%',
      trend: 'up',
      icon: Package,
      color: 'bg-green-500',
      previous: '29.7%',
      target: '27.0%'
    }
  ];

  const salesData = [
    { time: '9:00', revenue: 1200, orders: 45 },
    { time: '10:00', revenue: 1800, orders: 68 },
    { time: '11:00', revenue: 2400, orders: 92 },
    { time: '12:00', revenue: 4200, orders: 158 },
    { time: '13:00', revenue: 3800, orders: 145 },
    { time: '14:00', revenue: 2100, orders: 78 },
    { time: '15:00', revenue: 1500, orders: 56 },
    { time: '16:00', revenue: 1800, orders: 67 },
    { time: '17:00', revenue: 2800, orders: 105 },
    { time: '18:00', revenue: 4500, orders: 172 },
    { time: '19:00', revenue: 5200, orders: 198 },
    { time: '20:00', revenue: 4800, orders: 184 },
    { time: '21:00', revenue: 3600, orders: 138 },
    { time: '22:00', revenue: 2400, orders: 89 }
  ];

  const topItems = [
    { name: 'Signature Burger', sales: 234, revenue: '$3,276', icon: Pizza, change: '+15%' },
    { name: 'Caesar Salad', sales: 187, revenue: '$2,618', icon: Salad, change: '+8%' },
    { name: 'Grilled Salmon', sales: 156, revenue: '$4,368', icon: Coffee, change: '+12%' },
    { name: 'Pasta Carbonara', sales: 143, revenue: '$2,574', icon: Utensils, change: '+5%' },
    { name: 'House Wine', sales: 267, revenue: '$4,005', icon: Wine, change: '+22%' }
  ];

  const customerMetrics = [
    { label: 'New Customers', value: '342', change: '+18.5%', trend: 'up' },
    { label: 'Returning Customers', value: '567', change: '+12.2%', trend: 'up' },
    { label: 'Customer Retention', value: '68.2%', change: '+4.1%', trend: 'up' },
    { label: 'Average Visit Frequency', value: '2.3x', change: '+0.2x', trend: 'up' }
  ];

  const operationalData = [
    { metric: 'Order Accuracy', value: '98.5%', target: '99.0%', status: 'good' },
    { metric: 'Average Prep Time', value: '12 min', target: '10 min', status: 'warning' },
    { metric: 'Staff Efficiency', value: '87.3%', target: '85.0%', status: 'excellent' },
    { metric: 'Waste Percentage', value: '3.2%', target: '2.5%', status: 'warning' }
  ];

  const recentAlerts = [
    { type: 'warning', message: 'Prep time exceeded target during lunch rush', time: '2 hours ago' },
    { type: 'success', message: 'Daily revenue target achieved', time: '3 hours ago' },
    { type: 'info', message: 'New customer review: 5 stars', time: '4 hours ago' },
    { type: 'warning', message: 'Low stock: Premium beef', time: '5 hours ago' }
  ];

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('RestaurantAnalytics rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50`}>
        {/* Header */}
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    console.log('Opening sidebar');
                    setSidebarOpen(true);
                  }}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-gray-600 mt-2">Comprehensive insights and reporting for restaurant performance</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {periods.map(period => (
                      <option key={period.value} value={period.value}>{period.label}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={refreshData}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Previous: {kpi.previous}</span>
                    <span>Target: {kpi.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Orders Trend</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="h-80 flex items-end space-x-2">
                {salesData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                        style={{ height: `${(data.revenue / 5200) * 100}%` }}
                      ></div>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg opacity-60"
                        style={{ height: `${(data.orders / 200) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.time}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Orders</span>
                </div>
              </div>
            </div>

            {/* Top Performing Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Items</h3>
                <button 
                  onClick={() => toggleCard('topItems')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  {expandedCards.topItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.sales} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{item.revenue}</p>
                      <p className="text-xs text-green-600">{item.change}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {expandedCards.topItems && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Full Menu Analytics
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Customer Analytics & Operational Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Customer Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Analytics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {customerMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Operational Efficiency</h3>
              
              <div className="space-y-4">
                {operationalData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{data.metric}</p>
                      <p className="text-xs text-gray-600">Target: {data.target}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{data.value}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(data.status)}`}>
                        {data.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Alerts & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Reports</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                  <BarChart3 className="h-8 w-8 text-blue-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Sales Report</p>
                </button>
                
                <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group">
                  <Users className="h-8 w-8 text-emerald-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Customer Report</p>
                </button>
                
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                  <Package className="h-8 w-8 text-purple-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Inventory Report</p>
                </button>
                
                <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
                  <UserCheck className="h-8 w-8 text-orange-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Staff Report</p>
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Generate Custom Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => {
              console.log('Closing sidebar');
              setSidebarOpen(false);
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAnalytics;