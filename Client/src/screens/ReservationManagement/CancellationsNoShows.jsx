import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment-timezone';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Bed,
  Search,
  Filter,
  Eye,
  X,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';

const CancellationsNoShows = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showNoShowForm, setShowNoShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const calculateRefund = (booking, reason) => {
    const policyConfig = cancellationPolicies.find(p => p.id === booking?.cancellationPolicy) || cancellationPolicies[0];
    const checkInDate = moment(booking.checkInDate).tz('Asia/Kolkata');
    const now = moment().tz('Asia/Kolkata');
    const hoursUntilCheckIn = checkInDate.diff(now, 'hours');

    if (["medical-emergency", "hotel-maintenance", "overbooking"].includes(reason)) {
      return {
        refund: booking.totalAmount * 0.9,
        penalty: booking.totalAmount * 0.1
      };
    }

    if (reason === "no-show" && hoursUntilCheckIn < 0) {
      return {
        refund: 0,
        penalty: booking.totalAmount
      };
    }

    if (hoursUntilCheckIn >= policyConfig.minHoursBefore) {
      return {
        refund: booking.totalAmount * (policyConfig.refundPercentage / 100),
        penalty: policyConfig.penaltyFee
      };
    } else {
      return {
        refund: Math.max(0, booking.totalAmount * (policyConfig.refundPercentage / 100) - policyConfig.penaltyFee),
        penalty: policyConfig.penaltyFee
      };
    }
  };

  // Cancellation policies
  const cancellationPolicies = [
    {
      id: 'flexible',
      name: 'Flexible',
      description: 'Full refund if cancelled 24 hours before check-in',
      refundPercentage: 100,
      minHoursBefore: 24,
      penaltyFee: 0
    },
    {
      id: 'moderate',
      name: 'Moderate',
      description: '50% refund if cancelled 48 hours before check-in',
      refundPercentage: 50,
      minHoursBefore: 48,
      penaltyFee: 25
    },
    {
      id: 'strict',
      name: 'Strict',
      description: '25% refund if cancelled 7 days before check-in',
      refundPercentage: 25,
      minHoursBefore: 168,
      penaltyFee: 50
    },
    {
      id: 'non-refundable',
      name: 'Non-Refundable',
      description: 'No refund for cancellations',
      refundPercentage: 0,
      minHoursBefore: 0,
      penaltyFee: 0
    }
  ];

  // Cancellation reasons
  const cancellationReasons = [
    { id: 'guest-request', name: 'Guest Request', category: 'guest' },
    { id: 'medical-emergency', name: 'Medical Emergency', category: 'emergency' },
    { id: 'travel-restrictions', name: 'Travel Restrictions', category: 'external' },
    { id: 'weather-conditions', name: 'Weather Conditions', category: 'external' },
    { id: 'flight-cancellation', name: 'Flight Cancellation', category: 'external' },
    { id: 'personal-reasons', name: 'Personal Reasons', category: 'guest' },
    { id: 'duplicate-booking', name: 'Duplicate Booking', category: 'error' },
    { id: 'booking-error', name: 'Booking Error', category: 'error' },
    { id: 'hotel-maintenance', name: 'Hotel Maintenance', category: 'hotel' },
    { id: 'overbooking', name: 'Overbooking', category: 'hotel' },
    { id: 'other', name: 'Other', category: 'other' }
  ];

  const { data: rooms = [], isLoading: isRoomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/rooms`)).data
  });
  const { data: bookingsData = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/bookings`)).data
  });
  const { data: cancellationsData = [], isLoading: isCancellationsLoading } = useQuery({
    queryKey: ['cancellations'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/cancellations`)).data
  });

  const activeBookings = useMemo(
    () =>
      bookingsData
        .filter((b) => ['confirmed', 'checked-in'].includes(b.status))
        .map((b) => ({
          ...b,
          guestName: b.guestName || `${b.firstName || ''} ${b.lastName || ''}`.trim(),
          room: b.splitStays?.length > 0 ? null : rooms.find((r) => r.id === b.roomId)
        })),
    [bookingsData, rooms]
  );
  const cancellations = useMemo(
    () => cancellationsData.filter((c) => c.type === 'cancellation'),
    [cancellationsData]
  );
  const noShows = useMemo(
    () => cancellationsData.filter((c) => c.type === 'no-show'),
    [cancellationsData]
  );

  const handleCancelBooking = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cancellations/cancel/${formData.bookingId}`, {
        reason: formData.reason,
        reasonNote: formData.reasonNote,
        refundMethod: formData.refundMethod,
      });
      if (!response.data || response.status !== 200) {
        setError('Cancellation failed: No response from server');
        return;
      }
      setSuccess('Booking cancelled successfully');
      setTimeout(async () => {
        setShowCancelForm(false);
        setSelectedBooking(null);
        setSuccess('');
        await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        await queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      }, 2000);
    } catch (err) {
      console.error('Cancel booking error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkNoShow = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cancellations/noshow/${formData.bookingId}`, {
        contactAttempts: formData.contactAttempts,
        lastContactTime: formData.lastContactTime,
        notes: formData.notes,
      });
      if (!response.data || response.status !== 200) {
        setError('No-show failed: No response from server');
        return;
      }
      setSuccess('Booking marked as no-show successfully');
      setTimeout(async () => {
        setShowNoShowForm(false);
        setSelectedBooking(null);
        setSuccess('');
        await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        await queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      }, 2000);
    } catch (err) {
      console.error('No-show error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to mark as no-show');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getFilteredData = () => {
    let data = [];

    switch (view) {
      case 'active':
        data = activeBookings;
        break;
      case 'cancelled':
        data = cancellations;
        break;
      case 'no-shows':
        data = noShows;
        break;
      default:
        data = [];
    }

    if (statusFilter !== 'all' && (view === 'cancelled' || view === 'no-shows')) {
      data = data.filter(item => item.status === statusFilter);
    }

    if (searchQuery) {
      data = data.filter(item => {
        const booking = item.originalBookingId || item;
        return (
          (booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim())
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return data;
  };


  const CancellationForm = ({ booking, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      bookingId: booking?.id || '',
      reason: '',
      reasonNote: '',
      refundMethod: 'original'
    });
    const [formError, setFormError] = useState('');

    const policy = cancellationPolicies.find(p => p.id === booking?.cancellationPolicy);
    const refundCalc = formData.reason ? calculateRefund(booking, formData.reason) : { refund: 0, penalty: 0 };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.reason) {
        setFormError('Cancellation reason is required');
        return;
      }
      onSave(formData);
      setFormError('');
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onCancel}>
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 id="cancel-form-title" className="text-xl sm:text-2xl font-bold text-white">Cancel Booking</h2>
                  <p className="text-sm text-white/70 font-normal">{booking?.guestName} - {booking?.bookingReference}</p>
                </div>
              </div>
              <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" aria-label="Close cancellation form">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-700">Guest:</span>
                  <span className="ml-2">{booking?.guestName}</span>
                </div>
                <div>
                  <span className="text-red-700">Reference:</span>
                  <span className="ml-2">{booking?.bookingReference}</span>
                </div>
                <div>
                  <span className="text-red-700">Room:</span>
                  <span className="ml-2">
                    {booking?.room?.roomNumber || 'Split Stay'} - {booking?.room?.name || 'Multiple Rooms'}
                  </span>
                </div>
                <div>
                  <span className="text-red-700">Total Amount:</span>
                  <span className="ml-2">${booking?.totalAmount}</span>
                </div>
              </div>
            </div>

            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason *</label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                required
                aria-required="true"
              >
                <option value="">Select a reason</option>
                {cancellationReasons.map(reason => (
                  <option key={reason.id} value={reason.id}>{reason.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reasonNote" className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                id="reasonNote"
                value={formData.reasonNote}
                onChange={(e) => setFormData({ ...formData, reasonNote: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Provide additional details about the cancellation..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy: {policy?.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{policy?.description}</p>

              {formData.reason && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Refund Amount:</span>
                    <span className="font-semibold text-green-600">${refundCalc.refund.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penalty Fee:</span>
                    <span className="font-semibold text-red-600">${refundCalc.penalty.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700 mb-2">Refund Method</label>
              <select
                id="refundMethod"
                value={formData.refundMethod}
                onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="original">Original Payment Method</option>
                <option value="credit">Store Credit</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Cancel form"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 disabled:bg-gray-400"
                disabled={!formData.reason}
                aria-label="Process cancellation"
              >
                <XCircle className="h-4 w-4" />
                <span>Process Cancellation</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const NoShowForm = ({ booking, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      bookingId: booking?.id || '',
      contactAttempts: 0,
      lastContactTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm'),
      notes: ''
    });
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.contactAttempts === 0 && !formData.notes) {
        setFormError('At least one contact attempt or note is required');
        return;
      }
      onSave(formData);
      setFormError('');
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onCancel}>
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 id="no-show-form-title" className="text-xl sm:text-2xl font-bold text-white">Mark as No-Show</h2>
                  <p className="text-sm text-white/70 font-normal">{booking?.guestName} - {booking?.bookingReference}</p>
                </div>
              </div>
              <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" aria-label="Close no-show form">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Guest:</span>
                  <span className="font-semibold ml-2">{booking?.guestName}</span>
                </div>
                <div>
                  <span className="text-orange-700">Reference:</span>
                  <span className="font-semibold ml-2">{booking?.bookingReference}</span>
                </div>
                <div>
                  <span className="text-orange-700">Check-in Date:</span>
                  <span className="font-semibold ml-2">{moment(booking?.checkInDate).tz('Asia/Kolkata').format('MM/DD/YYYY')}</span>
                </div>
                <div>
                  <span className="text-orange-700">Total Amount:</span>
                  <span className="font-semibold ml-2">${booking?.totalAmount}</span>
                </div>
              </div>
            </div>

            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="contactAttempts" className="block text-sm font-medium text-gray-700 mb-2">Number of Contact Attempts</label>
              <input
                id="contactAttempts"
                type="number"
                min="0"
                max="10"
                value={formData.contactAttempts}
                onChange={(e) => setFormData({ ...formData, contactAttempts: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="lastContactTime" className="block text-sm font-medium text-gray-700 mb-2">Last Contact Attempt</label>
              <input
                id="lastContactTime"
                type="datetime-local"
                value={formData.lastContactTime}
                onChange={(e) => setFormData({ ...formData, lastContactTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Record contact attempts, guest communication, and other relevant details..."
              />
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">No-Show Policy</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                No-show bookings typically forfeit the full booking amount unless an exception applies. The room will be released for new reservations.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Cancel form"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 disabled:bg-gray-400"
                disabled={formData.contactAttempts === 0 && !formData.notes}
                aria-label="Mark as no-show"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Mark as No-Show</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const DetailsModal = ({ item, type, onClose }) => {
    const booking = item.originalBookingId || item;
    const room = booking.room || rooms.find(r => r.id === booking.roomId);

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${type === 'cancelled' ? 'bg-rose-500' :
                  type === 'no-shows' ? 'bg-amber-500' : 'bg-blue-1000'
                  }`}>
                  {type === 'cancelled' ? <XCircle className="h-6 w-6 text-white" /> :
                    type === 'no-shows' ? <AlertTriangle className="h-6 w-6 text-white" /> :
                      <CheckCircle className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h2 id="details-modal-title" className="text-xl sm:text-2xl font-bold text-white">
                    {type === 'cancelled' ? 'Cancelled Booking' :
                      type === 'no-shows' ? 'No-Show Record' : 'Booking Details'}
                  </h2>
                  <p className="text-sm text-white/70 font-normal">{booking.bookingReference}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" aria-label="Close details modal">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium">{booking.guestName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{booking.guestEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium">{booking.guestPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Guests:</span>
                    <span className="text-sm font-medium">{booking.guests}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Room:</span>
                    <span className="text-sm font-medium">{room?.roomNumber || 'Split Stay'} - {room?.name || 'Multiple Rooms'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Check-in:</span>
                    <span className="text-sm font-medium">{moment(booking.checkInDate).tz('Asia/Kolkata').format('MM/DD/YYYY')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Check-out:</span>
                    <span className="text-sm font-medium">{moment(booking.checkOutDate).tz('Asia/Kolkata').format('MM/DD/YYYY')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-xl font-semibold text-gray-900">${booking.totalAmount}</span>
                    <div>
                </div>
                  </div>
                </div>
              </div>
            </div>

            {type === 'cancelled' && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Cancellation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Cancelled:</span>
                      <span className="text-sm font-medium">{moment(item.cancellationDate).tz('Asia/Kolkata').format('MM/DD/YYYY HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Reason:</span>
                      <span className="text-sm font-medium">{cancellationReasons.find(r => r.id === item.reason)?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Processed by:</span>
                      <span className="text-sm font-medium">{item.processedBy}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-red-700">Refund Amount:</span>
                      <span className="text-sm font-medium text-green-600">${item.refundAmount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Penalty Fee:</span>
                      <span className="text-sm font-medium text-red-600">${item.penaltyFee}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                {item.reasonNote && (
                  <div className="mt-3">
                    <span className="text-sm text-red-700 font-medium">Notes:</span>
                    <p className="text-sm text-gray-700 mt-1">{item.reasonNote}</p>
                  </div>
                )}
              </div>
            )}

            {type === 'no-shows' && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">No-Show Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-700">No-Show Date:</span>
                      <span className="text-sm font-medium">{moment(item.noShowDate).tz('Asia/Kolkata').format('MM/DD/YYYY HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-700">Contact Attempts:</span>
                      <span className="text-sm font-medium">{item.contactAttempts}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-700">Last Contact:</span>
                      <span className="text-sm font-medium">{moment(item.lastContactTime).tz('Asia/Kolkata').format('MM/DD/YYYY HH:mm')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-700">Processed by:</span>
                      <span className="text-sm font-medium">{item.processedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-orange-700">Refund Amount:</span>
                      <span className="text-sm font-medium text-red-600">${item.refundAmount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.status === 'confirmed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                {item.notes && (
                  <div className="mt-3">
                    <span className="text-sm text-orange-700 font-medium">Notes:</span>
                    <p className="text-sm text-gray-700 mt-1">{item.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const BookingCard = ({ booking, type, onView, onCancel, onNoShow }) => {
    const room = booking.room || rooms.find(r => r.id === (booking.originalBookingId?.roomId || booking.roomId));
    const bookingData = booking.originalBookingId || booking;

    return (
      <div className="bg-white border border-[#c9a24a]/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300 group">
        <div className="h-1 w-full bg-[#c9a24a]" />
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-[#0f2742] text-base sm:text-lg group-hover:text-[#c9a24a] transition-colors line-clamp-1">{bookingData.guestName}</h3>
              <p className="text-sm text-gray-600 font-medium">{bookingData.bookingReference}</p>
            </div>
            {type === 'active' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onCancel(booking)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Cancel Booking"
                >
                  <XCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onNoShow(booking)}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Mark as No-Show"
                >
                  <AlertTriangle className="h-5 w-5" />
                </button>
              </div>
            )}
            {type === 'cancelled' && (
              <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider border border-rose-200">
                Cancelled
              </span>
            )}
            {type === 'no-shows' && (
              <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider border border-amber-200">
                No-Show
              </span>
            )}
          </div>

          <div className="space-y-3 mb-4 text-sm text-gray-600 font-medium">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-2 text-[#c9a24a]" />
              <span className="truncate">{room?.roomNumber || 'Split Stay'} - {room?.name || 'Multiple Rooms'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-[#c9a24a]" />
              <span>{moment(bookingData.checkInDate).format('MMM DD')} - {moment(bookingData.checkOutDate).format('MMM DD, YYYY')}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-[#c9a24a]" />
              <span>{bookingData.guests} Guest{bookingData.guests !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-[#0f2742]">
              <DollarSign className="h-4 w-4 mr-2 text-[#c9a24a]" />
              <span className='text-green-600'>Total Amount: ${bookingData.totalAmount}</span>
            </div>
          </div>

          {type === 'cancelled' && (
            <div className="mb-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-rose-800">Refund: <span className="text-emerald-600 ml-1">${booking.refundAmount}</span></span>
                {booking.penaltyFee > 0 && <span className="text-rose-800">Penalty: <span className="text-rose-600 ml-1">${booking.penaltyFee}</span></span>}
              </div>
            </div>
          )}

          {type === 'no-shows' && (
            <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-xs font-bold text-amber-800">
                <span>Contact attempts:</span>
                <span className="ml-1 px-2 py-0.5 bg-amber-200 rounded-full">{booking.contactAttempts}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            {type === 'cancelled' && `Date: ${moment(booking.cancellationDate).format('MMM DD, YYYY')}`}
            {type === 'no-shows' && `Date: ${moment(booking.noShowDate).format('MMM DD, YYYY')}`}
            {type === 'active' && `Check-in: ${moment(bookingData.checkInDate).format('MMM DD, YYYY')}`}
          </div>
          <button
          onClick={() => onView(request)}
          className="p-2 text-slate-400 hover:text-[#0f2742] hover:bg-[#0f2742]/5 rounded-lg transition-all"
          title="View Details">
          <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-slate-50/50 transition-all duration-300 ease-in-out">
        <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
              <div className="flex items-center bg-[#0f2742]/5 rounded-lg p-1">
                <button
                  onClick={() => setView('active')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    view === 'active' ? 'bg-[#0f2742] text-white shadow-md' : 'text-[#0f2742]/60 hover:text-[#0f2742]'
                  }`}
                >
                  Active Bookings
                </button>
                <button
                  onClick={() => setView('cancelled')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    view === 'cancelled' ? 'bg-[#0f2742] text-white shadow-md' : 'text-[#0f2742]/60 hover:text-[#0f2742]'
                  }`}
                >
                  Cancelled
                </button>
                <button
                  onClick={() => setView('no-shows')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    view === 'no-shows' ? 'bg-[#0f2742] text-white shadow-md' : 'text-[#0f2742]/60 hover:text-[#0f2742]'
                  }`}
                >
                  No-Shows
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
                />
              </div>

              {(view === 'cancelled' || view === 'no-shows') && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    {view === 'no-shows' && <option value="confirmed">Confirmed</option>}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {filteredData.length} {view === 'active' ? 'active bookings' : view}
              </div>
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['rooms'] });
                  queryClient.invalidateQueries({ queryKey: ['bookings'] });
                  queryClient.invalidateQueries({ queryKey: ['cancellations'] });
                }}
                className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
                title="Refresh Data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="p-6">
        {(isRoomsLoading || isBookingsLoading || isCancellationsLoading) ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="h-36 rounded-xl bg-gray-50 border border-gray-200" />
            <div className="h-36 rounded-xl bg-gray-50 border border-gray-200" />
            <div className="h-36 rounded-xl bg-gray-50 border border-gray-200" />
          </div>
        ) : (
          filteredData.length === 0 ? (
            <div className="text-center py-12">
              {view === 'active' && <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
              {view === 'cancelled' && <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
              {view === 'no-shows' && <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {view === 'active' ? 'active bookings' : view} found
              </h3>
              <p className="text-gray-600">
                {searchQuery ? `No ${view} match your search criteria.` : `No ${view} to display.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredData.map((item) => (
                <BookingCard
                  key={item.id || item.originalBookingId?.id}
                  booking={item}
                  type={view === 'active' ? 'active' : view === 'cancelled' ? 'cancelled' : 'no-shows'}
                  onView={(booking, type) => {
                    setSelectedBooking(booking);
                    setShowDetailsModal(type);
                  }}
                  onCancel={(booking) => {
                    setSelectedBooking(booking);
                    setShowCancelForm(true);
                  }}
                  onNoShow={(booking) => {
                    setSelectedBooking(booking);
                    setShowNoShowForm(true);
                  }}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {showCancelForm && selectedBooking && (
        <CancellationForm
          booking={selectedBooking}
          onSave={handleCancelBooking}
          onCancel={() => {
            setShowCancelForm(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showNoShowForm && selectedBooking && (
        <NoShowForm
          booking={selectedBooking}
          onSave={handleMarkNoShow}
          onCancel={() => {
            setShowNoShowForm(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showDetailsModal && selectedBooking && (
        <DetailsModal
          item={selectedBooking}
          type={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Message Toasts */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-rose-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-up z-50">
          <AlertCircle className="h-5 w-5 text-rose-200" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-[#0f2742] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-up z-50">
          <CheckCircle className="h-5 w-5 text-[#c9a24a]" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </div>
  );
};

export default CancellationsNoShows;
