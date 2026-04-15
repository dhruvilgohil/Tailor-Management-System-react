import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, CreditCard, X, Loader, ListTodo, Scissors } from 'lucide-react';
import { useOrderStore } from '../../domain/store/orderStore';

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const orders = useOrderStore(state => state.orders);
    const fetchOrders = useOrderStore(state => state.fetchOrders);
    const isLoading = useOrderStore(state => state.isLoading);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeOrders = (orders || []).filter(order => order.status !== 'Completed');

        const builtNotifications = activeOrders.map((order) => {
            let variant = 'status';
            let title = 'Order Pending';
            let message = 'This order is waiting to be started.';
            let icon = ListTodo;
            let accent = {
                borderColor: '#FDE68A',
                backgroundColor: '#FFFBEB',
                iconBg: '#FEF3C7',
                iconColor: '#D97706'
            };

            if (order.targetDeliveryDate) {
                const deliveryDate = new Date(order.targetDeliveryDate);
                deliveryDate.setHours(0, 0, 0, 0);

                if (deliveryDate < today) {
                    variant = 'overdue';
                    title = 'Overdue Order';
                    message = `Due: ${deliveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
                    icon = AlertTriangle;
                    accent = {
                        borderColor: '#FEE2E2',
                        backgroundColor: '#FFF5F5',
                        iconBg: '#FEE2E2',
                        iconColor: '#DC2626'
                    };
                } else if (deliveryDate.getTime() === today.getTime()) {
                    variant = 'due-today';
                    title = 'Due Today';
                    message = 'Deliver before end of day.';
                    icon = Clock;
                    accent = {
                        borderColor: '#FEF3C7',
                        backgroundColor: '#FFFBEB',
                        iconBg: '#FEF3C7',
                        iconColor: '#D97706'
                    };
                }
            }

            if (variant === 'status' && order.paymentMethod === 'Pending') {
                variant = 'payment-pending';
                title = 'Payment Pending';
                message = 'Customer payment is still pending.';
                icon = CreditCard;
                accent = {
                    borderColor: '#DBEAFE',
                    backgroundColor: '#EFF6FF',
                    iconBg: '#DBEAFE',
                    iconColor: '#2563EB'
                };
            } else if (variant === 'status' && order.status === 'In Progress') {
                title = 'Order In Progress';
                message = 'Tailor is currently working on this order.';
                icon = Scissors;
                accent = {
                    borderColor: '#D1FAE5',
                    backgroundColor: '#ECFDF5',
                    iconBg: '#D1FAE5',
                    iconColor: '#059669'
                };
            }

            return {
                key: `${variant}-${order._id}`,
                variant,
                order,
                title,
                message,
                icon,
                accent
            };
        });

        const priority = {
            overdue: 0,
            'due-today': 1,
            'payment-pending': 2,
            status: 3
        };

        return builtNotifications.sort((a, b) => {
            const priorityDiff = (priority[a.variant] ?? 99) - (priority[b.variant] ?? 99);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.order.createdAt) - new Date(a.order.createdAt);
        });
    }, [orders]);

    const getCustomerName = (order) => order.customerId?.name || order.customerId?.customerName || 'Unknown Customer';
    const totalCount = notifications.length;

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary)',
                    position: 'relative',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={24} style={{ fill: totalCount > 0 ? 'var(--primary)' : 'none' }} />
                {totalCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                    }}>
                        {totalCount > 9 ? '9+' : totalCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    width: '360px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: '#FAFAFA'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={18} color="#4F46E5" />
                            <span style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>Notifications</span>
                            {totalCount > 0 && (
                                <span style={{ backgroundColor: '#EF4444', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: '700' }}>
                                    {totalCount}
                                </span>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Notification List */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {isLoading && totalCount === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                <Loader size={28} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p style={{ fontWeight: '600' }}>Loading notifications...</p>
                            </div>
                        ) : totalCount === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                <Bell size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <p style={{ fontWeight: '600' }}>All caught up!</p>
                                <p style={{ fontSize: '14px', marginTop: '4px' }}>No pending alerts right now.</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map(({ key, order, title, message, icon: Icon, accent }) => (
                                    <div
                                        key={key}
                                        onClick={() => { navigate('/orders'); setOpen(false); }}
                                        style={{
                                            padding: '14px 20px',
                                            borderBottom: `1px solid ${accent.borderColor}`,
                                            backgroundColor: accent.backgroundColor,
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: accent.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                            <Icon size={18} color={accent.iconColor} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: accent.iconColor }}>{title}</p>
                                            <p style={{ margin: '2px 0 4px', fontSize: '13px', color: '#374151' }}>{getCustomerName(order)}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{message}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {totalCount > 0 && (
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
                            <button
                                onClick={() => { navigate('/orders'); setOpen(false); }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#4F46E5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                View All Orders →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
