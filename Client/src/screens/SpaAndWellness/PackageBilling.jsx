import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, DollarSign, AlertCircle, Eye, Download, X, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../../apiconfig';

const PackageBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const [notification, setNotification] = useState(null);

  const API_URL = `${API_BASE_URL}/spa`;

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const normalizeToken = (token) => {
    return token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token;
  };

  const fetchBillings = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': normalizeToken(token) }),
      };
      const response = await fetch(
        `${API_URL}/billing?expand=0&limit=500&fields=_id,billingId,appointmentId,guestId,guestName,guestEmail,guestPhone,invoiceDate,items,subtotal,tax,discount,total,amountPaid,amountDue,paymentStatus,paymentMethod,notes,dueDate`,
        { headers }
      );
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const data = await response.json();
      const safeBillings = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);
      setBillings(safeBillings);
    } catch (error) {
      console.error('Error fetching billings:', error);
      showNotification('Failed to load billings', 'error');
      setBillings([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const filteredBillings = billings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.billingId.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || b.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      partial: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const totalRevenue = billings
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const pendingPayments = billings
    .reduce((sum, b) => sum + (b.amountDue || 0), 0);

  const handleViewBilling = (billing) => {
    setSelectedBilling(billing);
    setShowViewModal(true);
  };

  const handleEdit = (billing) => {
    setEditingBilling(billing);
    setShowEditModal(true);
  };

  const handleUpdateBilling = async (e, formData) => {
    e.preventDefault();
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': normalizeToken(token) }),
      };

      const amountPaidNum = parseFloat(formData.amountPaid) || 0;
      const taxNum = parseFloat(formData.tax) || 0;
      const discountNum = parseFloat(formData.discount) || 0;
      const newTotal = editingBilling.subtotal + taxNum - discountNum;
      
      const updatedData = {
        ...editingBilling,
        ...formData,
        amountPaid: amountPaidNum,
        tax: taxNum,
        discount: discountNum,
        total: newTotal,
        amountDue: newTotal - amountPaidNum,
      };

      const response = await fetch(`${API_URL}/billing/${editingBilling._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update billing');
      
      fetchBillings({ background: true });
      setShowEditModal(false);
      showNotification('Billing updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating billing:', error);
      showNotification('Failed to update billing', 'error');
    }
  };

  const handleDownloadInvoice = (billing) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(31, 41, 55);
      doc.text('INVOICE', 20, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(107, 114, 128);
      doc.text(billing.billingId, 20, 28);
      
      // Company Info 
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text('LUSH WARE Hotels', 200, 20, { align: 'right' });
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text('Spa & Wellness Department', 200, 28, { align: 'right' });
      doc.text('Resort Paradise, Paradise City', 200, 34, { align: 'right' });
      doc.text('Phone: +94 (0) 123-4567', 200, 40, { align: 'right' });
      
      // Bill To Section
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Bill To:', 20, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      let billToY = 68;
      
      // Name with label
      const guestName = billing.guestName || billing.firstName || 'Guest';
      doc.text(`Name: ${guestName}`, 20, billToY);
      billToY += 6;
      
      // Email with label 
      const email = billing.guestEmail || 
                    billing.email || 
                    (billing.appointmentId?.guestEmail) ||
                    'Not provided';
      doc.text(`Email: ${email}`, 20, billToY);
      billToY += 6;
      
      // Phone with label 
      const phone = billing.guestPhone || 
                    billing.phone || 
                    (billing.appointmentId?.guestPhone) ||
                    'Not provided';
      doc.text(`Phone Number: ${phone}`, 20, billToY);
      billToY += 6;

      // Invoice Details 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Invoice Details:', 110, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Invoice Date: ${new Date(billing.invoiceDate).toLocaleDateString()}`, 110, 68);
      doc.text(`Due Date: ${billing.dueDate ? new Date(billing.dueDate).toLocaleDateString() : 'N/A'}`, 110, 74);
      doc.text(`Package: ${billing.appointmentId?.packageName || billing.packageName || 'Spa Package'}`, 110, 80);
      doc.text(`Payment Status: ${billing.paymentStatus.toUpperCase()}`, 110, 86);
      
      // Items Table Header
      doc.setFillColor(249, 250, 251);
      doc.rect(20, 110, 170, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('Description', 22, 116);
      doc.text('Qty', 120, 116, { align: 'right' });
      doc.text('Rate', 150, 116, { align: 'right' });
      doc.text('Total', 188, 116, { align: 'right' });
      
      // Items Rows
      let y = 126;
      if (billing.items && billing.items.length > 0) {
        billing.items.forEach((item) => {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(31, 41, 55);
          doc.text(item.description, 22, y, { maxWidth: 90 });
          doc.text(item.quantity.toString(), 120, y, { align: 'right' });
          doc.text(`$${parseFloat(item.unitPrice || 0).toFixed(2)}`, 150, y, { align: 'right' });
          doc.setFont("helvetica", "bold");
          doc.text(`$${parseFloat(item.subtotal || 0).toFixed(2)}`, 188, y, { align: 'right' });
          y += 10;
        });
      }
      
      // Totals Section
      const totalsX = 130;
      doc.setLineWidth(0.5);
      doc.line(130, y, 190, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('Subtotal:', totalsX, y);
      doc.text(`$${parseFloat(billing.subtotal || 0).toFixed(2)}`, 188, y, { align: 'right' });
      y += 8;
      doc.text('Tax:', totalsX, y);
      doc.text(`$${parseFloat(billing.tax || 0).toFixed(2)}`, 188, y, { align: 'right' });
      y += 8;
      doc.text('Discount:', totalsX, y);
      doc.text(`-$${parseFloat(billing.discount || 0).toFixed(2)}`, 188, y, { align: 'right' });
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text('Total:', totalsX, y);
      doc.text(`$${parseFloat(billing.total || 0).toFixed(2)}`, 188, y, { align: 'right' });
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text('Paid:', totalsX, y);
      doc.text(`$${parseFloat(billing.amountPaid || 0).toFixed(2)}`, 188, y, { align: 'right' });
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text('Balance Due:', totalsX, y);
      doc.text(`$${parseFloat(billing.amountDue || 0).toFixed(2)}`, 188, y, { align: 'right' });
      
      y += 16;
      const statusColors = {
        paid: [220, 252, 231],
        partial: [254, 243, 199],
        pending: [254, 243, 199],
        refunded: [240, 240, 240],
        cancelled: [254, 226, 226]
      };
      const textColors = {
        paid: [22, 163, 74],
        partial: [202, 138, 4],
        pending: [202, 138, 4],
        refunded: [107, 114, 128],
        cancelled: [220, 38, 38]
      };
      
      const bgColor = statusColors[billing.paymentStatus] || [240, 240, 240];
      const textColor = textColors[billing.paymentStatus] || [31, 41, 55];
      
      doc.setFillColor(...bgColor);
      doc.rect(20, y - 6, 170, 12, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.text(billing.paymentStatus.toUpperCase(), 22, y);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Thank you for choosing our Spa & Wellness services!', 105, 280, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 287, { align: 'center' });

      doc.save(`spa-invoice_${billing.billingId}.pdf`);
      showNotification('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Failed to download invoice: ' + error.message, 'error');
    }
  };

  const BillingDetailsModal = ({ billing, onClose }) => {
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{billing.billingId}</h2>
                <p className="text-sm text-gray-600">Invoice Details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-3 hover:bg-gray-200 rounded-full transition-colors">
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice ID</p>
                <p className="font-semibold text-gray-900">{billing.billingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Guest Name</p>
                <p className="font-semibold text-gray-900">{billing.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
                <p className="font-semibold text-gray-900">{new Date(billing.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="font-semibold text-gray-900">{billing.dueDate ? new Date(billing.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(billing.paymentStatus)}`}>
                  {billing.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="font-semibold text-green-600">${billing.total?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Subtotal</p>
                <p className="text-lg font-semibold text-gray-900">${billing.subtotal?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Tax (10%)</p>
                <p className="text-lg font-semibold text-gray-900">${billing.tax?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Amount Paid</p>
                <p className="text-lg font-semibold text-green-600">${billing.amountPaid?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {billing.items && billing.items.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Price</th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-gray-600">${item.unitPrice?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-2 text-right font-medium text-gray-900">${item.subtotal?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-900">${billing.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax (10%):</span>
                <span className="font-medium text-gray-900">${billing.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Discount:</span>
                <span className="font-medium text-gray-900">-${billing.discount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${billing.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-green-600 pt-2">
                <span>Amount Paid:</span>
                <span className="font-semibold">${billing.amountPaid?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Amount Due:</span>
                <span>${billing.amountDue?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 flex gap-3">
            <button 
              onClick={() => handleDownloadInvoice(billing)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const EditPaymentModal = ({ billing, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
      amountPaid: billing.amountPaid ? String(billing.amountPaid) : '',
      tax: billing.tax ? String(billing.tax) : '',
      discount: billing.discount ? String(billing.discount) : '',
      paymentStatus: billing.paymentStatus || 'pending',
      paymentMethod: billing.paymentMethod || '',
      notes: billing.notes || '',
    });

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const handleSubmit = (e) => {
      onUpdate(e, formData);
    };

    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Update Payment</h2>
                <p className="text-sm text-gray-600">Modify Payment Details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-3 hover:bg-gray-200 rounded-full transition-colors">
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank or enter 0 for no tax</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank or enter 0 for no discount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Update
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
          }`}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <XCircle size={20} />}
            {notification.type === 'info' && <AlertCircle size={20} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Billing Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign size={32} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pending Payments</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">${pendingPayments.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText size={32} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{billings.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText size={32} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Records</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billings Table */}
      <div className="px-4 sm:px-6 pb-6">
        {loading && billings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Preparing billing records...</p>
          </div>
        ) : filteredBillings.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No billing records found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Invoice ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Guest</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Paid</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Pending</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBillings.map(billing => (
                    <tr key={billing._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{billing.billingId}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{billing.guestName}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{new Date(billing.invoiceDate).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-900">${billing.total.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-green-600 font-medium">${billing.amountPaid.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-red-600 font-medium">${billing.amountDue.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(billing.paymentStatus)}`}>
                          {billing.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewBilling(billing)}
                            className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(billing)}
                            className="p-2 sm:p-3 text-orange-600 hover:bg-orange-50 rounded transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(billing)}
                            className="p-2 sm:p-3 text-green-600 hover:bg-green-50 rounded transition"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
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

      {showViewModal && selectedBilling && (
        <BillingDetailsModal billing={selectedBilling} onClose={() => setShowViewModal(false)} />
      )}

      {showEditModal && editingBilling && (
        <EditPaymentModal billing={editingBilling} onClose={() => setShowEditModal(false)} onUpdate={handleUpdateBilling} />
      )}
    </div>
  );
};

export default PackageBilling;

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
  }
`;
if (!document.head.querySelector('style[data-billing-animation]')) {
  style.setAttribute('data-billing-animation', 'true');
  document.head.appendChild(style);
}
