import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const Maintenance = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const [rooms, setRooms] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
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

  // Synchronized room data with RoomRate.jsx
  useEffect(() => {
    const sampleRooms = [
      {
        id: 'R101',
        roomNumber: '101',
        type: 'Deluxe',
        name: 'Deluxe King Room',
        capacity: 2,
        maxCapacity: 3,
        basePrice: 150,
        weekendPrice: 180,
        status: 'available',
        floor: 1,
        size: 300,
        description: 'A spacious room with a king-size bed and modern amenities.',
        amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop',
        ],
        lastCleaned: '2025-08-05T10:00:00Z',
        maintenanceNotes: '',
        bookingHistory: 50,
        rating: 4.5,
      },
      {
        id: 'R102',
        roomNumber: '102',
        type: 'Suite',
        name: 'Executive Suite',
        capacity: 4,
        maxCapacity: 6,
        basePrice: 300,
        weekendPrice: 350,
        status: 'maintenance',
        floor: 1,
        size: 500,
        description: 'Luxurious suite with separate living area and premium amenities.',
        amenities: ['wifi', 'tv', 'ac', 'kitchen', 'safe', 'balcony'],
        images: [
          'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500&h=300&fit=crop',
        ],
        lastCleaned: '2025-08-04T09:00:00Z',
        maintenanceNotes: 'Plumbing issue reported',
        bookingHistory: 30,
        rating: 4.8,
      },
      {
        id: 'R201',
        roomNumber: '201',
        type: 'Standard',
        name: 'Standard Double Room',
        capacity: 2,
        maxCapacity: 2,
        basePrice: 100,
        weekendPrice: 120,
        status: 'occupied',
        floor: 2,
        size: 250,
        description: 'Cozy double room with essential amenities.',
        amenities: ['wifi', 'tv', 'ac'],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&h=300&fit=crop',
        ],
        lastCleaned: '2025-08-05T14:00:00Z',
        maintenanceNotes: '',
        bookingHistory: 60,
        rating: 4.0,
      },
      {
        id: 'R202',
        roomNumber: '202',
        type: 'Deluxe',
        name: 'Deluxe Twin Room',
        capacity: 2,
        maxCapacity: 3,
        basePrice: 160,
        weekendPrice: 190,
        status: 'maintenance',
        floor: 2,
        size: 320,
        description: 'Twin room with modern amenities and city view.',
        amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe'],
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=300&fit=crop',
        ],
        lastCleaned: '2025-08-03T11:00:00Z',
        maintenanceNotes: 'AC unit needs servicing',
        bookingHistory: 45,
        rating: 4.3,
      },
    ];
    setRooms(sampleRooms);
  }, []);

  // Sample maintenance tickets (updated to reference synchronized room IDs)
  useEffect(() => {
    const sampleTickets = [
      {
        id: 'MT001',
        roomId: 'R102',
        title: 'Plumbing Leak in Bathroom',
        description: 'Water leak under bathroom sink causing floor damage.',
        category: 'plumbing',
        priority: 'high',
        status: 'in_progress',
        reportedBy: 'Housekeeping',
        reportedByType: 'staff',
        reporterContact: 'housekeeping@hotel.com',
        assignedTo: 'Mike Davis',
        assignedToContact: 'mike.davis@maintenance.com',
        createdAt: '2025-08-05T09:00:00Z',
        updatedAt: '2025-08-05T14:30:00Z',
        estimatedCost: 200,
        actualCost: 0,
        estimatedTime: 3,
        actualTime: 0,
        notes: 'Pipes inspected, replacement parts ordered.',
        images: ['https://images.unsplash.com/photo-1585128792020-803d29415281?w=300&h=200&fit=crop'],
        roomUnavailable: true,
      },
      {
        id: 'MT002',
        roomId: 'R202',
        title: 'AC Unit Not Cooling',
        description: 'Air conditioning unit not maintaining set temperature.',
        category: 'hvac',
        priority: 'high',
        status: 'pending',
        reportedBy: 'Guest - Jane Doe',
        reportedByType: 'guest',
        reporterContact: 'jane.doe@email.com',
        assignedTo: 'John Smith',
        assignedToContact: 'john.smith@maintenance.com',
        createdAt: '2025-08-04T16:00:00Z',
        updatedAt: '2025-08-04T16:00:00Z',
        estimatedCost: 300,
        actualCost: 0,
        estimatedTime: 4,
        actualTime: 0,
        notes: 'Scheduled for inspection tomorrow.',
        images: [],
        roomUnavailable: true,
      },
      {
        id: 'MT003',
        roomId: 'R101',
        title: 'TV Signal Issue',
        description: 'Television showing no signal despite cable checks.',
        category: 'electronics',
        priority: 'low',
        status: 'completed',
        reportedBy: 'Front Desk',
        reportedByType: 'staff',
        reporterContact: 'frontdesk@hotel.com',
        assignedTo: 'Sarah Wilson',
        assignedToContact: 'sarah.wilson@maintenance.com',
        createdAt: '2025-08-03T10:00:00Z',
        updatedAt: '2025-08-04T12:00:00Z',
        estimatedCost: 50,
        actualCost: 60,
        estimatedTime: 1,
        actualTime: 1.5,
        notes: 'Cable replaced, issue resolved.',
        images: [],
        roomUnavailable: false,
      },
      {
        id: 'MT004',
        roomId: 'R201',
        title: 'Window Lock Malfunction',
        description: 'Window lock not engaging properly, posing security risk.',
        category: 'doors_windows',
        priority: 'medium',
        status: 'scheduled',
        reportedBy: 'Housekeeping',
        reportedByType: 'staff',
        reporterContact: 'housekeeping@hotel.com',
        assignedTo: 'Tom Brown',
        assignedToContact: 'tom.brown@maintenance.com',
        createdAt: '2025-08-05T08:00:00Z',
        updatedAt: '2025-08-05T09:00:00Z',
        estimatedCost: 100,
        actualCost: 0,
        estimatedTime: 2,
        actualTime: 0,
        notes: 'Lock replacement scheduled.',
        images: [],
        roomUnavailable: false,
      },
    ];
    setMaintenanceTickets(sampleTickets);
    setFilteredTickets(sampleTickets);
  }, []);

  // Categories, priorities, statuses, and staff members remain unchanged
  const categories = [
    { id: 'hvac', name: 'HVAC', icon: Wind, color: 'blue' },
    { id: 'plumbing', name: 'Plumbing', icon: Droplets, color: 'cyan' },
    { id: 'electrical', name: 'Electrical', icon: Zap, color: 'yellow' },
    { id: 'electronics', name: 'Electronics', icon: Tv, color: 'purple' },
    { id: 'doors_windows', name: 'Doors & Windows', icon: Home, color: 'green' },
    { id: 'furniture', name: 'Furniture', icon: Bed, color: 'orange' },
    { id: 'cleaning', name: 'Cleaning', icon: Bath, color: 'pink' },
    { id: 'safety', name: 'Safety & Security', icon: AlertTriangle, color: 'red' },
    { id: 'other', name: 'Other', icon: Wrench, color: 'gray' },
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: 'green', icon: Clock },
    { id: 'medium', name: 'Medium', color: 'yellow', icon: AlertCircle },
    { id: 'high', name: 'High', color: 'red', icon: AlertTriangle },
    { id: 'critical', name: 'Critical', color: 'purple', icon: Zap },
  ];

  const statuses = [
    { id: 'pending', name: 'Pending', color: 'gray', icon: Clock },
    { id: 'scheduled', name: 'Scheduled', color: 'blue', icon: Calendar },
    { id: 'in_progress', name: 'In Progress', color: 'yellow', icon: Wrench },
    { id: 'completed', name: 'Completed', color: 'green', icon: CheckCircle },
    { id: 'cancelled', name: 'Cancelled', color: 'red', icon: X },
  ];

  const staffMembers = [
    { id: 'john_smith', name: 'John Smith', email: 'john.smith@maintenance.com', specialties: ['hvac', 'electrical'] },
    { id: 'mike_davis', name: 'Mike Davis', email: 'mike.davis@maintenance.com', specialties: ['plumbing', 'doors_windows'] },
    { id: 'sarah_wilson', name: 'Sarah Wilson', email: 'sarah.wilson@maintenance.com', specialties: ['electronics', 'furniture'] },
    { id: 'tom_brown', name: 'Tom Brown', email: 'tom.brown@maintenance.com', specialties: ['doors_windows', 'safety'] },
  ];

  // Filter tickets (unchanged)
  useEffect(() => {
    let filtered = maintenanceTickets;

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
      filtered = filtered.filter(ticket => ticket.category === filterCategory);
    }

    setFilteredTickets(filtered);
  }, [maintenanceTickets, filterStatus, filterPriority, filterCategory, rooms]);

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
    const categoryObj = categories.find(c => c.id === category);
    switch (categoryObj?.color) {
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

  const handleAddTicket = (ticketData) => {
    const newTicket = {
      ...ticketData,
      id: `MT${String(maintenanceTickets.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actualCost: 0,
      actualTime: 0,
    };
    setMaintenanceTickets([...maintenanceTickets, newTicket]);
    setShowTicketForm(false);

    if (newTicket.roomUnavailable) {
      setRooms(rooms.map(room =>
        room.id === newTicket.roomId
          ? { ...room, status: 'maintenance', maintenanceNotes: newTicket.title }
          : room
      ));
    }
  };

  const handleEditTicket = (ticketData) => {
    const updatedTicket = {
      ...ticketData,
      updatedAt: new Date().toISOString(),
    };
    setMaintenanceTickets(maintenanceTickets.map(ticket =>
      ticket.id === ticketData.id ? updatedTicket : ticket
    ));
    setEditingTicket(null);
    setShowTicketForm(false);

    const room = getRoomByTicket(ticketData.roomId);
    if (room) {
      let newStatus = room.status;
      let newNotes = room.maintenanceNotes;

      if (ticketData.status === 'completed' && room.status === 'maintenance') {
        newStatus = 'available';
        newNotes = '';
      } else if (ticketData.roomUnavailable && room.status !== 'maintenance') {
        newStatus = 'maintenance';
        newNotes = ticketData.title;
      }

      setRooms(rooms.map(r =>
        r.id === ticketData.roomId
          ? { ...r, status: newStatus, maintenanceNotes: newNotes }
          : r
      ));
    }
  };

  const handleDeleteTicket = (ticketId) => {
    if (window.confirm('Are you sure you want to delete this maintenance ticket?')) {
      const ticket = maintenanceTickets.find(t => t.id === ticketId);
      setMaintenanceTickets(maintenanceTickets.filter(ticket => ticket.id !== ticketId));

      if (ticket && ticket.roomUnavailable) {
        setRooms(rooms.map(room =>
          room.id === ticket.roomId
            ? { ...room, status: 'available', maintenanceNotes: '' }
            : room
        ));
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
    });

    const [tagInput, setTagInput] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

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

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {ticket ? 'Edit Maintenance Ticket' : 'Create New Maintenance Ticket'}
              </h2>
              <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Detailed description of the maintenance issue..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporter Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reported By *</label>
                  <input
                    type="text"
                    required
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Name or department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reporter Type</label>
                  <select
                    value={formData.reportedByType}
                    onChange={(e) => setFormData({ ...formData, reportedByType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Email or phone"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Staff</label>
                  <select
                    value={staffMembers.find(s => s.name === formData.assignedTo)?.id || ''}
                    onChange={(e) => handleStaffChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="staff@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost & Time Estimates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
    const category = categories.find(c => c.id === ticket.category);
    const priority = priorities.find(p => p.id === ticket.priority);
    const status = statuses.find(s => s.id === ticket.status);
    const StatusIcon = status?.icon || Clock;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{ticket.title}</h2>
                  <p className="text-sm text-gray-600">
                    Ticket #{ticket.id} • Room {room?.roomNumber} • {category?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(ticket)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(ticket.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-4 w-4 text-gray-600" />
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                  {status?.name}
                </span>
              </div>
              {ticket.roomUnavailable && (
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                  Room Unavailable
                </span>
              )}
            </div>

            {room && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Room</p>
                      <p className="font-medium text-gray-900">{room.roomNumber} - {room.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Floor</p>
                      <p className="font-medium text-gray-900">{room.floor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-medium text-gray-900">{room.capacity} guests</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reporter Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Reported by</p>
                        <p className="font-medium text-gray-900">{ticket.reportedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-medium text-gray-900 capitalize">{ticket.reportedByType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {ticket.reporterContact && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-medium text-gray-900">{ticket.reporterContact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned to</p>
                        <p className="font-medium text-gray-900">{ticket.assignedTo || 'Unassigned'}</p>
                      </div>
                    </div>
                    {ticket.assignedToContact && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-medium text-gray-900">{ticket.assignedToContact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-medium text-gray-900">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-medium text-gray-900">
                          {new Date(ticket.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost & Time</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Cost</p>
                        <p className="font-medium text-gray-900">${ticket.estimatedCost}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Time</p>
                        <p className="font-medium text-gray-900">{ticket.estimatedTime} hours</p>
                      </div>
                    </div>
                    {ticket.actualCost > 0 && (
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Actual Cost</p>
                          <p className="font-medium text-gray-900">${ticket.actualCost}</p>
                        </div>
                      </div>
                    )}
                    {ticket.actualTime > 0 && (
                      <div className="flex items-center space-x-3">
                        <Timer className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Actual Time</p>
                          <p className="font-medium text-gray-900">{ticket.actualTime} hours</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {ticket.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.notes}</p>
              </div>
            )}

            {ticket.images && ticket.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Issue ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
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
    const category = categories.find(c => c.id === ticket.category);
    const priority = priorities.find(p => p.id === ticket.priority);
    const status = statuses.find(s => s.id === ticket.status);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{ticket.title}</h3>
                <p className="text-xs text-gray-600">#{ticket.id} • Room {room?.roomNumber}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                {status?.name}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                {priority?.name}
              </span>
            </div>
            {ticket.roomUnavailable && (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                Room Unavailable
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span>Assigned: {ticket.assignedTo || 'Unassigned'}</span>
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

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={() => onView(ticket)}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
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
      </div>
    );
  };

  const TicketListItem = ({ ticket, onView, onEdit, onDelete }) => {
    const room = getRoomByTicket(ticket.roomId);
    const category = categories.find(c => c.id === ticket.category);
    const priority = priorities.find(p => p.id === ticket.priority);
    const status = statuses.find(s => s.id === ticket.status);

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-4 px-4">
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-gray-900 text-sm">{ticket.title}</p>
              <p className="text-xs text-gray-600">#{ticket.id}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">
            Room {room?.roomNumber}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{category?.name}</span>
        </td>
        <td className="py-4 px-4">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
            {priority?.name}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
            {status?.name}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{ticket.assignedTo || 'Unassigned'}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">${ticket.estimatedCost}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </td>
        <td className="py-4 px-4">
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

  // Dynamic sidebar width calculation
  const sidebarWidth = sidebarMinimized ? 4 : 16; // rem
  const sidebarOffset = sidebarOpen ? sidebarWidth : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: `${sidebarOffset}rem`,
          width: `calc(100% - ${sidebarOffset}rem)`,
        }}
      >
        {/* Filters and Controls */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.name}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowTicketForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                style={{ alignSelf: 'flex-start' }}
              >
                <Plus className="h-4 w-4" />
                <span>Create Ticket</span>
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => setShowUnavailableRooms(!showUnavailableRooms)}
              >
                <span>Currently Unavailable Rooms</span>
              </button>
            </div>
            {!showUnavailableRooms && (
              <div className="flex items-center space-x-4">
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

        {/*Unavailable Rooms */}
        {!showUnavailableRooms ? (
          <div className="px-6 py-6 h-[calc(100vh-4rem)] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tickets found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                    ? 'No tickets match your current filters.'
                    : 'Get started by creating your first maintenance ticket.'}
                </p>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Ticket</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Assigned To</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Est. Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
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
              </div>
            )}
          </div>
        ) : (
          <div className="w-full mt-4">
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rooms Under Maintenance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {rooms.filter(room => room.status === 'maintenance').map(room => {
                  const roomTickets = maintenanceTickets.filter(t => t.roomId === room.id && t.status !== 'completed');
                  return (
                    <div key={room.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Room {room.roomNumber}</h4>
                        <span className="text-sm text-red-600 font-medium">Unavailable</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{room.name}</p>
                      <p className="text-xs text-gray-500">
                        {roomTickets.length} active ticket{roomTickets.length !== 1 ? 's' : ''}
                      </p>
                      {room.maintenanceNotes && (
                        <p className="text-xs text-red-600 mt-1 italic">{room.maintenanceNotes}</p>
                      )}
                    </div>
                  );
                })}
                {rooms.filter(room => room.status === 'maintenance').length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-600">All rooms are currently available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
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

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;