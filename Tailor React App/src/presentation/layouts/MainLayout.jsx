import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, Wallet, Calendar, Search, Scissors, UserCircle, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../domain/store/authStore';
import { useSearchStore } from '../../domain/store/searchStore';
import NotificationBell from '../components/NotificationBell';

const MainLayout = () => {
    const user = useAuthStore(state => state.user);
    const { searchQuery, setSearchQuery } = useSearchStore();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Track window size for responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false); // auto-close on desktop resize
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
        // Clear search on route change
        setSearchQuery('');
    }, [location.pathname, isMobile, setSearchQuery]);

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return 'Dashboard';
            case '/orders': return 'Orders';
            case '/customers': return 'Customers';
            case '/inventory': return 'Inventory';
            case '/income': return 'Income';
            case '/appointment': return 'Measurement';
            case '/tailors': return 'Tailors';
            case '/profile': return 'Profile';
            default: return 'Dashboard';
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/tailors', label: 'Tailors', icon: Scissors },
        { path: '/inventory', label: 'Inventory', icon: Package },
        { path: '/income', label: 'Income', icon: Wallet },
        { path: '/appointment', label: 'Appointment', icon: Calendar },
        { path: '/profile', label: 'Profile', icon: UserCircle },
    ];

    const sidebarWidth = '240px';
    const showSidebar = !isMobile || sidebarOpen;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>

            {/* Mobile Overlay Backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 15,
                        transition: 'opacity 0.3s'
                    }}
                />
            )}

            {/* Sidebar */}
            {showSidebar && (
                <aside style={{
                    width: sidebarWidth,
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 20,
                    boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
                    transition: 'transform 0.3s ease',
                    overflowY: 'auto'
                }}>
                    {/* Logo Area */}
                    <div style={{ padding: 'var(--spacing-xl) var(--spacing-xl) var(--spacing-lg)', textAlign: 'center', position: 'relative' }}>
                        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0, color: '#000', lineHeight: 1.2 }}>
                            {user?.shopName || 'Able Tailor'}
                        </h1>
                        <p style={{ fontSize: 'var(--text-sm)', color: '#000', fontWeight: 'bold', marginTop: 'var(--spacing-xs)', letterSpacing: '1px' }}>
                            Men's Wear
                        </p>
                        {/* Close button on mobile */}
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    background: '#F3F4F6', border: 'none', borderRadius: '8px',
                                    padding: '6px', cursor: 'pointer', color: '#6B7280'
                                }}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ padding: '0 var(--spacing-md) var(--spacing-xl)', flex: 1 }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Menu
                        </p>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md) var(--spacing-lg)',
                                        borderRadius: 'var(--radius-md)',
                                        color: isActive ? 'white' : 'var(--text-secondary)',
                                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                        textDecoration: 'none',
                                        fontWeight: isActive ? '600' : '400',
                                        fontSize: '15px',
                                        transition: 'all var(--motion-fast)'
                                    })}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Logout Button at bottom */}
                    <div style={{ padding: 'var(--spacing-lg)' }}>
                        <button
                            onClick={() => useAuthStore.getState().logout()}
                            style={{
                                width: '100%',
                                backgroundColor: '#FEE2E2',
                                color: '#B91C1C',
                                border: 'none',
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                fontSize: '15px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: isMobile ? '0' : '240px',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                transition: 'margin-left 0.3s ease'
            }}>
                {/* Top Header */}
                <header style={{
                    height: '70px',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px 0 20px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    gap: '12px'
                }}>
                    {/* Hamburger + Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                style={{
                                    background: '#F3F4F6', border: 'none', borderRadius: '8px',
                                    padding: '8px', cursor: 'pointer', color: '#374151',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Menu size={22} />
                            </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-base)' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '500' }}>Admin</span>
                            <span style={{ color: 'var(--text-secondary)' }}>›</span>
                            <span style={{ fontWeight: '700', color: '#000' }}>{getPageTitle()}</span>
                        </div>
                    </div>

                    {/* Search Bar — hidden on small mobile */}
                    <div style={{ flex: 1, maxWidth: '440px', display: isMobile ? 'none' : 'block', margin: '0 16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#F3F4F6',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <Search size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search orders, customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    border: 'none', backgroundColor: 'transparent',
                                    marginLeft: '8px', width: '100%', outline: 'none',
                                    fontSize: 'var(--text-sm)', color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Bell + User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        {/* Live Notification Bell */}
                        <NotificationBell />

                        {/* User Info — hidden on xs mobile */}
                        <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: '700', color: '#000', fontSize: '15px' }}>{user?.fullName || 'Tailor'}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Master Tailor</p>
                            </div>
                            <div style={{
                                width: '40px', height: '40px',
                                backgroundColor: '#E0E7FF', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <UserCircle size={24} color="#4F46E5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: isMobile ? '16px' : 'var(--spacing-2xl)', flex: 1, backgroundColor: 'var(--bg-base)' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
