import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { API_BASE_URL } from '../apiconfig';
import { readViewCache, writeViewCache } from '../lib/viewCache';
import {
  BarChart3,
  Utensils,
  DollarSign,
  Bed,
  Calendar,
  ChevronRight,
  Eye,
  Menu,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const KPI = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="hotel-stat-card bg-white border border-[#c9a24a]/40 p-6 hover:border-[#c9a24a]/60 transition-colors duration-300 shadow-sm rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-gray-500 mb-2">{title}</p>
          <p className="text-4xl font-bold mb-1.5 tracking-tight text-[#0f2742] leading-none">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-[#0f2742] flex items-center justify-center flex-shrink-0 ml-3 shadow-md" style={{ height: 52, width: 52 }}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

const SmallStat = ({ label, value }) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 hover:bg-[#fffaf0] border border-transparent hover:border-[#ead8a8]/40 transition-all duration-150">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-sm font-bold text-[#172033]">{value}</div>
  </div>
);

const ChartCanvas = ({ draw }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    if (draw && typeof draw === 'function') {
      chartRef.current = draw(ctx, Chart);
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [draw]);

  return <canvas ref={canvasRef} />;
};

const RestaurantAnalytics = () => {
  const cachedAnalytics = readViewCache('analytics-page', {
    fallback: { bookings: [], orders: [], rooms: [], payments: [] },
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const [bookings, setBookings] = useState(cachedAnalytics.bookings || []);
  const [orders, setOrders] = useState(cachedAnalytics.orders || []);
  const [rooms, setRooms] = useState(cachedAnalytics.rooms || []);
  const [payments, setPayments] = useState(cachedAnalytics.payments || []);

  const [loading, setLoading] = useState(
    () =>
      (cachedAnalytics.bookings || []).length === 0 &&
      (cachedAnalytics.orders || []).length === 0 &&
      (cachedAnalytics.rooms || []).length === 0 &&
      (cachedAnalytics.payments || []).length === 0
  );
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAll = async ({ background = false } = {}) => {
    if (!background) setLoading(true);
    try {
      const [bR, oR, rR, pR] = await Promise.all([
        axios.get(`${API_BASE_URL}/bookings`, {
          params: { limit: 500, fields: 'id,status,createdAt,checkInDate,checkOutDate,roomId,totalAmount' },
        }),
        axios.get(`${API_BASE_URL}/orders`, {
          params: { limit: 500, fields: 'id,status,total,amount,createdAt,items.name,items.quantity' },
        }),
        axios.get(`${API_BASE_URL}/rooms`, {
          params: { limit: 500, fields: 'id,roomNumber,status,occupancyStatus,type' },
        }),
        axios.get(`${API_BASE_URL}/billing/payments`, {
          params: { limit: 500, fields: 'id,reservationId,amount,total,status,method,type,date,createdAt' },
        }),
      ]);

      const normalize = (d) => (Array.isArray(d) ? d : (d?.items && Array.isArray(d.items) ? d.items : []));

      const nextBookings = normalize(bR.data);
      const nextOrders = normalize(oR.data);
      const nextRooms = normalize(rR.data);
      const nextPayments = normalize(pR.data);

      setBookings(nextBookings);
      setOrders(nextOrders);
      setRooms(nextRooms);
      setPayments(nextPayments);
      writeViewCache('analytics-page', {
        bookings: nextBookings,
        orders: nextOrders,
        rooms: nextRooms,
        payments: nextPayments,
      });
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Analytics fetch error', err);
      setError(err?.message || 'Failed to load analytics');
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    await fetchAll({ background: true });
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    // Try server-side export endpoint first
    try {
      const serverUrl = `${API_BASE_URL}/exports/analytics?format=csv`;
      const res = await fetch(serverUrl, { method: 'GET' });
      if (res.ok) {
        const blob = await res.blob();
        const contentType = res.headers.get('content-type') || '';
        const filename = `analytics-export-${ts}.csv`;
        downloadFile(blob, filename);
        setToast('Export ready — downloaded CSV');
        setExporting(false);
        setTimeout(() => setToast(null), 3500);
        return;
      }
      // fallthrough to client-side CSV if server returns non-OK
    } catch (err) {
      console.warn('Server export not available, falling back to client CSV', err);
    }

    try {
      const lines = [];
      lines.push('metric,value');
      lines.push(`totalRooms,${totalRooms}`);
      lines.push(`occupiedRooms,${occupiedRooms}`);
      lines.push(`occupancyRate,${occupancyRate}`);
      lines.push(`revenueFromPayments,${revenueFromPayments}`);
      lines.push(`revenueFromOrders,${revenueFromOrders}`);
      lines.push(`totalRevenue,${totalRevenue}`);
      lines.push('');
      lines.push('Top F&B Items');
      lines.push('name,qty');
      if (topItems && topItems.length) {
        topItems.forEach(t => {
          const name = (t.name || '').replace(/"/g, '""');
          lines.push(`"${name}",${t.qty}`);
        });
      } else {
        lines.push('No items,0');
      }

      const csvBlob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const filename = `analytics-export-${ts}.csv`;
      downloadFile(csvBlob, filename);
      setToast('Export complete — downloaded CSV');
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Client CSV export failed', err);
      setError('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // KPI calculations
  const totalRooms = rooms.length || 0;
  const occupiedRooms = bookings.filter((b) => b.status === 'checked-in' || b.status === 'confirmed').length;
  const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const revenueFromPayments = payments.reduce((s, p) => s + safeNumber(p.amount || p.total || 0), 0);
  const revenueFromOrders = orders.reduce((s, o) => s + safeNumber(o.total ?? o.amount ?? 0), 0); // F&B orders revenue
  const totalRevenue = revenueFromPayments + revenueFromOrders; // combined collected payments + orders (reported)

  // Bookings over time (last 30 days)
  const bookingsByDate = (() => {
    const map = {};
    const days = 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map[key] = 0;
    }
    bookings.forEach((b) => {
      const dateField = b.createdAt || b.checkInDate || b.createdAt || b.date;
      if (!dateField) return;
      const key = new Date(dateField).toISOString().split('T')[0];
      if (key in map) map[key] += 1;
    });
    const keys = Object.keys(map);
    const shortLabels = keys.map((k) => k.slice(5));
    return {
      labels: shortLabels,
      data: Object.values(map),
    };
  })();

  const topItems = (() => {
    const count = {};
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          const name = it.name || it.item || 'Unknown';
          const qty = it.quantity || it.qty || 1;
          count[name] = (count[name] || 0) + qty;
        });
      }
    });
    const arr = Object.entries(count).map(([name, qty]) => ({ name, qty }));
    arr.sort((a, b) => b.qty - a.qty);
    return arr.slice(0, 6);
  })();

  // Orders by status for pie chart
  const ordersStatus = (() => {
    const byStatus = {};
    orders.forEach((o) => {
      const s = o.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    return {
      labels: Object.keys(byStatus),
      data: Object.values(byStatus),
    };
  })();

  // Revenue split
  const revenueSplit = (() => {
    const paymentsTotal = revenueFromPayments;
    const fbRev = revenueFromOrders;
    return {
      labels: ['Payments (collected)', 'F&B (orders, reported)'],
      data: [paymentsTotal, fbRev],
    };
  })();

  const drawBookingsLine = (ctx) => {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: bookingsByDate.labels,
        datasets: [
          {
            label: 'Bookings',
            data: bookingsByDate.data,
            borderColor: '#0f2742',
            backgroundColor: 'rgba(201,162,74,0.12)',
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#c9a24a',
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  const drawTopItemsBar = (ctx) => {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topItems.map((t) => t.name),
        datasets: [
          {
            label: 'Qty sold',
            data: topItems.map((t) => t.qty),
            backgroundColor: topItems.map((_, i) => ['#f97316', '#fb7185', '#60a5fa', '#34d399', '#a78bfa', '#f59e0b'][i % 6]),
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } },
    });
  };

  const drawOrdersPie = (ctx) => {
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ordersStatus.labels,
        datasets: [
          {
            data: ordersStatus.data,
            backgroundColor: ['#60a5fa', '#34d399', '#f97316', '#fb7185', '#a78bfa'],
          },
        ],
      },
      options: { responsive: true },
    });
  };

  const drawRevenueDonut = (ctx) => {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: revenueSplit.labels,
        datasets: [
          {
            data: revenueSplit.data,
            backgroundColor: ['#0f2742', '#c9a24a'],
            borderWidth: 0,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  };

  return (
    <div className="hotel-page">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className="bg-[#0f2742] shadow-sm border-b border-[#c9a24a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-white/10 p-3 rounded-lg shadow-lg">
                  <BarChart3 className="h-7 w-7 text-[#c9a24a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#c9a24a] font-medium">Business Intelligence</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Analytics & Reports</h1>
                  <p className="text-sm text-white/60">Insights for rooms, reservations, restaurant and billing.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="hotel-button-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
                <button
                  onClick={handleRefresh}
                  className="hotel-button-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  Refresh
                </button>
                {lastUpdated && (
                  <span className="text-xs text-white/40 hidden md:block">
                    {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {toast && (
            <div className="fixed right-6 top-20 z-50">
              <div className="bg-black text-white text-sm px-4 py-2 rounded-lg shadow">{toast}</div>
            </div>
          )}
          {loading && bookings.length === 0 && orders.length === 0 && rooms.length === 0 && payments.length === 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="h-28 rounded-3xl bg-white border border-gray-100 shadow-sm" />
                <div className="h-28 rounded-3xl bg-white border border-gray-100 shadow-sm" />
                <div className="h-28 rounded-3xl bg-white border border-gray-100 shadow-sm" />
                <div className="h-28 rounded-3xl bg-white border border-gray-100 shadow-sm" />
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                <div className="h-96 rounded-3xl bg-white border border-gray-100 shadow-sm lg:col-span-3" />
                <div className="h-96 rounded-3xl bg-white border border-gray-100 shadow-sm" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI title="Occupancy" value={`${occupiedRooms}/${totalRooms}`} subtitle={`${occupancyRate}%`} icon={Bed} />
                <KPI title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} subtitle={`Collected: $${revenueFromPayments.toFixed(2)} · Orders: $${revenueFromOrders.toFixed(2)}`} icon={DollarSign} />
                <KPI title="F&B Revenue" value={`$${revenueFromOrders.toFixed(2)}`} subtitle={`${orders.length} orders`} icon={Utensils} />
                <KPI title="Bookings (30d)" value={bookingsByDate.data.reduce((s, v) => s + v, 0)} subtitle={`${bookings.length} total`} icon={Calendar} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="hotel-card p-6 lg:col-span-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Bookings (last 30 days)</h3>
                    <button className="text-sm text-gray-500">View</button>
                  </div>
                  <div className="h-72">
                    <ChartCanvas draw={(ctx) => drawBookingsLine(ctx)} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <SmallStat label="Confirmed" value={bookings.filter(b=>b.status==='confirmed').length} />
                    <SmallStat label="Checked-in" value={bookings.filter(b=>b.status==='checked-in').length} />
                    <SmallStat label="Cancelled" value={bookings.filter(b=>b.status==='cancelled').length} />
                    <SmallStat label="No-show" value={bookings.filter(b=>b.status==='no-show').length} />
                  </div>
                </div>
                <div className="hotel-card p-6 lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Revenue Split</h3>
                    <button className="text-sm text-gray-500">Month</button>
                  </div>
                  <div className="h-56 flex items-center justify-center"><div className="w-40 h-40"><ChartCanvas draw={(ctx)=>drawRevenueDonut(ctx)} /></div></div>
                  <div className="mt-4 space-y-2">
                    <SmallStat label="Collected (payments)" value={`$${revenueFromPayments.toFixed(2)}`} />
                    <SmallStat label="F&B Orders" value={`$${revenueFromOrders.toFixed(2)}`} />
                    <SmallStat label="Total" value={`$${totalRevenue.toFixed(2)}`} />
                  </div>
                </div>
                 <div className="hotel-card p-6 lg:col-span-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Top F&B Items</h3>
                    <button className="text-sm text-gray-500">Export</button>
                  </div>
                  <div className="h-56">
                    <ChartCanvas draw={(ctx) => drawTopItemsBar(ctx)} />
                  </div>
                  <div className="mt-4">
                    {topItems.map((t) => (
                      <div key={t.name} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="text-sm text-gray-700">{t.name}</div>
                        <div className="font-semibold">{t.qty}</div>
                      </div>
                    ))}
                    {topItems.length===0 && <div className="text-sm text-gray-500 py-2">No order items yet</div>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalytics;
