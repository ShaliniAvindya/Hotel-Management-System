import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
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
import { API_BASE_URL } from '../../apiconfig';

const CheckInCheckOut = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('today');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInData, setCheckInData] = useState({
    actualCheckInTime: '',
    notes: '',
    keyCardNumber: '',
    depositAmount: 0,
    specialRequests: '',
    isEarlyCheckIn: false
  });
  const [checkOutData, setCheckOutData] = useState({
    actualCheckOutTime: '',
    notes: '',
    damageCharges: 0,
    minibarCharges: 0,
    additionalServices: 0,
    finalAmount: 0,
    refundAmount: 0,
    isLateCheckOut: false
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch rooms and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`);
        setRooms(roomsResponse.data);

        const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`);
        const fetchedBookings = bookingsResponse.data.map(booking => ({
          ...booking,
          room: booking.splitStays.length > 0 ? null : roomsResponse.data.find(r => r.id === booking.roomId)
        }));
        console.log('Fetched bookings:', fetchedBookings);
        setBookings(fetchedBookings);
        setFilteredBookings(fetchedBookings);
      } catch (err) {
        setError('Failed to fetch data from the server');
      }
    };
    fetchData();
  }, []);

  // Filter bookings
  useEffect(() => {
  let filtered = bookings;
  console.log('Bookings before filter:', bookings);
    const today = new Date().toISOString().split('T')[0];

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (booking.room?.roomNumber && booking.room.roomNumber.includes(searchQuery)) ||
          booking.guestPhone.includes(searchQuery)
      );
    }

    switch (viewFilter) {
      case 'today':
        filtered = filtered.filter(
          (booking) =>
            booking.checkInDate.split('T')[0] === today ||
            booking.checkOutDate.split('T')[0] === today ||
            (booking.status === 'checked-in' && 
             booking.checkInDate.split('T')[0] <= today && 
             booking.checkOutDate.split('T')[0] >= today)
        );
        break;
      case 'arriving':
        filtered = filtered.filter(
          (booking) => booking.checkInDate.split('T')[0] === today && booking.status === 'confirmed'
        );
        break;
      case 'departing':
        filtered = filtered.filter(
          (booking) => booking.checkOutDate.split('T')[0] === today && booking.status === 'checked-in'
        );
        break;
    }

  console.log('Filtered bookings:', filtered);
  setFilteredBookings(filtered);
  }, [bookings, searchQuery, viewFilter]);

  const handleCheckIn = (booking) => {
    setSelectedBooking(booking);
    setCheckInData({
      actualCheckInTime: new Date().toISOString().slice(0, 16),
      notes: '',
      keyCardNumber: `KEY${booking.room?.roomNumber || '000'}`,
      depositAmount: Math.round(booking.totalAmount * 0.1),
      specialRequests: booking.specialRequests || '',
      isEarlyCheckIn: booking.isEarlyCheckIn || false
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
      refundAmount: 0,
      isLateCheckOut: booking.isLateCheckOut || false
    });
    setShowCheckOutModal(true);
  };

  const confirmCheckIn = async () => {
    if (!selectedBooking) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/checkinout/checkin/${selectedBooking.id}`, checkInData);
      const updatedBooking = {
        ...response.data,
        room: selectedBooking.room
      };
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setFilteredBookings(filteredBookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSuccess('Guest checked in successfully');
      setTimeout(() => {
        setShowCheckInModal(false);
        setSuccess(null);
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in guest');
      setTimeout(() => setError(null), 3000);
    }
  };

  const confirmCheckOut = async () => {
    if (!selectedBooking) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/checkinout/checkout/${selectedBooking.id}`, checkOutData);
      const updatedBooking = {
        ...response.data,
        room: selectedBooking.room
      };
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setFilteredBookings(filteredBookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSuccess('Guest checked out successfully');
      setTimeout(() => {
        setShowCheckOutModal(false);
        setSuccess(null);
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out guest');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'clean': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      case 'dirty': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isToday = (dateString) => {
    return dateString.split('T')[0] === new Date().toISOString().split('T')[0];
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
                  <span className="ml-2 font-medium">{selectedBooking?.room?.roomNumber || 'Split Stay'} - {selectedBooking?.room?.name || 'Multiple Rooms'}</span>
                </div>
                <div>
                  <span className="text-blue-700">Guests:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.guests}</span>
                </div>
                <div>
                  <span className="text-blue-700">Scheduled Check-in:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.checkInTime || '14:00'}</span>
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
                    onChange={(e) => setCheckInData({...checkInData, depositAmount: parseFloat(e.target.value) || 0})}
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

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
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
                  <span className="ml-2 font-medium">{selectedBooking?.room?.roomNumber || 'Split Stay'} - {selectedBooking?.room?.name || 'Multiple Rooms'}</span>
                </div>
                <div>
                  <span className="text-blue-700">Check-in:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.actualCheckInTime ? new Date(selectedBooking.actualCheckInTime).toLocaleDateString() : 'Not checked in'}</span>
                </div>
                <div>
                  <span className="text-blue-700">Original Total:</span>
                  <span className="ml-2 font-medium">${selectedBooking?.totalAmount}</span>
                </div>
                <div>
                  <span className="text-blue-700">Scheduled Check-out:</span>
                  <span className="ml-2 font-medium">{selectedBooking?.checkOutTime || '12:00'}</span>
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

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

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
                  {rooms.filter(r => r.occupancyStatus === 'occupied').length}
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
                            {booking.room?.roomNumber || 'Split Stay'} - {booking.room?.name || 'Multiple Rooms'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(booking.room?.status)}`}>
                              {booking.room?.status || 'N/A'}
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
                            {booking.checkInTime || '14:00'}
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
                            {booking.checkOutTime || '12:00'}
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
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default CheckInCheckOut;