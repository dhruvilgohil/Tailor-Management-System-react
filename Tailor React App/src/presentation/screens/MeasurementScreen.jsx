import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '../../domain/store/customerStore';
import { useMeasurementStore } from '../../domain/store/measurementStore';
import { useSearchStore } from '../../domain/store/searchStore';
import { Eye, Edit, Trash2, Plus, List, ChevronLeft, ChevronRight } from 'lucide-react';

const FormInput = ({ label, placeholder, type = "text", value, onChange }) => (
    <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>{label} :</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                outline: 'none',
                color: '#111827',
                transition: 'border-color var(--motion-fast)'
            }}
        />
    </div>
);

const MeasurementScreen = () => {
    const { customers, fetchCustomers } = useCustomerStore();
    const { saveMeasurement, measurements, fetchMeasurements, updateMeasurement, deleteMeasurement } = useMeasurementStore();
    const { searchQuery } = useSearchStore();

    useEffect(() => {
        fetchCustomers();
        fetchMeasurements();
    }, [fetchCustomers, fetchMeasurements]);

    // Reset page to 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const [activeTab, setActiveTab] = useState('List'); // 'List' | 'Form'
    const [editingId, setEditingId] = useState(null);
    const [viewingMeasurement, setViewingMeasurement] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        customerId: '',
        dressType: '',
        measurementDate: '',
        shirtMeasurements: { length: '', shoulder: '', sleeveLength: '', halfSleeveLength: '', halfSleeveFitting: '', chest: '', stomach: '', sideChest: '', sideStomach: '', sideSeat: '' },
        pantMeasurements: { length: '', waist: '', seat: '', thigh: '', knee: '', bottom: '', jhulo: '' }
    });

    const resetForm = () => {
        setFormData({
            customerId: '', dressType: '', measurementDate: '',
            shirtMeasurements: { length: '', shoulder: '', sleeveLength: '', halfSleeveLength: '', halfSleeveFitting: '', chest: '', stomach: '', sideChest: '', sideStomach: '', sideSeat: '' },
            pantMeasurements: { length: '', waist: '', seat: '', thigh: '', knee: '', bottom: '', jhulo: '' }
        });
        setEditingId(null);
    };

    const handleEditClick = (m) => {
        setEditingId(m._id);
        const parsedDressType = m.dressType || m.type || '';

        let shirt = { length: '', shoulder: '', sleeveLength: '', halfSleeveLength: '', halfSleeveFitting: '', chest: '', stomach: '', sideChest: '', sideStomach: '', sideSeat: '' };
        let pant = { length: '', waist: '', seat: '', thigh: '', knee: '', bottom: '', jhulo: '' };

        if (m.measurements) {
            if (m.measurements.shirtMeasurements) shirt = { ...shirt, ...m.measurements.shirtMeasurements };
            if (m.measurements.pantMeasurements) pant = { ...pant, ...m.measurements.pantMeasurements };
        }

        setFormData({
            customerId: m.customerId?._id || m.customerId || '',
            dressType: parsedDressType,
            measurementDate: m.measurementDate ? new Date(m.measurementDate).toISOString().split('T')[0] : (m.recordedDate ? new Date(m.recordedDate).toISOString().split('T')[0] : ''),
            shirtMeasurements: shirt,
            pantMeasurements: pant
        });
        setActiveTab('Form');
    };

    const handleShirtChange = (key, value) => {
        setFormData(prev => ({ ...prev, shirtMeasurements: { ...prev.shirtMeasurements, [key]: value } }));
    };

    const handlePantChange = (key, value) => {
        setFormData(prev => ({ ...prev, pantMeasurements: { ...prev.pantMeasurements, [key]: value } }));
    };

    const handleSubmit = async () => {
        if (!formData.customerId || !formData.dressType || !formData.measurementDate) {
            alert('Please select a customer, dress type, and measurement date.');
            return;
        }

        if (formData.dressType === 'Shirt & Pant' || formData.dressType === 'Suit' || formData.dressType === 'Kurta') {
            const requiredShirt = ['length', 'shoulder', 'chest', 'stomach'];
            for (let key of requiredShirt) {
                if (!formData.shirtMeasurements[key] || isNaN(formData.shirtMeasurements[key])) {
                    alert(`Valid numeric value required for Shirt: ${key.replace(/([A-Z])/g, ' $1').trim()}`);
                    return;
                }
            }
        }

        if (formData.dressType === 'Shirt & Pant' || formData.dressType === 'Suit') {
            const requiredPant = ['length', 'waist', 'seat', 'thigh'];
            for (let key of requiredPant) {
                if (!formData.pantMeasurements[key] || isNaN(formData.pantMeasurements[key])) {
                    alert(`Valid numeric value required for Pant: ${key.replace(/([A-Z])/g, ' $1').trim()}`);
                    return;
                }
            }
        }

        const payload = {
            customerId: formData.customerId,
            title: `${formData.dressType} Measurement`,
            type: formData.dressType,
            measurements: {
                shirtMeasurements: formData.shirtMeasurements,
                pantMeasurements: formData.pantMeasurements
            },
            recordedDate: formData.measurementDate
        };

        if (editingId) {
            await updateMeasurement(editingId, payload);
            alert('Measurement Updated Successfully!');
        } else {
            await saveMeasurement(payload);
            alert('Measurement Saved Successfully!');
        }

        resetForm();
        setActiveTab('List');
    };

    // Filter measurements
    const filteredMeasurements = (measurements || []).filter(m => {
        const custObj = customers.find(c => c._id === (m.customerId?._id || m.customerId));
        const custName = (m.customerId?.name || custObj?.name || '').toLowerCase();
        const dressType = (m.type || m.dressType || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return custName.includes(sq) || dressType.includes(sq);
    });

    // Calculate generic pagination variables
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMeasurements = filteredMeasurements.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMeasurements.length / itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>

            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', padding: '8px' }}>
                    <button
                        onClick={() => { setActiveTab('List'); resetForm(); }}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'List' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'List' ? 'white' : '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: activeTab === 'List' ? '600' : '500',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all var(--motion-fast)'
                        }}
                    >
                        <List size={18} /> Measurement List
                    </button>
                    <button
                        onClick={() => { setActiveTab('Form'); resetForm(); }}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'Form' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'Form' ? 'white' : '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: activeTab === 'Form' ? '600' : '500',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all var(--motion-fast)'
                        }}
                    >
                        <Plus size={18} /> {editingId ? 'Edit Measurement' : 'Add New'}
                    </button>
                </div>
            </div>

            {/* List Tab View */}
            {activeTab === 'List' && (
                <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', padding: '8px', border: '1px solid var(--border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#000', fontSize: '16px' }}>Customer Name</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '16px' }}>Dress Type</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '16px' }}>Measurement Date</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#000', fontSize: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMeasurements && currentMeasurements.length > 0 ? currentMeasurements.map((m) => {
                                const custObj = customers.find(c => c._id === (m.customerId?._id || m.customerId));
                                const custName = m.customerId?.name || custObj?.name || 'Unknown';
                                const dressTypeLabel = m.type || m.dressType || '-';
                                const dateStr = m.recordedDate
                                    ? new Date(m.recordedDate).toLocaleDateString()
                                    : m.measurementDate
                                        ? new Date(m.measurementDate).toLocaleDateString()
                                        : '';
                                return (
                                    <tr key={m._id || Math.random()} style={{ backgroundColor: 'var(--surface)' }}>
                                        <td style={{ padding: '16px', color: '#000', borderBottom: '1px solid #F3F4F6' }}>{custName}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#000', borderBottom: '1px solid #F3F4F6' }}>{dressTypeLabel}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#000', borderBottom: '1px solid #F3F4F6' }}>{dateStr}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => setViewingMeasurement(m)} style={{ padding: '8px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleEditClick(m)} style={{ padding: '8px', backgroundColor: '#D9F99D', color: '#4D7C0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => {
                                                if (window.confirm('Delete this measurement?')) deleteMeasurement(m._id);
                                            }} style={{ padding: '8px', backgroundColor: '#FECACA', color: '#B91C1C', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No measurements found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMeasurements.length)} of {filteredMeasurements.length} Entries
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
            )}

            {/* Form Tab View */}
            {activeTab === 'Form' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
                    <div style={{ backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--spacing-xl)', color: 'var(--text-primary)' }}>Customer Info</h3>

                        <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Customer :</label>
                                <select
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827', backgroundColor: 'white' }}
                                >
                                    <option value="">Select Verified Customer</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c._id}>{c.customerName || c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Contact No (Auto-Fetched) :</label>
                                <input
                                    type="text"
                                    disabled
                                    value={formData.customerId ? customers.find(c => c._id === formData.customerId)?.contactNo || customers.find(c => c._id === formData.customerId)?.contact || 'Not Found' : ''}
                                    placeholder="Select a customer first"
                                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#6B7280', backgroundColor: '#F3F4F6' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Dress Type :</label>
                                <select
                                    value={formData.dressType}
                                    onChange={(e) => setFormData({ ...formData, dressType: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }}
                                >
                                    <option value="">Select Dress Type</option>
                                    <option value="Shirt & Pant">Shirt & Pant</option>
                                    <option value="Suit">Suit</option>
                                    <option value="Kurta">Kurta</option>
                                </select>
                            </div>
                            <FormInput label="Measurement Date" type="date" value={formData.measurementDate} onChange={e => setFormData({ ...formData, measurementDate: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--spacing-2xl)', color: 'var(--text-primary)', textAlign: 'center' }}>Measurements Setup</h3>

                        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                            <button style={{ padding: '8px 24px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', marginBottom: 'var(--spacing-lg)' }}>
                                Shirt Measurement
                            </button>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
                                <FormInput label="Length (*)" value={formData.shirtMeasurements.length} onChange={e => handleShirtChange('length', e.target.value)} />
                                <FormInput label="Shoulder (*)" value={formData.shirtMeasurements.shoulder} onChange={e => handleShirtChange('shoulder', e.target.value)} />
                                <FormInput label="Sleeve Length" value={formData.shirtMeasurements.sleeveLength} onChange={e => handleShirtChange('sleeveLength', e.target.value)} />
                                <FormInput label="Half Sleeve Length" value={formData.shirtMeasurements.halfSleeveLength} onChange={e => handleShirtChange('halfSleeveLength', e.target.value)} />
                                <FormInput label="Half Sleeve Fitting" value={formData.shirtMeasurements.halfSleeveFitting} onChange={e => handleShirtChange('halfSleeveFitting', e.target.value)} />
                                <FormInput label="Chest (*)" value={formData.shirtMeasurements.chest} onChange={e => handleShirtChange('chest', e.target.value)} />
                                <FormInput label="Stomach (*)" value={formData.shirtMeasurements.stomach} onChange={e => handleShirtChange('stomach', e.target.value)} />
                                <FormInput label="Side Chest" value={formData.shirtMeasurements.sideChest} onChange={e => handleShirtChange('sideChest', e.target.value)} />
                                <FormInput label="Side Stomach" value={formData.shirtMeasurements.sideStomach} onChange={e => handleShirtChange('sideStomach', e.target.value)} />
                                <FormInput label="Side Seat" value={formData.shirtMeasurements.sideSeat} onChange={e => handleShirtChange('sideSeat', e.target.value)} />
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--spacing-2xl) 0' }} />

                        <div>
                            <button style={{ padding: '8px 24px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', marginBottom: 'var(--spacing-lg)' }}>
                                Pant Measurement
                            </button>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
                                <FormInput label="Length (*)" value={formData.pantMeasurements.length} onChange={e => handlePantChange('length', e.target.value)} />
                                <FormInput label="Waist (*)" value={formData.pantMeasurements.waist} onChange={e => handlePantChange('waist', e.target.value)} />
                                <FormInput label="Seat (*)" value={formData.pantMeasurements.seat} onChange={e => handlePantChange('seat', e.target.value)} />
                                <FormInput label="Thigh (*)" value={formData.pantMeasurements.thigh} onChange={e => handlePantChange('thigh', e.target.value)} />
                                <FormInput label="Knee" value={formData.pantMeasurements.knee} onChange={e => handlePantChange('knee', e.target.value)} />
                                <FormInput label="Bottom" value={formData.pantMeasurements.bottom} onChange={e => handlePantChange('bottom', e.target.value)} />
                                <FormInput label="Jhulo/Rise" value={formData.pantMeasurements.jhulo} onChange={e => handlePantChange('jhulo', e.target.value)} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: 'var(--spacing-2xl)' }}>
                            <button onClick={handleSubmit} style={{ padding: '12px 64px', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: 'var(--text-lg)', cursor: 'pointer' }}>
                                {editingId ? 'Update Measurement' : 'Save Measurement Profile'}
                            </button>
                            {editingId && (
                                <button onClick={() => { setActiveTab('List'); resetForm(); }} style={{ padding: '12px 48px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', fontWeight: 'bold', fontSize: 'var(--text-lg)', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Only Modal */}
            {viewingMeasurement && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto' }}>
                    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', margin: 'auto' }}>
                        <h2 style={{ textAlign: 'center', margin: 0, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                            Measurement Profile
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Customer:</span>
                                <span style={{ color: '#111827', fontWeight: '600' }}>
                                    {(() => {
                                        const custId = viewingMeasurement.customerId?._id || viewingMeasurement.customerId;
                                        const c = customers.find(c => c._id === custId);
                                        return c?.name || 'Unknown';
                                    })()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Dress Type:</span>
                                <span style={{ color: '#111827', fontWeight: '600' }}>{viewingMeasurement.type || viewingMeasurement.dressType}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <span style={{ color: '#6B7280', fontWeight: '500' }}>Measured On:</span>
                                <span style={{ color: '#111827', fontWeight: '600' }}>
                                    {viewingMeasurement.recordedDate
                                        ? new Date(viewingMeasurement.recordedDate).toLocaleDateString()
                                        : viewingMeasurement.measurementDate
                                            ? new Date(viewingMeasurement.measurementDate).toLocaleDateString()
                                            : 'N/A'}
                                </span>
                            </div>

                            {/* Shirt Measurements */}
                            {viewingMeasurement.measurements?.shirtMeasurements && Object.keys(viewingMeasurement.measurements.shirtMeasurements).length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <h4 style={{ color: '#374151', marginBottom: '8px', fontWeight: '600' }}>Shirt Measurements</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                        {Object.entries(viewingMeasurement.measurements.shirtMeasurements).map(([key, val]) => val ? (
                                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>
                                                <span style={{ color: '#4B5563', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                <span style={{ color: '#111827', fontWeight: '600' }}>{val}</span>
                                            </div>
                                        ) : null)}
                                    </div>
                                </div>
                            )}

                            {/* Pant Measurements */}
                            {viewingMeasurement.measurements?.pantMeasurements && Object.keys(viewingMeasurement.measurements.pantMeasurements).length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <h4 style={{ color: '#374151', marginBottom: '8px', fontWeight: '600' }}>Pant Measurements</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                        {Object.entries(viewingMeasurement.measurements.pantMeasurements).map(([key, val]) => val ? (
                                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>
                                                <span style={{ color: '#4B5563', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                <span style={{ color: '#111827', fontWeight: '600' }}>{val}</span>
                                            </div>
                                        ) : null)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setViewingMeasurement(null)} style={{ padding: '12px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer', marginTop: '16px' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeasurementScreen;
