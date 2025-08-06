import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Star,
  DollarSign,
  Award,
  Activity,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  Menu
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Sample staff data
  const [staffMembers, setStaffMembers] = useState([
    {
      id: 'EMP001',
      name: 'Sarah Johnson',
      role: 'Head Chef',
      department: 'Kitchen',
      email: 'sarah.j@restaurant.com',
      phone: '+1-555-0123',
      avatar: 'SJ',
      status: 'active',
      shift: 'Morning',
      hourlyRate: 28,
      hoursWorked: 42,
      performance: 4.8,
      joinDate: '2023-01-15',
      lastActive: '2 hours ago',
      skills: ['Culinary Arts', 'Team Leadership', 'Menu Planning']
    },
    {
      id: 'EMP002',
      name: 'Michael Chen',
      role: 'Sous Chef',
      department: 'Kitchen',
      email: 'michael.c@restaurant.com',
      phone: '+1-555-0456',
      avatar: 'MC',
      status: 'active',
      shift: 'Evening',
      hourlyRate: 22,
      hoursWorked: 38,
      performance: 4.6,
      joinDate: '2023-03-20',
      lastActive: '1 hour ago',
      skills: ['Food Preparation', 'Inventory Management', 'Quality Control']
    },
    {
      id: 'EMP003',
      name: 'Emma Rodriguez',
      role: 'Server',
      department: 'Front of House',
      email: 'emma.r@restaurant.com',
      phone: '+1-555-0789',
      avatar: 'ER',
      status: 'active',
      shift: 'Evening',
      hourlyRate: 15,
      hoursWorked: 35,
      performance: 4.9,
      joinDate: '2023-02-10',
      lastActive: '30 minutes ago',
      skills: ['Customer Service', 'POS Systems', 'Wine Knowledge']
    },
    {
      id: 'EMP004',
      name: 'David Wilson',
      role: 'Bartender',
      department: 'Bar',
      email: 'david.w@restaurant.com',
      phone: '+1-555-0321',
      avatar: 'DW',
      status: 'active',
      shift: 'Night',
      hourlyRate: 18,
      hoursWorked: 40,
      performance: 4.7,
      joinDate: '2023-04-05',
      lastActive: '1 day ago',
      skills: ['Mixology', 'Inventory', 'Customer Relations']
    },
    {
      id: 'EMP005',
      name: 'Lisa Park',
      role: 'Server',
      department: 'Front of House',
      email: 'lisa.p@restaurant.com',
      phone: '+1-555-0654',
      avatar: 'LP',
      status: 'off',
      shift: 'Morning',
      hourlyRate: 15,
      hoursWorked: 0,
      performance: 4.4,
      joinDate: '2023-05-12',
      lastActive: '3 days ago',
      skills: ['Customer Service', 'Order Management', 'Team Collaboration']
    },
    {
      id: 'EMP006',
      name: 'James Thompson',
      role: 'Kitchen Assistant',
      department: 'Kitchen',
      email: 'james.t@restaurant.com',
      phone: '+1-555-0987',
      avatar: 'JT',
      status: 'active',
      shift: 'Morning',
      hourlyRate: 16,
      hoursWorked: 36,
      performance: 4.3,
      joinDate: '2023-06-01',
      lastActive: '4 hours ago',
      skills: ['Food Prep', 'Cleaning', 'Equipment Operation']
    }
  ]);

  // Sample shift schedule data
  const [shifts, setShifts] = useState([
    {
      id: 'SH001',
      staffId: 'EMP001',
      date: '2025-07-13',
      startTime: '06:00',
      endTime: '14:00',
      status: 'scheduled',
      position: 'Head Chef',
      notes: 'Menu planning session at 7 AM'
    },
    {
      id: 'SH002',
      staffId: 'EMP002',
      date: '2025-07-13',
      startTime: '14:00',
      endTime: '22:00',
      status: 'scheduled',
      position: 'Sous Chef',
      notes: 'Evening service lead'
    },
    {
      id: 'SH003',
      staffId: 'EMP003',
      date: '2025-07-13',
      startTime: '17:00',
      endTime: '23:00',
      status: 'scheduled',
      position: 'Server',
      notes: 'Section A tables'
    },
    {
      id: 'SH004',
      staffId: 'EMP004',
      date: '2025-07-13',
      startTime: '19:00',
      endTime: '02:00',
      status: 'scheduled',
      position: 'Bartender',
      notes: 'Happy hour and evening service'
    }
  ]);

  const roles = ['all', 'Head Chef', 'Sous Chef', 'Server', 'Bartender', 'Kitchen Assistant', 'Manager'];
  const departments = ['Kitchen', 'Front of House', 'Bar', 'Management'];
  const statuses = ['all', 'active', 'off', 'vacation', 'sick'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'off': return 'bg-gray-100 text-gray-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getShiftForDate = (staffId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.find(shift => shift.staffId === staffId && shift.date === dateStr);
  };

  const AddStaffModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      role: '',
      department: '',
      email: '',
      phone: '',
      hourlyRate: '',
      skills: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newStaff = {
        id: `EMP${String(staffMembers.length + 1).padStart(3, '0')}`,
        ...formData,
        avatar: formData.name.split(' ').map(n => n[0]).join(''),
        status: 'active',
        shift: 'Morning',
        hoursWorked: 0,
        performance: 4.0,
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
        skills: formData.skills.split(',').map(s => s.trim())
      };
      
      setStaffMembers([...staffMembers, newStaff]);
      setShowAddStaff(false);
      setFormData({
        name: '',
        role: '',
        department: '',
        email: '',
        phone: '',
        hourlyRate: '',
        skills: ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add New Staff Member</h2>
            <button onClick={() => setShowAddStaff(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Role</option>
                  {roles.slice(1).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Customer Service, POS Systems, Wine Knowledge"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddStaff(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Staff Member
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ScheduleModal = () => {
    const [scheduleData, setScheduleData] = useState({
      staffId: '',
      date: selectedDate.toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      position: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newShift = {
        id: `SH${String(shifts.length + 1).padStart(3, '0')}`,
        ...scheduleData,
        status: 'scheduled'
      };
      
      setShifts([...shifts, newShift]);
      setShowScheduleModal(false);
      setScheduleData({
        staffId: '',
        date: selectedDate.toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        position: '',
        notes: ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Schedule Shift</h2>
            <button onClick={() => setShowScheduleModal(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
              <select
                required
                value={scheduleData.staffId}
                onChange={(e) => setScheduleData({...scheduleData, staffId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Staff Member</option>
                {staffMembers.filter(staff => staff.status === 'active').map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name} - {staff.role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={scheduleData.date}
                onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData({...scheduleData, startTime: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={scheduleData.endTime}
                  onChange={(e) => setScheduleData({...scheduleData, endTime: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={scheduleData.position}
                onChange={(e) => setScheduleData({...scheduleData, position: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Section A Server, Kitchen Lead"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes or instructions"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Shift
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const StaffOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staffMembers.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">{staffMembers.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled Shifts</p>
              <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">4.6</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role === 'all' ? 'All Roles' : role}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          
          <button
            onClick={() => setShowAddStaff(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Staff List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(staff => (
            <div key={staff.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{staff.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-600">{staff.role}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(staff.status)}`}>
                    {staff.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Department</span>
                  <span className="text-sm text-gray-900">{staff.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Performance</span>
                  <div className="flex items-center space-x-1">
                    <Star className={`h-4 w-4 ${getPerformanceColor(staff.performance)}`} />
                    <span className={`text-sm ${getPerformanceColor(staff.performance)}`}>{staff.performance}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hours/Week</span>
                  <span className="text-sm text-gray-900">{staff.hoursWorked}h</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{staff.avatar}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Star className={`h-4 w-4 ${getPerformanceColor(staff.performance)}`} />
                        <span className={`text-sm ${getPerformanceColor(staff.performance)}`}>{staff.performance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.hoursWorked}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-green-600 hover:text-green-900">Schedule</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const ScheduleView = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekDays = Array.from({length: 7}, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    const timeSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00', '22:00', '23:00'
    ];

    return (
      <div className="space-y-6">
        {/* Schedule Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
              {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Shift</span>
            </button>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-8 gap-0 border-b border-gray-200">
            <div className="p-4 bg-gray-50 font-medium text-sm text-gray-700">Time</div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-4 bg-gray-50 text-center">
                <div className="font-medium text-sm text-gray-900">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 gap-0 border-b border-gray-100 last:border-b-0">
                <div className="p-3 bg-gray-50 text-sm text-gray-600 font-medium">{time}</div>
                {weekDays.map(day => {
                  const dayShifts = shifts.filter(shift => {
                    const shiftDate = new Date(shift.date);
                    return shiftDate.toDateString() === day.toDateString() &&
                           shift.startTime <= time && shift.endTime > time;
                  });
                  
                  return (
                    <div key={`${day.toISOString()}-${time}`} className="p-2 min-h-[60px] border-r border-gray-100 last:border-r-0">
                      {dayShifts.map(shift => {
                        const staff = staffMembers.find(s => s.id === shift.staffId);
                        return (
                          <div key={shift.id} className="mb-1 p-2 bg-blue-100 rounded text-xs">
                            <div className="font-medium text-blue-900">{staff?.name}</div>
                            <div className="text-blue-700">{shift.position}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Shifts Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Shifts</h3>
          <div className="space-y-3">
            {shifts.filter(shift => shift.date === new Date().toISOString().split('T')[0]).map(shift => {
              const staff = staffMembers.find(s => s.id === shift.staffId);
              return (
                <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{staff?.avatar}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{staff?.name}</div>
                      <div className="text-sm text-gray-600">{shift.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {shift.startTime} - {shift.endTime}
                    </div>
                    <div className="text-xs text-gray-600">{shift.notes}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const TimeTracking = () => (
    <div className="space-y-6">
      {/* Time Tracking Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Time Tracking</h2>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Refresh
          </button>
        </div>
      </div>

      {/* Clock In/Out Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffMembers.filter(staff => staff.status === 'active').map(staff => (
          <div key={staff.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{staff.avatar}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                  <p className="text-sm text-gray-600">{staff.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clock In</span>
                <span className="text-sm font-medium text-gray-900">08:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hours Today</span>
                <span className="text-sm font-medium text-gray-900">6.5h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Break Time</span>
                <span className="text-sm font-medium text-gray-900">45m</span>
              </div>
            </div>
            
            <button className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
              Clock Out
            </button>
          </div>
        ))}
      </div>

      {/* Weekly Hours Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Hours Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Staff Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Regular Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Overtime</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Gross Pay</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map(staff => (
                <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{staff.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-600">{staff.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{Math.min(staff.hoursWorked, 40)}h</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{Math.max(staff.hoursWorked - 40, 0)}h</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{staff.hoursWorked}h</td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    ${(Math.min(staff.hoursWorked, 40) * staff.hourlyRate + 
                      Math.max(staff.hoursWorked - 40, 0) * staff.hourlyRate * 1.5).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PerformanceView = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performers</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {staffMembers
              .sort((a, b) => b.performance - a.performance)
              .slice(0, 3)
              .map((staff, index) => (
                <div key={staff.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{staff.name}</div>
                      <div className="text-xs text-gray-600">{staff.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{staff.performance}</div>
                    <div className="text-xs text-gray-600">rating</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attendance Rate</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">94.5%</div>
            <div className="text-sm text-gray-600">This month</div>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">+2.3% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Labor Cost</h3>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">$12,450</div>
            <div className="text-sm text-gray-600">This week</div>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">-5.2% from last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Staff Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Staff Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Attendance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Punctuality</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Customer Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map(staff => (
                <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{staff.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-600">{staff.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${(staff.performance / 5) * 100}%`}}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{staff.performance}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">96%</td>
                  <td className="py-4 px-4 text-sm text-gray-900">98%</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-900">{(staff.performance - 0.1).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">View Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('StaffManagement rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50 p-6`}>
        {/* Header */}
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
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600 mt-1">Manage your restaurant staff, schedules, and performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Time</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Staff Overview', icon: Users },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'timetracking', label: 'Time Tracking', icon: Clock },
              { id: 'performance', label: 'Performance', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <StaffOverview />}
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'timetracking' && <TimeTracking />}
        {activeTab === 'performance' && <PerformanceView />}

        {/* Modals */}
        {showAddStaff && <AddStaffModal />}
        {showScheduleModal && <ScheduleModal />}

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

export default StaffManagement;