import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Plus, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTailorStore } from '../../domain/store/tailorStore';
import { useSearchStore } from '../../domain/store/searchStore';

const TailorsScreen = () => {
    const { tailors, fetchTailors, addTailor, updateTailor, deleteTailor } = useTailorStore();
    const { searchQuery } = useSearchStore();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', employmentType: 'Salary' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchTailors();
    }, [fetchTailors]);

    // Reset page to 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleAdd = () => {
        setFormData({ name: '', address: '', phone: '', employmentType: 'Salary' });
        setEditingId(null);
        setEditModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;

        if (editingId) {
            await updateTailor(editingId, formData);
        } else {
            await addTailor(formData);
        }
        setEditModalOpen(false);
    };

    const handleEdit = (tailor) => {
        setFormData({
            name: tailor.name || '',
            address: tailor.address || '',
            phone: tailor.phone || '',
            employmentType: tailor.employmentType || 'Salary'
        });
        setEditingId(tailor._id);
        setEditModalOpen(true);
    };

    // Filter tailors
    const filteredTailors = tailors.filter(t => {
        const name = (t.name || '').toLowerCase();
        const phone = (t.phone || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return name.includes(sq) || phone.includes(sq);
    });

    // Calculate generic pagination variables
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTailors = filteredTailors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTailors.length / itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                    Staff Management
                </h2>
                <button
                    onClick={handleAdd}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
                    <Plus size={18} />
                    Hire Tailor
                </button>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#F8FAFC' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Tailor Name</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Contact Info</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Employment Type</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTailors.map((tailor) => (
                            <tr key={tailor._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                    {tailor.name}
                                </td>
                                <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <Phone size={14} /> {tailor.phone || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={14} /> {tailor.address || 'N/A'}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: tailor.employmentType === 'Salary' ? '#DBEAFE' : '#FFEDD5',
                                        color: tailor.employmentType === 'Salary' ? '#1E40AF' : '#9A3412'
                                    }}>
                                        {tailor.employmentType}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button onClick={() => handleEdit(tailor)} style={{ padding: '6px', backgroundColor: '#FEF08A', color: '#854D0E', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => deleteTailor(tailor._id)} style={{ padding: '6px', backgroundColor: '#FECACA', color: '#B91C1C', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTailors.length)} of {filteredTailors.length} Entries
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

            {isEditModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{editingId ? 'Edit Tailor' : 'Hire Tailor'}</h2>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Full Name</label>
                            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="John Doe" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Phone Number</label>
                            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="+91 XXXXX XXXXX" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Address</label>
                            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} rows={3} placeholder="Full address" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Employment Agreement</label>
                            <select value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <option value="Salary">Salaried (Full-time)</option>
                                <option value="Contract">Contract (Per Order)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Details
                            </button>
                            <button onClick={() => setEditModalOpen(false)} style={{ padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TailorsScreen;
