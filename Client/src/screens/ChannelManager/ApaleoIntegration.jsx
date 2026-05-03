import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { API_BASE_URL } from '../../apiconfig';
import Sidebar from '../Sidebar';
import Appbar from '../../Appbar';
import {
  Globe, Link2, Link2Off, RefreshCw, Building2, BedDouble,
  Tag, Calendar, CheckCircle2, XCircle, AlertCircle, ExternalLink,
  Save, Loader2, Info, ArrowRight, Terminal, Search, Filter, Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Globe, color: 'blue' },
  { id: 'properties', label: 'Properties', icon: Building2, color: 'cyan' },
  { id: 'room-types', label: 'Room Types', icon: BedDouble, color: 'purple' },
  { id: 'rate-plans', label: 'Rate Plans', icon: Tag, color: 'yellow' },
  { id: 'reservations', label: 'Reservations', icon: Calendar, color: 'green' },
];

const locName = (name) => {
  if (!name) return '—';
  if (typeof name === 'string') return name;
  return name.en || name[Object.keys(name)[0]] || '—';
};

const StatusBadge = ({ connected }) =>
  connected ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
      <CheckCircle2 size={12} /> Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold">
      <XCircle size={12} /> Not connected
    </span>
  );

// Overview Tab
const EnvRow = ({ name, set }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="font-mono text-sm text-slate-700">{name}</span>
    {set
      ? <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} /> Set</span>
      : <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500"><XCircle size={13} /> Missing</span>
    }
  </div>
);

const OverviewTab = ({ config, onConnect, onDisconnect }) => {
  const [saving, setSaving] = useState(false);

  const handleConnect = async () => {
    if (!config?.envConfigured) {
      toast.error('Set APALEO_CLIENT_ID and APALEO_CLIENT_SECRET in Server/.env first');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/apaleo/connect`);
      toast.success('Connected to Apaleo!');
      onConnect();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection failed — check .env credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect from Apaleo? This will stop all sync.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/apaleo/disconnect`);
      toast.success('Disconnected from Apaleo');
      onDisconnect();
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  return (
    <div className="px-4 sm:px-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-[#0f2742]/10 rounded-lg">
              <Terminal size={18} className="text-[#0f2742]" />
            </div>
            Server Environment Variables
          </h3>
          <StatusBadge connected={config?.connected} />
        </div>

        <div className="max-w-lg space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden pl-4 pr-4">
            <EnvRow name="APALEO_CLIENT_ID" set={config?.envConfigured} />
            <EnvRow name="APALEO_CLIENT_SECRET" set={config?.envConfigured} />
            <EnvRow name="APALEO_ENVIRONMENT" set={!!config?.environment} />
          </div>

          {!config?.envConfigured && (
            <div className="rounded-xl border border-slate-300 bg-slate-900 px-5 py-4">
              <p className="text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">Add to Server/.env</p>
              <pre className="text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap font-mono">{`APALEO_CLIENT_ID=your-client-id
APALEO_CLIENT_SECRET=your-client-secret
APALEO_ENVIRONMENT=sandbox`}</pre>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {!config?.connected ? (
              <button
                onClick={handleConnect}
                disabled={saving || !config?.envConfigured}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f2742] text-white text-sm font-bold rounded-xl hover:bg-[#1a3a5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                {saving ? 'Connecting…' : 'Test Connection'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f2742] text-white text-sm font-bold rounded-xl hover:bg-[#1a3a5c] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {saving ? 'Re-testing…' : 'Re-test Connection'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-rose-200 text-rose-600 text-sm font-bold rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <Link2Off size={16} />
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-3">
          <div className="p-2.5 bg-[#0f2742]/10 rounded-lg">
            <CheckCircle2 size={18} className="text-[#0f2742]" />
          </div>
          Setup Checklist
        </h3>
        <div className="space-y-3">
          {[
            { done: !!config?.envConfigured, label: 'Add APALEO_CLIENT_ID, APALEO_CLIENT_SECRET, APALEO_ENVIRONMENT to Server/.env' },
            { done: !!config?.connected, label: 'Click "Test connection" to verify credentials and get an access token' },
            { done: !!config?.propertyId, label: 'Select your active property in the Properties tab' },
            { done: (config?.roomMappings?.length ?? 0) > 0, label: 'Map local room types to Apaleo unit types' },
            { done: false, label: 'Enable Booking.com channel in Apaleo portal → Distribution → Channels' },
            { done: false, label: 'Register webhook URL in Apaleo portal → Developer → Webhooks' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                {step.done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm leading-relaxed pt-0.5 ${step.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PropertiesTab = ({ config, onPropertySelect }) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(config?.propertyId || '');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: propertiesData = {}, isLoading: loading } = useQuery({
    queryKey: ['apaleo-properties'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/apaleo/properties`);
      return data;
    },
  });

  const properties = propertiesData.properties || [];

  useEffect(() => { setSelectedId(config?.propertyId || ''); }, [config?.propertyId]);

  const saveSelection = async () => {
    if (!selectedId) { toast.error('Select a property first'); return; }
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/apaleo/save-config`, { propertyId: selectedId });
      toast.success('Active property saved');
      onPropertySelect(selectedId);
    } catch {
      toast.error('Failed to save property selection');
    } finally {
      setSaving(false);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Filter section - connected to header */}
      <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>
          </div>

          {/* Count and Refresh */}
          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredProperties.length} properties
            </div>
            <button
              onClick={() => queryClient.refetchQueries({ queryKey: ['apaleo-properties'] })}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#c9a24a]" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Building2 size={40} className="mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-sm text-slate-500">{searchQuery ? 'No properties found' : 'No properties available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map(p => {
            const isSelected = selectedId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`text-left p-6 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#c9a24a] bg-[#c9a24a]/5 shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#c9a24a]/50 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-[#0f2742]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-[#0f2742]" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#c9a24a] bg-[#c9a24a]/10 px-3 py-1.5 rounded-full">
                      <CheckCircle2 size={13} /> Active
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-base mb-1">{p.name}</p>
                <p className="text-xs text-slate-400 font-mono mb-3">{p.id}</p>
                <div className="space-y-2 text-sm text-slate-700">
                  {p.location?.addressLine1 && (
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 text-xs font-bold flex-shrink-0 mt-0.5">📍</span>
                      <span className="text-slate-600">{p.location.addressLine1}, {p.location.city}</span>
                    </p>
                  )}
                  {p.unitCount != null && (
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 text-xs font-bold flex-shrink-0 mt-0.5">🏢</span>
                      <span className="text-slate-600">{p.unitCount} units</span>
                    </p>
                  )}
                  {p.timeZone && (
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 text-xs font-bold flex-shrink-0 mt-0.5">🕐</span>
                      <span className="text-slate-600">{p.timeZone}</span>
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

        {filteredProperties.length > 0 && selectedId && (
          <div className="mt-6">
            <button
              onClick={saveSelection}
              disabled={saving || !selectedId}
              className="flex items-center gap-2 px-6 py-3 bg-[#0f2742] text-white text-sm font-bold rounded-xl hover:bg-[#1a3a5c] transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save Selection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Room Types Tab 
const RoomTypesTab = ({ config, onRefresh }) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [mappings, setMappings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: unitTypesData = {}, isLoading: loading } = useQuery({
    queryKey: ['apaleo-unit-types', config?.propertyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/apaleo/unit-types?propertyId=${config.propertyId}`);
      return data;
    },
    enabled: !!config?.propertyId,
  });

  const unitTypes = unitTypesData.unitTypes || [];

  useEffect(() => {
    const initMaps = {};
    (config?.roomMappings || []).forEach(m => { initMaps[m.apaleoUnitTypeId] = m.localRoomType; });
    setMappings(initMaps);
  }, [config?.roomMappings]);

  const saveMappings = async () => {
    setSaving(true);
    try {
      const roomMappings = unitTypes
        .filter(u => mappings[u.id])
        .map(u => ({ apaleoUnitTypeId: u.id, apaleoUnitTypeName: u.name, localRoomType: mappings[u.id] }));
      await axios.post(`${API_BASE_URL}/apaleo/save-config`, { roomMappings });
      toast.success('Room mappings saved');
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to save mappings');
    } finally {
      setSaving(false);
    }
  };

  const filteredTypes = unitTypes.filter(u =>
    locName(u.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!config?.propertyId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <BedDouble size={36} className="mx-auto mb-3 opacity-30 text-slate-400" />
        <p className="text-sm text-slate-500">Select an active property in the Properties tab first</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Filter section - connected to header */}
      <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search room types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>
          </div>

          {/* Count and Refresh */}
          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredTypes.length} room types
            </div>
            <button
              onClick={() => queryClient.refetchQueries({ queryKey: ['apaleo-unit-types'] })}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#c9a24a]" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#0f2742] to-[#0f2742] text-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Room Type Name</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Units</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Mapped To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      <BedDouble size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">{searchQuery ? 'No room types found' : 'No unit types available'}</p>
                    </td>
                  </tr>
                ) : filteredTypes.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{locName(u.name)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.id}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">
                        {u.unitCount ?? u.maxPersons ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={mappings[u.id] || ''}
                        onChange={e => setMappings(m => ({ ...m, [u.id]: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/40 focus:border-[#c9a24a] bg-white font-medium"
                      >
                        <option value="">Select mapping...</option>
                        {['single', 'double', 'twin', 'triple', 'suite', 'presidential', 'villa', 'penthouse'].map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
      {filteredTypes.length > 0 && (
        <div className="px-6 pb-6">
          <button
            onClick={saveMappings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0f2742] text-white text-sm font-bold rounded-xl hover:bg-[#1a3a5c] transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save All Mappings'}
          </button>
        </div>
      )}
    </div>
  );
};

// Rate Plans Tab 
const RatePlansTab = ({ config }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: plansData = {}, isLoading: loading } = useQuery({
    queryKey: ['apaleo-rate-plans', config?.propertyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/apaleo/rate-plans?propertyId=${config.propertyId}`);
      return data;
    },
    enabled: !!config?.propertyId,
  });

  const plans = plansData.ratePlans || [];

  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!config?.propertyId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <Tag size={36} className="mx-auto mb-3 opacity-30 text-slate-400" />
        <p className="text-sm text-slate-500">Select an active property in the Properties tab first</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Filter section - connected to header */}
      <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rate plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>
          </div>

          {/* Count and Refresh */}
          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredPlans.length} rate plans
            </div>
            <button
              onClick={() => queryClient.refetchQueries({ queryKey: ['apaleo-rate-plans'] })}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#c9a24a]" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#0f2742] to-[#0f2742] text-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Plan Name</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Code</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Channels</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <Tag size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">{searchQuery ? 'No rate plans found' : 'No rate plans available'}</p>
                    </td>
                  </tr>
                ) : filteredPlans.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.code || '—'}</td>
                    <td className="px-6 py-4 text-slate-700 capitalize">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">
                        {p.type || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.channelCodes || []).slice(0, 3).map(c => (
                          <span key={c} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-bold">{c}</span>
                        ))}
                        {(p.channelCodes || []).length > 3 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">+{(p.channelCodes || []).length - 3}</span>
                        )}
                        {(!p.channelCodes || p.channelCodes.length === 0) && (
                          <span className="text-slate-400 text-xs">All channels</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 text-xs rounded-full font-bold inline-block ${
                        p.isActive !== false 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

// Reservations Tab 
const ReservationsTab = ({ config }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', from: '', to: '', searchQuery: '' });
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const { data: reservationsData = {}, isLoading: loading, isFetching: isFetchingRes } = useQuery({
    queryKey: ['apaleo-reservations', config?.propertyId, filters, page],
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams({
        propertyId: config.propertyId,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });
      if (filters.status) params.set('status', filters.status);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);

      const { data } = await axios.get(`${API_BASE_URL}/apaleo/reservations?${params}`);
      return data;
    },
    enabled: !!config?.propertyId,
  });

  const reservations = reservationsData.reservations || [];
  const total = reservationsData.count || 0;

  const STATUS_COLORS = {
    Confirmed: 'bg-blue-50 text-blue-700',
    InHouse: 'bg-emerald-50 text-emerald-700',
    CheckedOut: 'bg-slate-100 text-slate-600',
    Canceled: 'bg-rose-50 text-rose-600',
    NoShow: 'bg-amber-50 text-amber-700',
  };

  const filteredReservations = reservations.filter(r =>
    (r.primaryGuest?.firstName || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
    (r.primaryGuest?.lastName || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
    (r.id || '').toLowerCase().includes(filters.searchQuery.toLowerCase())
  );

  if (!config?.propertyId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <Calendar size={36} className="mx-auto mb-3 opacity-30 text-slate-400" />
        <p className="text-sm text-slate-500">Select an active property in the Properties tab first</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Filter section - connected to header */}
      <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className="pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              >
                <option value="">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="InHouse">In House</option>
                <option value="CheckedOut">Checked Out</option>
                <option value="Canceled">Canceled</option>
                <option value="NoShow">No Show</option>
              </select>
            </div>

            {/* Date Filters */}
            <input 
              type="date" 
              value={filters.from} 
              onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
            />
            <input 
              type="date" 
              value={filters.to} 
              onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
            />
          </div>

          {/* Count and Refresh */}
          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredReservations.length} reservations
            </div>
            <button
              onClick={() => queryClient.refetchQueries({ queryKey: ['apaleo-reservations'] })}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isFetchingRes ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f2742] text-white">
                    {['ID','Guest Name','Arrival','Departure','Room Type','Channel','Status'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 rounded"/></td>
                      <td className="px-6 py-4"><div className="h-3 w-32 bg-slate-200 rounded"/></td>
                      <td className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 rounded"/></td>
                      <td className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 rounded"/></td>
                      <td className="px-6 py-4"><div className="h-3 w-24 bg-slate-200 rounded"/></td>
                      <td className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 rounded"/></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 rounded-full"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#0f2742] to-[#0f2742] text-white border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Guest Name</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Arrival</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Departure</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Room Type</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Channel</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{filters.searchQuery || filters.status ? 'No reservations match your filters' : 'No reservations found'}</p>
                      </td>
                    </tr>
                  ) : filteredReservations.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{r.id?.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">
                        {r.primaryGuest?.firstName} {r.primaryGuest?.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {r.arrival ? new Date(r.arrival).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {r.departure ? new Date(r.departure).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">
                          {r.unit?.unitType?.name || r.unitType?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.channelCode
                          ? <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full font-bold">{r.channelCode}</span>
                          : <span className="text-slate-400 text-xs">Direct</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs rounded-full font-bold inline-block ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600'}`}>
                          {r.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500 font-semibold">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
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
  );
};

// Main Component 
const ApaleoIntegration = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: config = { connected: false }, isLoading: configLoading } = useQuery({
    queryKey: ['apaleo-config'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/apaleo/config`);
        return data;
      } catch {
        return { connected: false };
      }
    },
  });

  const handleConnect = () => queryClient.refetchQueries({ queryKey: ['apaleo-config'] });
  const handleDisconnect = () => queryClient.refetchQueries({ queryKey: ['apaleo-config'] });
  const handleRefreshConfig = () => queryClient.refetchQueries({ queryKey: ['apaleo-config'] });
  const handlePropertySelect = () => {
    queryClient.refetchQueries({ queryKey: ['apaleo-config'] });
  };

  const getTabStyles = (tab, isActive) => {
    return isActive
      ? 'bg-[#0f2742] text-white border-[#c9a24a] shadow-sm'
      : 'bg-white text-slate-600 border-slate-200 hover:text-[#0f2742] hover:border-[#c9a24a] hover:bg-[#fffaf0]';
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
        {/* Header with Tabs */}
        <div className="bg-[#0f2742] shadow-sm border-b border-[#c9a24a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-white/10 p-3 rounded-lg shadow-lg">
                  <Globe className="h-8 w-8 text-[#c9a24a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#c9a24a] font-medium">Channel Integration</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Channel Manager</h1>
                  <p className="text-white/60">Apaleo API integration with Booking.com distribution and reservations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 sm:px-6 pt-2 pb-5 overflow-x-auto">
            <nav className="flex gap-2 min-w-max" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLocked = !config?.connected && tab.id !== 'overview';

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isLocked && setActiveTab(tab.id)}
                    disabled={isLocked}
                    className={`${getTabStyles(tab, isActive)} 
                      hotel-tab flex items-center space-x-2 px-4 py-3 border-2 font-semibold text-sm transition-all ${
                      isLocked ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {!config?.connected && activeTab !== 'overview' && (
            <div className="px-4 sm:px-6 mt-6 mx-auto max-w-7xl flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Not connected to Apaleo</p>
                <p className="text-sm text-amber-700 mt-1">
                  Go to the <button onClick={() => setActiveTab('overview')} className="underline font-semibold hover:text-amber-900">Overview tab</button> to connect your Apaleo account.
                </p>
              </div>
            </div>
          )}

          {/* Tab content */}
          {configLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#c9a24a]" />
            </div>
          ) : (
            <div className={activeTab === 'overview' ? 'px-4 sm:px-6 py-8' : ''}>
              <div className="w-full max-w-full">
                {activeTab === 'overview' && (
                  <OverviewTab config={config} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                )}
                {activeTab === 'properties' && config?.connected && (
                  <PropertiesTab config={config} onPropertySelect={handlePropertySelect} />
                )}
                {activeTab === 'room-types' && config?.connected && (
                  <RoomTypesTab config={config} onRefresh={handleRefreshConfig} />
                )}
                {activeTab === 'rate-plans' && config?.connected && (
                  <RatePlansTab config={config} />
                )}
                {activeTab === 'reservations' && config?.connected && (
                  <ReservationsTab config={config} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApaleoIntegration;
