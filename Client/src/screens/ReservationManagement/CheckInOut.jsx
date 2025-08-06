import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  Users,
  Bed,
  Search,
  CheckCircle,
  LogOut,
  AlertCircle,
  RefreshCw,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Key,
  ClipboardCheck,
  X,
  Save,
  Timer,
  Ban
} from 'lucide-react';

const CheckInCheckOut = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('today'); // today, arriving, departing, all
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInData, setCheckInData] = useState({
    actualCheckInTime: '',
    notes: '',
    keyCardNumber: '',
    depositAmount: 0,
    specialRequests: ''
  });
  const [checkOutData, setCheckOutData] = useState({
    actualCheckOutTime: '',
    notes: '',
    damageCharges: 0,
    minibarCharges: 0,
    additionalServices: 0,
    finalAmount: 0,
    refundAmount: 0
  });

  // Initialize sample data
  useEffect(() => {
    const sampleRooms = [
      { id: 'R001', roomNumber: '101', type: 'single', name: 'Deluxe Single Room', capacity: 1, maxCapacity: 2, basePrice: 120, weekendPrice: 150, floor: 1, status: 'occupied' },
      { id: 'R002', roomNumber: '201', type: 'double', name: 'Premium Double Room', capacity: 2, maxCapacity: 3, basePrice: 180, weekendPrice: 220, floor: 2, status: 'available' },
      { id: 'R003', roomNumber: '301', type: 'suite', name: 'Executive Suite', capacity: 4, maxCapacity: 6, basePrice: 350, weekendPrice: 420, floor: 3, status: 'maintenance' },
      { id: 'R004', roomNumber: '102', type: 'single', name: 'Standard Single Room', capacity: 1, maxCapacity: 2, basePrice: 100, weekendPrice: 130, floor: 1, status: 'available' },
      { id: 'R005', roomNumber: '202', type: 'double', name: 'Deluxe Double Room', capacity: 2, maxCapacity: 3, basePrice: 200, weekendPrice: 240, floor: 2, status: 'cleaning' },
      { id: 'R006', roomNumber: '302', type: 'suite', name: 'Family Suite', capacity: 4, maxCapacity: 6, basePrice: 320, weekendPrice: 380, floor: 3, status: 'available' }
    ];
    setRooms(sampleRooms);

    const today = new Date();
    const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

    const sampleBookings = [
      {
        id: 'B001',
        bookingReference: 'HTL2024001',
        guestName: 'John Smith',
        guestEmail: 'john.smith@email.com',
        guestPhone: '+1-555-0123',
        roomId: 'R001',
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: tomorrow.toISOString().split('T')[0],
        guests: 1,
        status: 'confirmed',
        totalAmount: 240,
        bookingSource: 'walk-in',
        createdAt: new Date().toISOString(),
        specialRequests: 'Late check-in requested',
        splitStays: [],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        isEarlyCheckIn: false,
        isLateCheckOut: false,
        actualCheckInTime: null,
        actualCheckOutTime: null
      },
      {
        id: 'B002',
        bookingReference: 'HTL2024002',
        guestName: 'Sarah Johnson',
        guestEmail: 'sarah.j@email.com',
        guestPhone: '+1-555-0456',
        roomId: 'R002',
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 2,
        status: 'confirmed',
        totalAmount: 360,
        bookingSource: 'phone',
        createdAt: new Date().toISOString(),
        specialRequests: '',
        splitStays: [],
        checkInTime: '14:00',
        checkOutTime: '12:00',
        isEarlyCheckIn: true,
        isLateCheckOut: false,
        actualCheckInTime: null,
        actualCheckOutTime: null
      },
      {
        id: 'B003',
        bookingReference: 'HTL2024003',
        guestName: 'Mike Davis',
        guestEmail: 'mike.davis@email.com',
        guestPhone: '+1-555-0789',
        roomId: 'R003',
        checkInDate: yesterday.toISOString().split('T')[0],
        checkOutDate: today.toISOString().split('T')[0],
        guests: 4,
        status: 'checked-in',
        totalAmount: 350,
        bookingSource: 'email',
        createdAt: new Date().toISOString(),
        specialRequests: 'Extra towels, early breakfast',
        splitStays: [],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        isEarlyCheckIn: false,
        isLateCheckOut: true,
        actualCheckInTime: '2024-01-14T15:30:00Z',
        actualCheckOutTime: null
      },
      {
        id: 'B004',
        bookingReference: 'HTL2024004',
        guestName: 'Emily Brown',
        guestEmail: 'emily.brown@email.com',
        guestPhone: '+1-555-0321',
        roomId: 'R004',
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 1,
        status: 'confirmed',
        totalAmount: 200,
        bookingSource: 'online',
        createdAt: new Date().toISOString(),
        specialRequests: '',
        splitStays: [],
        checkInTime: '16:00',
        checkOutTime: '10:00',
        isEarlyCheckIn: false,
        isLateCheckOut: false,
        actualCheckInTime: null,
        actualCheckOutTime: null
      }
    ].map(booking => ({
      ...booking,
      room: sampleRooms.find(r => r.id === booking.roomId)
    }));

    setBookings(sampleBookings);
    setFilteredBookings(sampleBookings);
  }, []);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;
    const today = new Date().toISOString().split('T')[0];

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.room?.roomNumber.includes(searchQuery) ||
          booking.guestPhone.includes(searchQuery)
      );
    }

    switch (viewFilter) {
      case 'today':
        filtered = filtered.filter(
          (booking) =>
            booking.checkInDate === today ||
            booking.checkOutDate === today ||
            (booking.status === 'checked-in' && booking.checkInDate <= today && booking.checkOutDate >= today)
        );
        break;
      case 'arriving':
        filtered = filtered.filter(
          (booking) => booking.checkInDate === today && booking.status === 'confirmed'
        );
        break;
      case 'departing':
        filtered = filtered.filter(
          (booking) => booking.checkOutDate === today && booking.status === 'checked-in'
        );
        break;
    }

    setFilteredBookings(filtered);
  }, [bookings, searchQuery, viewFilter]);

  const handleCheckIn = (booking) => {
    setSelectedBooking(booking);
    setCheckInData({
      actualCheckInTime: new Date().toISOString().slice(0, 16),
      notes: '',
      keyCardNumber: `KEY${booking.room?.roomNumber || '000'}`,
      depositAmount: Math.round(booking.totalAmount * 0.1),
      specialRequests: booking.specialRequests || ''
    });
    setShowCheckInModal(true);
  };

  const handleCheckOut = (booking) => {
    setSelectedBooking(booking);
    setCheckOutData({
      actualCheckOutTime: new Date().toISOString().slice(0, 16),
      notes: '',
      damageCharges: 0,
      minibarCharges: 0,
      additionalServices: 0,
      finalAmount: booking.totalAmount,
      refundAmount: 0
    });
    setShowCheckOutModal(true);
  };

  const confirmCheckIn = () => {
    if (!selectedBooking) return;

    const updatedBooking = {
      ...selectedBooking,
      status: 'checked-in',
      actualCheckInTime: checkInData.actualCheckInTime,
      checkInNotes: checkInData.notes,
      keyCardNumber: checkInData.keyCardNumber,
      depositAmount: checkInData.depositAmount
    };

    setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
    
    // Update room status to occupied
    setRooms(rooms.map(r => 
      r.id === selectedBooking.roomId ? { ...r, status: 'occupied' } : r
    ));

    setShowCheckInModal(false);
    setSelectedBooking(null);
  };

  const confirmCheckOut = () => {
    if (!selectedBooking) return;

    const updatedBooking = {
      ...selectedBooking,
      status: 'checked-out',
      actualCheckOutTime: checkOutData.actualCheckOutTime,
      checkOutNotes: checkOutData.notes,
      finalAmount: checkOutData.finalAmount,
      additionalCharges: {
        damage: checkOutData.damageCharges,
        minibar: checkOutData.minibarCharges,
        services: checkOutData.additionalServices
      },
      refundAmount: checkOutData.refundAmount
    };

    setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
    
    setRooms(rooms.map(r => 
      r.id === selectedBooking.roomId ? { ...r, status: 'cleaning' } : r
    ));

    setShowCheckOutModal(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isToday = (dateString) => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  const CheckInModal = () => (
    createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Check-In Guest</h2>
                <p className="text-sm text-gray-600">{selectedBooking?.guestName} - {selectedBooking?.bookingReference}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckInModal(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Room:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.room?.roomNumber} - {selectedBooking?.room?.name}</span>
                </div>
                <div>
                  <span className="text-blue-700">Guests:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.guests}</span>
                </div>
                <div>
                  <span className="text-blue-700">Scheduled Check-in:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.checkInTime}</span>
                </div>
                <div>
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="ml-2 font-medium">${selectedBooking?.totalAmount}</span>
                </div>
              </div>
              {selectedBooking?.isEarlyCheckIn && (
                <div className="mt-2 flex items-center space-x-2 text-orange-700">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">Early Check-in Requested</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Check-in Time</label>
                <input
                  type="datetime-local"
                  value={checkInData.actualCheckInTime}
                  onChange={(e) => setCheckInData({...checkInData, actualCheckInTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Card Number</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={checkInData.keyCardNumber}
                    onChange={(e) => setCheckInData({...checkInData, keyCardNumber: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={checkInData.depositAmount}
                    onChange={(e) => setCheckInData({...checkInData, depositAmount: parseFloat(e.target.value)})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Notes</label>
              <textarea
                value={checkInData.notes}
                onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any additional notes or observations..."
              />
            </div>

            {selectedBooking?.specialRequests && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Special Requests</h4>
                <p className="text-sm text-yellow-700">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckIn}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete Check-In</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  );

  const CheckOutModal = () => (
    createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LogOut className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Check-Out Guest</h2>
                <p className="text-sm text-gray-600">{selectedBooking?.guestName} - {selectedBooking?.bookingReference}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckOutModal(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Stay Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Room:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.room?.roomNumber} - {selectedBooking?.room?.name}</span>
                </div>
                <div>
                  <span className="text-blue-700">Check-in:</span>
                  <span className="ml-2 font-medium">{new Date(selectedBooking?.actualCheckInTime || '').toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-blue-700">Original Total:</span>
                  <span className="ml-2 font-medium">${selectedBooking?.totalAmount}</span>
                </div>
                <div>
                  <span className="text-blue-700">Scheduled Check-out:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.checkOutTime}</span>
                </div>
              </div>
              {selectedBooking?.isLateCheckOut && (
                <div className="mt-2 flex items-center space-x-2 text-orange-700">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">Late Check-out Approved</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Check-out Time</label>
                <input
                  type="datetime-local"
                  value={checkOutData.actualCheckOutTime}
                  onChange={(e) => setCheckOutData({...checkOutData, actualCheckOutTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Charges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damage Charges</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={checkOutData.damageCharges}
                      onChange={(e) => {
                        const newCharges = parseFloat(e.target.value) || 0;
                        setCheckOutData({
                          ...checkOutData, 
                          damageCharges: newCharges,
                          finalAmount: selectedBooking.totalAmount + newCharges + checkOutData.minibarCharges + checkOutData.additionalServices
                        });
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minibar Charges</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={checkOutData.minibarCharges}
                      onChange={(e) => {
                        const newCharges = parseFloat(e.target.value) || 0;
                        setCheckOutData({
                          ...checkOutData, 
                          minibarCharges: newCharges,
                          finalAmount: selectedBooking.totalAmount + checkOutData.damageCharges + newCharges + checkOutData.additionalServices
                        });
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Services</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={checkOutData.additionalServices}
                      onChange={(e) => {
                        const newCharges = parseFloat(e.target.value) || 0;
                        setCheckOutData({
                          ...checkOutData, 
                          additionalServices: newCharges,
                          finalAmount: selectedBooking.totalAmount + checkOutData.damageCharges + checkOutData.minibarCharges + newCharges
                        });
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-green-900">Final Amount:</span>
                <span className="text-xl font-bold text-green-900">${checkOutData.finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Notes</label>
              <textarea
                value={checkOutData.notes}
                onChange={(e) => setCheckOutData({...checkOutData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Room condition, lost items, feedback, etc..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCheckOutModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Complete Check-Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests or rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewFilter('today')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewFilter === 'today' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Today's Activity
              </button>
              <button
                onClick={() => setViewFilter('arriving')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewFilter === 'arriving' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Arrivals
              </button>
              <button
                onClick={() => setViewFilter('departing')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewFilter === 'departing' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Departures
              </button>
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewFilter === 'all' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                All Bookings
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {filteredBookings.length} bookings
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Arrivals</p>
                <p className="text-xl font-semibold text-gray-900">
                  {bookings.filter(b => isToday(b.checkInDate) && b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LogOut className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Departures</p>
                <p className="text-xl font-semibold text-gray-900">
                  {bookings.filter(b => isToday(b.checkOutDate) && b.status === 'checked-in').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bed className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
                <p className="text-xl font-semibold text-gray-900">
                  {rooms.filter(r => r.status === 'occupied').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cleaning Required</p>
                <p className="text-xl font-semibold text-gray-900">
                  {rooms.filter(r => r.status === 'cleaning').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchQuery || viewFilter !== 'all'
                  ? 'No bookings match your current filters.'
                  : 'No bookings scheduled for today.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Guest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Check-In</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Check-Out</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Special Notes</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{booking.guestName}</p>
                          <p className="text-sm text-gray-600">{booking.bookingReference}</p>
                          <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.room?.roomNumber} - {booking.room?.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(booking.room?.status)}`}>
                              {booking.room?.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.checkInTime}
                            {booking.isEarlyCheckIn && (
                              <span className="ml-1 text-orange-600">(Early)</span>
                            )}
                          </p>
                          {booking.actualCheckInTime && (
                            <p className="text-xs text-green-600">
                              ✓ {new Date(booking.actualCheckInTime).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.checkOutTime}
                            {booking.isLateCheckOut && (
                              <span className="ml-1 text-orange-600">(Late)</span>
                            )}
                          </p>
                          {booking.actualCheckOutTime && (
                            <p className="text-xs text-blue-600">
                              ✓ {new Date(booking.actualCheckOutTime).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-1">
                          {booking.isEarlyCheckIn && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <Timer className="h-3 w-3" />
                              <span className="text-xs">Early Check-in</span>
                            </div>
                          )}
                          {booking.isLateCheckOut && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <Timer className="h-3 w-3" />
                              <span className="text-xs">Late Check-out</span>
                            </div>
                          )}
                          {booking.specialRequests && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-xs truncate max-w-32" title={booking.specialRequests}>
                                Special requests
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {booking.status === 'confirmed' && isToday(booking.checkInDate) && (
                            <button
                              onClick={() => handleCheckIn(booking)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                              title="Check In Guest"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Check In</span>
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => handleCheckOut(booking)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                              title="Check Out Guest"
                            >
                              <LogOut className="h-3 w-3" />
                              <span>Check Out</span>
                            </button>
                          )}
                          {booking.status === 'checked-out' && (
                            <span className="text-xs text-gray-500">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showCheckInModal && selectedBooking && <CheckInModal />}
      {showCheckOutModal && selectedBooking && <CheckOutModal />}
    </div>
  );
};

export default CheckInCheckOut;