import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Bed,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Edit,
  Eye,
  X,
  User,
  Mail,
  Phone,
  Save,
  MapPin,
  CreditCard,
  Split,
  Trash2
} from 'lucide-react';

const BookingCard = React.memo(({ booking, onView, onEdit, onDelete }) => {
  const room = booking.room;
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  const getStatusColor = (status) => {
    const bookingStatuses = [
      { id: 'all', name: 'All Bookings', color: 'gray' },
      { id: 'confirmed', name: 'Confirmed', color: 'blue' },
      { id: 'checked-in', name: 'Checked In', color: 'green' },
      { id: 'checked-out', name: 'Checked Out', color: 'gray' },
      { id: 'cancelled', name: 'Cancelled', color: 'red' },
      { id: 'no-show', name: 'No Show', color: 'orange' }
    ];
    const statusObj = bookingStatuses.find(s => s.id === status);
    return statusObj ? statusObj.color : 'gray';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{booking.guestName}</h3>
          <p className="text-sm text-gray-600">{booking.bookingReference}</p>
        </div>
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          getStatusColor(booking.status) === 'green' ? 'bg-green-100 text-green-800' :
          getStatusColor(booking.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
          getStatusColor(booking.status) === 'red' ? 'bg-red-100 text-red-800' :
          getStatusColor(booking.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Bed className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Room:</span>
          <span className="font-medium">
            {room ? `${room.roomNumber} - ${room.name}` : 'Multiple (Split Stay)'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Stay:</span>
          <span className="font-medium">
            {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()} ({nights} nights)
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Guests:</span>
          <span className="font-medium">{booking.guests}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-green-600">${booking.totalAmount}</span>
        </div>
      </div>

      {booking.splitStays?.length > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <div className="flex items-center space-x-1 text-sm text-yellow-800">
            <Split className="h-4 w-4" />
            <span className="font-medium">Split Stay ({booking.splitStays.length} segments)</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Source: <span className="capitalize">{booking.bookingSource}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(booking)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(booking)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Modify Booking"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(booking.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Cancel Booking"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

const BookingForm = ({ booking, rooms, bookings, onSave, onCancel, quickBookingData }) => {
  const [formData, setFormData] = useState(
    quickBookingData
      ? {
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          roomId: quickBookingData.roomId,
          checkInDate: quickBookingData.date,
          checkOutDate: '',
          guests: 1,
          status: 'confirmed',
          bookingSource: 'walk-in',
          specialRequests: '',
          splitStays: []
        }
      : booking || {
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          roomId: '',
          checkInDate: '',
          checkOutDate: '',
          guests: 1,
          status: 'confirmed',
          bookingSource: 'walk-in',
          specialRequests: '',
          splitStays: []
        }
  );
  const [splitStays, setSplitStays] = useState(booking?.splitStays || []);
  const [useSplitStay, setUseSplitStay] = useState(booking?.splitStays?.length > 0 || false);

  const calculateTotal = (splitStays, roomId, checkIn, checkOut) => {
    if (splitStays.length > 0) {
      return splitStays.reduce((total, stay) => {
        const room = rooms.find(r => r.id === stay.roomId);
        if (!room) return total;
        const startDate = new Date(stay.checkIn);
        const endDate = new Date(stay.checkOut);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return total + nights * room.basePrice;
      }, 0);
    }
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return nights * room.basePrice;
  };

  const isRoomAvailable = (roomId, checkIn, checkOut, excludeBookingId) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return !bookings.some(b => 
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.roomId === roomId &&
      new Date(b.checkInDate) < end &&
      new Date(b.checkOutDate) > start
    ) && !bookings.some(b => 
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.splitStays.some(stay => 
        stay.roomId === roomId &&
        new Date(stay.checkIn) < end &&
        new Date(stay.checkOut) > start
      )
    );
  };

  const validateSplitStays = (splitStays, checkInDate, checkOutDate) => {
    if (splitStays.length === 0) return true;
    const mainStart = new Date(checkInDate);
    const mainEnd = new Date(checkOutDate);
    let currentDate = new Date(mainStart);
    for (const stay of splitStays.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))) {
      const stayStart = new Date(stay.checkIn);
      const stayEnd = new Date(stay.checkOut);
      if (stayStart.getTime() !== currentDate.getTime()) return false; // Gap or overlap
      if (stayStart < mainStart || stayEnd > mainEnd) return false; // Outside main dates
      if (!isRoomAvailable(stay.roomId, stay.checkIn, stay.checkOut, booking?.id)) return false;
      currentDate = new Date(stayEnd);
    }
    return currentDate.getTime() === mainEnd.getTime();
  };

  const handleAddSplitStay = () => {
    const lastStay = splitStays[splitStays.length - 1];
    const startDate = lastStay ? lastStay.checkOut : formData.checkInDate;
    setSplitStays([...splitStays, { roomId: '', checkIn: startDate, checkOut: '' }]);
  };

  const handleRemoveSplitStay = (index) => {
    setSplitStays(splitStays.filter((_, i) => i !== index));
  };

  const handleSplitStayChange = (index, field, value) => {
    const newSplitStays = [...splitStays];
    newSplitStays[index] = { ...newSplitStays[index], [field]: value };
    setSplitStays(newSplitStays);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    
    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    if (!useSplitStay && selectedRoom && formData.guests > selectedRoom.maxCapacity) {
      alert(`Selected room can accommodate maximum ${selectedRoom.maxCapacity} guests`);
      return;
    }

    if (!useSplitStay && !isRoomAvailable(formData.roomId, formData.checkInDate, formData.checkOutDate, booking?.id)) {
      alert('Selected room is not available for the specified dates');
      return;
    }

    if (useSplitStay && !validateSplitStays(splitStays, formData.checkInDate, formData.checkOutDate)) {
      alert('Split stays must cover the entire booking period without gaps or overlaps and rooms must be available');
      return;
    }

    if (useSplitStay && splitStays.some(stay => !stay.roomId || !stay.checkIn || !stay.checkOut)) {
      alert('All split stay segments must have a room and valid dates');
      return;
    }

    onSave({
      ...formData,
      totalAmount: calculateTotal(useSplitStay ? splitStays : [], formData.roomId, formData.checkInDate, formData.checkOutDate),
      id: booking ? booking.id : `B${String(Math.random()).slice(2, 8)}`,
      bookingReference: booking ? booking.bookingReference : `HTL2024${String(Math.random()).slice(2, 8)}`,
      createdAt: booking ? booking.createdAt : new Date().toISOString(),
      splitStays: useSplitStay ? splitStays : []
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {quickBookingData ? 'Quick Booking' : booking ? 'Modify Booking' : 'Create New Booking'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {quickBookingData && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-blue-900 font-medium">
                {quickBookingData.roomNumber} - {quickBookingData.roomName}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Source</label>
                <select
                  value={formData.bookingSource}
                  onChange={(e) => setFormData({ ...formData, bookingSource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="walk-in">Walk-in</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked In</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={useSplitStay}
                onChange={(e) => {
                  setUseSplitStay(e.target.checked);
                  if (!e.target.checked) setSplitStays([]);
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Use Split Stay</label>
            </div>
            {!useSplitStay ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!useSplitStay}
                  disabled={useSplitStay}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber} - {room.name} (${room.basePrice}/night)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleAddSplitStay}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Split Stay Segment</span>
                </button>
                {splitStays.map((stay, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                      {quickBookingData && index === 0 ? (
                        <select
                          value={stay.roomId}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        >
                          <option value={quickBookingData.roomId}>
                            {quickBookingData.roomNumber} - {quickBookingData.roomName}
                          </option>
                        </select>
                      ) : (
                        <select
                          value={stay.roomId}
                          onChange={(e) => handleSplitStayChange(index, 'roomId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select a room</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.roomNumber} - {room.name} (${room.basePrice}/night)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                      <input
                        type="date"
                        value={stay.checkIn}
                        onChange={(e) => handleSplitStayChange(index, 'checkIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                      <input
                        type="date"
                        value={stay.checkOut}
                        onChange={(e) => handleSplitStayChange(index, 'checkOut', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={quickBookingData && index === 0}
                      />
                    </div>
                    {!(quickBookingData && index === 0) && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitStay(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special requests or notes..."
            />
          </div>

          {(formData.roomId || (useSplitStay && splitStays.length > 0)) && formData.checkInDate && formData.checkOutDate && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-blue-900">Estimated Total:</span>
                <span className="text-xl font-bold text-blue-900">
                  ${calculateTotal(useSplitStay ? splitStays : [], formData.roomId, formData.checkInDate, formData.checkOutDate)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{booking ? 'Update Booking' : 'Create Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const BookingDetails = ({ booking, rooms, onClose, onEdit }) => {
  const room = rooms.find(r => r.id === booking.roomId);
  const bookingStatuses = [
    { id: 'confirmed', name: 'Confirmed', color: 'blue' },
    { id: 'checked-in', name: 'Checked In', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'gray' },
    { id: 'cancelled', name: 'Cancelled', color: 'red' },
    { id: 'no-show', name: 'No Show', color: 'orange' }
  ];
  const statusConfig = bookingStatuses.find(s => s.id === booking.status) || { color: 'gray' };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{booking.bookingReference}</h2>
              <p className="text-sm text-gray-600">{booking.guestName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                statusConfig.color === 'green' ? 'bg-green-100 text-green-800' :
                statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                statusConfig.color === 'red' ? 'bg-red-100 text-red-800' :
                statusConfig.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {statusConfig.name}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-green-600">${booking.totalAmount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Booking Source</h3>
              <p className="text-lg font-medium capitalize">{booking.bookingSource}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">{booking.guestName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{booking.guestEmail || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm font-medium">{booking.guestPhone || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Guests:</span>
                <span className="text-sm font-medium">{booking.guests}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Bed className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Room:</span>
                <span className="text-sm font-medium">
                  {booking.splitStays.length > 0 ? 'Multiple (Split Stay)' : room ? `${room.roomNumber} - ${room.name}` : 'Room not found'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Floor:</span>
                <span className="text-sm font-medium">{room?.floor || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Check-in:</span>
                <span className="text-sm font-medium">
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Check-out:</span>
                <span className="text-sm font-medium">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {booking.splitStays?.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Split className="h-5 w-5 text-yellow-600" />
                <span>Split Stay Information</span>
              </h3>
              <div className="space-y-2">
                {booking.splitStays.map((stay, index) => {
                  const stayRoom = rooms.find(r => r.id === stay.roomId);
                  return (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">
                          Room {stayRoom?.roomNumber || 'N/A'} - {stayRoom?.name || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(stay.checkIn).toLocaleDateString()} → {new Date(stay.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {booking.specialRequests && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
              <p className="text-gray-700">{booking.specialRequests}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEdit(booking)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Modify Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Memoized CalendarRow
const CalendarRow = React.memo(({ room, dates, bookings, bookingStatuses, onCellClick, onBookingClick, isToday, isWeekend }) => {
  const getBookingForRoomAndDate = (roomId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(booking => 
      (booking.roomId === roomId && 
       booking.checkInDate <= dateStr && 
       booking.checkOutDate > dateStr) ||
      booking.splitStays.some(stay => 
        stay.roomId === roomId && 
        stay.checkIn <= dateStr && 
        stay.checkOut > dateStr
      )
    );
  };

  return (
    <div className="grid grid-cols-8 divide-x divide-gray-200 hover:bg-gray-50">
      <div className="p-4 bg-gray-50">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bed className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{room.roomNumber}</span>
          </div>
          <div className="text-xs text-gray-600">{room.name}</div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{room.capacity}/{room.maxCapacity}</span>
            <span className="ml-2">${room.basePrice}/night</span>
          </div>
        </div>
      </div>
      {dates.map((date, dateIndex) => {
        const booking = getBookingForRoomAndDate(room.id, date);
        const statusConfig = booking ? bookingStatuses.find(s => s.id === booking.status) || { color: 'gray' } : null;
        const isFirstDay = booking && (
          booking.checkInDate === date.toISOString().split('T')[0] ||
          booking.splitStays.some(stay => stay.checkIn === date.toISOString().split('T')[0])
        );
        const isLastDay = booking && (
          booking.checkOutDate === date.toISOString().split('T')[0] ||
          booking.splitStays.some(stay => stay.checkOut === date.toISOString().split('T')[0])
        );
        const isSplitStay = booking?.splitStays?.some(
          stay => stay.roomId === room.id && stay.checkIn <= date.toISOString().split('T')[0] && stay.checkOut > date.toISOString().split('T')[0]
        );

        return (
          <div
            key={dateIndex}
            className={`p-2 h-20 cursor-pointer transition-colors ${
              booking ? 'relative' : 'hover:bg-blue-50'
            } ${isWeekend(date) ? 'bg-red-50' : ''}`}
            onClick={() => booking ? onBookingClick(booking) : onCellClick(room.id, date)}
          >
            {booking ? (
              <div className={`h-full rounded px-2 py-1 bg-${statusConfig.color}-500 text-white text-xs`}>
                <div className="font-medium truncate">{booking.guestName}</div>
                <div className="truncate opacity-90">{booking.bookingReference}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <Users className="h-3 w-3" />
                  <span>{booking.guests}</span>
                  {isFirstDay && <Clock className="h-3 w-3 ml-auto" />}
                  {isSplitStay && <Split className="h-3 w-3 ml-1" />}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

const BookingCalendar = () => {
  const [view, setView] = useState('list'); 
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', roomType: 'all', dateRange: { start: '', end: '' } });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); 
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [quickBookingData, setQuickBookingData] = useState(null);

  const bookingStatuses = [
    { id: 'all', name: 'All Bookings', color: 'gray' },
    { id: 'confirmed', name: 'Confirmed', color: 'blue' },
    { id: 'checked-in', name: 'Checked In', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'gray' },
    { id: 'cancelled', name: 'Cancelled', color: 'red' },
    { id: 'no-show', name: 'No Show', color: 'orange' }
  ];

  const roomTypes = [
    { id: 'all', name: 'All Room Types' },
    { id: 'single', name: 'Single Room' },
    { id: 'double', name: 'Double Room' },
    { id: 'twin', name: 'Twin Room' },
    { id: 'triple', name: 'Triple Room' },
    { id: 'suite', name: 'Suite' },
    { id: 'presidential', name: 'Presidential Suite' },
    { id: 'villa', name: 'Villa' },
    { id: 'penthouse', name: 'Penthouse' }
  ];

  // Initialize sample data
  useEffect(() => {
    const sampleRooms = [
      { id: 'R001', roomNumber: '101', type: 'single', name: 'Deluxe Single Room', capacity: 1, maxCapacity: 2, basePrice: 120, weekendPrice: 150, floor: 1 },
      { id: 'R002', roomNumber: '201', type: 'double', name: 'Premium Double Room', capacity: 2, maxCapacity: 3, basePrice: 180, weekendPrice: 220, floor: 2 },
      { id: 'R003', roomNumber: '301', type: 'suite', name: 'Executive Suite', capacity: 4, maxCapacity: 6, basePrice: 350, weekendPrice: 420, floor: 3 },
      { id: 'R004', roomNumber: '102', type: 'single', name: 'Standard Single Room', capacity: 1, maxCapacity: 2, basePrice: 100, weekendPrice: 130, floor: 1 },
      { id: 'R005', roomNumber: '202', type: 'double', name: 'Deluxe Double Room', capacity: 2, maxCapacity: 3, basePrice: 200, weekendPrice: 240, floor: 2 },
      { id: 'R006', roomNumber: '302', type: 'suite', name: 'Family Suite', capacity: 4, maxCapacity: 6, basePrice: 320, weekendPrice: 380, floor: 3 }
    ];
    setRooms(sampleRooms);

    const today = new Date();
    const sampleBookings = [
      {
        id: 'B001',
        bookingReference: 'HTL2024001',
        guestName: 'John Smith',
        guestEmail: 'john.smith@email.com',
        guestPhone: '+1-555-0123',
        roomId: 'R001',
        checkInDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOutDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 1,
        status: 'confirmed',
        totalAmount: 360,
        bookingSource: 'walk-in',
        createdAt: new Date().toISOString(),
        specialRequests: 'Late check-in requested',
        splitStays: []
      },
      {
        id: 'B002',
        bookingReference: 'HTL2024002',
        guestName: 'Sarah Johnson',
        guestEmail: 'sarah.j@email.com',
        guestPhone: '+1-555-0456',
        roomId: 'R002',
        checkInDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOutDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 2,
        status: 'confirmed',
        totalAmount: 540,
        bookingSource: 'phone',
        createdAt: new Date().toISOString(),
        specialRequests: '',
        splitStays: []
      },
      {
        id: 'B003',
        bookingReference: 'HTL2024003',
        guestName: 'Mike Davis',
        guestEmail: 'mike.davis@email.com',
        guestPhone: '+1-555-0789',
        roomId: 'R003',
        checkInDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOutDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 4,
        status: 'checked-in',
        totalAmount: 700 + 180, // R003 for 2 nights + R002 for 1 night
        bookingSource: 'email',
        createdAt: new Date().toISOString(),
        specialRequests: 'Extra towels, early breakfast',
        splitStays: [
          { roomId: 'R003', checkIn: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], checkOut: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          { roomId: 'R002', checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], checkOut: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        ]
      }
    ].map(booking => ({
      ...booking,
      room: booking.splitStays.length > 0 ? null : sampleRooms.find(r => r.id === booking.roomId)
    }));
    setBookings(sampleBookings);
    setFilteredBookings(sampleBookings);
    setFilteredRooms(sampleRooms);
  }, []);

  // Filter bookings and rooms
  useEffect(() => {
    let filteredB = bookings;
    let filteredR = rooms;

    if (filters.search) {
      filteredB = filteredB.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.bookingReference.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.guestEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.guestPhone.includes(filters.search)
      );
      filteredR = filteredR.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          room.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filteredB = filteredB.filter((booking) => booking.status === filters.status);
    }

    if (filters.roomType !== 'all') {
      filteredR = filteredR.filter((room) => room.type === filters.roomType);
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filteredB = filteredB.filter(
        (booking) => new Date(booking.checkInDate) <= end && new Date(booking.checkOutDate) >= start
      );
    }

    setFilteredBookings(filteredB);
    setFilteredRooms(filteredR);
  }, [bookings, rooms, filters]);

  const handleAddBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      room: bookingData.splitStays.length > 0 ? null : rooms.find(r => r.id === bookingData.roomId)
    };
    setBookings([...bookings, newBooking]);
    setShowBookingForm(false);
    setQuickBookingData(null);
  };

  const handleEditBooking = (bookingData) => {
    const updatedBooking = {
      ...bookingData,
      room: bookingData.splitStays.length > 0 ? null : rooms.find(r => r.id === bookingData.roomId)
    };
    setBookings(bookings.map((b) => (b.id === bookingData.id ? updatedBooking : b)));
    setShowBookingForm(false);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  // Calendar logic
  const getDateRange = () => {
    let startDate = new Date(currentDate);
    if (filters.dateRange.start && filters.dateRange.end) {
      startDate = new Date(filters.dateRange.start);
    } else {
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
    }
    
    const dates = [];
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date(startDate);
    endDate.setDate(endDate.getDate() + (viewMode === 'week' ? 6 : 13));
    
    let current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - (viewMode === 'week' ? 7 : 14));
    setCurrentDate(newDate);
    setFilters({ ...filters, dateRange: { start: '', end: '' } });
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (viewMode === 'week' ? 7 : 14));
    setCurrentDate(newDate);
    setFilters({ ...filters, dateRange: { start: '', end: '' } });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setFilters({ ...filters, dateRange: { start: '', end: '' } });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const handleCellClick = (roomId, date) => {
    const room = rooms.find(r => r.id === roomId);
    setQuickBookingData({
      roomId,
      roomName: room?.name,
      roomNumber: room?.roomNumber,
      date: date.toISOString().split('T')[0]
    });
    setShowBookingForm(true);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const dates = getDateRange();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* View Toggle and Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1 rounded-md text-sm ${
                  view === 'list' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Booking List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1 rounded-md text-sm ${
                  view === 'calendar' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Reservation Calendar
              </button>
            </div>
        
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {bookingStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              {view === 'calendar' && (
                <>
                  <select
                    value={filters.roomType}
                    onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                 
                </>
              )}
            </div>
            <button
              onClick={() => setShowBookingForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Booking</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {view === 'list' ? `${filteredBookings.length} bookings` : `${filteredRooms.length} rooms`}
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

        {view === 'calendar' && (
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={navigatePrevious}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {dates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h1>
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Today
            </button>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'week' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'month' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                2 Weeks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend for Calendar */}
      {view === 'calendar' && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-700">Legend:</span>
            {bookingStatuses.filter(s => s.id !== 'all').map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                <span className="text-sm text-gray-600">{status.name}</span>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Split className="h-3 w-3 text-yellow-600" />
              <span className="text-sm text-gray-600">Split Stay</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-4">
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-xl font-semibold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Checked In</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'checked-in').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">
                  {filters.search || filters.status !== 'all' || (filters.dateRange.start && filters.dateRange.end)
                    ? 'No bookings match your current filters.'
                    : 'Start by creating your first booking.'}
                </p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Booking</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onView={(b) => {
                      setSelectedBooking(b);
                      setShowBookingDetails(true);
                    }}
                    onEdit={(b) => {
                      setEditingBooking(b);
                      setShowBookingForm(true);
                    }}
                    onDelete={handleDeleteBooking}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-8 divide-x divide-gray-200">
                <div className="p-3">
                  <span className="text-sm font-medium text-gray-700">Room</span>
                </div>
                {dates.map((date, index) => (
                  <div key={index} className="p-3 text-center">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-sm font-medium ${
                        isToday(date) ? 'text-blue-600 bg-blue-100 rounded-full px-2 py-1' : 
                        isWeekend(date) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      {isToday(date) && (
                        <div className="text-xs text-blue-600 font-medium">Today</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <CalendarRow
                  key={room.id}
                  room={room}
                  dates={dates}
                  bookings={filteredBookings}
                  bookingStatuses={bookingStatuses}
                  onCellClick={handleCellClick}
                  onBookingClick={handleBookingClick}
                  isToday={isToday}
                  isWeekend={isWeekend}
                />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-600">
                  {filters.search || filters.roomType !== 'all'
                    ? 'No rooms match your current filters.'
                    : 'No rooms available in the system.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showBookingForm && (
        <BookingForm
          booking={editingBooking}
          rooms={rooms}
          bookings={bookings}
          quickBookingData={quickBookingData}
          onSave={editingBooking ? handleEditBooking : handleAddBooking}
          onCancel={() => {
            setShowBookingForm(false);
            setEditingBooking(null);
            setQuickBookingData(null);
          }}
        />
      )}

      {showBookingDetails && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          rooms={rooms}
          onClose={() => {
            setShowBookingDetails(false);
            setSelectedBooking(null);
          }}
          onEdit={(booking) => {
            setEditingBooking(booking);
            setShowBookingForm(true);
            setShowBookingDetails(false);
          }}
        />
      )}
    </div>
  );
};

export default BookingCalendar;