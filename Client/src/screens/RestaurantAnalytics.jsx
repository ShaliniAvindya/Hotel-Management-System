import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, RefreshCw, DollarSign, Users } from 'lucide-react';
import Sidebar from './Sidebar';
import Chart from 'chart.js/auto';
import { API_BASE_URL} from '../apiconfig';

const RestaurantAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    avgRevenuePerRoom: 0,
    diningDemand: 0,
    revenueByDate: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [bookingsRes, roomsRes, availabilityRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/bookings`),
          axios.get(`${API_BASE_URL}/rooms`),
          axios.get(`${API_BASE_URL}/roomAvailability`),
        ]);
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
        setRoomAvailability(availabilityRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const processAnalytics = () => {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const relevantBookings = bookings.filter((booking) => {
        const checkIn = new Date(booking.checkInDate);
        return checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear;
      });

      // Calculate total revenue from bookings
      const totalRevenue = relevantBookings.reduce((sum, booking) => sum + (booking.rate || 0), 0);

      // Calculate occupied rooms and average revenue per occupied room
      const occupiedRoomIds = roomAvailability
        .filter((avail) =>
          avail.availability.some(
            (entry) =>
              entry.status === 'occupied' &&
              new Date(entry.date).getMonth() === currentMonth &&
              new Date(entry.date).getFullYear() === currentYear
          )
        )
        .map((avail) => avail.roomId);
      const uniqueOccupiedRooms = [...new Set(occupiedRoomIds)];
      const avgRevenuePerRoom = uniqueOccupiedRooms.length
        ? (totalRevenue / uniqueOccupiedRooms.length).toFixed(2)
        : 0;

      const diningDemand = relevantBookings.filter((booking) =>
        ['checked-in', 'confirmed'].includes(booking.status)
      ).length;

      const revenueByDate = {};
      relevantBookings.forEach((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const date = new Date(currentYear, currentMonth, 1);
        while (date <= checkOut && date.getMonth() === currentMonth) {
          const dateKey = date.toISOString().split('T')[0];
          if (checkIn <= date && date <= checkOut) {
            revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + (booking.rate || 0);
          }
          date.setDate(date.getDate() + 1);
        }
      });

      setAnalyticsData({
        totalRevenue,
        avgRevenuePerRoom,
        diningDemand,
        revenueByDate,
      });
    };

    if (bookings.length && rooms.length && roomAvailability.length) {
      processAnalytics();
    }
  }, [bookings, rooms, roomAvailability, currentDate]);

  useEffect(() => {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx) {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const labels = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        return date.toLocaleDateString('en-US', { day: 'numeric' });
      });
      const data = labels.map((_, i) => {
        const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
          .toISOString()
          .split('T')[0];
        return analyticsData.revenueByDate[dateKey] || 0;
      });

      // Destroy previous chart instance if exists
      if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
      }

      window.revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Restaurant Revenue",
              data: data,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#3b82f6",
              pointBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: "#1f2937",
                font: {
                  size: 12
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Revenue ($)",
                color: "#1f2937",
                font: {
                  size: 12
                }
              },
              ticks: {
                color: "#1f2937"
              },
              grid: {
                color: "#e5e7eb"
              }
            },
            x: {
              title: {
                display: true,
                text: "Day of Month",
                color: "#1f2937",
                font: {
                  size: 12
                }
              },
              ticks: {
                color: "#1f2937"
              },
              grid: {
                color: "#e5e7eb"
              }
            }
          }
        }
      });
    }
  }, [analyticsData.revenueByDate, currentDate]);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const sidebarWidth = sidebarMinimized ? 'ml-16' : 'ml-64';
  const sidebarOffset = sidebarOpen ? sidebarWidth : 'ml-0';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <main className={`flex-1 ${sidebarOffset} transition-all duration-300 p-6`}>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant & Bar Analytics</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-lg font-semibold text-gray-800">{formatDate(currentDate)}</span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Today
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-800">
                  ${analyticsData.totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">For {formatDate(currentDate)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Avg. Revenue per Room</h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-800">
                  ${analyticsData.avgRevenuePerRoom}
                </p>
                <p className="text-sm text-gray-600">For occupied rooms</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Dining Demand</h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-800">{analyticsData.diningDemand}</p>
                <p className="text-sm text-gray-600">Bookings likely using restaurant</p>
              </div>
            </div>
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <canvas id="revenueChart" className="w-full h-64"></canvas>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantAnalytics;