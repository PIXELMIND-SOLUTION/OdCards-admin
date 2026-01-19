// src/components/admin/UserProducts.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSort,
  FaUser,
  FaBox,
  FaRupeeSign,
  FaCalendar,
  FaFilePdf,
  FaFileExcel,
  FaPrint,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaTags,
  FaCog,
  FaPalette,
  FaRuler,
  FaLayerGroup,
  FaFileAlt,
  FaShoppingBag,
  FaSun,
  FaMoon,
  FaFileUpload
} from 'react-icons/fa';
import {
  MdCategory,
  MdLocalOffer,
  MdSettings,
  MdExpandMore,
  MdRefresh
} from 'react-icons/md';

// API endpoints
const API_BASE_URL = 'http://31.97.206.144:9124/api';
const USER_CARDS_API = `${API_BASE_URL}/user-cards`;
const SINGLE_CARD_API = (id) => `${API_BASE_URL}/user/card/${id}`;

const UserProducts = ({darkMode}) => {
  
  // Main state
  const [userCards, setUserCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Sort state
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Users and products for filters
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch all user cards
  const fetchUserCards = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(USER_CARDS_API);
      if (response.data.success) {
        setUserCards(response.data.data || []);
        setFilteredCards(response.data.data || []);
        setTotalItems(response.data.count || response.data.data?.length || 0);
        
        // Extract unique users and products for filters
        const uniqueUsers = [];
        const uniqueProducts = [];
        const userMap = new Map();
        const productMap = new Map();
        
        response.data.data.forEach(card => {
          // Extract users
          if (card.userId && card.userId._id) {
            if (!userMap.has(card.userId._id)) {
              userMap.set(card.userId._id, true);
              uniqueUsers.push({
                id: card.userId._id,
                name: card.userId.name,
                email: card.userId.email
              });
            }
          }
          
          // Extract products
          if (card.ProductId && card.ProductId._id) {
            if (!productMap.has(card.ProductId._id)) {
              productMap.set(card.ProductId._id, true);
              uniqueProducts.push({
                id: card.ProductId._id,
                name: card.ProductId.productName?.values || 'Unnamed Product',
                category: card.ProductId.category?.values || 'Uncategorized'
              });
            }
          }
        });
        
        setUsers(uniqueUsers);
        setProducts(uniqueProducts);
      }
    } catch (err) {
      setError('Failed to fetch user cards');
      console.error('Error fetching user cards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single card details
  const fetchCardDetails = async (cardId) => {
    setLoading(true);
    try {
      const response = await axios.get(SINGLE_CARD_API(cardId));
      if (response.data.success) {
        setSelectedCard(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (err) {
      setError('Failed to fetch card details');
      console.error('Error fetching card details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...userCards];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        (card.userId?.name?.toLowerCase().includes(term)) ||
        (card.userId?.email?.toLowerCase().includes(term)) ||
        (card.ProductId?.productName?.values?.toLowerCase().includes(term)) ||
        (card.ProductId?.category?.values?.toLowerCase().includes(term)) ||
        (card._id?.toLowerCase().includes(term))
      );
    }
    
    // Apply user filter
    if (filterUser) {
      filtered = filtered.filter(card => card.userId?._id === filterUser);
    }
    
    // Apply product filter
    if (filterProduct) {
      filtered = filtered.filter(card => card.ProductId?._id === filterProduct);
    }
    
    // Apply price filters
    if (minPrice) {
      filtered = filtered.filter(card => card.totalPrice >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(card => card.totalPrice <= parseFloat(maxPrice));
    }
    
    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(card => new Date(card.createdAt) >= startDate);
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(card => new Date(card.createdAt) <= endDate);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'totalPrice':
          aValue = a.totalPrice || 0;
          bValue = b.totalPrice || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'user':
          aValue = a.userId?.name || '';
          bValue = b.userId?.name || '';
          break;
        case 'product':
          aValue = a.ProductId?.productName?.values || '';
          bValue = b.ProductId?.productName?.values || '';
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredCards(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterUser('');
    setFilterProduct('');
    setDateRange({ start: '', end: '' });
    setMinPrice('');
    setMaxPrice('');
    setFilteredCards(userCards);
    setTotalItems(userCards.length);
    setCurrentPage(1);
  };

  // Pagination calculations
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCards.slice(startIndex, endIndex);
  }, [filteredCards, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Order ID',
      'User Name',
      'User Email',
      'Product Name',
      'Category',
      'Quantity',
      'Total Price (₹)',
      'Created Date',
      'Printing Type',
      'Lamination Type',
      'Features'
    ];
    
    const csvData = filteredCards.map(card => [
      card._id,
      card.userId?.name || 'N/A',
      card.userId?.email || 'N/A',
      card.ProductId?.productName?.values || 'Custom Card',
      card.ProductId?.category?.values || 'N/A',
      card.selectedOptions?.quantity || 'N/A',
      card.totalPrice || 0,
      new Date(card.createdAt).toLocaleDateString(),
      card.selectedOptions?.printingType?.label || 'N/A',
      card.selectedOptions?.laminationType?.label || 'N/A',
      Object.keys(card.selectedOptions?.features || {}).filter(key => 
        card.selectedOptions.features[key]?.label
      ).map(key => card.selectedOptions.features[key].label).join(', ') || 'None'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-cards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF generation (in a real app, you might use jsPDF or similar)
    const printContent = document.getElementById('user-cards-table');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      const printArea = printContent.outerHTML;
      document.body.innerHTML = printArea;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        // Assuming DELETE endpoint exists
        await axios.delete(`${API_BASE_URL}/user/card/delete/${cardId}`);
        setSuccess('Order deleted successfully');
        fetchUserCards();
      } catch (err) {
        setError('Failed to delete order');
      }
    }
  };

  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = filteredCards.length;
    const totalRevenue = filteredCards.reduce((sum, card) => sum + (card.totalPrice || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const userCount = new Set(filteredCards.map(card => card.userId?._id)).size;
    const productCount = new Set(filteredCards.map(card => card.ProductId?._id)).size;
    
    const recentOrders = filteredCards
      .filter(card => {
        const orderDate = new Date(card.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }).length;
    
    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      userCount,
      productCount,
      recentOrders
    };
  }, [filteredCards]);

  // Initialize
  useEffect(() => {
    fetchUserCards();
  }, []);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterUser, filterProduct, minPrice, maxPrice, dateRange, sortField, sortDirection, userCards]);

  // Render selected options details
  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions) return null;
    
    const sections = [
      {
        title: 'Printing & Lamination',
        items: [
          { label: 'Printing Type', value: selectedOptions.printingType?.label },
          { label: 'Lamination Type', value: selectedOptions.laminationType?.label },
          { label: 'Quantity', value: selectedOptions.quantity }
        ]
      },
      {
        title: 'Size & Dimensions',
        items: [
          { label: 'Size', value: selectedOptions.size?.label },
          { label: 'Demo Size', value: selectedOptions.demmySize?.label },
          { label: 'Size Multiplier', value: selectedOptions.cardSizeMultiplier?.value }
        ]
      },
      {
        title: 'Materials',
        items: [
          { label: 'Board Type', value: selectedOptions.boardType?.label },
          { label: 'Board Thickness', value: selectedOptions.boardThickness?.label },
          { label: 'Paper Type', value: selectedOptions.paperType?.label },
          { label: 'GSM', value: selectedOptions.gsm?.label }
        ]
      },
      {
        title: 'Special Options',
        items: [
          { label: 'Special Options', value: selectedOptions.specialOptions?.label }
        ]
      }
    ];
    
    // Features section
    const features = selectedOptions.features ? Object.entries(selectedOptions.features)
      .filter(([_, value]) => value && value.label)
      .map(([key, value]) => ({ label: key.replace(/([A-Z])/g, ' $1'), value: value.label }))
      : [];
    
    if (features.length > 0) {
      sections.push({
        title: 'Features',
        items: features
      });
    }
    
    return (
      <div className="space-y-4">
        {sections.map((section, idx) => (
          section.items.some(item => item.value) && (
            <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">{section.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {section.items.map((item, itemIdx) => 
                  item.value && (
                    <div key={itemIdx} className="text-sm">
                      <span className="font-medium">{item.label}:</span>
                      <span className="ml-2">{item.value}</span>
                      {item.label === 'Quantity' && <span className="ml-1">pcs</span>}
                      {item.label === 'Size Multiplier' && <span className="ml-1">x</span>}
                    </div>
                  )
                )}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  // Render price details
  const renderPriceDetails = (selectedOptions, totalPrice) => {
    if (!selectedOptions) return null;
    
    const priceItems = [
      { label: 'Printing', price: selectedOptions.printingType?.price },
      { label: 'Lamination', price: selectedOptions.laminationType?.price },
      { label: 'Size', price: selectedOptions.size?.price },
      { label: 'Demo Size', price: selectedOptions.demmySize?.price },
      { label: 'Size Multiplier', price: selectedOptions.cardSizeMultiplier?.price },
      { label: 'Board Type', price: selectedOptions.boardType?.price },
      { label: 'Board Thickness', price: selectedOptions.boardThickness?.price },
      { label: 'Paper Type', price: selectedOptions.paperType?.price },
      { label: 'GSM', price: selectedOptions.gsm?.price },
      { label: 'Special Options', price: selectedOptions.specialOptions?.price }
    ];
    
    // Feature prices
    if (selectedOptions.features) {
      Object.entries(selectedOptions.features).forEach(([key, value]) => {
        if (value && value.price) {
          priceItems.push({
            label: key.replace(/([A-Z])/g, ' $1'),
            price: value.price
          });
        }
      });
    }
    
    const nonZeroItems = priceItems.filter(item => item.price > 0);
    const basePrice = nonZeroItems.reduce((sum, item) => sum + item.price, 0);
    const quantity = selectedOptions.quantity || 1;
    const calculatedTotal = basePrice * quantity;
    
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400">Price Breakdown</h4>
        <div className="space-y-2">
          {nonZeroItems.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">₹{item.price}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span>Base Price (per unit)</span>
              <span>₹{basePrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span>{quantity} pcs</span>
            </div>
            <div className="flex justify-between font-medium text-lg mt-2">
              <span>Calculated Total</span>
              <span>₹{calculatedTotal}</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t">
              <span>Order Total</span>
              <span className="text-green-600 dark:text-green-400">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaShoppingBag className="text-4xl text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">User Submitted Orders</h1>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage and review visiting card orders submitted by users
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchUserCards}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <FaSync />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-blue-800' : 'bg-blue-600'} text-white`}>
            <div className="text-sm opacity-90">Total Orders</div>
            <div className="text-3xl font-bold mt-2">{stats.totalOrders}</div>
            <div className="text-sm opacity-90 mt-2">₹{stats.totalRevenue.toLocaleString()} revenue</div>
          </div>
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-green-800' : 'bg-green-600'} text-white`}>
            <div className="text-sm opacity-90">Active Users</div>
            <div className="text-3xl font-bold mt-2">{stats.userCount}</div>
            <div className="text-sm opacity-90 mt-2">₹{stats.avgOrderValue.toFixed(0)} avg order</div>
          </div>
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-purple-800' : 'bg-purple-600'} text-white`}>
            <div className="text-sm opacity-90">Products Ordered</div>
            <div className="text-3xl font-bold mt-2">{stats.productCount}</div>
            <div className="text-sm opacity-90 mt-2">{products.length} unique products</div>
          </div>
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-yellow-800' : 'bg-yellow-600'} text-white`}>
            <div className="text-sm opacity-90">Recent Orders (30d)</div>
            <div className="text-3xl font-bold mt-2">{stats.recentOrders}</div>
            <div className="text-sm opacity-90 mt-2">Last updated: Just now</div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                ×
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                className={`pl-10 pr-4 py-2 w-full rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                placeholder="Search orders by user, product, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <FaFilter />
                Filters
              </button>
              <button
                onClick={exportToCSV}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-green-800 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                <FaFileExcel />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              >
                <FaFilePdf />
                Export PDF
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* User Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Filter by User</label>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">All Users</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Filter by Product</label>
                  <select
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                    className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">All Products</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className={`w-1/2 px-3 py-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className={`w-1/2 px-3 py-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className={`w-1/2 px-3 py-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className={`w-1/2 px-3 py-2 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={resetFilters}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Reset Filters
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredCards.length} of {userCards.length} orders
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Table */}
        <div className={`rounded-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {loading ? (
            <div className="flex justify-center items-center min-h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table id="user-cards-table" className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <button 
                          onClick={() => toggleSort('user')}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          User <FaSort />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <button 
                          onClick={() => toggleSort('product')}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Product <FaSort />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Options
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <button 
                          onClick={() => toggleSort('totalPrice')}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Price <FaSort />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <button 
                          onClick={() => toggleSort('createdAt')}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Date <FaSort />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedCards.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            <FaBox className="mx-auto h-12 w-12 mb-3 opacity-50" />
                            <p className="text-lg">No orders found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedCards.map((card) => (
                        <tr key={card._id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                                <FaUser className={darkMode ? 'text-blue-300' : 'text-blue-600'} />
                              </div>
                              <div>
                                <div className="font-medium">{card.userId?.name || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {card.userId?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {card.ProductId?.images?.values?.[0] && (
                                <img
                                  src={card.ProductId.images.values[0]}
                                  alt="Product"
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium">
                                  {card.ProductId?.productName?.values || 'Custom Card'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {card.ProductId?.category?.values || 'Uncategorized'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FaPrint className="text-gray-400" />
                                <span className="text-sm">{card.selectedOptions?.printingType?.label || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaLayerGroup className="text-gray-400" />
                                <span className="text-sm">{card.selectedOptions?.laminationType?.label || 'N/A'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Qty:</span> {card.selectedOptions?.quantity || 'N/A'} pcs
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-lg">₹{card.totalPrice || 0}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {card.selectedOptions?.quantity || 1} × ₹{Math.round((card.totalPrice || 0) / (card.selectedOptions?.quantity || 1))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {new Date(card.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(card.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => fetchCardDetails(card._id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleDeleteCard(card._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
                    </div>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className={`px-3 py-1 border rounded text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      <FaArrowLeft />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded ${currentPage === pageNum ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Header */}
              <div className={`px-6 py-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-600'} text-white`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaShoppingBag />
                    <h3 className="text-lg font-semibold">Order Details</h3>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`max-h-[80vh] overflow-y-auto p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Order Summary */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-4">Order Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Order ID</div>
                          <div className="font-medium">{selectedCard._id}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                          <div className="font-medium">
                            {new Date(selectedCard.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">User</div>
                          <div className="font-medium">{selectedCard.userId?.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedCard.userId?.email}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total Price</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ₹{selectedCard.totalPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="md:w-1/3">
                      <h4 className="text-xl font-bold mb-4">Product Information</h4>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="font-medium mb-2">
                          {selectedCard.ProductId?.productName?.values || 'Custom Card'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          {selectedCard.ProductId?.category?.values || 'Uncategorized'} • 
                          {selectedCard.ProductId?.subCategory?.values ? ` • ${selectedCard.ProductId.subCategory.values}` : ''}
                        </div>
                        {selectedCard.ProductId?.images?.values?.[0] && (
                          <img
                            src={selectedCard.ProductId.images.values[0]}
                            alt="Product"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Options */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold mb-4">Selected Options</h4>
                  {renderSelectedOptions(selectedCard.selectedOptions)}
                </div>

                {/* Price Breakdown */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold mb-4">Price Breakdown</h4>
                  {renderPriceDetails(selectedCard.selectedOptions, selectedCard.totalPrice)}
                </div>

                {/* User Images */}
                {selectedCard.images && selectedCard.images.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold mb-4">User Uploaded Images</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedCard.images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`User upload ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                            Upload {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Configuration (from detailed API) */}
                {selectedCard.ProductId?.printingType && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold mb-4">Product Configuration</h4>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Available Options */}
                        <div>
                          <h5 className="font-medium mb-3">Available Printing Types</h5>
                          <div className="space-y-2">
                            {selectedCard.ProductId.printingType.options?.map((option, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{option.label}</span>
                                <span className="font-medium">₹{option.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Available Quantities */}
                        <div>
                          <h5 className="font-medium mb-3">Available Quantities</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedCard.ProductId.quantity?.values?.map((qty, idx) => (
                              <span key={idx} className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {qty} pcs
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => exportToPDF()}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    <FaPrint />
                    Print Summary
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProducts;