import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { API_BASE_URL } from '../apiconfig';
import {
  BarChart3,
  Utensils,
  DollarSign,
  Bed,
  Calendar,
  ChevronRight,
  Eye,
  Menu,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const KPI = ({ title, value, subtitle, color = 'blue' }) => (
  <div className={`group p-6 rounded-2xl relative overflow-hidden bg-${color}-50 border border-${color}-200 hover:shadow-md`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const SmallStat = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
    <div className="text-sm text-gray-700">{label}</div>
    <div className="font-semibold text-gray-900">{value}</div>
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bR, oR, rR, pR] = await Promise.all([
        axios.get(`${API_BASE_URL}/bookings`),
        axios.get(`${API_BASE_URL}/orders`),
        axios.get(`${API_BASE_URL}/rooms`),
        axios.get(`${API_BASE_URL}/billing/payments`),
      ]);

      setBookings(bR.data || []);
      setOrders(oR.data || []);
      setRooms(rR.data || []);
      setPayments(pR.data || []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Analytics fetch error', err);
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    await fetchAll();
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
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            borderWidth: 2,
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
            backgroundColor: ['#10b981', '#f97316'],
          },
        ],
      },
      options: { responsive: true },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'ml-16' : 'ml-64'}`}>
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange-500 to-orange-400 p-3 rounded-2xl shadow">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Analytics & Reports</h1>
                  <p className="text-sm text-gray-500">Insights for rooms, reservations, restaurant and billing</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleExport} className="p-2 rounded-xl hover:bg-gray-100" disabled={exporting}>{exporting ? 'Exporting...' : 'Export'}</button>
              <button onClick={handleRefresh} className="p-2 rounded-xl hover:bg-gray-100">Refresh</button>
              {lastUpdated && <div className="text-xs text-gray-500">Updated {new Date(lastUpdated).toLocaleTimeString()}</div>}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {toast && (
            <div className="fixed right-6 top-20 z-50">
              <div className="bg-black text-white text-sm px-4 py-2 rounded-lg shadow">{toast}</div>
            </div>
          )}
          {loading ? (
            <div className="text-center py-20">Loading analytics...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI title="Occupancy" value={`${occupiedRooms}/${totalRooms}`} subtitle={`${occupancyRate}%`} color="blue" />
                <KPI title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} subtitle={`Collected: $${revenueFromPayments.toLocaleString()} · Orders: $${revenueFromOrders.toLocaleString()}`} color="green" />
                <KPI title="F&B Revenue" value={`$${revenueFromOrders.toLocaleString()}`} subtitle={`${orders.length} orders`} color="orange" />
                <KPI title="Bookings (30d)" value={bookingsByDate.data.reduce((s, v) => s + v, 0)} subtitle={`${bookings.length} total`} color="red" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-3">
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
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Revenue Split</h3>
                    <button className="text-sm text-gray-500">Month</button>
                  </div>
                  <div className="h-56 flex items-center justify-center"><div className="w-40 h-40"><ChartCanvas draw={(ctx)=>drawRevenueDonut(ctx)} /></div></div>
                  <div className="mt-4 space-y-2">
                    <SmallStat label="Collected (payments)" value={`$${revenueFromPayments.toLocaleString()}`} />
                    <SmallStat label="F&B Orders" value={`$${revenueFromOrders.toLocaleString()}`} />
                    <SmallStat label="Total" value={`$${totalRevenue.toLocaleString()}`} />
                  </div>
                </div>
                 <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-4">
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