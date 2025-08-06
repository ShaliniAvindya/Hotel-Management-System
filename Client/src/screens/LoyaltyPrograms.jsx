import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Gift, 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Award,
  Calendar,
  DollarSign,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  Upload,
  Settings,
  Bell,
  Zap,
  Target,
  Crown,
  Badge,
  Percent,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Menu
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const LoyaltyPrograms = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('points');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Sample data for loyalty programs
  const loyaltyPrograms = [
    {
      id: 'premium',
      name: 'Premium Rewards',
      type: 'Points-based',
      active: true,
      members: 1247,
      pointsRate: '1 point per $1',
      tier: 'Premium',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      id: 'gold',
      name: 'Gold Members',
      type: 'Tier-based',
      active: true,
      members: 423,
      pointsRate: '2 points per $1',
      tier: 'Gold',
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    },
    {
      id: 'silver',
      name: 'Silver Circle',
      type: 'Tier-based',
      active: true,
      members: 856,
      pointsRate: '1.5 points per $1',
      tier: 'Silver',
      color: 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  ];

  // Sample customer data
  const customers = [
    {
      id: 'CU001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      program: 'Premium Rewards',
      tier: 'Premium',
      points: 2850,
      totalSpent: 4250,
      visits: 42,
      lastVisit: '2025-07-10',
      joinDate: '2024-03-15',
      status: 'active',
      avatar: 'SJ',
      birthday: '1988-05-22',
      preferences: ['Vegetarian', 'Wine Pairing'],
      recentOrders: [
        { date: '2025-07-10', amount: 85.50, points: 85 },
        { date: '2025-07-05', amount: 120.00, points: 120 },
        { date: '2025-06-28', amount: 95.75, points: 96 }
      ]
    },
    {
      id: 'CU002',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1-555-0456',
      program: 'Gold Members',
      tier: 'Gold',
      points: 4200,
      totalSpent: 6850,
      visits: 65,
      lastVisit: '2025-07-12',
      joinDate: '2024-01-20',
      status: 'active',
      avatar: 'MC',
      birthday: '1975-09-12',
      preferences: ['Seafood', 'Cocktails'],
      recentOrders: [
        { date: '2025-07-12', amount: 145.00, points: 290 },
        { date: '2025-07-08', amount: 78.25, points: 157 },
        { date: '2025-07-03', amount: 210.50, points: 421 }
      ]
    },
    {
      id: 'CU003',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      phone: '+1-555-0789',
      program: 'Silver Circle',
      tier: 'Silver',
      points: 1680,
      totalSpent: 2340,
      visits: 28,
      lastVisit: '2025-07-11',
      joinDate: '2024-06-10',
      status: 'active',
      avatar: 'ER',
      birthday: '1992-12-03',
      preferences: ['Desserts', 'Coffee'],
      recentOrders: [
        { date: '2025-07-11', amount: 65.00, points: 98 },
        { date: '2025-07-06', amount: 42.75, points: 64 },
        { date: '2025-06-30', amount: 89.50, points: 134 }
      ]
    },
    {
      id: 'CU004',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1-555-0321',
      program: 'Premium Rewards',
      tier: 'Premium',
      points: 3420,
      totalSpent: 5680,
      visits: 48,
      lastVisit: '2025-07-09',
      joinDate: '2024-02-28',
      status: 'inactive',
      avatar: 'DW',
      birthday: '1985-07-18',
      preferences: ['Steaks', 'Red Wine'],
      recentOrders: [
        { date: '2025-07-09', amount: 156.00, points: 156 },
        { date: '2025-06-25', amount: 98.50, points: 99 },
        { date: '2025-06-18', amount: 234.75, points: 235 }
      ]
    }
  ];

  // Sample rewards data
  const rewards = [
    {
      id: 'RW001',
      name: 'Free Appetizer',
      description: 'Choose any appetizer from our menu',
      pointsCost: 500,
      category: 'Food',
      active: true,
      redeemed: 145,
      expires: '2025-12-31'
    },
    {
      id: 'RW002',
      name: '15% Off Dinner',
      description: 'Discount on dinner orders over $50',
      pointsCost: 750,
      category: 'Discount',
      active: true,
      redeemed: 89,
      expires: '2025-12-31'
    },
    {
      id: 'RW003',
      name: 'Complimentary Dessert',
      description: 'Free dessert with any main course',
      pointsCost: 400,
      category: 'Food',
      active: true,
      redeemed: 203,
      expires: '2025-12-31'
    },
    {
      id: 'RW004',
      name: 'Wine Tasting for Two',
      description: 'Exclusive wine tasting experience',
      pointsCost: 1500,
      category: 'Experience',
      active: true,
      redeemed: 23,
      expires: '2025-12-31'
    }
  ];

  // Analytics data
  const analytics = {
    totalMembers: 2526,
    activeMembers: 1892,
    pointsIssued: 125840,
    pointsRedeemed: 89620,
    revenue: 285600,
    avgOrderValue: 78.50,
    memberRetention: 87.3,
    programROI: 340
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesProgram = selectedProgram === 'all' || customer.program === selectedProgram;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'points':
        return b.points - a.points;
      case 'spent':
        return b.totalSpent - a.totalSpent;
      case 'visits':
        return b.visits - a.visits;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalMembers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeMembers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Points Issued</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.pointsIssued.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15.8%</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue Impact</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.revenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+22.1%</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loyaltyPrograms.map((program) => (
          <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`${program.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-white" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{program.name}</h3>
                    <p className="text-sm text-white/80">{program.type}</p>
                  </div>
                </div>
                <Badge className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Members</span>
                  <span className="text-sm font-medium text-gray-900">{program.members.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points Rate</span>
                  <span className="text-sm font-medium text-gray-900">{program.pointsRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${program.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {program.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors">
                  Manage Program
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New member joined Premium Rewards</p>
              <p className="text-xs text-gray-600">Sarah Johnson • 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Reward redeemed</p>
              <p className="text-xs text-gray-600">Michael Chen redeemed Wine Tasting for Two • 4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Points earned</p>
              <p className="text-xs text-gray-600">Emma Rodriguez earned 98 points • 1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Programs</option>
              {loyaltyPrograms.map((program) => (
                <option key={program.id} value={program.name}>{program.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="points">Sort by Points</option>
              <option value="spent">Sort by Spent</option>
              <option value="visits">Sort by Visits</option>
              <option value="name">Sort by Name</option>
            </select>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2 inline" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Program</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Points</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Visits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCustomers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{customer.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTierColor(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">{customer.points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">${customer.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{customer.visits}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setShowRewardModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Gift className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedCustomer === customer.id && (
                    <tr>
                      <td colSpan="7" className="py-4 px-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Member Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{customer.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>Joined: {customer.joinDate}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>Last Visit: {customer.lastVisit}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Recent Orders</h4>
                            <div className="space-y-2">
                              {customer.recentOrders.slice(0, 3).map((order, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">{order.date}</span>
                                  <span className="text-gray-900">${order.amount}</span>
                                  <span className="text-blue-600">+{order.points} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Rewards Catalog</h2>
        <button 
          onClick={() => setShowRewardModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Add Reward
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Gift className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{reward.name}</h3>
                    <p className="text-sm text-gray-600">{reward.category}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-900">{reward.pointsCost}</span>
                  <span className="text-sm text-gray-600">points</span>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${reward.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {reward.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Times Redeemed</span>
                  <span className="text-gray-900">{reward.redeemed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expires</span>
                  <span className="text-gray-900">{reward.expires}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Edit className="h-4 w-4 mr-1 inline" />
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Eye className="h-4 w-4 mr-1 inline" />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Member Retention</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.memberRetention}%</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.avgOrderValue}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Program ROI</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.programROI}%</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Points Redeemed</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.pointsRedeemed.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Distribution</h3>
          <div className="space-y-4">
            {loyaltyPrograms.map((program, index) => (
              <div key={program.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${program.color.replace('bg-gradient-to-r', 'bg-purple-500')}`}></div>
                  <span className="text-sm font-medium text-gray-900">{program.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{program.members}</p>
                  <p className="text-xs text-gray-600">{((program.members / analytics.totalMembers) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rewards</h3>
          <div className="space-y-4">
            {rewards.slice(0, 4).map((reward, index) => (
              <div key={reward.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Gift className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reward.name}</p>
                    <p className="text-xs text-gray-600">{reward.pointsCost} points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{reward.redeemed}</p>
                  <p className="text-xs text-gray-600">redeemed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Points</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-4 text-sm text-gray-900">2025-07-12</td>
                <td className="py-3 px-4 text-sm text-gray-900">Michael Chen</td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Redeemed
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">-1500</td>
                <td className="py-3 px-4 text-sm text-gray-600">Wine Tasting for Two</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-900">2025-07-12</td>
                <td className="py-3 px-4 text-sm text-gray-900">Sarah Johnson</td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Earned
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">+85</td>
                <td className="py-3 px-4 text-sm text-gray-600">Dinner purchase</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-900">2025-07-11</td>
                <td className="py-3 px-4 text-sm text-gray-900">Emma Rodriguez</td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Redeemed
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">-400</td>
                <td className="py-3 px-4 text-sm text-gray-600">Complimentary Dessert</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Reward Modal Component
  const RewardModal = ({ isOpen, onClose, customer }) => {
    const [selectedReward, setSelectedReward] = useState('');
    const [customPoints, setCustomPoints] = useState('');
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {customer ? `Award Points to ${customer.name}` : 'Award Points'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Rewards
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rewards.slice(0, 4).map((reward) => (
                  <button
                    key={reward.id}
                    onClick={() => setSelectedReward(reward.id)}
                    className={`p-3 border rounded-lg text-sm ${
                      selectedReward === reward.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{reward.name}</div>
                    <div className="text-xs text-gray-600">{reward.pointsCost} pts</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Points
              </label>
              <input
                type="number"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="Enter points amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional reason for awarding points..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle award logic here
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Award Points
            </button>
          </div>
        </div>
      </div>
    );
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('LoyaltyPrograms rendering');

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
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
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
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loyalty Programs</h1>
                    <p className="text-sm text-gray-600">Manage customer rewards and loyalty programs</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Star },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'rewards', label: 'Rewards', icon: Gift },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'members' && renderMembers()}
          {activeTab === 'rewards' && renderRewards()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>

        {/* Reward Modal */}
        <RewardModal 
          isOpen={showRewardModal} 
          onClose={() => setShowRewardModal(false)}
          customer={selectedCustomer}
        />

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

export default LoyaltyPrograms;