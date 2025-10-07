import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { createPortal } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import {
  CreditCard, Receipt, FileText, Search, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle, X, Download, Printer, Eye, Menu, History,
} from 'lucide-react';
import { API_BASE_URL } from '../apiconfig';

// Helper to download invoice as PDF
const handleDownloadInvoice = (invoice, reservation) => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(31, 41, 55);
  doc.text('INVOICE', 20, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text(invoice.invoiceNumber, 20, 28);
  
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text('Hotel Paradise', 200, 20, { align: 'right' });
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text('123 Resort Drive', 200, 28, { align: 'right' });
  doc.text('Paradise City, PC 12345', 200, 34, { align: 'right' });
  doc.text('Phone: +1 (555) 123-4567', 200, 40, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Bill To:', 20, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(reservation?.guestName || 'N/A', 20, 68);
  doc.text(reservation?.email || 'N/A', 20, 74);
  doc.text(reservation?.phone || 'N/A', 20, 80);
  doc.text(reservation?.address || 'N/A', 20, 86);

  const room = invoice.reservation?.room || { name: 'Unknown', roomNumber: 'N/A' };
  const checkIn = invoice.reservation?.checkIn ? new Date(invoice.reservation.checkIn).toLocaleDateString() : 'N/A';
  const checkOut = invoice.reservation?.checkOut ? new Date(invoice.reservation.checkOut).toLocaleDateString() : 'N/A';
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text('Invoice Details:', 110, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Invoice Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 110, 68);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 110, 74);
  doc.text(`Check-in: ${checkIn}`, 110, 80);
  doc.text(`Check-out: ${checkOut}`, 110, 86);
  doc.text(`Room: ${room.name} (${room.roomNumber})`, 110, 92);
  
  doc.setFillColor(249, 250, 251);
  doc.rect(20, 110, 170, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.text('Description', 22, 116);
  doc.text('Qty', 120, 116, { align: 'right' });
  doc.text('Rate', 150, 116, { align: 'right' });
  doc.text('Total', 188, 116, { align: 'right' });
  
  let y = 126;
  invoice.items.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    doc.text(item.description, 22, y, { maxWidth: 90 });
    doc.text(item.quantity.toString(), 120, y, { align: 'right' });
    doc.text(`$${item.unitPrice.toFixed(2)}`, 150, y, { align: 'right' });
    doc.setFont("helvetica", "bold");
    doc.text(`$${item.total.toFixed(2)}`, 188, y, { align: 'right' });
    y += 10;
  });
  
  const totalsX = 130;
  doc.setLineWidth(0.5);
  doc.line(130, y, 190, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text('Subtotal:', totalsX, y);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 188, y, { align: 'right' });
  y += 8;
  doc.text('Tax (10%):', totalsX, y);
  doc.text(`$${invoice.tax.toFixed(2)}`, 188, y, { align: 'right' });
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text('Total:', totalsX, y);
  doc.text(`$${invoice.total.toFixed(2)}`, 188, y, { align: 'right' });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(22, 163, 74);
  doc.text('Paid:', totalsX, y);
  doc.text(`$${invoice.paidAmount.toFixed(2)}`, 188, y, { align: 'right' });
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text('Balance Due:', totalsX, y);
  doc.text(`$${(invoice.total - invoice.paidAmount).toFixed(2)}`, 188, y, { align: 'right' });
  
  y += 16;
  doc.setFillColor(...(
    invoice.status === 'paid'
      ? [220, 252, 231]
      : invoice.status === 'overdue'
        ? [254, 226, 226]
        : [254, 243, 199]
  ));
  doc.rect(20, y - 6, 170, 12, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...(
    invoice.status === 'paid' ? [22, 163, 74] :
    invoice.status === 'overdue' ? [220, 38, 38] :
    [202, 138, 4]
  ));
  doc.text(invoice.status.toUpperCase(), 22, y);
  
  doc.save(`invoice_${invoice.invoiceNumber}.pdf`);
};

