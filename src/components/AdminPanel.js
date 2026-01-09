import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/users/Users';
import Settings from '../pages/Settings';
import EditUser from '../pages/users/UpdateUser';
import UserDetails from '../pages/users/UserDetails';
import CoinPackage from '../pages/packages/CoinPackage';
import CampaignPackage from '../pages/packages/CampaignPackage';
import AdminUserPosts from '../pages/users/UserPosts';
import AdminSpinDashboard from '../pages/spin/AdminSpin';
import AdminCampaigns from '../pages/campaign/AllCampaigns';
import SingleCampaignView from '../pages/campaign/SingleCampaign';
import CampaignRequests from '../pages/campaign/CampaignRequests';
import RejectedCampaigns from '../pages/campaign/RejectedCampaigns';
import Posts from '../pages/posts/AllPosts';
import Calender from '../pages/Calender';
import Payments from '../pages/Payments';
import AdminDownloadConfig from '../pages/AdminDownloadConfig';
import SinglePostDetails from '../pages/users/SinglePostDetails';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [darkMode, setDarkMode] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        // Load from localStorage or default to false
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true' || false;
    });

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleCollapsed = () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);
        localStorage.setItem('sidebarCollapsed', newCollapsed);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
    };

    const handleNavigation = (path) => {
        navigate(`/admin${path}`);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    // Load preferences
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    return (
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    darkMode={darkMode}
                    toggleSidebar={toggleSidebar}
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                    onNavigate={handleNavigation}
                />

                {/* Main Content Area */}
                <div className={`
                    flex-1 flex flex-col 
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'md:ml-0' : 'md:ml-0'}
                `}>
                    {/* Navbar */}
                    <Navbar
                        toggleSidebar={toggleSidebar}
                        toggleDarkMode={toggleDarkMode}
                        darkMode={darkMode}
                        collapsed={collapsed}
                        sidebarOpen={sidebarOpen}
                        onNavigate={handleNavigation}
                    />

                    {/* Main Content Area with Routes */}
                    <main className={`
                        flex-1 p-4 md:p-6 overflow-y-auto
                        transition-all duration-300
                    `}>
                        <Routes>
                            <Route path="/" element={<Dashboard darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/dashboard" element={<Dashboard darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/users" element={<Users darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/users/:id" element={<EditUser darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/users/details/:id" element={<UserDetails darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path='/userposts/:userId' element={<AdminUserPosts darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path='/user/post/:postId' element={<SinglePostDetails darkMode={darkMode} collapsed={collapsed} />}/>

                            <Route path="/posts" element={<Posts darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/packages" element={<CoinPackage darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/campaign-packages" element={<CampaignPackage darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/campaigns" element={<AdminCampaigns darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/campaigns/:id" element={<SingleCampaignView darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/campaign-requests" element={<CampaignRequests darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/rejected-campaigns" element={<RejectedCampaigns darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/spins" element={<AdminSpinDashboard darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path='/download' element={<AdminDownloadConfig darkMode={darkMode} collapsed={collapsed} />}  />

                            <Route path='/calender' element={<Calender darkMode={darkMode} collapsed={collapsed} />}/>
                            <Route path="/payments" element={<Payments darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="/settings" element={<Settings darkMode={darkMode} collapsed={collapsed} />} />
                            <Route path="*" element={<Navigate to="/admin" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;