import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../../domain/store/orderStore';
import { useCustomerStore } from '../../domain/store/customerStore';
import { useInventoryStore } from '../../domain/store/inventoryStore';
import { useTailorStore } from '../../domain/store/tailorStore';
import { useMeasurementStore } from '../../domain/store/measurementStore';
import { useSearchStore } from '../../domain/store/searchStore';
import { Eye, Edit, Trash2, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

const OrdersScreen = () => {
    const { orders, fetchOrders, createOrder, updateOrder, deleteOrder } = useOrderStore();
    const { customers, fetchCustomers, addCustomer } = useCustomerStore();
    const { items, fetchItems } = useInventoryStore();
    const { tailors, fetchTailors } = useTailorStore();
    const { measurements, fetchMeasurements } = useMeasurementStore();
    const { searchQuery } = useSearchStore();

    const [activeTab, setActiveTab] = useState('All Orders');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [currentOrder, setCurrentOrder] = useState({
        customerId: '',
        isNewCustomer: false,
        newCustomerName: '',
        newCustomerContact: '',
        measurementId: '',
        services: '',
        itemsUsed: [],
        status: 'Pending',
        assignedTailor: '',
        tailorContractPrice: 0,
        deliveryDate: '',
        paymentMethod: 'Cash',
        paymentPendingDate: '',
        userDefinedTotal: 0,
        calculatedTotal: 0
    });

    useEffect(() => {
        fetchOrders();
        fetchCustomers();
        fetchItems();
        fetchTailors();
        fetchMeasurements();
    }, [fetchOrders, fetchCustomers, fetchItems, fetchTailors, fetchMeasurements]);

    const tabs = ['All Orders', 'Pending', 'In Progress', 'Completed'];

    const baseFilteredOrders = activeTab === 'All Orders'
        ? orders
        : orders.filter(o => o.status === activeTab);

    const filteredOrders = baseFilteredOrders.filter(o => {
        const custName = (o.customerId?.name || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return custName.includes(sq);
    });

    // Reset pagination when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    // Calculate generic pagination variables
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Dynamic price calculation
    useEffect(() => {
        let total = 0;
        currentOrder.itemsUsed.forEach(used => {
            const inventoryItem = items.find(i => i._id === used.inventoryId);
            if (inventoryItem) {
                total += (inventoryItem.unitPrice || 0) * (used.quantity || 0);
            }
        });
        setCurrentOrder(prev => ({ ...prev, calculatedTotal: total }));
    }, [currentOrder.itemsUsed, items]);

    const buildOrderPayload = (customerId) => {
        const payload = {
            customerId,
            measurementId: currentOrder.measurementId || undefined,
            services: currentOrder.services ? currentOrder.services.split(',').map(s => s.trim()).filter(s => s) : [],
            itemsUsed: currentOrder.itemsUsed.filter(i => i.inventoryId && i.quantity > 0).map(i => {
                const inventoryItem = items.find(inv => inv._id === i.inventoryId);
                return {
                    inventoryId: i.inventoryId,
                    quantity: i.quantity,
                    calculatedPrice: inventoryItem ? (inventoryItem.unitPrice * i.quantity) : 0
                }
            }),
            status: currentOrder.status,
            paymentMethod: currentOrder.paymentMethod,
            paymentExpectedBy: currentOrder.paymentPendingDate || undefined,
            assignedTailor: currentOrder.assignedTailor || undefined,
            tailorContractPrice: currentOrder.tailorContractPrice || 0,
            calculatedTotal: currentOrder.calculatedTotal,
            userDefinedTotal: currentOrder.userDefinedTotal || currentOrder.calculatedTotal,
            targetDeliveryDate: currentOrder.deliveryDate || undefined,
        };
        return payload;
    };

    const handleAdd = async () => {
        let finalCustomerId = currentOrder.customerId;

        if (currentOrder.isNewCustomer && currentOrder.newCustomerName && currentOrder.newCustomerContact) {
            const newCust = await addCustomer({
                name: currentOrder.newCustomerName,
                contact: currentOrder.newCustomerContact
            });
            if (newCust && newCust._id) {
                finalCustomerId = newCust._id;
            } else {
                alert("Failed to create new customer");
                return;
            }
        }

        if (!finalCustomerId) {
            alert("Please select or create a customer first");
            return;
        }

        await createOrder(buildOrderPayload(finalCustomerId));
        setAddModalOpen(false);
        resetForm();
    };

    const handleEditSave = async () => {
        if (!currentOrder.customerId || !editingId) {
            alert("Invalid Order or Customer");
            return;
        }
        await updateOrder(editingId, buildOrderPayload(currentOrder.customerId));
        setEditModalOpen(false);
        resetForm();
        setEditingId(null);
    };

    const resetForm = () => {
        setCurrentOrder({
            customerId: '', isNewCustomer: false, newCustomerName: '', newCustomerContact: '',
            measurementId: '', services: '', itemsUsed: [], status: 'Pending', assignedTailor: '',
            tailorContractPrice: 0, deliveryDate: '', paymentMethod: 'Cash', paymentPendingDate: '',
            userDefinedTotal: 0, calculatedTotal: 0
        });
    };

    const openEdit = (order) => {
        setCurrentOrder({
            customerId: order.customerId?._id || order.customerId || '',
            isNewCustomer: false,
            newCustomerName: '',
            newCustomerContact: '',
            measurementId: order.measurementId?._id || order.measurementId || '',
            services: Array.isArray(order.services) ? order.services.join(', ') : (order.services || ''),
            itemsUsed: order.itemsUsed || [],
            status: order.status || 'Pending',
            assignedTailor: order.assignedTailor?._id || order.assignedTailor || '',
            tailorContractPrice: order.tailorContractPrice || 0,
            deliveryDate: order.targetDeliveryDate ? new Date(order.targetDeliveryDate).toISOString().split('T')[0] : (order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : ''),
            paymentMethod: order.paymentMethod || 'Cash',
            paymentPendingDate: order.paymentExpectedBy ? new Date(order.paymentExpectedBy).toISOString().split('T')[0] : '',
            userDefinedTotal: order.userDefinedTotal || 0,
            calculatedTotal: order.calculatedTotal || 0
        });
        setEditingId(order._id);
        setEditModalOpen(true);
    };

    const handleItemSelectionAdd = () => {
        setCurrentOrder(prev => ({
            ...prev,
            itemsUsed: [...prev.itemsUsed, { inventoryId: '', quantity: 1 }]
        }));
    };

    const updateItemUsed = (index, field, value) => {
        const updated = [...currentOrder.itemsUsed];
        updated[index][field] = value;
        setCurrentOrder({ ...currentOrder, itemsUsed: updated });
    };

    const removeItemUsed = (index) => {
        const updated = currentOrder.itemsUsed.filter((_, i) => i !== index);
        setCurrentOrder({ ...currentOrder, itemsUsed: updated });
    };

    const selectedTailorDoc = tailors.find(t => t._id === currentOrder.assignedTailor);
    const applicableMeasurements = measurements.filter(m => {
        return m.customerId === currentOrder.customerId || (m.customerId && m.customerId._id === currentOrder.customerId);
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', padding: '8px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab ? 'white' : '#000',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: activeTab === tab ? '600' : '500',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all var(--motion-fast)'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => { resetForm(); setAddModalOpen(true); }}
                    style={{ padding: 'var(--spacing-md) var(--spacing-xl)', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: '500' }}>
                    Add Order
                </button>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', padding: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#000', fontSize: '18px' }}>Customer Info</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Price</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Assigned Tailor</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Date</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '18px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.map((order) => {
                            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
                            const priceDisplay = order.userDefinedTotal > 0 ? order.userDefinedTotal : (order.calculatedTotal > 0 ? order.calculatedTotal : order.totalAmount);

                            return (
                                <tr key={order._id} style={{ backgroundColor: 'var(--surface)' }}>
                                    <td style={{ padding: '16px', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>
                                        {order.customerId?.customerName || order.customerId?.name || 'Unknown'}
                                        <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                                            Services: {Array.isArray(order.services) ? order.services.join(', ') : order.services}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6', fontWeight: 'bold' }}>
                                        ₹ {priceDisplay}
                                    </td>
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
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>{order.assignedTailor?.name || 'Not assigned'}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#000', fontSize: '16px', borderBottom: '1px solid #F3F4F6' }}>{formattedDate}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button onClick={() => setViewingOrder(order)} style={{ padding: '8px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={16} /></button>
                                        <button onClick={() => openEdit(order)} style={{ padding: '8px', backgroundColor: '#D9F99D', color: '#4D7C0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit size={16} /></button>
                                        <button onClick={() => { if (window.confirm('Delete this order?')) deleteOrder(order._id); }} style={{ padding: '8px', backgroundColor: '#FECACA', color: '#B91C1C', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} Entries
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: currentPage === 1 ? '#F9FAFB' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#9CA3AF' : '#374151' }}>
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontWeight: '500', color: '#111827' }}>
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: currentPage === totalPages ? '#F9FAFB' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#9CA3AF' : '#374151' }}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Add / Edit Order */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, minHeight: '100vh', padding: '40px 0' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '700px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <h2 style={{ textAlign: 'center', margin: 0, color: '#111827', fontSize: '24px' }}>
                            {isAddModalOpen ? 'Create New Order' : 'Edit Order'}
                        </h2>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ fontWeight: '600', color: '#111827' }}>Customer Info</label>
                                    <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4F46E5', fontWeight: '500' }}>
                                        <input type="checkbox" checked={currentOrder.isNewCustomer} onChange={(e) => setCurrentOrder({ ...currentOrder, isNewCustomer: e.target.checked })} />
                                        New Customer
                                    </label>
                                </div>

                                {!currentOrder.isNewCustomer ? (
                                    <select value={currentOrder.customerId} onChange={(e) => setCurrentOrder({ ...currentOrder, customerId: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }}>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (<option key={c._id} value={c._id}>{c.name} ({c.contact})</option>))}
                                    </select>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input type="text" placeholder="Full Name" value={currentOrder.newCustomerName} onChange={(e) => setCurrentOrder({ ...currentOrder, newCustomerName: e.target.value })} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                        <input type="text" placeholder="Contact Number" value={currentOrder.newCustomerContact} onChange={(e) => setCurrentOrder({ ...currentOrder, newCustomerContact: e.target.value })} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Link Measurement Profile</label>
                                <select value={currentOrder.measurementId} onChange={(e) => setCurrentOrder({ ...currentOrder, measurementId: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }}>
                                    <option value="">Select Measurement Profile</option>
                                    {applicableMeasurements.map(m => (
                                        <option key={m._id} value={m._id}>{m.title} ({m.dressType || m.type})</option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '12px', marginTop: '8px', color: '#6B7280' }}>
                                    Only profiles for the selected customer are shown.
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>General Services :</label>
                            <input type="text" placeholder="e.g., Alteration, Custom Suit, 2 Pants" value={currentOrder.services} onChange={(e) => setCurrentOrder({ ...currentOrder, services: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }} />
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ fontWeight: '600', color: '#065F46' }}>Inventory Used (Auto-Pricing)</label>
                                <button onClick={handleItemSelectionAdd} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#A7F3D0', color: '#065F46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                                    <Plus size={14} /> Add Fabric/Item
                                </button>
                            </div>

                            {currentOrder.itemsUsed.map((usedItem, index) => (
                                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                    <select
                                        value={usedItem.inventoryId}
                                        onChange={(e) => updateItemUsed(index, 'inventoryId', e.target.value)}
                                        style={{ flex: 2, padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                                    >
                                        <option value="">Select Item</option>
                                        {items.map(inv => (
                                            <option key={inv._id} value={inv._id}>{inv.itemName} (₹{inv.unitPrice} / {inv.stockUnit})</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={usedItem.quantity}
                                        onChange={(e) => updateItemUsed(index, 'quantity', Number(e.target.value))}
                                        style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                                        min="1"
                                    />
                                    <button onClick={() => removeItemUsed(index)} style={{ padding: '10px', border: 'none', borderRadius: '6px', backgroundColor: '#FECACA', color: '#B91C1C', cursor: 'pointer' }}>
                                        <Minus size={16} />
                                    </button>
                                </div>
                            ))}
                            {currentOrder.itemsUsed.length === 0 && <span style={{ color: '#166534', fontSize: '14px' }}>No inventory items linked to this order.</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4B5563' }}>Calculated Total (Items Setup)</label>
                                <input type="number" readOnly value={currentOrder.calculatedTotal} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#6B7280', backgroundColor: '#E5E7EB', fontWeight: 'bold' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#111827' }}>Final Agreed Price Override (₹)</label>
                                <input type="number" value={currentOrder.userDefinedTotal} onChange={e => setCurrentOrder({ ...currentOrder, userDefinedTotal: Number(e.target.value) })} style={{ width: '100%', padding: '12px', border: '2px solid #6366F1', borderRadius: '6px', outline: 'none', color: '#111827', fontWeight: 'bold' }} />
                                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Set this to lock in the final price billed to the customer.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#92400E' }}>Assigned Tailor</label>
                                <select value={currentOrder.assignedTailor} onChange={(e) => setCurrentOrder({ ...currentOrder, assignedTailor: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }}>
                                    <option value="">Unassigned</option>
                                    {tailors.map(t => (
                                        <option key={t._id} value={t._id}>{t.name} ({t.employmentType})</option>
                                    ))}
                                </select>

                                {selectedTailorDoc?.employmentType === 'Contract' && (
                                    <div style={{ marginTop: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#92400E', fontSize: '14px' }}>Contractor Price Cut (₹)</label>
                                        <input type="number" value={currentOrder.tailorContractPrice} onChange={e => setCurrentOrder({ ...currentOrder, tailorContractPrice: Number(e.target.value) })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Payment Logic :</label>
                                    <select value={currentOrder.paymentMethod} onChange={(e) => setCurrentOrder({ ...currentOrder, paymentMethod: e.target.value, paymentPendingDate: e.target.value !== 'Pending' ? '' : currentOrder.paymentPendingDate })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}>
                                        <option value="Cash">Cash (Paid - Will hit Income)</option>
                                        <option value="Online">Online (Paid - Will hit Income)</option>
                                        <option value="Pending">Pending / Deposit</option>
                                    </select>
                                </div>
                                {currentOrder.paymentMethod === 'Pending' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Expected By:</label>
                                        <input type="date" value={currentOrder.paymentPendingDate} onChange={(e) => setCurrentOrder({ ...currentOrder, paymentPendingDate: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Status :</label>
                                <select value={currentOrder.status} onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827', backgroundColor: '#F3F4F6', fontWeight: 'bold' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Target Delivery Date :</label>
                                <input type="date" value={currentOrder.deliveryDate} onChange={(e) => setCurrentOrder({ ...currentOrder, deliveryDate: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }} />
                            </div>
                        </div>


                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button onClick={isAddModalOpen ? handleAdd : handleEditSave} style={{ flex: 1, padding: '14px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                                {isAddModalOpen ? 'Create Full Order' : 'Save Changes'}
                            </button>
                            <button onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }} style={{ padding: '14px', backgroundColor: 'transparent', color: '#4F46E5', border: '1px solid #4F46E5', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

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
                                        const invDetails = items.find(i => i._id === (item.inventoryId?._id || item.inventoryId));
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

export default OrdersScreen;
