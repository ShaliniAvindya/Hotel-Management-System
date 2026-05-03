import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Menu,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react';
import { API_BASE_URL } from '../apiconfig';
import { readViewCache, writeViewCache } from '../lib/viewCache';
import Sidebar from './Sidebar';
import Appbar from '../Appbar';
import toast from 'react-hot-toast';

const LeadsManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(true);
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: '',
    checkInDate: '',
    checkOutDate: '',
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editData, setEditData] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [allLeads, setAllLeads] = useState(() => readViewCache('meta-leads', { fallback: [] }));
  const [isFetching, setIsFetching] = useState(false);

  const PAGE_SIZE = 20;

  const fetchLeads = useCallback(async ({ background = false } = {}) => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE_URL}/leads?pageSize=10000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const leads = data.leads || [];
      writeViewCache('meta-leads', leads);
      setAllLeads(leads);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads({ background: true });
  }, []); 
  const filteredLeads = useMemo(() => {
    let result = allLeads;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(l =>
        l.firstName?.toLowerCase().includes(q) ||
        l.lastName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q)
      );
    }

    if (filters.status) {
      result = result.filter(l => l.status === filters.status);
    }

    if (filters.checkInDate) {
      const fd = new Date(filters.checkInDate);
      result = result.filter(l => {
        if (!l.checkInDate) return false;
        const d = new Date(l.checkInDate);
        return d.getUTCFullYear() === fd.getUTCFullYear() &&
               d.getUTCMonth() === fd.getUTCMonth() &&
               d.getUTCDate() === fd.getUTCDate();
      });
    }

    if (filters.checkOutDate) {
      const fd = new Date(filters.checkOutDate);
      result = result.filter(l => {
        if (!l.checkOutDate) return false;
        const d = new Date(l.checkOutDate);
        return d.getUTCFullYear() === fd.getUTCFullYear() &&
               d.getUTCMonth() === fd.getUTCMonth() &&
               d.getUTCDate() === fd.getUTCDate();
      });
    }

    return result;
  }, [allLeads, filters]);

  // Client-side pagination
  const total = filteredLeads.length;
  const leads = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLeads.slice(start, start + PAGE_SIZE);
  }, [filteredLeads, page]);

  const handleRefresh = () => {
    fetchLeads({ background: false });
    toast.success('Leads refreshed');
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
    setEditData(lead);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setEditData({ ...lead });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Delete this lead?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/leads/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllLeads(prev => prev.filter(l => l._id !== leadId));
        toast.success('Lead deleted');
      } catch (err) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data: res } = await axios.put(`${API_BASE_URL}/leads/${editData._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.lead || editData;
      setAllLeads(prev => prev.map(l => l._id === updated._id ? updated : l));
      toast.success('Lead updated');
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    // Optimistic update — flips badge instantly
    setAllLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
    setStatusDropdown(null);
    if (editData && editData._id === leadId) {
      setEditData(d => ({ ...d, status: newStatus }));
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/leads/${leadId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Status updated');
    } catch (err) {
      fetchLeads({ background: true });
      toast.error('Failed to update status');
    }
  };

  const STATUS_OPTIONS = ['new', 'contacted', 'interested', 'converted', 'not-interested'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'contacted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'converted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'not-interested':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'direct':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72';

  return (
    <div className="hotel-page flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        <div className="bg-[#0f2742] shadow-sm border-b border-[#c9a24a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10"
              >
                <Menu size={24} />
              </button>
              <div className="bg-white/10 p-3 rounded-lg shadow-lg">
                <Users className="h-8 w-8 text-[#c9a24a]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#c9a24a] font-medium">Lead Management</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Leads Management</h1>
                <p className="text-white/60">Lead arrivals and inquiries management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="min-h-screen bg-slate-50/50">
            <div className="px-6 py-3 bg-white w-full border-b border-[#c9a24a]/30 sticky top-20 z-20">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Search</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name, email, phone..."
                      value={filters.searchQuery}
                      onChange={(e) => { setFilters(f => ({ ...f, searchQuery: e.target.value })); setPage(1); }}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] text-[#0f2742]"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Status</span>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filters.status}
                      onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
                      className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] text-[#0f2742]"
                    >
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="converted">Converted</option>
                      <option value="not-interested">Not Interested</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#c9a24a] focus-within:ring-1 focus-within:ring-[#c9a24a] transition-all">
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Check-in</span>
                  <input
                    type="date"
                    value={filters.checkInDate}
                    onChange={(e) => { setFilters(f => ({ ...f, checkInDate: e.target.value })); setPage(1); }}
                    className="text-sm bg-transparent border-none outline-none text-[#0f2742] w-32"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#c9a24a] focus-within:ring-1 focus-within:ring-[#c9a24a] transition-all">
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Check-out</span>
                  <input
                    type="date"
                    value={filters.checkOutDate}
                    onChange={(e) => { setFilters(f => ({ ...f, checkOutDate: e.target.value })); setPage(1); }}
                    className="text-sm bg-transparent border-none outline-none text-[#0f2742] w-32"
                  />
                </div>

                {(filters.searchQuery || filters.status || filters.checkInDate || filters.checkOutDate) && (
                  <button
                    onClick={() => { setFilters({ searchQuery: '', status: '', checkInDate: '', checkOutDate: '' }); setPage(1); }}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{total} leads</span>
                  <button onClick={handleRefresh} className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all" title="Refresh">
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  </button>
                </div>

              </div>
            </div>

            {/* Leads Table */}
            <div className="p-6">
              {leads.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                  <Users size={40} className="mx-auto mb-3 opacity-20 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    {filters.searchQuery || filters.status || filters.checkInDate || filters.checkOutDate ? 'No leads match your filters' : 'No leads found'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#0f2742] to-[#0f2742] text-white border-b border-slate-200">
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Name</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Email</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Phone</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Platform</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Check-in</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Check-out</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Created</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leads.map((lead) => (
                          <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              <div className="flex items-center space-x-2">
                                <span>
                                  {lead.firstName} {lead.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-xs">{lead.email}</td>
                            <td className="px-6 py-4 text-slate-700 text-xs">{lead.phone || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPlatformColor(lead.platform)}`}>
                                {lead.platform || 'unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-xs">{formatDate(lead.checkInDate)}</td>
                            <td className="px-6 py-4 text-slate-700 text-xs">{formatDate(lead.checkOutDate)}</td>
                            <td className="px-6 py-4 text-slate-700 text-xs">{formatDate(lead.createdAt || lead.leadDate)}</td>
                            <td className="px-6 py-4 w-36">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (statusDropdown?.id === lead._id) {
                                    setStatusDropdown(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setStatusDropdown({ id: lead._id, top: rect.bottom + 4, left: rect.left });
                                  }
                                }}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer hover:opacity-80 transition whitespace-nowrap ${getStatusColor(lead.status)}`}
                              >
                                {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                                <ChevronDown className="w-3 h-3 flex-shrink-0" />
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleView(lead)}
                                  className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(lead)}
                                  className="p-1.5 hover:bg-amber-100 rounded text-amber-600 transition"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(lead._id)}
                                  className="p-1.5 hover:bg-red-100 rounded text-red-600 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {total > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                      <span className="text-xs text-slate-500 font-semibold">
                        Page {page} of {Math.ceil(total / PAGE_SIZE)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={page <= 1}
                          onClick={() => setPage(page - 1)}
                          className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          disabled={page >= Math.ceil(total / PAGE_SIZE)}
                          onClick={() => setPage(page + 1)}
                          className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {statusDropdown && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setStatusDropdown(null)}
          />
          <div
            className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl min-w-[170px] py-1"
            style={{ top: statusDropdown.top, left: statusDropdown.left }}
          >
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(statusDropdown.id, s);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 ${s === leads.find(l => l._id === statusDropdown.id)?.status ? 'bg-slate-50' : ''}`}
              >
                <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusColor(s)}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && modalMode && selectedLead && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 text-white p-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">
                {modalMode === 'view' ? 'Lead Details' : 'Edit Lead'}
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={editData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setEditData(d => ({ ...d, status: newStatus }));
                    if (modalMode === 'view') {
                      handleStatusChange(editData._id, newStatus);
                    }
                  }}
                  className="px-3 py-1.5 bg-white/10 border border-white/25 rounded-lg text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} className="text-slate-900 bg-white">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                {modalMode === 'view' && (
                  <button
                    onClick={() => setModalMode('edit')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {modalMode === 'view' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editData.firstName && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">First Name</p>
                      <p className="text-sm font-medium text-slate-800">{editData.firstName}</p>
                    </div>
                  )}
                  {editData.lastName && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Name</p>
                      <p className="text-sm font-medium text-slate-800">{editData.lastName}</p>
                    </div>
                  )}
                  {editData.email && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-800">{editData.email}</p>
                    </div>
                  )}
                  {editData.phone && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm font-medium text-slate-800">{editData.phone}</p>
                    </div>
                  )}
                  {editData.city && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">City</p>
                      <p className="text-sm font-medium text-slate-800">{editData.city}</p>
                    </div>
                  )}
                  {editData.country && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Country</p>
                      <p className="text-sm font-medium text-slate-800">{editData.country}</p>
                    </div>
                  )}
                  {editData.checkInDate && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-in Date</p>
                      <p className="text-sm font-medium text-slate-800">{formatDate(editData.checkInDate)}</p>
                    </div>
                  )}
                  {editData.checkOutDate && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-out Date</p>
                      <p className="text-sm font-medium text-slate-800">{formatDate(editData.checkOutDate)}</p>
                    </div>
                  )}
                  {editData.numberOfGuests != null && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Guests</p>
                      <p className="text-sm font-medium text-slate-800">{editData.numberOfGuests}</p>
                    </div>
                  )}
                  {editData.platform && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Platform</p>
                      <p className="text-sm font-medium text-slate-800 capitalize">{editData.platform}</p>
                    </div>
                  )}
                  {editData.notes && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Requests / Notes</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{editData.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT MODE */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                      <input type="text" value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                      <input type="text" value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                      <input type="tel" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                      <input type="text" value={editData.city || ''} onChange={(e) => setEditData({ ...editData, city: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                      <input type="text" value={editData.country || ''} onChange={(e) => setEditData({ ...editData, country: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Check-in Date</label>
                      <input type="date" value={editData.checkInDate ? new Date(editData.checkInDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditData({ ...editData, checkInDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Check-out Date</label>
                      <input type="date" value={editData.checkOutDate ? new Date(editData.checkOutDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditData({ ...editData, checkOutDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Guests</label>
                      <input type="number" value={editData.numberOfGuests || ''} onChange={(e) => setEditData({ ...editData, numberOfGuests: parseInt(e.target.value) || null })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Platform</label>
                      <select value={editData.platform || ''} onChange={(e) => setEditData({ ...editData, platform: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="direct">Direct</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Requests / Notes</label>
                    <textarea value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows="4" placeholder="Add any special requests or notes..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-400 transition"
              >
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode === 'edit' && (
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