// PaymentHistoryModal component
const PaymentHistoryModal = ({ invoice, onClose }) => {
  const reservation = invoice.reservation;
  const payments = invoice.payments || [];

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Payment History for Invoice {invoice.invoiceNumber}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Information</h3>
            <p><strong>Name:</strong> {reservation?.guestName}</p>
            <p><strong>Email:</strong> {reservation?.email}</p>
            <p><strong>Room:</strong> {reservation?.room?.name} ({reservation?.room?.roomNumber})</p>
          </div>
          {payments.length === 0 ? (
            <p className="text-gray-600">No payments recorded for this invoice.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Payment ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Amount</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Method</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="px-4 py-2 text-sm font-mono text-blue-600">{payment.id}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-green-600">${payment.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm capitalize">{payment.type.replace('_', ' ')}</td>
                      <td className="px-4 py-2 text-sm capitalize">{payment.method.replace('_', ' ')}</td>
                      <td className="px-4 py-2 text-sm">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm font-mono">{payment.reference || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const BillingInvoice = () => {
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('reservations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, roomsRes, invoicesRes, paymentsRes, servicesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/bookings`),
          fetch(`${API_BASE_URL}/billing/rooms`),
          fetch(`${API_BASE_URL}/billing/invoices`),
          fetch(`${API_BASE_URL}/billing/payments`),
          fetch(`${API_BASE_URL}/billing/services`),
        ]);
        const bookings = await bookingsRes.json();
        const rooms = await roomsRes.json();
        let invoices = await invoicesRes.json();
        const payments = await paymentsRes.json();
        const services = await servicesRes.json();

        // Map bookings to reservations format
        const mappedReservations = bookings.map(booking => ({
          id: booking.id,
          guestName: `${booking.firstName} ${booking.lastName}`.trim(),
          email: booking.guestEmail,
          phone: booking.guestPhone,
          address: booking.address || '',
          roomId: booking.roomId,
          room: rooms.find(room => room.id === booking.roomId) || { name: 'Unknown', roomNumber: 'N/A' },
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          guests: booking.guests,
          nights: Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
          roomRate: booking.totalAmount / Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
          totalRoomCharges: booking.totalAmount,
          status: booking.status.replace('-', '_'),
          bookingDate: booking.createdAt,
          specialRequests: booking.specialRequests,
          advancePayment: booking.depositAmount,
          deposit: booking.depositAmount,
          additionalCharges: [
            ...(booking.minibarCharges ? [{ serviceId: 'minibar', quantity: 1, unitPrice: booking.minibarCharges, total: booking.minibarCharges, date: booking.checkInDate }] : []),
            ...(booking.additionalServices ? [{ serviceId: 'additional_services', quantity: 1, unitPrice: booking.additionalServices, total: booking.additionalServices, date: booking.checkInDate }] : []),
            ...(booking.damageCharges ? [{ serviceId: 'damage', quantity: 1, unitPrice: booking.damageCharges, total: booking.damageCharges, date: booking.checkInDate }] : []),
          ],
          finalAmount: booking.finalAmount,
        }));

        // Attach payments and reservation to invoices
        const currentDate = new Date('2025-09-10');
        invoices = invoices.map(invoice => ({
          ...invoice,
          status: invoice.paidAmount >= invoice.total
            ? 'paid'
            : new Date(invoice.dueDate) < currentDate
              ? 'overdue'
              : 'pending',
          reservation: mappedReservations.find(r => r.id === invoice.reservationId) || null,
          payments: payments.filter(p => p.reservationId === invoice.reservationId),
        }));

        setReservations(mappedReservations);
        setRooms(rooms);
        setInvoices(invoices);
        setPayments(payments);
        setAdditionalServices(services);
      } catch (err) {
        toast.error('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRoomById = (roomId) => rooms.find(room => room.id === roomId) || { name: 'Unknown', roomNumber: 'N/A' };

  const getServiceById = (serviceId) => additionalServices.find(service => service.id === serviceId) || { name: 'Unknown', basePrice: 0 };

  const calculateTotalCharges = (reservation) => {
    const additionalTotal = reservation.additionalCharges?.reduce((sum, charge) => sum + charge.total, 0) || 0;
    const subtotal = reservation.totalRoomCharges + additionalTotal;
    const tax = subtotal * 0.1;
    return subtotal + tax;
  };

  const getPaymentsByReservation = (reservationId) => payments.filter(payment => payment.reservationId === reservationId);

  const getTotalPaid = (reservationId) => getPaymentsByReservation(reservationId).reduce((sum, payment) => sum + payment.amount, 0);

  const getOutstandingBalance = (reservation) => calculateTotalCharges(reservation) - getTotalPaid(reservation.id);

  const getInvoiceStatus = (reservationId) => {
    const invoice = invoices
      .filter(inv => inv.reservationId === reservationId)
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))[0];
    return invoice ? invoice.status : 'No Invoice';
  };

  const uniqueInvoices = Object.values(
    invoices.reduce((acc, invoice) => {
      if (!acc[invoice.reservationId] || new Date(invoice.issueDate) > new Date(acc[invoice.reservationId].issueDate)) {
        acc[invoice.reservationId] = invoice;
      }
      return acc;
    }, {})
  );

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

    const removeCharge = (index) => setCharges(charges.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const updatedBooking = {
          ...reservation,
          minibarCharges: charges.filter(c => c.serviceId === 'minibar').reduce((sum, c) => sum + c.total, 0),
          additionalServices: charges.filter(c => c.serviceId !== 'minibar' && c.serviceId !== 'damage').reduce((sum, c) => sum + c.total, 0),
          damageCharges: charges.filter(c => c.serviceId === 'damage').reduce((sum, c) => sum + c.total, 0),
        };
        await fetch(`${API_BASE_URL}/bookings/${reservation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBooking),
        });
        toast.success('Charges updated successfully');
        onSave({ ...reservation, additionalCharges: charges });
        const [bookingsRes, invoicesRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/bookings`),
          fetch(`${API_BASE_URL}/billing/invoices`),
          fetch(`${API_BASE_URL}/billing/payments`),
        ]);
        const bookings = await bookingsRes.json();
        const rooms = await (await fetch(`${API_BASE_URL}/billing/rooms`)).json();
        let invoices = await invoicesRes.json();
        const payments = await paymentsRes.json();
        const mappedReservations = bookings.map(booking => ({
          id: booking.id,
          guestName: `${booking.firstName} ${booking.lastName}`.trim(),
          email: booking.guestEmail,
          phone: booking.guestPhone,
          address: booking.address || '',
          roomId: booking.roomId,
          room: rooms.find(room => room.id === booking.roomId) || { name: 'Unknown', roomNumber: 'N/A' },
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          guests: booking.guests,
          nights: Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
          roomRate: booking.totalAmount / Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
          totalRoomCharges: booking.totalAmount,
          status: booking.status.replace('-', '_'),
          bookingDate: booking.createdAt,
          specialRequests: booking.specialRequests,
          advancePayment: booking.depositAmount,
          deposit: booking.depositAmount,
          additionalCharges: [
            ...(booking.minibarCharges ? [{ serviceId: 'minibar', quantity: 1, unitPrice: booking.minibarCharges, total: booking.minibarCharges, date: booking.checkInDate }] : []),
            ...(booking.additionalServices ? [{ serviceId: 'additional_services', quantity: 1, unitPrice: booking.additionalServices, total: booking.additionalServices, date: booking.checkInDate }] : []),
            ...(booking.damageCharges ? [{ serviceId: 'damage', quantity: 1, unitPrice: booking.damageCharges, total: booking.damageCharges, date: booking.checkInDate }] : []),
          ],
          finalAmount: booking.finalAmount,
        }));

        invoices = invoices.map(invoice => ({
          ...invoice,
          status: invoice.paidAmount >= invoice.total
            ? 'paid'
            : new Date(invoice.dueDate) < currentDate
              ? 'overdue'
              : 'pending',
          reservation: mappedReservations.find(r => r.id === invoice.reservationId) || null,
          payments: payments.filter(p => p.reservationId === invoice.reservationId),
        }));

        setReservations(mappedReservations);
        setInvoices(invoices);
        setPayments(payments);
      } catch (err) {
        toast.error('Failed to update charges');
        console.error(err);
      }
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
                  <div><strong>Room:</strong> {reservation.room?.name} ({reservation.room?.roomNumber})</div>
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
                    <span>${reservation.roomRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Nights:</span>
                    <span>{reservation.nights}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Room Charges:</span>
                    <span>${reservation.totalRoomCharges.toFixed(2)}</span>
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
                      {charges.map((charge, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2 text-sm">{getServiceById(charge.serviceId).name}</td>
                          <td className="px-4 py-2 text-sm">{new Date(charge.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-sm">{charge.quantity}</td>
                          <td className="px-4 py-2 text-sm">${charge.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-semibold">${charge.total.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeCharge(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Additional Charges Total: ${charges.reduce((sum, charge) => sum + charge.total, 0).toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold">
                    Tax (10%): ${(reservation.totalRoomCharges + charges.reduce((sum, charge) => sum + charge.total, 0)) * 0.1.toFixed(2)}
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    Grand Total: ${(reservation.totalRoomCharges + charges.reduce((sum, charge) => sum + charge.total, 0) * 1.1).toFixed(2)}
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
      date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payment = {
          id: `PAY-${Date.now()}`,
          reservationId: reservation.id,
          amount: parseFloat(paymentData.amount),
          type: paymentData.type,
          method: paymentData.method,
          status: 'completed',
          date: paymentData.date,
          reference: paymentData.reference,
          notes: paymentData.notes,
        };
        const response = await fetch(`${API_BASE_URL}/billing/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment),
        });
        if (!response.ok) throw new Error('Failed to record payment');
        const newPayment = await response.json();
        toast.success('Payment recorded successfully');
        onSave(newPayment);
        // Auto-refresh data
        const [bookingsRes, roomsRes, invoicesRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/bookings`),
          fetch(`${API_BASE_URL}/billing/rooms`),
          fetch(`${API_BASE_URL}/billing/invoices`),
          fetch(`${API_BASE_URL}/billing/payments`),
        ]);
        const bookings = await bookingsRes.json();
        const rooms = await roomsRes.json();
        let invoices = await invoicesRes.json();
        const payments = await paymentsRes.json();
        const mappedReservations = bookings.map(booking => ({
          id: booking.id,
          guestName: `${booking.firstName} ${booking.lastName}`.trim(),
          email: booking.guestEmail,
          phone: booking.guestPhone,
          address: booking.address || '',
          roomId: booking.roomId,
          room: rooms.find(room => room.id === booking.roomId) || { name: 'Unknown', roomNumber: 'N/A' },
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          guests: booking.guests,
          nights: Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
          roomRate: booking.totalAmount / Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
          totalRoomCharges: booking.totalAmount,
          status: booking.status.replace('-', '_'),
          bookingDate: booking.createdAt,
          specialRequests: booking.specialRequests,
          advancePayment: booking.depositAmount,
          deposit: booking.depositAmount,
          additionalCharges: [
            ...(booking.minibarCharges ? [{ serviceId: 'minibar', quantity: 1, unitPrice: booking.minibarCharges, total: booking.minibarCharges, date: booking.checkInDate }] : []),
            ...(booking.additionalServices ? [{ serviceId: 'additional_services', quantity: 1, unitPrice: booking.additionalServices, total: booking.additionalServices, date: booking.checkInDate }] : []),
            ...(booking.damageCharges ? [{ serviceId: 'damage', quantity: 1, unitPrice: booking.damageCharges, total: booking.damageCharges, date: booking.checkInDate }] : []),
          ],
          finalAmount: booking.finalAmount,
        }));

        invoices = invoices.map(invoice => ({
          ...invoice,
          status: invoice.paidAmount >= invoice.total
            ? 'paid'
            : new Date(invoice.dueDate) < currentDate
              ? 'overdue'
              : 'pending',
          reservation: mappedReservations.find(r => r.id === invoice.reservationId) || null,
          payments: payments.filter(p => p.reservationId === invoice.reservationId),
        }));

        setReservations(mappedReservations);
        setRooms(rooms);
        setInvoices(invoices);
        setPayments(payments);
      } catch (err) {
        toast.error(`Failed to record payment: ${err.message}`);
        console.error(err);
      }
    };

    const outstandingBalance = getOutstandingBalance(reservation);

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
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
                  <div><strong>Room:</strong> {reservation.room?.name} ({reservation.room?.roomNumber})</div>
                  <div><strong>Check-in:</strong> {new Date(reservation.checkIn).toLocaleDateString()}</div>
                  <div><strong>Check-out:</strong> {new Date(reservation.checkOut).toLocaleDateString()}</div>
                  <div><strong>Outstanding Balance:</strong> <span className="text-red-600 font-semibold">${outstandingBalance.toFixed(2)}</span></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={outstandingBalance}
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
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
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <input
                      type="text"
                      value={paymentData.reference}
                      onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction reference"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>
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

  const generateInvoice = async (reservation) => {
    try {
      const totalCharges = calculateTotalCharges(reservation);
      const paidAmount = getTotalPaid(reservation.id);
      const currentDate = new Date('2025-09-10');
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const invoice = {
        id: `INV-${Date.now()}`,
        reservationId: reservation.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        subtotal: totalCharges / 1.1,
        tax: totalCharges - (totalCharges / 1.1),
        total: totalCharges,
        paidAmount: paidAmount,
        items: [
          {
            description: `Room Charges (${reservation.nights} nights)`,
            quantity: reservation.nights,
            unitPrice: reservation.roomRate,
            total: reservation.totalRoomCharges,
          },
          ...(reservation.additionalCharges || []).map(charge => ({
            description: getServiceById(charge.serviceId).name,
            quantity: charge.quantity,
            unitPrice: charge.unitPrice,
            total: charge.total,
          })),
        ],
        reservation,
        payments: getPaymentsByReservation(reservation.id),
      };
      const response = await fetch(`${API_BASE_URL}/billing/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error('Failed to generate invoice');
      const newInvoice = await response.json();
      setInvoices([...invoices, { ...newInvoice, reservation, payments: getPaymentsByReservation(reservation.id) }]);
      return newInvoice;
    } catch (err) {
      toast.error('Failed to generate invoice');
      console.error(err);
    }
  };

  const updateInvoiceStatus = async (invoice) => {
    const currentDate = new Date('2025-09-10');
    const newStatus = (invoice.total - invoice.paidAmount) === 0 
      ? 'paid'
      : new Date(invoice.dueDate) < currentDate 
        ? 'overdue' 
        : 'pending';
    if (invoice.status !== newStatus) {
      const updatedInvoice = { ...invoice, status: newStatus };
      try {
        await fetch(`${API_BASE_URL}/billing/invoices/${invoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedInvoice),
        });
        return updatedInvoice;
      } catch (err) {
        toast.error('Failed to update invoice status');
        console.error(err);
        return updatedInvoice;
      }
    }
    return invoice;
  };

  const InvoiceDetailsModal = ({ invoice, onClose }) => {
    let reservation = invoice.reservation;
    if (!reservation || !reservation.checkIn || !reservation.checkOut || !reservation.room) {
      reservation = reservations.find(r => r.id === invoice.reservationId) || {};
    }
    let room = reservation.room;
    if (!room || !room.name || !room.roomNumber) {
      room = getRoomById(reservation.roomId);
    }
    if (!room) room = { name: 'Unknown', roomNumber: 'N/A' };

    const handlePrint = () => window.print();

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDownloadInvoice(invoice, reservation)}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
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
    setReservations(reservations.map(res => res.id === updatedReservation.id ? updatedReservation : res));
    setShowBillingForm(false);
  };

  const handleAddPayment = async (payment) => {
    setPayments([...payments, payment]);
    setShowPaymentForm(false);

    const invoice = invoices.find(inv => inv.reservationId === payment.reservationId);
    if (invoice) {
      const updatedInvoice = {
        ...invoice,
        paidAmount: invoice.paidAmount + payment.amount,
        payments: [...invoice.payments, payment],
      };
      const updatedInvoiceWithStatus = await updateInvoiceStatus(updatedInvoice);
      setInvoices(invoices.map(inv => inv.id === invoice.id ? updatedInvoiceWithStatus : inv));
    }

    // Update reservation finalAmount
    const totalPaid = getTotalPaid(payment.reservationId);
    setReservations(reservations.map(res => res.id === payment.reservationId ? { ...res, finalAmount: totalPaid } : res));
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      checked_in: 'bg-green-100 text-green-800 border-green-200',
      checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const tabs = [
    { id: 'reservations', label: 'Reservations & Billing', icon: Receipt, color: 'blue' },
    { id: 'payments', label: 'Payment History', icon: CreditCard, color: 'green' },
    { id: 'invoices', label: 'Invoices', icon: FileText, color: 'purple' },
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
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
        <div className="px-6 py-6">
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
                      <option value="no_show">No Show</option>
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reservation Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => {
                      const totalCharges = calculateTotalCharges(reservation);
                      const totalPaid = getTotalPaid(reservation.id);
                      const balance = totalCharges - totalPaid;
                      const invoiceStatus = getInvoiceStatus(reservation.id);
                      const additionalTotal = reservation.additionalCharges?.reduce((sum, charge) => sum + charge.total, 0) || 0;
                      const subtotal = reservation.totalRoomCharges + additionalTotal;
                      const tax = subtotal * 0.1;
                      return (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{reservation.guestName}</p>
                              <p className="text-sm text-gray-600">{reservation.email}</p>
                              <p className="text-sm text-blue-600">{reservation.room?.name} ({reservation.room?.roomNumber})</p>
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
                              <p className="text-gray-600">Room: ${reservation.totalRoomCharges.toFixed(2)}</p>
                              {reservation.additionalCharges?.length > 0 && (
                                <p className="text-gray-600">Extras: ${additionalTotal.toFixed(2)}</p>
                              )}
                              <p className="text-gray-600">Tax (10%): ${tax.toFixed(2)}</p>
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(invoiceStatus)}`}>
                              {invoiceStatus === 'No Invoice' ? 'No Invoice' : invoiceStatus}
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
                              >
                                <Receipt className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowPaymentForm(true);
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  const invoice = await generateInvoice(reservation);
                                  if (invoice) {
                                    setSelectedInvoice(invoice);
                                    setShowInvoiceDetails(true);
                                  }
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
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
                            <p className="text-lg font-bold text-green-600">${payment.amount.toFixed(2)}</p>
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
                    {uniqueInvoices.map((invoice) => {
                      const reservation = invoice.reservation;
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
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowInvoiceDetails(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPaymentHistory(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <History className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(invoice, reservation)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
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
          {showPaymentHistory && selectedInvoice && (
            <PaymentHistoryModal
              invoice={selectedInvoice}
              onClose={() => {
                setShowPaymentHistory(false);
                setSelectedInvoice(null);
              }}
            />
          )}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
          <ToastContainer />
        </div>
      </div>
      </div>
    );
  };

export default BillingInvoice;