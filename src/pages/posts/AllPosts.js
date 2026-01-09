// App.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    User,
    Heart,
    MessageCircle,
    Image as ImageIcon,
    VideoIcon,
    BarChart3,
    Eye,
    MousePointer,
    Calendar,
    Sun,
    Moon,
    MoreVertical,
    CheckCircle,
    XCircle,
    Download,
    Share2,
    Flag,
    Trash2,
    ExternalLink,
    Clock,
    TrendingUp,
    Users,
    AlertCircle,
    X
} from 'lucide-react';
import { FaInfo, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Theme context
const ThemeContext = React.createContext();

const Posts = ({ darkMode }) => {
    const [posts, setPosts] = useState([]);
    const [ads, setAds] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: 'post',
        dateFrom: '',
        dateTo: '',
        sortBy: 'newest',
        status: 'all'
    });
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://apisocial.atozkeysolution.com/api/posts');
                const result = await response.json();
                if (result.success) {
                    setPosts(result.data);
                    setAds(result);
                    console.log('Fetched posts:', result);
                    setFilteredPosts(result.data);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Responsive posts per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setPostsPerPage(5);
            } else if (window.innerWidth < 1024) {
                setPostsPerPage(8);
            } else {
                setPostsPerPage(12);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Search function with debouncing
    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);

        try {
            // Search in posts
            const searchPosts = posts.filter(post => {
                if (post.type === 'post') {
                    return (
                        post.data.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.data.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.data.userId?.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.data._id?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                } else if (post.type === 'advertisement') {
                    return (
                        post.data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.data.campaignId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.data.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                }
                return false;
            });

            // Search in ads if available
            const searchAds = ads.data?.campaigns || [];
            const filteredAds = searchAds.filter(ad =>
                ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ad.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ad.campaignId?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Combine results
            const combinedResults = [
                ...searchPosts,
                ...filteredAds.map(ad => ({
                    type: 'advertisement',
                    data: ad
                }))
            ];

            setSearchResults(combinedResults);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    const debouncedSearch = (searchQuery) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // Apply filters and search
    useEffect(() => {
        let result = [...posts];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(post => {
                if (post.type === 'post') {
                    return (
                        post.data.description?.toLowerCase().includes(term) ||
                        post.data.userId?.fullName?.toLowerCase().includes(term) ||
                        post.data.userId?.profile?.username?.toLowerCase().includes(term) ||
                        post.data._id?.toLowerCase().includes(term)
                    );
                } else if (post.type === 'advertisement') {
                    return (
                        post.data.title?.toLowerCase().includes(term) ||
                        post.data.campaignId?.toLowerCase().includes(term) ||
                        post.data.description?.toLowerCase().includes(term)
                    );
                }
                return false;
            });
        }

        // Type filter
        if (filters.type !== 'all') {
            result = result.filter(post => post.type === filters.type);
        }

        // Status filter for ads
        if (filters.status !== 'all') {
            result = result.filter(post => {
                if (post.type === 'advertisement') {
                    return post.data.status === filters.status;
                }
                return true; // Keep all posts if status filter is not 'all'
            });
        }

        // Date filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            result = result.filter(post => {
                const postDate = new Date(post.type === 'post' ? post.data.createdAt : post.data.stats?.timestamp);
                return postDate >= fromDate;
            });
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(post => {
                const postDate = new Date(post.type === 'post' ? post.data.createdAt : post.data.stats?.timestamp);
                return postDate <= toDate;
            });
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.type === 'post' ? a.data.createdAt : a.data.stats?.timestamp);
            const dateB = new Date(b.type === 'post' ? b.data.createdAt : b.data.stats?.timestamp);

            if (filters.sortBy === 'newest') {
                return dateB - dateA;
            } else if (filters.sortBy === 'oldest') {
                return dateA - dateB;
            } else if (filters.sortBy === 'popular') {
                const likesA = a.type === 'post' ? a.data.likes?.length || 0 : a.data.stats?.impressions || 0;
                const likesB = b.type === 'post' ? b.data.likes?.length || 0 : b.data.stats?.impressions || 0;
                return likesB - likesA;
            }
            return dateB - dateA;
        });

        setFilteredPosts(result);
        setCurrentPage(1);
    }, [searchTerm, filters, posts]);

    // Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Stats calculation
    const stats = useMemo(() => {
        const totalPostsCount = posts.filter(p => p.type === 'post').length;
        // const totalAdsCount = posts.filter(p => p.type === 'advertisement').length;

        const totalLikes = posts.reduce((sum, post) => {
            if (post.type === 'post') {
                return sum + (post.data.likes?.length || 0);
            }
            return sum;
        }, 0);

        const totalComments = posts.reduce((sum, post) => {
            if (post.type === 'post') {
                return sum + (post.data.comments?.length || 0);
            }
            return sum;
        }, 0);

        const totalImpressions = posts.reduce((sum, post) => {
            if (post.type === 'advertisement') {
                return sum + (post.data.stats?.impressions || 0);
            }
            return sum;
        }, 0);

        const activeAds = posts.filter(p =>
            p.type === 'advertisement' && p.data.status === 'active'
        ).length;

        return {
            totalPosts: totalPostsCount,
            totalAds: ads.totalCampaigns || 0,
            totalLikes,
            totalComments,
            totalImpressions,
            activeAds
        };
    }, [posts]);

    const theme = darkMode ? 'dark' : 'light';

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            type: 'post',
            dateFrom: '',
            dateTo: '',
            sortBy: 'newest',
            status: 'all'
        });
        setShowSearchResults(false);
        setSearchResults([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(dateString);
    };

    const handlePostAction = async (postId, ownerId, action) => {
        try {
            if (action === 'delete') {
                const confirmDelete = window.confirm('Are you sure you want to delete this item?');
                if (!confirmDelete) return;

                // API call to delete
                const response = await fetch(`https://apisocial.atozkeysolution.com/api/deletePost/${ownerId}/${postId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setPosts(prev => prev.filter(p =>
                        (p.type === 'post' && p.data._id !== postId) ||
                        (p.type === 'advertisement' && p.data.campaignId !== postId)
                    ));
                    setSelectedPost(null);
                    alert('Item deleted successfully');
                }
            } else if (action === 'approve' || action === 'reject') {
                // Handle approve/reject for ads
                const response = await fetch(`https://apisocial.atozkeysolution.com/api/ads/${postId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: action })
                });

                if (response.ok) {
                    setPosts(prev => prev.map(p =>
                        p.type === 'advertisement' && p.data.campaignId === postId
                            ? { ...p, data: { ...p.data, status: action } }
                            : p
                    ));
                    alert(`Ad ${action}d successfully`);
                }
            }
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action');
        }
    };

    const exportData = () => {
        const dataStr = JSON.stringify(filteredPosts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `social-posts-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading posts...</p>
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme }}>
            <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

                {/* Search Section */}
                <div className="container mx-auto px-4 py-6 lg:px-6">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search posts, users, ads, campaigns..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className={`w-full pl-12 pr-12 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearchResults && searchTerm && (
                            <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border z-50 max-h-96 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold">Search Results</h3>
                                        <span className="text-sm text-gray-500">
                                            {isSearching ? 'Searching...' : `${searchResults.length} results`}
                                        </span>
                                    </div>

                                    {isSearching ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                            <span className="ml-3">Searching...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="space-y-3">
                                            {searchResults.slice(0, 10).map((item, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        setSelectedPost(item);
                                                        setShowSearchResults(false);
                                                    }}
                                                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                                            {item.type === 'post' ? (
                                                                <User size={16} />
                                                            ) : (
                                                                <BarChart3 size={16} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">
                                                                {item.type === 'post'
                                                                    ? item.data.userId?.fullName || 'Unknown User'
                                                                    : item.data.title
                                                                }
                                                            </h4>
                                                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                                                                {item.type === 'post'
                                                                    ? item.data.description || 'No description'
                                                                    : item.data.description || 'Advertisement'
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'post' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900' : 'bg-green-100 text-green-800 dark:bg-green-900'}`}>
                                                            {item.type === 'post' ? 'Post' : 'Ad'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {searchResults.length > 10 && (
                                                <div className="text-center py-2 text-sm text-gray-500">
                                                    + {searchResults.length - 10} more results
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                            <p>No results found for "{searchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Overview - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        <StatCard
                            title="Posts"
                            value={stats.totalPosts}
                            icon={<MessageCircle />}
                            color="blue"
                            theme={theme}
                        />
                        <StatCard
                            title="Ads"
                            value={stats.totalAds}
                            icon={<BarChart3 />}
                            color="green"
                            theme={theme}
                        />
                        <StatCard
                            title="Likes"
                            value={stats.totalLikes}
                            icon={<Heart />}
                            color="red"
                            theme={theme}
                        />
                        <StatCard
                            title="Comments"
                            value={stats.totalComments}
                            icon={<MessageCircle />}
                            color="purple"
                            theme={theme}
                        />
                    </div>

                    {/* Filters Section */}
                    <div className={`mb-6 p-4 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Filter size={20} />
                                <h3 className="font-semibold">Filters & Sorting</h3>
                            </div>

                            <div className="flex flex-wrap gap-2 md:gap-4">
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm md:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                >
                                    {/* <option value="all">All Types</option> */}
                                    <option value="post">Posts</option>
                                    {/* <option value="advertisement">Advertisements</option> */}
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm md:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                </select>

                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm md:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />

                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm md:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />

                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm md:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="popular">Most Popular</option>
                                </select>

                                <button
                                    onClick={clearFilters}
                                    className={`px-3 py-2 rounded-lg text-sm md:text-base ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* View Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold">
                            Content <span className="text-sm font-normal">({filteredPosts.length} items)</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            {/* View Toggle */}
                            <div className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`
                                        px-3 py-1 rounded-md text-sm font-medium transition-all
                                        ${viewMode === "grid"
                                            ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white"
                                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        }
                                    `}
                                >
                                    Grid
                                </button>

                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`
                                        px-3 py-1 rounded-md text-sm font-medium transition-all
                                        ${viewMode === "list"
                                            ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white"
                                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        }
                                    `}
                                >
                                    List
                                </button>
                            </div>

                            {/* Count */}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {indexOfFirstPost + 1}–
                                {Math.min(indexOfLastPost, filteredPosts.length)} of{" "}
                                {filteredPosts.length}
                            </span>
                        </div>

                    </div>

                    {/* Posts Grid/List */}
                    <div className="mb-8">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {currentPosts.map((item, index) => (
                                    <ContentCard
                                        key={index}
                                        item={item}
                                        theme={theme}
                                        getTimeAgo={getTimeAgo}
                                        formatDate={formatDate}
                                        onAction={handlePostAction}
                                        onSelect={setSelectedPost}
                                        compact={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentPosts.map((item, index) => (
                                    <ContentCardList
                                        key={index}
                                        item={item}
                                        theme={theme}
                                        getTimeAgo={getTimeAgo}
                                        onAction={handlePostAction}
                                        onSelect={setSelectedPost}
                                    />
                                ))}
                            </div>
                        )}

                        {currentPosts.length === 0 && (
                            <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg mb-2">No content found</p>
                                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your search or filters'}
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t dark:border-gray-700">
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Page {currentPage} of {totalPages} • {filteredPosts.length} items
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
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
                                                className={`w-10 h-10 rounded-lg ${currentPage === pageNum ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="px-2">...</span>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`w-10 h-10 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <select
                                value={postsPerPage}
                                onChange={(e) => setPostsPerPage(Number(e.target.value))}
                                className={`px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Selected Post Modal
                {selectedPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50"
                            onClick={() => setSelectedPost(null)}
                        />
                        <div className={`relative max-w-4xl w-full rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-hidden`}>
                            <div className="p-4 md:p-6 overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl md:text-2xl font-bold">Content Details</h3>
                                    <button
                                        onClick={() => setSelectedPost(null)}
                                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {selectedPost.type === 'post' ? (
                                    <PostDetails post={selectedPost.data} theme={theme} />
                                ) : (
                                    <AdDetails ad={selectedPost.data} theme={theme} />
                                )}

                                <div className="mt-6 pt-6 border-t dark:border-gray-700 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => window.open(
                                            selectedPost.type === 'post'
                                                ? `/posts/${selectedPost.data._id}`
                                                : `/campaigns/${selectedPost.data.campaignId}`,
                                            '_blank'
                                        )}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        <ExternalLink size={18} />
                                        Open Full View
                                    </button>
                                    <button
                                        onClick={() => {
                                            handlePostAction(
                                                selectedPost.type === 'post' ? selectedPost.data._id : selectedPost.data.campaignId,
                                                selectedPost.data.userId._id,
                                                'delete'
                                            );
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                    {selectedPost.type === 'advertisement' && selectedPost.data.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    handlePostAction(selectedPost.data.campaignId, 'approve');
                                                    setSelectedPost(null);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                            >
                                                <CheckCircle size={18} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handlePostAction(selectedPost.data.campaignId, 'reject');
                                                    setSelectedPost(null);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setSelectedPost(null)}
                                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Footer */}
                <footer className={`mt-8 py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Social Media Admin Dashboard • {new Date().getFullYear()}
                                </p>
                                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Total: {posts.length} items • Filtered: {filteredPosts.length} items
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                                    Privacy Policy
                                </button>
                                <button className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                                    Terms of Service
                                </button>
                                <button className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                                    Help
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ThemeContext.Provider>
    );
};

// Stat Card Component - Responsive
const StatCard = ({ title, value, icon, color, theme, change }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
    };

    return (
        <div className={`p-3 md:p-4 rounded-xl shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
                    <p className="text-lg md:text-2xl font-bold mt-1">{value.toLocaleString()}</p>
                    {change && (
                        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={`p-2 md:p-3 rounded-full ${colorClasses[color]}`}>
                    <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Content Card Component - Grid View
const ContentCard = ({ item, theme, getTimeAgo, onAction, onSelect, compact }) => {
    const isPost = item.type === 'post';
    const data = item.data;
    const navigate = useNavigate();

    return (
        <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className={`p-3 md:p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                            {isPost && data.userId?.profile?.image ? (
                                <img
                                    src={data.userId.profile.image}
                                    alt={data.userId.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={compact ? 16 : 20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold truncate text-sm md:text-base">
                                {isPost ? data.userId?.fullName || 'Unknown User' : data.title}
                            </h3>
                            <p className={`text-xs md:text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isPost ? `@${data.userId?.profile?.username || 'user'}` : 'Advertisement'}
                                <span className="mx-1 md:mx-2">•</span>
                                {getTimeAgo(isPost ? data.createdAt : data.stats?.timestamp)}
                            </p>
                        </div>
                    </div>

                    {/* <button
                        onClick={() => navigate(`/admin/user/post/${data._id}`)}
                        className={`flex-shrink-0 p-1 md:p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <FaInfoCircle size={compact ? 16 : 20} />
                    </button> */}
                </div>

                {/* Type Badge */}
                {/* <div className="mt-2">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${isPost
                                ? 'bg-green-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }
                        `}
                    >
                        {isPost ? 'Post' : 'Advertisement'}
                    </span>

                    {!isPost && data.status && (
                        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            data.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {data.status}
                        </span>
                    )}
                </div> */}
            </div>

            {/* Content */}
            <div className="p-3 md:p-4">
                {isPost ? (
                    <>
                        {data.description && (
                            <p className="mb-3 text-sm md:text-base line-clamp-2">{data.description}</p>
                        )}

                        {data.media && data.media.length > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    {data.media[0].type === 'image' ? <ImageIcon size={14} /> : <VideoIcon size={14} />}
                                    <span className="text-xs md:text-sm">{data.media.length} media</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {data.media.slice(0, 4).map((media, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={media.url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-1 md:gap-2">
                                <Heart size={14} className="text-red-500" />
                                <span>{data.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <MessageCircle size={14} className="text-blue-500" />
                                <span>{data.comments?.length || 0}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="mb-3 text-sm md:text-base line-clamp-2">{data.description || data.title}</p>

                        {data.media && data.media.length > 0 && (
                            <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={data.media[0].url}
                                    alt={data.title}
                                    className="w-full h-32 md:h-40 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                                <p className="font-semibold text-sm md:text-base">{data.stats?.impressions || 0}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
                                <p className="font-semibold text-sm md:text-base">{data.stats?.clicks || 0}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div className={`p-3 md:p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/admin/user/post/${data._id}`)}
                        className={`flex-1 py-2 rounded-lg text-center text-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onAction(
                            isPost ? data._id : data.campaignId,
                            data.userId._id,
                            'delete'
                        )}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Content Card Component - List View
const ContentCardList = ({ item, theme, getTimeAgo, onAction, onSelect }) => {
    const isPost = item.type === 'post';
    const data = item.data;

    return (
        <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center p-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {isPost && data.userId?.profile?.image ? (
                                <img
                                    src={data.userId.profile.image}
                                    alt={data.userId.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={20} className="m-auto mt-2" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                {isPost ? data.userId?.fullName || 'Unknown User' : data.title}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isPost ? `@${data.userId?.profile?.username || 'user'}` : 'Advertisement'}
                                <span className="mx-2">•</span>
                                {getTimeAgo(isPost ? data.createdAt : data.stats?.timestamp)}
                            </p>
                        </div>
                    </div>

                    {data.description && (
                        <p className="text-sm line-clamp-1 mb-2">{data.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                        {isPost ? (
                            <>
                                <span className="flex items-center gap-1">
                                    <Heart size={14} className="text-red-500" />
                                    {data.likes?.length || 0} likes
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageCircle size={14} className="text-blue-500" />
                                    {data.comments?.length || 0} comments
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="flex items-center gap-1">
                                    <Eye size={14} className="text-blue-500" />
                                    {data.stats?.impressions || 0} impressions
                                </span>
                                <span className="flex items-center gap-1">
                                    <MousePointer size={14} className="text-green-500" />
                                    {data.stats?.clicks || 0} clicks
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPost ? 'bg-blue-100 text-blue-800 dark:bg-blue-900' : 'bg-green-100 text-green-800 dark:bg-green-900'}`}>
                        {isPost ? 'Post' : 'Ad'}
                    </span>
                    <button
                        onClick={() => onSelect(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Post Details Component
const PostDetails = ({ post, theme }) => {
    return (
        <div className="space-y-6">
            {/* User Info */}
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        {post.userId?.profile?.image ? (
                            <img
                                src={post.userId.profile.image}
                                alt={post.userId.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={32} className="m-auto mt-4" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">{post.userId?.fullName || 'Unknown User'}</h4>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            @{post.userId?.profile?.username || 'user'}
                        </p>
                        <p className="text-sm mt-1">{post.userId?.email || 'No email'}</p>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div>
                <h4 className="font-semibold mb-2">Post Content</h4>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p>{post.description || 'No description'}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Media */}
            {post.media && post.media.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Media ({post.media.length})</h4>
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {post.media.map((media, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                    <img
                                        src={media.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="text-2xl font-bold text-blue-500">{post.likes?.length || 0}</div>
                    <div className="text-sm mt-1">Likes</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="text-2xl font-bold text-green-500">{post.comments?.length || 0}</div>
                    <div className="text-sm mt-1">Comments</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="text-2xl font-bold text-purple-500">{post.media?.length || 0}</div>
                    <div className="text-sm mt-1">Media</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="text-2xl font-bold text-yellow-500">
                        {post.shares || 0}
                    </div>
                    <div className="text-sm mt-1">Shares</div>
                </div>
            </div>
        </div>
    );
};

// Ad Details Component
const AdDetails = ({ ad, theme }) => {
    const ctr = ad.stats?.impressions ? ((ad.stats.clicks / ad.stats.impressions) * 100).toFixed(2) : 0;
    const conversionRate = ad.stats?.clicks ? ((ad.stats.conversions / ad.stats.clicks) * 100).toFixed(2) : 0;

    return (
        <div className="space-y-6">
            {/* Campaign Info */}
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className="font-bold text-lg mb-2">{ad.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Campaign ID</p>
                        <p className="font-mono">{ad.campaignId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ad.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {ad.status || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div>
                <h4 className="font-semibold mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard
                        label="Impressions"
                        value={ad.stats?.impressions || 0}
                        theme={theme}
                        icon={<Eye size={20} />}
                    />
                    <MetricCard
                        label="Clicks"
                        value={ad.stats?.clicks || 0}
                        theme={theme}
                        icon={<MousePointer size={20} />}
                    />
                    <MetricCard
                        label="Conversions"
                        value={ad.stats?.conversions || 0}
                        theme={theme}
                        icon={<TrendingUp size={20} />}
                    />
                    <MetricCard
                        label="CTR"
                        value={`${ctr}%`}
                        theme={theme}
                        icon={<BarChart3 size={20} />}
                    />
                </div>
            </div>

            {/* Package Details */}
            {ad.package && (
                <div>
                    <h4 className="font-semibold mb-2">Package Information</h4>
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Package Name</p>
                                <p className="font-semibold">{ad.package.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Target Users</p>
                                <p className="font-semibold">{ad.package.targetUsers}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Duration</p>
                                <p className="font-semibold">{ad.package.durationHours}h</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="font-semibold">${ad.package.price || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Preview */}
            {ad.media && ad.media.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Ad Creative</h4>
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <img
                            src={ad.media[0].url}
                            alt={ad.title}
                            className="w-full h-48 md:h-64 object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Metric Card Component for Details
const MetricCard = ({ label, value, theme, icon }) => (
    <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
            {icon}
            <span className="text-sm">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default Posts;