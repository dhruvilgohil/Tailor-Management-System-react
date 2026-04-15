import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '../../domain/store/customerStore';
import { useOrderStore } from '../../domain/store/orderStore';
import { useIncomeStore } from '../../domain/store/incomeStore';
import { useInventoryStore } from '../../domain/store/inventoryStore';
import { useSearchStore } from '../../domain/store/searchStore';
import { Users, Receipt, Clock, Wallet, Eye } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div style={{
        backgroundColor: 'var(--surface)',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    }}>
        <div>
            <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '18px', marginBottom: '16px', lineHeight: 1 }}>{title}</p>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#000', margin: '0 0 16px 0', lineHeight: 1 }}>{value}</h3>
            {subtext && (
                <p style={{ color: color || '#10B981', fontWeight: '600', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {color ? '' : <span style={{ fontSize: '16px' }}>↗</span>} {subtext}
                </p>
            )}
        </div>
        <div style={{ color: 'var(--primary)', ...(!color && { opacity: 0.8 }) }}>
            <Icon size={28} />
        </div>
    </div>
);

const DashboardScreen = () => {
    const { customers, fetchCustomers } = useCustomerStore();
    const { orders, fetchOrders } = useOrderStore();
    const { transactions, fetchIncome } = useIncomeStore();
    const { items, fetchItems } = useInventoryStore();
    const { searchQuery } = useSearchStore();
    const [viewingOrder, setViewingOrder] = useState(null);

    useEffect(() => {
        fetchCustomers();
        fetchOrders();
        fetchIncome();
        fetchItems();
    }, [fetchCustomers, fetchOrders, fetchIncome, fetchItems]);

    // Dynamic Calculations safely
    const totalCustomers = (customers || []).length;
    const totalOrders = (orders || []).length;
    const pendingOrders = (orders || []).filter(o => o.status === 'Pending').length;

    // Calculate Total Income safely
    const totalIncome = (transactions || []).reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

    const filteredOrders = (orders || []).filter((order) => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return true;

        const customerName = (order.customerId?.customerName || order.customerId?.name || '').toLowerCase();
        const services = Array.isArray(order.services)
            ? order.services.join(', ').toLowerCase()
            : (order.services || '').toLowerCase();
        const status = (order.status || '').toLowerCase();
        const assignedTailor = (order.assignedTailor?.name || '').toLowerCase();

        return (
            customerName.includes(query) ||
            services.includes(query) ||
            status.includes(query) ||
            assignedTailor.includes(query)
        );
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
            {/* Top Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px'
            }}>
                <StatCard title="Total Customer" value={totalCustomers.toLocaleString()} icon={Users} />
                <StatCard title="Total Orders" value={totalOrders.toLocaleString()} icon={Receipt} />
                <StatCard title="Pending Orders" value={pendingOrders.toLocaleString()} color="#F04438" icon={Clock} />
                <StatCard title="Total Income" value={`₹ ${totalIncome.toLocaleString()}`} icon={Wallet} />
            </div>

            {/* Recent Orders List */}
            <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                padding: '8px'
            }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#000', fontSize: '18px' }}>Customer Name</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Services</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Assigned Tailor</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Date</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.slice(0, 5).map((order) => {
                            // Extract just the date string (YYYY-MM-DD) from ISO format
                            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');

                            return (
                                <tr key={order._id} style={{ backgroundColor: 'var(--surface)' }}>
                                    <td style={{ padding: '16px', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>{order.customerId?.customerName || order.customerId?.name || 'Unknown'}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>{Array.isArray(order.services) ? order.services.join(', ') : order.services}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{
                                            padding: '6px 24px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            backgroundColor: order.status === 'Completed' ? '#A7F3D0' : order.status === 'In Progress' ? '#FDE68A' : order.status === 'Pending' ? '#E5E7EB' : '#FF8A8A',
                                            color: order.status === 'Completed' ? '#047857' : order.status === 'In Progress' ? '#B45309' : order.status === 'Pending' ? '#374151' : '#FFFFFF'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>{order.assignedTailor?.name || 'Unassigned'}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>{formattedDate}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
                                        <button
                                            onClick={() => setViewingOrder(order)}
                                            style={{
                                                padding: '8px 24px',
                                                backgroundColor: '#2A324B',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                            <Eye size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280', fontSize: '15px' }}>
                                    No orders match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Only Modal */}
            {viewingOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto' }}>
                    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '650px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', margin: 'auto' }}>
                        <h2 style={{ textAlign: 'center', margin: 0, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                            Order Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Customer</div>
                                <div style={{ color: '#111827', fontWeight: '600' }}>{viewingOrder.customerId?.customerName || viewingOrder.customerId?.name || 'Unknown'}</div>
                                <div style={{ color: '#4B5563', fontSize: '14px', marginTop: '4px' }}>{viewingOrder.customerId?.contactNo || viewingOrder.customerId?.contact || 'No Contact'}</div>
                            </div>

                            <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Status</div>
                                <div style={{ fontWeight: '600', color: viewingOrder.status === 'Completed' ? '#047857' : viewingOrder.status === 'In Progress' ? '#B45309' : '#374151' }}>
                                    {viewingOrder.status || 'Pending'}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                            <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Services Requested</div>
                            <div style={{ color: '#111827', fontWeight: '500' }}>{Array.isArray(viewingOrder.services) ? viewingOrder.services.join(', ') : (viewingOrder.services || 'None')}</div>
                        </div>

                        {viewingOrder.itemsUsed && viewingOrder.itemsUsed.length > 0 && (
                            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                                <div style={{ color: '#065F46', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Inventory Used</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {viewingOrder.itemsUsed.map((item, idx) => {
                                        const invDetails = (items || []).find(i => i._id === (item.inventoryId?._id || item.inventoryId));
                                        return (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D1FAE5', paddingBottom: '4px', fontSize: '14px' }}>
                                                <span style={{ color: '#064E3B' }}>{invDetails ? invDetails.itemName : 'Unknown Item'} <span style={{ color: '#059669' }}>x {item.quantity}</span></span>
                                                <span style={{ fontWeight: '600', color: '#065F46' }}>₹ {item.calculatedPrice}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                                <div style={{ color: '#92400E', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Assigned Tailor</div>
                                <div style={{ color: '#92400E', fontWeight: '600' }}>{viewingOrder.assignedTailor?.name || 'Unassigned'}</div>
                                {viewingOrder.tailorContractPrice > 0 && (
                                    <div style={{ color: '#B45309', fontSize: '13px', marginTop: '4px' }}>Contract Rate: ₹ {viewingOrder.tailorContractPrice}</div>
                                )}
                            </div>

                            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                                <div style={{ color: '#1D4ED8', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Payment Info</div>
                                <div style={{ color: '#1E40AF', fontWeight: '600' }}>Method: {viewingOrder.paymentMethod || 'Cash'}</div>
                                {viewingOrder.paymentMethod === 'Pending' && viewingOrder.paymentExpectedBy && (
                                    <div style={{ color: '#2563EB', fontSize: '13px', marginTop: '4px' }}>Expected By: {new Date(viewingOrder.paymentExpectedBy).toLocaleDateString()}</div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#111827', borderRadius: '8px', color: 'white' }}>
                            <span style={{ fontSize: '16px', fontWeight: '500' }}>Final Total Price</span>
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹ {viewingOrder.userDefinedTotal > 0 ? viewingOrder.userDefinedTotal : (viewingOrder.calculatedTotal > 0 ? viewingOrder.calculatedTotal : viewingOrder.totalAmount || 0)}</span>
                        </div>

                        <button onClick={() => setViewingOrder(null)} style={{ padding: '14px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;
