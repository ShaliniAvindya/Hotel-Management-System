import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Bath,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Wrench,
  Badge,
  Timer,
  DollarSign,
  MapPin,
  Mail,
  UserCheck,
  AlertCircle,
  Zap,
  Droplets,
  Wind,
  Tv,
  Bed,
  X,
  Grid,
  List,
  Menu,
  Eye,
  Users,
} from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';

const ROOMS_API_URL = `${API_BASE_URL}/rooms`;
const TICKETS_API_URL = `${API_BASE_URL}/roomMaintenance`;
const CATEGORIES_API_URL = `${API_BASE_URL}/roomMaintenance/categories`;
const STAFF_API_URL = `${API_BASE_URL}/staffMembers`;
const AVAIL_API_URL = `${API_BASE_URL}/roomAvailability`;

const Maintenance = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const [rooms, setRooms] = useState([]);
  const [roomMaintenance, setRoomMaintenance] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showUnavailableRooms, setShowUnavailableRooms] = useState(false);
  const [categories, setCategories] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoryStyles = {
    hvac: { color: 'blue', icon: Wind },
    plumbing: { color: 'cyan', icon: Droplets },
    electrical: { color: 'yellow', icon: Zap },
    electronics: { color: 'purple', icon: Tv },
    'doors & windows': { color: 'green', icon: Home },
    furniture: { color: 'orange', icon: Bed },
    cleaning: { color: 'pink', icon: Bath },
    'safety & security': { color: 'red', icon: AlertTriangle },
    other: { color: 'gray', icon: Wrench },
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ROOMS_API_URL);
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to fetch rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Fetch maintenance tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(TICKETS_API_URL);
        setRoomMaintenance(response.data);
        setFilteredTickets(response.data);
      } catch (error) {
        console.error('Error fetching maintenance tickets:', error);
        setError('Failed to fetch maintenance tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(CATEGORIES_API_URL);
        const uniqueCategories = [...new Set([...response.data, 'other'])].map(category => ({
          id: category.toLowerCase(),
          name: category.charAt(0).toUpperCase() + category.slice(1),
        }));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch staff members 
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await axios.get(STAFF_API_URL);
        setStaffMembers(response.data);
      } catch (error) {
        console.error('Error fetching staff members:', error);
        setError('Failed to fetch staff members. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Priorities 
  const priorities = [
    { id: 'low', name: 'Low', color: 'green', icon: Clock },
    { id: 'medium', name: 'Medium', color: 'yellow', icon: AlertCircle },
    { id: 'high', name: 'High', color: 'red', icon: AlertTriangle },
    { id: 'critical', name: 'Critical', color: 'purple', icon: Zap },
  ];

  // Statuses 
  const statuses = [
    { id: 'pending', name: 'Pending', color: 'gray', icon: Clock },
    { id: 'scheduled', name: 'Scheduled', color: 'blue', icon: Calendar },
    { id: 'in_progress', name: 'In Progress', color: 'yellow', icon: Wrench },
    { id: 'completed', name: 'Completed', color: 'green', icon: CheckCircle },
    { id: 'cancelled', name: 'Cancelled', color: 'red', icon: X },
  ];

  // Filter tickets
  useEffect(() => {
    let filtered = roomMaintenance;

    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rooms.find(room => room.id === ticket.roomId)?.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category.toLowerCase() === filterCategory);
    }

    setFilteredTickets(filtered);
  }, [roomMaintenance, searchQuery, filterStatus, filterPriority, filterCategory, rooms]);

  const getRoomByTicket = (roomId) => {
    return rooms.find(room => room.id === roomId);
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.id === priority);
    switch (priorityObj?.color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.id === status);
    switch (statusObj?.color) {
      case 'gray': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green': return 'bg-green-100 text-green-800 border-gray-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const categoryStyle = categoryStyles[category.toLowerCase()] || categoryStyles.other;
    switch (categoryStyle.color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'cyan': return 'bg-cyan-100 text-cyan-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'pink': return 'bg-pink-100 text-pink-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    return categoryStyles[category.toLowerCase()]?.icon || categoryStyles.other.icon;
  };

  const getDateKey = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateAvailability = async (roomId, status) => {
    const today = getDateKey(new Date());
    const availabilityResponse = await axios.get(`${AVAIL_API_URL}/${roomId}`);
    let availabilityData = availabilityResponse.data ? availabilityResponse.data.availability : [];
    availabilityData = availabilityData.filter(entry => entry.date !== today);
    availabilityData.push({ date: today, status: status });
    await axios.put(`${AVAIL_API_URL}/${roomId}`, { availability: availabilityData });
  };

  const updateRoomMaintenanceStatus = async (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const activeTickets = roomMaintenance.filter(
      t => t.roomId === roomId && t.status !== 'completed' && t.roomUnavailable
    );

    let newStatus = 'available';
    let maintenanceStartDate = null;
    let maintenanceNotes = '';

    if (activeTickets.length > 0) {
      newStatus = 'maintenance';
      const startDates = activeTickets
        .map(t => t.scheduledStartDate)
        .filter(d => d)
        .sort();
      maintenanceStartDate = startDates[0] || getDateKey(new Date());
      maintenanceNotes = activeTickets.map(t => t.title).join('; ');
    }

    if (room.status !== newStatus || room.maintenanceStartDate !== maintenanceStartDate || room.maintenanceNotes !== maintenanceNotes) {
      const updatedRoom = {
        ...room,
        status: newStatus,
        maintenanceStartDate,
        maintenanceNotes,
        occupancyStatus: newStatus === 'maintenance' ? 'out-of-order' : 'vacant',
      };
      await axios.put(`${ROOMS_API_URL}/${roomId}`, updatedRoom);
      await updateAvailability(roomId, newStatus);
      setRooms(rooms.map(r => r.id === roomId ? updatedRoom : r));
    }
  };

  const handleAddTicket = async (ticketData) => {
    try {
      setLoading(true);
      const response = await axios.post(TICKETS_API_URL, ticketData);
      const newTicket = response.data;
      setRoomMaintenance([...roomMaintenance, newTicket]);
      setShowTicketForm(false);

      if (ticketData.roomUnavailable) {
        await updateRoomMaintenanceStatus(ticketData.roomId);
      }

      const catResponse = await axios.get(CATEGORIES_API_URL);
      const uniqueCategories = [...new Set([...catResponse.data, 'other'])].map(category => ({
        id: category.toLowerCase(),
        name: category.charAt(0).toUpperCase() + category.slice(1),
      }));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error adding ticket:', error);
      setError('Failed to add ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = async (ticketData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${TICKETS_API_URL}/${ticketData.id}`, ticketData);
      setRoomMaintenance(roomMaintenance.map(ticket => ticket.id === ticketData.id ? response.data : ticket));
      setEditingTicket(null);
      setShowTicketForm(false);

      await updateRoomMaintenanceStatus(ticketData.roomId);
    } catch (error) {
      console.error('Error editing ticket:', error);
      setError('Failed to edit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this maintenance ticket?')) {
      try {
        setLoading(true);
        const ticket = roomMaintenance.find(t => t.id === ticketId);
        await axios.delete(`${TICKETS_API_URL}/${ticketId}`);
        setRoomMaintenance(roomMaintenance.filter(ticket => ticket.id !== ticketId));

        if (ticket && ticket.roomUnavailable) {
          await updateRoomMaintenanceStatus(ticket.roomId);
        }

        const response = await axios.get(CATEGORIES_API_URL);
        const uniqueCategories = [...new Set([...response.data, 'other'])].map(category => ({
          id: category.toLowerCase(),
          name: category.charAt(0).toUpperCase() + category.slice(1),
        }));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error deleting ticket:', error);
        setError('Failed to delete ticket. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const TicketForm = ({ ticket, onSave, onCancel }) => {
    const [formData, setFormData] = useState(ticket || {
      roomId: '',
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      status: 'pending',
      reportedBy: '',
      reportedByType: 'staff',
      reporterContact: '',
      assignedTo: '',
      assignedToContact: '',
      estimatedCost: 0,
      estimatedTime: 0,
      notes: '',
      images: [],
      roomUnavailable: false,
      scheduledStartDate: getDateKey(new Date()), // Default to today
      scheduledEndDate: '',
    });

    const handleStaffChange = (staffId) => {
      const staff = staffMembers.find(s => s.id === staffId);
      if (staff) {
        setFormData({
          ...formData,
          assignedTo: staff.name,
          assignedToContact: staff.email
        });
      }
    };

    if (rooms.length === 0 || categories.length === 0 || staffMembers.length === 0) {
      return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 text-center">
              <p className="text-gray-700">Loading data...</p>
            </div>
          </div>
        </div>,
        document.body
      );
    }

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {ticket ? 'Edit Maintenance Ticket' : 'Create New Maintenance Ticket'}
              </h2>
              <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 sm:p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category.toLowerCase()}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Detailed description of the maintenance issue..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Priority & Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>{priority.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roomUnavailable}
                      onChange={(e) => setFormData({ ...formData, roomUnavailable: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark Room Unavailable</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledStartDate}
                    onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled End Date</label>
                  <input
                    type="date"
                    value={formData.scheduledEndDate}
                    onChange={(e) => setFormData({ ...formData, scheduledEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Reporter Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reported By *</label>
                  <input
                    type="text"
                    required
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Name or department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reporter Type</label>
                  <select
                    value={formData.reportedByType}
                    onChange={(e) => setFormData({ ...formData, reportedByType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="staff">Staff</option>
                    <option value="guest">Guest</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="front_desk">Front Desk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                  <input
                    type="text"
                    value={formData.reporterContact}
                    onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Email or phone"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Staff</label>
                  <select
                    value={staffMembers.find(s => s.name === formData.assignedTo)?.id || ''}
                    onChange={(e) => handleStaffChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select Staff Member</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Contact</label>
                  <input
                    type="email"
                    value={formData.assignedToContact}
                    onChange={(e) => setFormData({ ...formData, assignedToContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="staff@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Cost & Time Estimates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (hours)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm sm:text-base"
              >
                {ticket ? 'Update Ticket' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const TicketDetails = ({ ticket, onClose, onEdit, onDelete }) => {
    const room = getRoomByTicket(ticket.roomId);
    const category = categories.find(c => c.id === ticket.category.toLowerCase());
    const priority = priorities.find(p => p.id === ticket.priority);
    const status = statuses.find(s => s.id === ticket.status);
    const StatusIcon = status?.icon || Clock;
    const CategoryIcon = getCategoryIcon(ticket.category);

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{ticket.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Ticket #{ticket.id} • Room {room?.roomNumber} • {category?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => onEdit(ticket)}
                  className="p-1 sm:p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                >
                  <Edit className="h-4 w-4 sm:h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(ticket.id)}
                  className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 w-5" />
                </button>
                <button onClick={onClose} className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <StatusIcon className="h-4 w-4 sm:h-5 w-5 text-gray-600" />
                <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                  {status?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CategoryIcon className="h-4 w-4 sm:h-5 w-5 text-gray-600" />
                <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getCategoryColor(ticket.category)}`}>
                  {category?.name}
                </span>
              </div>
              {ticket.roomUnavailable && (
                <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                  Room Unavailable
                </span>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Start</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.scheduledStartDate}</p>
                  </div>
                </div>
                {ticket.scheduledEndDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Scheduled End</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.scheduledEndDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {room && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Room</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{room.roomNumber} - {room.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Floor</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{room.floor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{room.capacity} guests</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Reporter Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Reported by</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.reportedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-medium text-gray-900 capitalize text-sm sm:text-base">{ticket.reportedByType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {ticket.reporterContact && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.reporterContact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Assignment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned to</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.assignedTo || 'Unassigned'}</p>
                      </div>
                    </div>
                    {ticket.assignedToContact && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.assignedToContact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {new Date(ticket.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Cost & Time</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Cost</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">${ticket.estimatedCost}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Time</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.estimatedTime} hours</p>
                      </div>
                    </div>
                    {ticket.actualCost > 0 && (
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Actual Cost</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">${ticket.actualCost}</p>
                        </div>
                      </div>
                    )}
                    {ticket.actualTime > 0 && (
                      <div className="flex items-center space-x-3">
                        <Timer className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Actual Time</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.actualTime} hours</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {ticket.notes && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.notes}</p>
              </div>
            )}

            {ticket.images && ticket.images.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Issue ${index + 1}`}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const TicketCard = ({ ticket, onView, onEdit, onDelete }) => {
    const room = getRoomByTicket(ticket.roomId);
    const category = categories.find(c => c.id === ticket.category.toLowerCase());
    const priority = priorities.find(p => p.id === ticket.priority);
    const status = statuses.find(s => s.id === ticket.status);
    const CategoryIcon = getCategoryIcon(ticket.category);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">{ticket.title}</h3>
              <p className="text-xs text-gray-600">#{ticket.id} • Room {room?.roomNumber}</p>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{ticket.description}</p>

        <div className="space-y-2 mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
              {status?.name}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
              {priority?.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-4 w-4 text-gray-600" />
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(ticket.category)}`}>
              {category?.name}
            </span>
          </div>
          {ticket.roomUnavailable && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
              Room Unavailable
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3 sm:mb-4 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>Start: {ticket.scheduledStartDate}</span>
          </div>
          {ticket.scheduledEndDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3" />
              <span>End: {ticket.scheduledEndDate}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3" />
            <span className="truncate">Assigned: {ticket.assignedTo || 'Unassigned'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
          {ticket.estimatedCost > 0 && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-3 w-3" />
              <span>Est. Cost: ${ticket.estimatedCost}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(ticket)}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(ticket)}
              className="p-1 text-gray-400 hover:text-orange-600 rounded"
              title="Edit Ticket"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(ticket.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete Ticket"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TicketListItem = ({ ticket, onView, onEdit, onDelete }) => {
    const room = getRoomByTicket(ticket.roomId);
    const category = categories.find(c => c.id === ticket.category.toLowerCase());
    const priority = priorities.find(p => p.id === ticket.priority);
    const status = statuses.find(s => s.id === ticket.status);
    const CategoryIcon = getCategoryIcon(ticket.category);

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-gray-900 text-sm truncate">{ticket.title}</p>
              <p className="text-xs text-gray-600">#{ticket.id}</p>
            </div>
          </div>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm text-gray-900">
            Room {room?.roomNumber}
          </span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-900">{category?.name}</span>
          </div>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
            {priority?.name}
          </span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
            {status?.name}
          </span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm text-gray-900 truncate">{ticket.assignedTo || 'Unassigned'}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm text-gray-900">${ticket.estimatedCost}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm text-gray-900">{ticket.scheduledStartDate}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm text-gray-900">{ticket.scheduledEndDate || 'Indefinite'}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(ticket)}
              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(ticket)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(ticket.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const sidebarWidth = sidebarMinimized ? 4 : 16;
  const sidebarOffset = sidebarOpen ? sidebarWidth : 0;

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300">
      {error && (
        <div className="px-6 py-4 bg-red-100 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div
        style={{
          marginLeft: `${sidebarOffset}rem`,
          width: `calc(100% - ${sidebarOffset}rem)`,
        }}
      >
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 flex-wrap w-full">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.name}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowTicketForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 w-full sm:w-auto text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create Ticket</span>
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto text-sm"
                onClick={() => setShowUnavailableRooms(!showUnavailableRooms)}
              >
                <span>Currently Unavailable Rooms</span>
              </button>
            </div>
            {!showUnavailableRooms && (
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {!showUnavailableRooms ? (
          <div className="px-4 sm:px-6 py-4 sm:py-6 h-[calc(100vh-4rem)] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Wrench className="h-12 w-12 sm:h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No maintenance tickets found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                    ? 'No tickets match your current filters.'
                    : 'Get started by creating your first maintenance ticket.'}
                </p>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 mx-auto text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Ticket</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onView={(ticket) => {
                      setSelectedTicket(ticket);
                      setShowTicketDetails(true);
                    }}
                    onEdit={(ticket) => {
                      setEditingTicket(ticket);
                      setShowTicketForm(true);
                    }}
                    onDelete={handleDeleteTicket}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Ticket</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Room</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Assigned To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Est. Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Start Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">End Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <TicketListItem
                        key={ticket.id}
                        ticket={ticket}
                        onView={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowTicketDetails(true);
                        }}
                        onEdit={(ticket) => {
                          setEditingTicket(ticket);
                          setShowTicketForm(true);
                        }}
                        onDelete={handleDeleteTicket}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full mt-4">
            <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Rooms Under Maintenance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {rooms.filter(room => room.status === 'maintenance').map(room => {
                  const roomTickets = roomMaintenance.filter(t => t.roomId === room.id && t.status !== 'completed');
                  return (
                    <div key={room.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Room {room.roomNumber}</h4>
                        <span className="text-xs text-red-600 font-medium">Unavailable</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{room.name}</p>
                      <p className="text-xs text-gray-500">
                        {roomTickets.length} active ticket{roomTickets.length !== 1 ? 's' : ''}
                      </p>
                      {room.maintenanceNotes && (
                        <p className="text-xs text-red-600 mt-1 italic truncate">{room.maintenanceNotes}</p>
                      )}
                    </div>
                  );
                })}
                {rooms.filter(room => room.status === 'maintenance').length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <CheckCircle className="h-8 w-8 sm:h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm sm:text-gray-600">All rooms are currently available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showTicketForm && (
          <TicketForm
            ticket={editingTicket}
            onSave={editingTicket ? handleEditTicket : handleAddTicket}
            onCancel={() => {
              setShowTicketForm(false);
              setEditingTicket(null);
            }}
          />
        )}

        {showTicketDetails && selectedTicket && (
          <TicketDetails
            ticket={selectedTicket}
            onClose={() => {
              setShowTicketDetails(false);
              setSelectedTicket(null);
            }}
            onEdit={(ticket) => {
              setEditingTicket(ticket);
              setShowTicketForm(true);
              setShowTicketDetails(false);
            }}
            onDelete={handleDeleteTicket}
          />
        )}
      </div>
    </div>
  );
};

export default Maintenance;