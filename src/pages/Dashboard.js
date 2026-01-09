import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaDollarSign, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaRegBell,
  FaComments,
  FaHeart,
  FaUserPlus,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFileAlt,
  FaBullhorn,
  FaImage,
  FaVideo,
  FaBell,
  FaChartBar,
  FaThumbsUp,
  FaCommentDots,
  FaNewspaper,
  FaCrown,
  FaMedal,
  FaAward,
  FaStar,
  FaFire,
  FaTrophy
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = ({ darkMode }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [postViewType, setPostViewType] = useState('byLikes'); // 'byLikes' or 'byComments'
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('https://apisocial.atozkeysolution.com/api/admin/dashboard?isAdmin=true');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getPostBadge = (index) => {
    const badges = [
      { icon: <FaCrown className="text-yellow-500" />, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
      { icon: <FaMedal className="text-gray-400" />, color: 'bg-gradient-to-r from-gray-400 to-gray-500' },
      { icon: <FaMedal className="text-amber-700" />, color: 'bg-gradient-to-r from-amber-700 to-amber-800' },
      { icon: <FaAward className="text-blue-500" />, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
      { icon: <FaStar className="text-green-500" />, color: 'bg-gradient-to-r from-green-500 to-green-600' },
      { icon: <FaStar className="text-purple-500" />, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
      { icon: <FaStar className="text-pink-500" />, color: 'bg-gradient-to-r from-pink-500 to-pink-600' },
      { icon: <FaFire className="text-orange-500" />, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
      { icon: <FaFire className="text-red-500" />, color: 'bg-gradient-to-r from-red-500 to-red-600' },
      { icon: <FaTrophy className="text-indigo-500" />, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' }
    ];
    
    return badges[index] || badges[9];
  };

  const getTopPosts = () => {
    if (!dashboardData) return [];
    
    if (postViewType === 'byLikes') {
      return dashboardData.topPosts.byLikes.slice(0, 10);
    } else {
      return dashboardData.topPosts.byComments.slice(0, 10);
    }
  };

  const chartData = [
    { name: 'Jan', users: 5, posts: 15 },
    { name: 'Feb', users: 8, posts: 22 },
    { name: 'Mar', users: 12, posts: 30 },
    { name: 'Apr', users: 18, posts: 45 },
    { name: 'May', users: 25, posts: 60 },
    { name: 'Jun', users: 38, posts: 100 },
  ];

  const postEngagementData = [
    { name: 'Likes', value: dashboardData?.posts.totalLikes || 67 },
    { name: 'Comments', value: dashboardData?.posts.totalComments || 115 },
    { name: 'Avg/Post', value: 1.82 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Failed to load dashboard data</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.users.total.toString(),
      change: '+32%',
      trend: 'up',
      icon: <FaUsers className="text-3xl text-blue-500" />,
      color: 'blue',
      subtitle: `${dashboardData.users.active} active, ${dashboardData.users.inactive} inactive`
    },
    {
      title: 'Total Posts',
      value: dashboardData.posts.total.toString(),
      change: '+45%',
      trend: 'up',
      icon: <FaFileAlt className="text-3xl text-green-500" />,
      color: 'green',
      subtitle: `${dashboardData.posts.totalLikes} likes, ${dashboardData.posts.totalComments} comments`
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardData.revenue.total.toLocaleString()}`,
      change: '+18.5%',
      trend: 'up',
      icon: <FaDollarSign className="text-3xl text-purple-500" />,
      color: 'purple',
      subtitle: `Currency: ${dashboardData.revenue.currency}`
    },
    {
      title: 'Campaigns',
      value: dashboardData.campaigns.total.toString(),
      change: dashboardData.campaigns.pendingApprovals > 0 ? `+${dashboardData.campaigns.pendingApprovals} pending` : 'No pending',
      trend: dashboardData.campaigns.pendingApprovals > 0 ? 'up' : 'stable',
      icon: <FaBullhorn className="text-3xl text-orange-500" />,
      color: 'orange',
      subtitle: `${dashboardData.campaigns.pendingApprovals} pending`
    }
  ];

  const topPosts = getTopPosts();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard Overview
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time insights and analytics for your social platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaRegBell className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            {dashboardData.notifications.unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {dashboardData.notifications.unread}
              </span>
            )}
          </div>
          {/* <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              ${darkMode 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-800 border-gray-300'
              }
              border focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select> */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl
              ${darkMode ? 'bg-gray-800' : 'bg-white'}
              border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-2xl md:text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center mt-6">
              <span className={`flex items-center ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-yellow-500'}`}>
                {stat.trend === 'up' ? <FaArrowUp /> : stat.trend === 'down' ? <FaArrowDown /> : <span className="w-4 h-4">•</span>}
                <span className="ml-1 font-medium">{stat.change}</span>
              </span>
              <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                from last period
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className={`
          rounded-2xl p-6 shadow-lg
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Platform Growth
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`
                px-3 py-1 rounded-lg text-sm
                ${darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-50 text-gray-800 border-gray-200'
                }
                border focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    borderColor: darkMode ? '#374151' : '#e5e7eb',
                    color: darkMode ? 'white' : 'black'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Post Engagement */}
        <div className={`
          rounded-2xl p-6 shadow-lg
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Post Engagement
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={postEngagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {postEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Count']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    borderColor: darkMode ? '#374151' : '#e5e7eb',
                    color: darkMode ? 'white' : 'black'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <FaHeart className="text-red-500 mr-2" />
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.posts.avgLikesPerPost}
                </span>
              </div>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Likes/Post</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <FaComments className="text-blue-500 mr-2" />
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.posts.avgCommentsPerPost}
                </span>
              </div>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Comments/Post</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <FaChartLine className="text-green-500 mr-2" />
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  1.82
                </span>
              </div>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Engagement Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className={`
          rounded-2xl p-6 shadow-lg
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Users
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                New user registrations
              </p>
            </div>
            <FaUserPlus className={`text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentActivity.users.slice(0, 5).map((user) => (
              <div 
                key={user._id}
                className={`p-4 rounded-xl transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-700 border-gray-700' 
                    : 'hover:bg-gray-50 border-gray-200'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.fullName}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FaCalendarAlt className="inline mr-1" />
                      {formatDate(user.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeAgo(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Approvals */}
        <div className={`
          rounded-2xl p-6 shadow-lg
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Campaign Approvals
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dashboardData.campaigns.pendingApprovals} pending approvals
              </p>
            </div>
            <FaBullhorn className={`text-xl ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentActivity.campaigns.map((campaign) => (
              <div 
                key={campaign._id}
                className={`p-4 rounded-xl transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-700 border-gray-700' 
                    : 'hover:bg-gray-50 border-gray-200'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {campaign.userId.fullName.charAt(0)}
                      </div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {campaign.fullName}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.adminApprovalStatus)}`}>
                        {campaign.adminApprovalStatus}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Submitted by: {campaign.userId.fullName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getTimeAgo(campaign.createdAt)}
                    </p>
                    {campaign.adminApprovalStatus === 'pending' && (
                      <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Posts Section */}
      <div className={`
        rounded-2xl p-6 shadow-lg
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Top Performing Posts
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing top 10 posts {postViewType === 'byLikes' ? 'by likes' : 'by comments'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPostViewType('byLikes')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                postViewType === 'byLikes' 
                  ? darkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaHeart className={postViewType === 'byLikes' ? 'text-red-300' : 'text-red-500'} />
              By Likes
            </button>
            <button 
              onClick={() => setPostViewType('byComments')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                postViewType === 'byComments' 
                  ? darkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaComments className={postViewType === 'byComments' ? 'text-blue-300' : 'text-blue-500'} />
              By Comments
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topPosts.map((post, index) => {
            const badge = getPostBadge(index);
            const isTopThree = index < 3;
            
            return (
              <div 
                key={post.postId}
                className={`
                  rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] relative
                  ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}
                  border ${darkMode ? 'border-gray-600' : 'border-gray-200'}
                `}
              >
                {/* Rank Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className={`${badge.color} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold`}>
                    <span className="text-sm">{index + 1}</span>
                  </div>
                </div>
                
                {/* Top 3 Badge */}
                {isTopThree && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="text-white">
                      {badge.icon}
                    </div>
                  </div>
                )}
                
                {/* Post Image */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={post.media} 
                    alt={post.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Post+Image';
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    {post.media.includes('video') ? (
                      <FaVideo className="text-xs" />
                    ) : (
                      <FaImage className="text-xs" />
                    )}
                  </div>
                  
                </div>
                
                {/* Post Content */}
                <div className="p-4">
                  <p className={`text-xs mb-2 line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getTimeAgo(post.createdAt)}
                  </p>
                  <p className={`line-clamp-2 mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                    {post.description || 'No description'}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <FaHeart className={`text-sm ${index < 3 ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {post.likes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaComments className={`text-sm ${index < 3 ? 'text-blue-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {post.comments}
                        </span>
                      </div>
                    </div>
                    
                    {/* Engagement Score */}
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      index < 3 
                        ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                        : darkMode 
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                    }`}>
                      {postViewType === 'byLikes' ? post.likes : post.comments}
                    </div>
                  </div>
                  
                  {/* Rank Indicator */}
                  <div className="mt-3 pt-3 border-t border-gray-700 border-opacity-50">
                    <div className={`text-xs text-center font-medium px-2 py-1 rounded-full ${
                      index === 0 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : index === 1
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        : index === 2
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {index === 0 ? '🏆 Top Performer' : 
                       index === 1 ? '🥈 Runner Up' : 
                       index === 2 ? '🥉 Third Place' : 
                       `Rank #${index + 1}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* View More Button */}
        <div className="mt-6 text-center">
          <button className={`
            px-6 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto
            ${darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          `}
          onClick={() => navigate(`/admin/posts`)}
          >
            View All Posts
            <FaArrowUp className="transform rotate-90" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`
        rounded-2xl p-6 shadow-lg
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Platform Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {dashboardData.users.active}/{dashboardData.users.total}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Active Users
            </p>
          </div>
          <div className="text-center p-4">
            <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {dashboardData.posts.avgLikesPerPost}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Likes per Post
            </p>
          </div>
          <div className="text-center p-4">
            <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {dashboardData.campaigns.pendingApprovals}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Pending Approvals
            </p>
          </div>
          <div className="text-center p-4">
            <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {dashboardData.notifications.unread}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Unread Notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;