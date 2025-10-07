import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
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
import { API_BASE_URL } from '../../apiconfig';

const BookingCard = React.memo(({ booking, onView, onEdit, onDelete }) => {
  const room = booking.room;
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'blue';
      case 'checked-in': return 'green';
      case 'checked-out': return 'gray';
      case 'cancelled': return 'red';
      case 'no-show': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{`${booking.firstName} ${booking.lastName || ''}`}</h3>
          <p className="text-sm text-gray-600">{booking.bookingReference}</p>
          <p className="text-sm text-gray-600">Guest ID: {booking.guestId || 'N/A'}</p>
        </div>
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800`}>
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

const BookingForm = ({ booking, rooms, bookings, onSave, onCancel, quickBookingData, setSuccess, setError }) => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState(
    quickBookingData
      ? {
          firstName: '',
          lastName: '',
          guestEmail: '',
          guestPhone: '',
          guestId: null,
          roomId: quickBookingData.roomId,
          checkInDate: quickBookingData.date,
          checkOutDate: '',
          guests: 1,
          status: 'confirmed',
          bookingSource: 'walk-in',
          specialRequests: '',
          splitStays: []
        }
      : booking
      ? {
          ...booking,
          firstName: booking.firstName || '',
          lastName: booking.lastName || '',
          guestEmail: booking.guestEmail || '',
          guestPhone: booking.guestPhone || '',
          guestId: booking.guestId || null,
          checkInDate: formatDateForInput(booking.checkInDate),
          checkOutDate: formatDateForInput(booking.checkOutDate),
          specialRequests: booking.specialRequests || '',
          splitStays: booking.splitStays || []
        }
      : {
          firstName: '',
          lastName: '',
          guestEmail: '',
          guestPhone: '',
          guestId: null,
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
  const [splitStays, setSplitStays] = useState(
    booking?.splitStays?.map(stay => ({
      ...stay,
      checkIn: formatDateForInput(stay.checkIn),
      checkOut: formatDateForInput(stay.checkOut)
    })) || []
  );
  const [useSplitStay, setUseSplitStay] = useState(booking?.splitStays?.length > 0 || false);

  const calculateTotal = (splitStays, roomId, checkIn, checkOut) => {
    if (splitStays.length > 0) {
      return splitStays.reduce((total, stay) => {
        const room = rooms.find(r => r.id === stay.roomId);
        if (!room) return total;
        const startDate = new Date(stay.checkIn);
        const endDate = new Date(stay.checkOut);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
        let price = 0;
        let current = new Date(startDate);
        while (current < endDate) {
          price += isWeekend(current) ? room.weekendPrice : room.basePrice;
          current.setDate(current.getDate() + 1);
        }
        return total + price;
      }, 0);
    }
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
    let price = 0;
    let current = new Date(startDate);
    while (current < endDate) {
      price += isWeekend(current) ? room.weekendPrice : room.basePrice;
      current.setDate(current.getDate() + 1);
    }
    return price;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    
    if (!formData.firstName) {
      setError('First name is required');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    if (!useSplitStay && selectedRoom && formData.guests > selectedRoom.maxCapacity) {
      setError(`Selected room can accommodate maximum ${selectedRoom.maxCapacity} guests`);
      return;
    }

    if (useSplitStay && !validateSplitStays(splitStays, formData.checkInDate, formData.checkOutDate)) {
      setError('Split stays must cover the entire booking period without gaps or overlaps and rooms must be available');
      return;
    }

    if (useSplitStay && splitStays.some(stay => !stay.roomId || !stay.checkIn || !stay.checkOut)) {
      setError('All split stay segments must have a room and valid dates');
      return;
    }

    const bookingData = {
      ...formData,
      totalAmount: calculateTotal(useSplitStay ? splitStays : [], formData.roomId, formData.checkInDate, formData.checkOutDate),
      splitStays: useSplitStay ? splitStays : []
    };

    try {
      if (booking) {
        const response = await axios.put(`${API_BASE_URL}/bookings/${booking.id}`, bookingData);
        onSave(response.data);
        setSuccess('Booking updated successfully!');
        setTimeout(() => {
          onCancel();
          window.location.reload();
        }, 2000);
      } else {
        // Create new booking
        const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
        onSave(response.data);
        setSuccess('Booking created successfully!');
        setTimeout(() => {
          onCancel();
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while saving the booking');
    }
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
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
  const statusConfig = {
    confirmed: { name: 'Confirmed', color: 'blue' },
    'checked-in': { name: 'Checked In', color: 'green' },
    'checked-out': { name: 'Checked Out', color: 'gray' },
    cancelled: { name: 'Cancelled', color: 'red' },
    'no-show': { name: 'No Show', color: 'orange' }
  }[booking.status] || { name: booking.status, color: 'gray' };

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
              <p className="text-sm text-gray-600">{`${booking.firstName} ${booking.lastName || ''}`}</p>
              <p className="text-sm text-gray-600">Guest ID: {booking.guestId || 'N/A'}</p>
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
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
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
                <span className="text-sm font-medium">{`${booking.firstName} ${booking.lastName || ''}`}</span>
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
                <div className="font-medium truncate">{`${booking.firstName} ${booking.lastName || ''}`}</div>
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

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

  // Fetch rooms and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`);
        const fetchedRooms = roomsResponse.data;
        setRooms(fetchedRooms);
        setFilteredRooms(fetchedRooms);

        const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`);
        const fetchedBookings = bookingsResponse.data.map(booking => ({
          ...booking,
          room: booking.splitStays.length > 0 ? null : fetchedRooms.find(r => r.id === booking.roomId)
        }));
        setBookings(fetchedBookings);
        setFilteredBookings(fetchedBookings);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch data from the server');
      }
    };

    fetchData();
  }, []);

  // Filter bookings and rooms
  useEffect(() => {
    let filteredB = bookings;
    let filteredR = rooms;

    if (filters.search) {
      filteredB = filteredB.filter(
        (booking) =>
          `${booking.firstName} ${booking.lastName || ''}`.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.bookingReference.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.guestEmail?.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.guestPhone?.includes(filters.search)
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

  const handleAddBooking = async (bookingData) => {
    try {
      const { id, ...bookingDataWithoutId } = bookingData;
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingDataWithoutId);
      const newBooking = {
        ...response.data,
        room: bookingData.splitStays.length > 0 ? null : rooms.find(r => r.id === bookingData.roomId)
      };
      setBookings([...bookings, newBooking]);
      setFilteredBookings([...filteredBookings, newBooking]);
      setQuickBookingData(null);
      setFormError(null);
      setFormSuccess('Booking created successfully!');
      setTimeout(() => {
        setFormSuccess(null);
        setShowBookingForm(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleEditBooking = async (bookingData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingData.id}`, bookingData);
      const updatedBooking = {
        ...response.data,
        room: bookingData.splitStays.length > 0 ? null : rooms.find(r => r.id === bookingData.roomId)
      };
      setBookings(bookings.map((b) => (b.id === bookingData.id ? updatedBooking : b)));
      setFilteredBookings(filteredBookings.map((b) => (b.id === bookingData.id ? updatedBooking : b)));
      setShowBookingForm(false);
      setEditingBooking(null);
      setFormSuccess('Booking updated successfully!');
      setTimeout(() => {
        setFormSuccess(null);
        window.location.reload();
      }, 2000);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`);
        const updatedBooking = bookings.find(b => b.id === bookingId);
        updatedBooking.status = 'cancelled';
        setBookings(bookings.map(b => b.id === bookingId ? updatedBooking : b));
        setFilteredBookings(filteredBookings.map(b => b.id === bookingId ? updatedBooking : b));
        setSuccess('Booking cancelled successfully!');
        setTimeout(() => setSuccess(null), 2000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  // Function to clear form-specific messages when form is closed
  const clearFormMessages = () => {
    setFormError(null);
    setFormSuccess(null);
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
      {createPortal(
        <div className="fixed top-6 right-6 z-[100]">
          {(success || formSuccess) && (
            <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in mb-4">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{success || formSuccess}</span>
              <button 
                onClick={() => { setSuccess(null); setFormSuccess(null); }} 
                className="ml-2 text-green-700 hover:text-green-900 focus:outline-none flex-shrink-0"
              >
                &times;
              </button>
            </div>
          )}
          
          {(error || formError) && !(success || formSuccess) && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{error || formError}</span>
              <button 
                onClick={() => { setError(null); setFormError(null); }} 
                className="ml-2 text-red-700 hover:text-red-900 focus:outline-none flex-shrink-0"
              >
                &times;
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

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
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
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
                  <p className="text-sm font-medium text-gray-600">Checked In</p>
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
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
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
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
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
            clearFormMessages();
          }}
          setSuccess={setFormSuccess}
          setError={setFormError}
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