import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '../../domain/store/customerStore';
import { useMeasurementStore } from '../../domain/store/measurementStore';
import { useSearchStore } from '../../domain/store/searchStore';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomersScreen = () => {
    const { customers, deleteCustomer, fetchCustomers, updateCustomer, addCustomer } = useCustomerStore();
    const { measurements, fetchMeasurements } = useMeasurementStore();
    const { searchQuery } = useSearchStore();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [currentCustomer, setCurrentCustomer] = useState({
        name: '',
        contact: '',
        address: '',
        measurementAction: 'select', // 'select' | 'new' | 'none'
        selectedMeasurementId: ''
    });
    const [editingId, setEditingId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCustomers();
        if (fetchMeasurements) fetchMeasurements();
    }, [fetchCustomers, fetchMeasurements]);

    // Reset page to 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleAdd = async () => {
        if (currentCustomer.name && currentCustomer.contact) {
            // Send field names that match the Customer model: { name, contact, address }
            await addCustomer({
                name: currentCustomer.name,
                contact: currentCustomer.contact,
                address: currentCustomer.address
            });
            setAddModalOpen(false);
            resetForm();
        }
    };

    const handleEditSave = async () => {
        if (currentCustomer.name && currentCustomer.contact && editingId) {
            await updateCustomer(editingId, {
                name: currentCustomer.name,
                contact: currentCustomer.contact,
                address: currentCustomer.address
            });
            setEditModalOpen(false);
            resetForm();
            setEditingId(null);
        }
    };

    const resetForm = () => {
        setCurrentCustomer({ name: '', contact: '', measurementAction: 'select', selectedMeasurementId: '' });
    };

    const openEdit = (customer) => {
        setCurrentCustomer({
            name: customer.name || '',
            contact: customer.contact || '',
            address: customer.address || '',
            measurementAction: 'select',
            selectedMeasurementId: ''
        });
        setEditingId(customer._id);
        setEditModalOpen(true);
    };

    // Filter customers
    const filteredCustomers = customers.filter(c => {
        const name = (c.name || '').toLowerCase();
        const contact = (c.contact || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return name.includes(sq) || contact.includes(sq);
    });

    // Calculate generic pagination variables
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>

            {/* Action Bar */}
            <div>
                <button
                    onClick={() => { resetForm(); setAddModalOpen(true); }}
                    style={{ padding: 'var(--spacing-md) var(--spacing-xl)', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: '500' }}>
                    Add Customer
                </button>
            </div>

            <div style={{
                backgroundColor: 'var(--bg-base)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Customer Name</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Contact No</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Address</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>View</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Edit</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCustomers.map((customer) => (
                            <tr key={customer._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: 'var(--spacing-xl)', color: 'var(--text-primary)' }}>{customer.name}</td>
                                <td style={{ padding: 'var(--spacing-xl)', color: 'var(--text-primary)' }}>{customer.contact}</td>
                                <td style={{ padding: 'var(--spacing-xl)', color: 'var(--text-secondary)', fontSize: '14px' }}>{customer.address || '-'}</td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <button
                                        onClick={() => setViewingCustomer(customer)}
                                        style={{
                                            padding: '8px 24px',
                                            backgroundColor: '#1E293B',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-xs)'
                                        }}>
                                        <Eye size={18} /> View
                                    </button>
                                </td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <button
                                        onClick={() => openEdit(customer)}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#D9F99D',
                                            color: '#4D7C0F',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer'
                                        }}>
                                        <Edit size={18} />
                                    </button>
                                </td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <button
                                        onClick={() => deleteCustomer(customer._id)}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#FECACA',
                                            color: '#B91C1C',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer'
                                        }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} Entries
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

            {/* Modal for Add / Edit */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <h2 style={{ textAlign: 'center', margin: 0, color: '#111827' }}>
                            {isAddModalOpen ? 'Add Customer' : 'Edit Customer'}
                        </h2>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Customer Name :</label>
                            <input type="text" placeholder="e.g., Jonathan Sterling" value={currentCustomer.name} onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Contact No :</label>
                            <input type="text" placeholder="+91 9876543210" value={currentCustomer.contact} onChange={(e) => setCurrentCustomer({ ...currentCustomer, contact: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Address :</label>
                            <textarea placeholder="Full address" rows={3} value={currentCustomer.address} onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827', resize: 'vertical' }} />
                        </div>

                        {/* Measurement Linking Logic */}
                        <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <label style={{ fontWeight: '600', color: '#111827', display: 'block', marginBottom: '12px' }}>Measurement Profile</label>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input type="radio" name="measurementAction" value="none" checked={currentCustomer.measurementAction === 'none'} onChange={() => setCurrentCustomer({ ...currentCustomer, measurementAction: 'none' })} />
                                    No Profile
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input type="radio" name="measurementAction" value="select" checked={currentCustomer.measurementAction === 'select'} onChange={() => setCurrentCustomer({ ...currentCustomer, measurementAction: 'select' })} />
                                    Link Existing
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input type="radio" name="measurementAction" value="new" checked={currentCustomer.measurementAction === 'new'} onChange={() => setCurrentCustomer({ ...currentCustomer, measurementAction: 'new' })} />
                                    Create New
                                </label>
                            </div>

                            {currentCustomer.measurementAction === 'select' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={currentCustomer.selectedMeasurementId}
                                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, selectedMeasurementId: e.target.value })}
                                        style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', color: '#111827', backgroundColor: 'white' }}>
                                        <option value="">Select Measurement Profile</option>
                                        {(measurements || []).map(m => (
                                            <option key={m._id} value={m._id}>{m.dressType} ({new Date(m.measurementDate).toLocaleDateString()})</option>
                                        ))}
                                    </select>
                                    <button disabled={!currentCustomer.selectedMeasurementId} style={{ padding: '10px 16px', backgroundColor: currentCustomer.selectedMeasurementId ? '#D9F99D' : '#F3F4F6', color: currentCustomer.selectedMeasurementId ? '#4D7C0F' : '#9CA3AF', border: 'none', borderRadius: '6px', cursor: currentCustomer.selectedMeasurementId ? 'pointer' : 'not-allowed' }}>
                                        <Edit size={16} /> Edit
                                    </button>
                                </div>
                            )}

                            {currentCustomer.measurementAction === 'new' && (
                                <div style={{ padding: '12px', backgroundColor: '#E0E7FF', color: '#3730A3', borderRadius: '6px', fontSize: '14px' }}>
                                    After saving, you will be redirected to the Measurement form to fill out the details.
                                </div>
                            )}
                        </div>

                        <button onClick={isAddModalOpen ? handleAdd : handleEditSave} style={{ padding: '12px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>
                            {isAddModalOpen ? (currentCustomer.measurementAction === 'new' ? 'Save & Add Measurement' : 'Add Customer') : 'Save Changes'}
                        </button>
                        <button onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }} style={{ padding: '12px', backgroundColor: 'transparent', color: '#4F46E5', border: '1px solid #4F46E5', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* View Only Modal */}
            {viewingCustomer && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <h2 style={{ textAlign: 'center', margin: 0, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                            Customer Details
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Name:</span>
                                <span style={{ color: '#111827', fontWeight: '600' }}>{viewingCustomer.name}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Contact No:</span>
                                <span style={{ color: '#111827', fontWeight: '600' }}>{viewingCustomer.contact}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Address:</span>
                                <span style={{ color: '#111827', lineHeight: '1.5' }}>{viewingCustomer.address || 'No address provided'}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Created On:</span>
                                <span style={{ color: '#111827' }}>{new Date(viewingCustomer.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button onClick={() => setViewingCustomer(null)} style={{ padding: '12px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer', marginTop: '16px' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersScreen;
