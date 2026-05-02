import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  FaTrash,
  FaEye,
  FaSearch,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUsers,
  FaFilter,
  FaSort,
  FaFileExport,
  FaTimes,
  FaAddressCard,
  FaIdCard,
  FaCalendar,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDoubleLeft,
  FaChevronDoubleRight,
  FaFileCsv,
  FaFilePdf,
  FaPrint,
  FaCog,
  FaSync,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserCheck,
  FaUserTimes,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdHome,
  MdDateRange,
  MdClear,
  MdRefresh
} from "react-icons/md";

const Customers = ({ darkMode }) => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    withAddresses: 0
  });

  // Search and Filter States
  const [searchField, setSearchField] = useState("name");
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Advanced Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [hasAddressFilter, setHasAddressFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  /* ================= FETCH USERS ================= */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://31.97.228.17:9124/api/users/getallusers"
      );
      const users = res.data.users || [];
      setCustomers(users);
      
      // Fetch addresses for all users to get stats
      const addressStats = await Promise.all(
        users.map(async (user) => {
          try {
            const addressRes = await axios.get(
              `http://31.97.228.17:9124/api/addresses/${user._id}`
            );
            return addressRes.data.length > 0;
          } catch {
            return false;
          }
        })
      );
      
      const withAddresses = addressStats.filter(Boolean).length;
      
      // Calculate stats
      const currentMonth = new Date().getMonth();
      const newThisMonth = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate.getMonth() === currentMonth;
      }).length;
      
      setStats({
        total: users.length,
        active: users.filter(u => u.status !== 'inactive').length,
        newThisMonth: newThisMonth,
        withAddresses: withAddresses
      });
      
      applyFilters(users);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch customers',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= FILTERING LOGIC ================= */
  const applyFilters = (data = customers) => {
    let result = [...data];
    
    // Apply text search filter
    if (searchText) {
      result = result.filter((u) =>
        (u[searchField] || "")
          .toString()
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(u => u.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter(u => new Date(u.createdAt) >= startDate);
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(u => new Date(u.createdAt) <= endDate);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      // Handle date comparison
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFiltered(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, searchField, statusFilter, dateRange, sortField, sortOrder, itemsPerPage]);

  /* ================= PAGINATION LOGIC ================= */
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /* ================= VIEW USER ================= */
  const viewUser = async (id) => {
    try {
      const userRes = await axios.get(
        `http://31.97.228.17:9124/api/users/user/${id}`
      );
      setSelectedUser(userRes.data.user);

      const addressRes = await axios.get(
        `http://31.97.228.17:9124/api/addresses/${id}`
      );
      setAddresses(addressRes.data || []);
      setShowModal(true);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load user details',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
      });
    }
  };

  /* ================= DELETE USER ================= */
  const deleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Customer?',
      html: `<p class="text-red-500">You are about to delete:</p>
             <p class="font-bold mt-2">${name}</p>
             <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#ffffff' : '#1f2937',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: darkMode ? '#4b5563' : '#9ca3af',
      reverseButtons: true,
      customClass: {
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
        cancelButton: 'px-4 py-2 rounded-lg font-medium'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `http://31.97.228.17:9124/api/users/deleteuser/${id}`
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Customer removed successfully',
        timer: 2000,
        showConfirmButton: false,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
      });
      
      fetchCustomers();
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Delete failed',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
      });
    }
  };

  /* ================= EXPORT FUNCTIONS ================= */
  const exportToExcel = async () => {
    setExportLoading(true);
    
    try {
      const data = filtered.map((u, i) => ({
        'S.No': i + 1,
        'Customer ID': u._id,
        'Name': u.name || 'N/A',
        'Email': u.email || 'N/A',
        'Mobile': u.mobile || 'N/A',
        'Location': u.location || 'N/A',
        'Status': u.status || 'active',
        'Registered': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
        'Last Updated': u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      
      // Style headers
      const headerStyle = {
        fill: { fgColor: { rgb: "2563EB" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = headerStyle;
      }
      
      // Auto-size columns
      const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
      ws['!cols'] = wscols;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      XLSX.writeFile(wb, `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      Swal.fire({
        icon: 'success',
        title: 'Exported!',
        text: `Exported ${filtered.length} customers to Excel`,
        timer: 1500,
        showConfirmButton: false,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
      });
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export data to Excel',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = () => {
    const data = filtered.map((u, i) => ({
      'S.No': i + 1,
      'Customer ID': u._id,
      'Name': u.name || 'N/A',
      'Email': u.email || 'N/A',
      'Mobile': u.mobile || 'N/A',
      'Location': u.location || 'N/A',
      'Status': u.status || 'active',
      'Registered': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Customers Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Customers Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Total Customers: ${filtered.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Location</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((customer, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${customer.name || 'N/A'}</td>
                  <td>${customer.email || 'N/A'}</td>
                  <td>${customer.mobile || 'N/A'}</td>
                  <td>${customer.location || 'N/A'}</td>
                  <td>${customer.status || 'active'}</td>
                  <td>${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Page 1 of 1 • Generated by Customer Management System</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSearchField("name");
    setStatusFilter("all");
    setDateRange({ start: "", end: "" });
    setHasAddressFilter("all");
    setSortField("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-50 to-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-2xl">
                    <FaUsers className="text-3xl text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Customer Management
                  </h1>
                  <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage and analyze your customer database
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className={`rounded-2xl p-5 backdrop-blur-sm border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <FaUsers className="text-white text-sm" />
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</div>
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                
                <div className={`rounded-2xl p-5 backdrop-blur-sm border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                      <FaUserCheck className="text-white text-sm" />
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.active}
                  </div>
                </div>
                
                <div className={`rounded-2xl p-5 backdrop-blur-sm border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      <FaAddressCard className="text-white text-sm" />
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">With Addresses</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.withAddresses}
                  </div>
                </div>
                
                <div className={`rounded-2xl p-5 backdrop-blur-sm border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
                      <FaChartLine className="text-white text-sm" />
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth Rate</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.total > 0 ? `${((stats.newThisMonth / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className={`rounded-2xl p-6 mb-8 backdrop-blur-sm border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-xl`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Field Select */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className={`pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} shadow-sm`}
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                >
                  <option value="name" className={darkMode ? 'bg-gray-800' : ''}><FaUser className="inline mr-2" /> Name</option>
                  <option value="email" className={darkMode ? 'bg-gray-800' : ''}><FaEnvelope className="inline mr-2" /> Email</option>
                  <option value="mobile" className={darkMode ? 'bg-gray-800' : ''}><FaPhone className="inline mr-2" /> Mobile</option>
                  <option value="location" className={darkMode ? 'bg-gray-800' : ''}><FaMapMarkerAlt className="inline mr-2" /> Location</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} shadow-sm`}
                  placeholder={`Search by ${searchField}...`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Sort Button */}
              <button
                onClick={() => handleSort(sortField)}
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-200 ${darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-300 hover:bg-gray-50'} shadow-sm`}
              >
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                <span className="hidden sm:inline">Sort</span>
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-200 ${darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-300 hover:bg-gray-50'} shadow-sm`}
              >
                <MdClear />
                <span className="hidden sm:inline">Clear</span>
              </button>
              
              <button
                onClick={fetchCustomers}
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-200 ${darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-300 hover:bg-gray-50'} shadow-sm`}
              >
                <MdRefresh />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input
                type="date"
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input
                type="date"
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Export Options Bar */}
        <div className={`rounded-2xl p-4 mb-6 backdrop-blur-sm border ${darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/60 border-gray-200'} shadow-lg`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFileExport className="text-blue-500" />
              <span className="font-medium">Export Options:</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={exportLoading || filtered.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${exportLoading || filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-sm`}
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Excel
                  </>
                )}
              </button>
              
              <button
                onClick={exportToCSV}
                disabled={filtered.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm`}
              >
                <FaFileCsv />
                CSV
              </button>
              
              <button
                onClick={printTable}
                disabled={filtered.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-sm`}
              >
                <FaPrint />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className={`rounded-2xl overflow-hidden border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-2xl backdrop-blur-sm`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-96 p-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600"></div>
              </div>
              <p className="mt-6 text-gray-500 dark:text-gray-400 font-medium">Loading customers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-10"></div>
                <FaUsers className="relative text-6xl opacity-30" />
              </div>
              <p className="text-xl font-medium mb-2">No customers found</p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchText ? 'Try a different search term' : 'Start adding customers to see them here'}
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={`${darkMode ? 'bg-gray-900/80' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        S NO
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaIdCard />
                          Customer
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaEnvelope />
                          Email
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaPhone />
                          Contact
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt />
                          Location
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map((customer, index) => (
                      <tr 
                        key={customer._id} 
                        className={`transition-all duration-200 hover:${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-md opacity-20"></div>
                              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold">{customer.name || 'Unnamed Customer'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ID: {customer._id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MdEmail className="text-gray-400" />
                            <span className="font-medium truncate max-w-[200px]">{customer.email || 'No email'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MdPhone className="text-gray-400" />
                            <span className="font-medium">{customer.mobile || 'No mobile'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MdLocationOn className="text-gray-400" />
                            <span className="truncate max-w-[150px]">{customer.location || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            customer.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {customer.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewUser(customer._id)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 group relative"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => deleteUser(customer._id, customer.name)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 group relative"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              <div className={`px-6 py-4 border-t ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                    <select
                      className={`px-3 py-1 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      of {filtered.length} customers
                    </span>
                  </div>
                  
                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <FaArrowLeft className="text-gray-500" />
                    </button>
                    
                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <FaChevronLeft className="text-gray-500" />
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <FaChevronRight className="text-gray-500" />
                    </button>
                    
                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <FaArrowRight className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Page Info */}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
              
              <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Modal Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <FaUser className="text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Customer Details</h3>
                        <p className="text-blue-100 mt-1">Complete customer information</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className={`max-h-[70vh] overflow-y-auto p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  {/* Customer Info Card */}
                  <div className={`rounded-2xl p-6 mb-8 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <FaUser className="text-blue-500" />
                      Personal Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                            <FaUser className="inline mr-2" />
                            Full Name
                          </label>
                          <div className="text-lg font-semibold">
                            {selectedUser.name || 'Not provided'}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                            <FaEnvelope className="inline mr-2" />
                            Email Address
                          </label>
                          <div className="text-lg font-semibold">
                            {selectedUser.email || 'Not provided'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                            <FaPhone className="inline mr-2" />
                            Mobile Number
                          </label>
                          <div className="text-lg font-semibold">
                            {selectedUser.mobile || 'Not provided'}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                            <FaMapMarkerAlt className="inline mr-2" />
                            Location
                          </label>
                          <div className="text-lg font-semibold">
                            {selectedUser.location || 'Not provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div>Customer ID: <span className="font-mono">{selectedUser._id}</span></div>
                        <div className="mt-1">
                          Registered: {selectedUser.createdAt ? 
                            new Date(selectedUser.createdAt).toLocaleString() : 
                            'Unknown'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Addresses Section */}
                  <div>
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <FaAddressCard className="text-purple-500" />
                      Saved Addresses ({addresses.length})
                    </h4>
                    
                    {addresses.length === 0 ? (
                      <div className={`text-center py-8 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <MdHome className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No addresses saved for this customer
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div 
                            key={address._id}
                            className={`rounded-xl p-5 border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-semibold text-lg mb-2">
                                  {address.addressType || 'Address'}
                                </div>
                                {address.isDefault && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Default Address
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-gray-600 dark:text-gray-300">
                              <p>{address.addressline1}</p>
                              {address.addressline2 && <p>{address.addressline2}</p>}
                              <p>
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p>{address.country}</p>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                              <div>Contact: {address.phone || selectedUser.mobile}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={`px-8 py-6 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last updated: {selectedUser.updatedAt ? 
                        new Date(selectedUser.updatedAt).toLocaleString() : 
                        'Unknown'
                      }
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className={`px-6 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-200`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className={`mt-8 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <p>Total customers in database: <span className="font-bold">{customers.length}</span></p>
            <span className="hidden sm:inline">•</span>
            <p>Showing: <span className="font-bold">{filtered.length}</span> after filters</p>
            <span className="hidden sm:inline">•</span>
            <p>
              Data refresh: <span className="font-mono">Auto (on load)</span> • 
              <button onClick={fetchCustomers} className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                Refresh Now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;