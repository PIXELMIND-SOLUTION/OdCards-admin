import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../Views/Dashboard';
import Customers from '../Views/customers/Customers';
import VisitingCardList from '../Views/cards/VisitingCardList';
import AllOrders from '../Views/orders/AllOrders';
import Reviews from '../Views/reviews/Reviews';
import Settings from '../Views/Settings';
import ContactUs from '../Views/contactus/ContactUs';
import Scroller from '../Views/scroller/Scroller';
import Faqs from '../Views/faqs/Faqs';
import Banners from '../Views/banners/Banners';
import AboutUs from '../Views/aboutus/AboutUs';
import UserProducts from '../Views/UserProducts/UserProducts';

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

                            <Route path="/customers" element={<Customers darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/visiting-cards" element={<VisitingCardList darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/user-products" element={<UserProducts darkMode={darkMode} collapsed={collapsed} />} /> 

                            <Route path="/allorders" element={<AllOrders darkMode={darkMode} collapsed={collapsed} />} />  

                            <Route path="/banners" element={<Banners darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/reviews" element={<Reviews darkMode={darkMode} collapsed={collapsed} />} />  

                            <Route path="/Contactus" element={<ContactUs darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/aboutus" element={<AboutUs darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/scrollers" element={<Scroller darkMode={darkMode} collapsed={collapsed} />} />

                            <Route path="/faqs" element={<Faqs darkMode={darkMode} collapsed={collapsed} />} />

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