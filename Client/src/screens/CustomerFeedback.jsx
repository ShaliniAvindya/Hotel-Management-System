import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  TrendingUp, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  MoreHorizontal,
  Send,
  Plus,
  Eye,
  Reply,
  Flag,
  Download,
  RefreshCw,
  Utensils,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Smile,
  Frown,
  Meh,
  ExternalLink,
  Menu
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const CustomerFeedback = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Sample feedback data
  const feedbackStats = {
    totalReviews: 1247,
    averageRating: 4.3,
    responseRate: 87,
    positiveReviews: 923,
    negativeReviews: 124,
    ratingDistribution: {
      5: 642,
      4: 281,
      3: 200,
      2: 89,
      1: 35
    }
  };

  const recentFeedback = [
    {
      id: 'FB001',
      customer: 'Sarah Johnson',
      rating: 5,
      date: '2025-07-13',
      time: '8:30 PM',
      table: 'T-12',
      order: '#2451',
      review: 'Absolutely fantastic experience! The pasta was perfectly cooked and the service was impeccable. Our server was attentive without being intrusive. Will definitely be back!',
      category: 'Food Quality',
      sentiment: 'positive',
      replied: false,
      verified: true,
      source: 'in-app'
    },
    {
      id: 'FB002',
      customer: 'Michael Chen',
      rating: 4,
      date: '2025-07-13',
      time: '7:15 PM',
      table: 'T-8',
      order: '#2448',
      review: 'Great food and ambiance. The only minor issue was the wait time for our appetizers, but the main course more than made up for it.',
      category: 'Service',
      sentiment: 'positive',
      replied: true,
      verified: true,
      source: 'google'
    },
    {
      id: 'FB003',
      customer: 'Emma Rodriguez',
      rating: 2,
      date: '2025-07-12',
      time: '6:45 PM',
      table: 'T-15',
      order: '#2445',
      review: 'Disappointing experience. The steak was overcooked and when we mentioned it to the server, they seemed disinterested. Expected better for the price point.',
      category: 'Food Quality',
      sentiment: 'negative',
      replied: false,
      verified: true,
      source: 'yelp'
    },
    {
      id: 'FB004',
      customer: 'David Wilson',
      rating: 5,
      date: '2025-07-12',
      time: '9:00 PM',
      table: 'T-20',
      order: '#2447',
      review: 'Outstanding service and delicious food! The wine selection was impressive and our server gave excellent recommendations.',
      category: 'Service',
      sentiment: 'positive',
      replied: true,
      verified: true,
      source: 'in-app'
    },
    {
      id: 'FB005',
      customer: 'Lisa Anderson',
      rating: 3,
      date: '2025-07-11',
      time: '7:30 PM',
      table: 'T-5',
      order: '#2439',
      review: 'Average experience. Food was decent but nothing special. The atmosphere was nice though.',
      category: 'Food Quality',
      sentiment: 'neutral',
      replied: false,
      verified: true,
      source: 'tripadvisor'
    }
  ];

  const categories = [
    { name: 'Food Quality', count: 485, trend: '+12%' },
    { name: 'Service', count: 392, trend: '+8%' },
    { name: 'Atmosphere', count: 287, trend: '+15%' },
    { name: 'Value', count: 183, trend: '-3%' },
    { name: 'Cleanliness', count: 98, trend: '+5%' }
  ];

  const sentimentData = [
    { label: 'Positive', value: 74, count: 923, color: 'bg-green-500' },
    { label: 'Neutral', value: 16, count: 200, color: 'bg-yellow-500' },
    { label: 'Negative', value: 10, count: 124, color: 'bg-red-500' }
  ];

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative': return <Frown className="h-4 w-4 text-red-500" />;
      default: return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'google': return '🔍';
      case 'yelp': return '🔴';
      case 'tripadvisor': return '🦉';
      case 'in-app': return '📱';
      default: return '💬';
    }
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  const submitReply = () => {
    console.log('Replying to:', selectedReview.id, 'with:', replyText);
    setShowReplyModal(false);
    setReplyText('');
    setSelectedReview(null);
  };

  const StarRating = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const filteredFeedback = recentFeedback.filter(feedback => {
    const matchesSearch = feedback.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.review.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = selectedRating === 'all' || feedback.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('CustomerFeedback rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50 p-6`}>
        {/* Header */}
        <div className="mb-8">
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
                <p className="text-gray-600 mt-1">Monitor and respond to customer reviews and feedback</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Review</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'reviews', label: 'Reviews', icon: MessageCircle },
                { id: 'analytics', label: 'Analytics', icon: PieChart },
                { id: 'settings', label: 'Settings', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.totalReviews}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+23 this week</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{feedbackStats.averageRating}</p>
                      <StarRating rating={Math.round(feedbackStats.averageRating)} />
                    </div>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+0.3 from last month</span>
                    </div>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.responseRate}%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+5% this week</span>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Reply className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Positive Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.positiveReviews}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">74% of total</span>
                    </div>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <ThumbsUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
                <div className="space-y-4">
                  {Object.entries(feedbackStats.ratingDistribution).reverse().map(([rating, count]) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 w-16">
                        <span className="text-sm font-medium text-gray-900">{rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / feedbackStats.totalReviews) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Analysis</h3>
                <div className="space-y-4">
                  {sentimentData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{item.count}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Feedback Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.trend}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{category.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>More Filters</span>
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {feedback.customer.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{feedback.customer}</h4>
                          <StarRating rating={feedback.rating} />
                          <span className="text-sm text-gray-500">{getSourceIcon(feedback.source)}</span>
                          {feedback.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{feedback.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{feedback.time}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{feedback.table}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>Order: {feedback.order}</span>
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{feedback.review}</p>
                        <div className="flex items-center space-x-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {feedback.category}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(feedback.sentiment)}
                            <span className="text-sm text-gray-600 capitalize">{feedback.sentiment}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReply(feedback)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          feedback.replied
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {feedback.replied ? 'Replied' : 'Reply'}
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600">Detailed analytics charts and insights coming soon...</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Settings</h3>
              <p className="text-gray-600">Configure feedback collection preferences and notification settings...</p>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Review</h3>
                {selectedReview && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{selectedReview.customer}</span>
                      <StarRating rating={selectedReview.rating} />
                    </div>
                    <p className="text-sm text-gray-600">{selectedReview.review}</p>
                  </div>
                )}
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => {
              console.log('Closing sidebar');
              setSidebarOpen(false);
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedback;