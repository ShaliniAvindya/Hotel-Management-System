import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Printer,
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Bed,
  Coffee,
  Utensils,
  Car,
  Wifi,
  Home,
  Star,
  Mountain,
  Sparkles,
  X,
  Save,
  Send,
  Home as HomeIcon,
  Settings,
  BarChart3,
  Package,
  UserCheck,
  Heart,
  ShoppingCart,
  Monitor,
  FileText,
  ChefHat,
  ChevronRight,
  ChevronLeft,
  Menu,
} from 'lucide-react';


// BillingInvoice Component
const BillingInvoice = () => {
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('reservations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Room data
  const rooms = [
    {
      id: 'R001',
      roomNumber: '101',
      type: 'single',
      name: 'Deluxe Single Room',
      capacity: 1,
      maxCapacity: 2,
      basePrice: 120,
      weekendPrice: 150,
      floor: 1,
      size: 250,
      description: 'A comfortable single room with modern amenities and city view.',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'phone'],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&h=300&fit=crop',
      ],
      rating: 4.2,
    },
    {
      id: 'R002',
      roomNumber: '201',
      type: 'double',
      name: 'Premium Double Room',
      capacity: 2,
      maxCapacity: 3,
      basePrice: 180,
      weekendPrice: 220,
      floor: 2,
      size: 350,
      description: 'Spacious double room with king-size bed and ocean view.',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'oceanview', 'bathtub'],
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop',
      ],
      rating: 4.7,
    },
    {
      id: 'R003',
      roomNumber: '301',
      type: 'suite',
      name: 'Executive Suite',
      capacity: 4,
      maxCapacity: 6,
      basePrice: 350,
      weekendPrice: 420,
      floor: 3,
      size: 600,
      description: 'Luxurious suite with separate living area and premium amenities.',
      amenities: ['wifi', 'tv', 'ac', 'kitchen', 'balcony', 'oceanview', 'bathtub', 'sofa', 'work_desk'],
      images: [
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=300&fit=crop',
      ],
      rating: 4.9,
    },
  ];

  // Additional services/charges
  const additionalServices = [
    { id: 'minibar', name: 'Minibar', category: 'room', basePrice: 15 },
    { id: 'restaurant', name: 'Restaurant Dining', category: 'dining', basePrice: 45 },
    { id: 'room_service', name: 'Room Service', category: 'dining', basePrice: 35 },
    { id: 'spa', name: 'Spa Services', category: 'wellness', basePrice: 80 },
    { id: 'laundry', name: 'Laundry Service', category: 'service', basePrice: 25 },
    { id: 'parking', name: 'Parking', category: 'service', basePrice: 20 },
    { id: 'wifi_premium', name: 'Premium WiFi', category: 'technology', basePrice: 10 },
    { id: 'breakfast', name: 'Breakfast', category: 'dining', basePrice: 18 },
    { id: 'airport_transfer', name: 'Airport Transfer', category: 'transport', basePrice: 60 },
    { id: 'late_checkout', name: 'Late Checkout', category: 'service', basePrice: 30 },
  ];

  // Sample data initialization
  useEffect(() => {
    const sampleReservations = [
      {
        id: 'RES001',
        guestName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 555-0123',
        address: '123 Main St, New York, NY 10001',
        roomId: 'R001',
        checkIn: '2025-08-15',
        checkOut: '2025-08-18',
        guests: 1,
        nights: 3,
        roomRate: 120,
        totalRoomCharges: 360,
        status: 'confirmed',
        bookingDate: '2025-08-01',
        specialRequests: 'Late check-in',
        advancePayment: 180,
        deposit: 100,
        additionalCharges: [
          { serviceId: 'minibar', quantity: 2, unitPrice: 15, total: 30, date: '2025-08-15' },
          { serviceId: 'breakfast', quantity: 3, unitPrice: 18, total: 54, date: '2025-08-16' },
        ],
      },
      {
        id: 'RES002',
        guestName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 555-0124',
        address: '456 Oak Ave, Los Angeles, CA 90210',
        roomId: 'R002',
        checkIn: '2025-08-20',
        checkOut: '2025-08-25',
        guests: 2,
        nights: 5,
        roomRate: 180,
        totalRoomCharges: 900,
        status: 'checked_in',
        bookingDate: '2025-08-05',
        specialRequests: 'Ocean view preferred',
        advancePayment: 450,
        deposit: 200,
        additionalCharges: [
          { serviceId: 'spa', quantity: 1, unitPrice: 80, total: 80, date: '2025-08-21' },
          { serviceId: 'room_service', quantity: 2, unitPrice: 35, total: 70, date: '2025-08-22' },
          { serviceId: 'parking', quantity: 5, unitPrice: 20, total: 100, date: '2025-08-20' },
        ],
      },
      {
        id: 'RES003',
        guestName: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1 555-0125',
        address: '789 Pine St, Chicago, IL 60601',
        roomId: 'R003',
        checkIn: '2025-08-10',
        checkOut: '2025-08-14',
        guests: 4,
        nights: 4,
        roomRate: 350,
        totalRoomCharges: 1400,
        status: 'checked_out',
        bookingDate: '2025-07-25',
        specialRequests: 'Extra towels',
        advancePayment: 700,
        deposit: 300,
        additionalCharges: [
          { serviceId: 'restaurant', quantity: 3, unitPrice: 45, total: 135, date: '2025-08-11' },
          { serviceId: 'minibar', quantity: 4, unitPrice: 15, total: 60, date: '2025-08-12' },
          { serviceId: 'airport_transfer', quantity: 1, unitPrice: 60, total: 60, date: '2025-08-14' },
        ],
      },
    ];

    const samplePayments = [
      {
        id: 'PAY001',
        reservationId: 'RES001',
        amount: 180,
        type: 'advance',
        method: 'credit_card',
        status: 'completed',
        date: '2025-08-01',
        reference: 'CC-20250801-001',
        notes: 'Advance payment for booking',
      },
      {
        id: 'PAY002',
        reservationId: 'RES001',
        amount: 100,
        type: 'deposit',
        method: 'credit_card',
        status: 'completed',
        date: '2025-08-01',
        reference: 'CC-20250801-002',
        notes: 'Security deposit',
      },
      {
        id: 'PAY003',
        reservationId: 'RES002',
        amount: 450,
        type: 'advance',
        method: 'bank_transfer',
        status: 'completed',
        date: '2025-08-05',
        reference: 'BT-20250805-001',
        notes: 'Bank transfer advance payment',
      },
      {
        id: 'PAY004',
        reservationId: 'RES003',
        amount: 1955,
        type: 'full_payment',
        method: 'credit_card',
        status: 'completed',
        date: '2025-08-14',
        reference: 'CC-20250814-001',
        notes: 'Full payment at checkout',
      },
    ];

    const sampleInvoices = [
      {
        id: 'INV001',
        reservationId: 'RES003',
        invoiceNumber: 'INV-2025-001',
        issueDate: '2025-08-14',
        dueDate: '2025-08-14',
        status: 'paid',
        subtotal: 1655,
        tax: 165.50,
        total: 1820.50,
        paidAmount: 1955,
        items: [
          { description: 'Room Charges (4 nights)', quantity: 4, unitPrice: 350, total: 1400 },
          { description: 'Restaurant Dining', quantity: 3, unitPrice: 45, total: 135 },
          { description: 'Minibar', quantity: 4, unitPrice: 15, total: 60 },
          { description: 'Airport Transfer', quantity: 1, unitPrice: 60, total: 60 },
        ],
      },
    ];

    setReservations(sampleReservations);
    setPayments(samplePayments);
    setInvoices(sampleInvoices);
  }, []);

  const getRoomById = (roomId) => rooms.find(room => room.id === roomId);

  const getServiceById = (serviceId) => additionalServices.find(service => service.id === serviceId);

  const calculateTotalCharges = (reservation) => {
    const additionalTotal = reservation.additionalCharges?.reduce((sum, charge) => sum + charge.total, 0) || 0;
    return reservation.totalRoomCharges + additionalTotal;
  };

  const getPaymentsByReservation = (reservationId) => {
    return payments.filter(payment => payment.reservationId === reservationId);
  };

  const getTotalPaid = (reservationId) => {
    return getPaymentsByReservation(reservationId).reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getOutstandingBalance = (reservation) => {
    const total = calculateTotalCharges(reservation);
    const paid = getTotalPaid(reservation.id);
    return total - paid;
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const BillingForm = ({ reservation, onSave, onCancel }) => {
    const [charges, setCharges] = useState(reservation?.additionalCharges || []);
    const [newCharge, setNewCharge] = useState({
      serviceId: '',
      quantity: 1,
      unitPrice: 0,
      date: new Date().toISOString().split('T')[0],
    });

    const addCharge = () => {
      if (newCharge.serviceId) {
        const service = getServiceById(newCharge.serviceId);
        const charge = {
          ...newCharge,
          total: newCharge.quantity * newCharge.unitPrice,
          id: `CHG-${Date.now()}`,
        };
        setCharges([...charges, charge]);
        setNewCharge({
          serviceId: '',
          quantity: 1,
          unitPrice: service?.basePrice || 0,
          date: new Date().toISOString().split('T')[0],
        });
      }
    };

    const removeCharge = (index) => {
      setCharges(charges.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...reservation, additionalCharges: charges });
    };

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Billing & Charges</h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Name:</strong> {reservation.guestName}</div>
                  <div><strong>Room:</strong> {getRoomById(reservation.roomId)?.name} ({getRoomById(reservation.roomId)?.roomNumber})</div>
                  <div><strong>Check-in:</strong> {new Date(reservation.checkIn).toLocaleDateString()}</div>
                  <div><strong>Check-out:</strong> {new Date(reservation.checkOut).toLocaleDateString()}</div>
                  <div><strong>Nights:</strong> {reservation.nights}</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Charges</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Room Rate (per night):</span>
                    <span>${reservation.roomRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Nights:</span>
                    <span>{reservation.nights}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Room Charges:</span>
                    <span>${reservation.totalRoomCharges}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Additional Charges</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={newCharge.serviceId}
                    onChange={(e) => {
                      const service = getServiceById(e.target.value);
                      setNewCharge({
                        ...newCharge,
                        serviceId: e.target.value,
                        unitPrice: service?.basePrice || 0,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Service</option>
                    {additionalServices.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newCharge.quantity}
                    onChange={(e) => setNewCharge({ ...newCharge, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCharge.unitPrice}
                    onChange={(e) => setNewCharge({ ...newCharge, unitPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addCharge}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Charge
                  </button>
                </div>
              </div>
            </div>

            {charges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Additional Charges</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Service</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Unit Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Total</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((charge, index) => {
                        const service = getServiceById(charge.serviceId);
                        return (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2 text-sm">{service?.name}</td>
                            <td className="px-4 py-2 text-sm">{new Date(charge.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{charge.quantity}</td>
                            <td className="px-4 py-2 text-sm">${charge.unitPrice}</td>
                            <td className="px-4 py-2 text-sm font-semibold">${charge.total}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => removeCharge(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Additional Charges Total: ${charges.reduce((sum, charge) => sum + charge.total, 0)}
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    Grand Total: ${reservation.totalRoomCharges + charges.reduce((sum, charge) => sum + charge.total, 0)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const PaymentForm = ({ reservation, onSave, onCancel }) => {
    const [paymentData, setPaymentData] = useState({
      amount: '',
      type: 'partial',
      method: 'credit_card',
      reference: '',
      notes: '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const payment = {
        id: `PAY-${Date.now()}`,
        reservationId: reservation.id,
        amount: parseFloat(paymentData.amount),
        type: paymentData.type,
        method: paymentData.method,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        reference: paymentData.reference,
        notes: paymentData.notes,
      };
      onSave(payment);
    };

    const outstandingBalance = getOutstandingBalance(reservation);

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest</label>
              <p className="text-gray-900 font-semibold">{reservation.guestName}</p>
              <p className="text-sm text-gray-600">Outstanding Balance: ${outstandingBalance.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                value={paymentData.type}
                onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="advance">Advance Payment</option>
                <option value="deposit">Deposit</option>
                <option value="partial">Partial Payment</option>
                <option value="full_payment">Full Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentData.method}
                onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction reference"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const generateInvoice = (reservation) => {
    const totalCharges = calculateTotalCharges(reservation);
    const tax = totalCharges * 0.1; // 10% tax
    const grandTotal = totalCharges + tax;

    const invoice = {
      id: `INV-${Date.now()}`,
      reservationId: reservation.id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      subtotal: totalCharges,
      tax: tax,
      total: grandTotal,
      paidAmount: getTotalPaid(reservation.id),
      items: [
        {
          description: `Room Charges (${reservation.nights} nights)`,
          quantity: reservation.nights,
          unitPrice: reservation.roomRate,
          total: reservation.totalRoomCharges,
        },
        ...(reservation.additionalCharges || []).map(charge => {
          const service = getServiceById(charge.serviceId);
          return {
            description: service?.name || 'Additional Service',
            quantity: charge.quantity,
            unitPrice: charge.unitPrice,
            total: charge.total,
          };
        }),
      ],
    };

    setInvoices([...invoices, invoice]);
    return invoice;
  };

  const InvoiceDetailsModal = ({ invoice, onClose }) => {
    const reservation = reservations.find(r => r.id === invoice.reservationId);
    const room = getRoomById(reservation?.roomId);

    const handlePrint = () => {
      window.print();
    };

    const handleDownload = () => {
      alert('Invoice download would be implemented here');
    };

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                title="Print Invoice"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                title="Download PDF"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-lg text-gray-600">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-blue-600">Hotel Paradise</h2>
                <p className="text-gray-600">123 Resort Drive</p>
                <p className="text-gray-600">Paradise City, PC 12345</p>
                <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="font-semibold">{reservation?.guestName}</p>
                <p className="text-gray-600">{reservation?.email}</p>
                <p className="text-gray-600">{reservation?.phone}</p>
                <p className="text-gray-600">{reservation?.address}</p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Invoice Date:</p>
                    <p className="font-semibold">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due Date:</p>
                    <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-in:</p>
                    <p className="font-semibold">{new Date(reservation?.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-out:</p>
                    <p className="font-semibold">{new Date(reservation?.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Room:</p>
                    <p className="font-semibold">{room?.name} ({room?.roomNumber})</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rate</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-80">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Tax (10%):</span>
                  <span>${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 text-lg font-bold">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-green-600">
                  <span className="font-medium">Paid:</span>
                  <span>${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 text-lg font-bold text-red-600">
                  <span>Balance Due:</span>
                  <span>${(invoice.total - invoice.paidAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {invoice.status === 'paid' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : invoice.status === 'overdue' ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-semibold capitalize">{invoice.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const handleUpdateBilling = (updatedReservation) => {
    setReservations(reservations.map(res => 
      res.id === updatedReservation.id ? updatedReservation : res
    ));
    setShowBillingForm(false);
  };

  const handleAddPayment = (payment) => {
    setPayments([...payments, payment]);
    setShowPaymentForm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      checked_in: 'bg-green-100 text-green-800 border-green-200',
      checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const tabs = [
    { 
      id: 'reservations', 
      label: 'Reservations & Billing', 
      icon: Receipt,
      color: 'blue'
    },
    { 
      id: 'payments', 
      label: 'Payment History', 
      icon: CreditCard,
      color: 'green'
    },
    { 
      id: 'invoices', 
      label: 'Invoices', 
      icon: FileText,
      color: 'purple'
    },
  ];

  const getTabStyles = (tab, isActive) => {
    const colorMap = {
      blue: isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
      green: isActive ? 'border-green-500 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300',
      purple: isActive ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
    };
    return colorMap[tab.color];
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        {/* Header with Tabs */}
        <div className="bg-white shadow-sm border-b border-gray-200">
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
                  <p className="text-gray-600">Manage reservations, payments, and invoices</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-5">
          <div className="px-6">
            <nav className="flex space-x-1" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${getTabStyles(tab, isActive)} 
                      flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm 
                      transition-all duration-200 rounded-t-lg`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6 animate-fadeIn">
          {activeTab === 'reservations' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by guest name, ID, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guest & Room</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dates</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Charges</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payments</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => {
                      const room = getRoomById(reservation.roomId);
                      const totalCharges = calculateTotalCharges(reservation);
                      const totalPaid = getTotalPaid(reservation.id);
                      const balance = totalCharges - totalPaid;

                      return (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{reservation.guestName}</p>
                              <p className="text-sm text-gray-600">{reservation.email}</p>
                              <p className="text-sm text-blue-600">{room?.name} ({room?.roomNumber})</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p><strong>In:</strong> {new Date(reservation.checkIn).toLocaleDateString()}</p>
                              <p><strong>Out:</strong> {new Date(reservation.checkOut).toLocaleDateString()}</p>
                              <p className="text-gray-600">{reservation.nights} nights</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold">${totalCharges.toFixed(2)}</p>
                              <p className="text-gray-600">Room: ${reservation.totalRoomCharges}</p>
                              {reservation.additionalCharges?.length > 0 && (
                                <p className="text-gray-600">
                                  Extras: ${reservation.additionalCharges.reduce((sum, charge) => sum + charge.total, 0)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-green-600">${totalPaid.toFixed(2)}</p>
                              <p className="text-gray-600">{getPaymentsByReservation(reservation.id).length} payments</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${balance.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
                              {reservation.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowBillingForm(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Manage Billing"
                              >
                                <Receipt className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowPaymentForm(true);
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Add Payment"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const invoice = generateInvoice(reservation);
                                  setSelectedInvoice(invoice);
                                  setShowInvoiceDetails(true);
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="Generate Invoice"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guest</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => {
                      const reservation = reservations.find(r => r.id === payment.reservationId);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-blue-600">{payment.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{reservation?.guestName}</p>
                              <p className="text-sm text-gray-600">{reservation?.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-lg font-bold text-green-600">${payment.amount}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-sm">{payment.type.replace('_', ' ')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-sm">{payment.method.replace('_', ' ')}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            {payment.reference}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guest</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map((invoice) => {
                      const reservation = reservations.find(r => r.id === invoice.reservationId);
                      const balance = invoice.total - invoice.paidAmount;
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-blue-600">{invoice.invoiceNumber}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{reservation?.guestName}</p>
                              <p className="text-sm text-gray-600">{reservation?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold">${invoice.total.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-green-600 font-semibold">${invoice.paidAmount.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${balance.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : invoice.status === 'overdue'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceDetails(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showBillingForm && selectedReservation && (
          <BillingForm
            reservation={selectedReservation}
            onSave={handleUpdateBilling}
            onCancel={() => setShowBillingForm(false)}
          />
        )}

        {showPaymentForm && selectedReservation && (
          <PaymentForm
            reservation={selectedReservation}
            onSave={handleAddPayment}
            onCancel={() => setShowPaymentForm(false)}
          />
        )}

        {showInvoiceDetails && selectedInvoice && (
          <InvoiceDetailsModal
            invoice={selectedInvoice}
            onClose={() => {
              setShowInvoiceDetails(false);
              setSelectedInvoice(null);
            }}
          />
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BillingInvoice;