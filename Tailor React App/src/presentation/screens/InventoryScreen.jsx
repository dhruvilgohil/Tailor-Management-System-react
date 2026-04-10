import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../domain/store/inventoryStore';
import { useSearchStore } from '../../domain/store/searchStore';
import { Package, PackageMinus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const InventoryScreen = () => {
    const { items, fetchItems, deleteItem, addItem, updateItem } = useInventoryStore();
    const { searchQuery } = useSearchStore();
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Reset page to 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // New Item State (Matches Backend Model logically)
    const [newItem, setNewItem] = useState({ itemName: '', category: '', stockQuantity: '', unitOfMeasure: 'Meters', unitPrice: '' });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleAdd = async () => {
        if (newItem.itemName && newItem.category) {
            // Mapping frontend internal state strictly to Backend Schema
            await addItem({
                itemName: newItem.itemName,
                category: newItem.category,
                stockQty: parseFloat(newItem.stockQuantity) || 0,
                stockUnit: newItem.unitOfMeasure,
                unitPrice: parseFloat(newItem.unitPrice) || 0
            });
            // Adding a display property 'stockLevel' for the table locally 
            // Better practice is updating table mapping later, but this works short-term

            setAddModalOpen(false);
            resetForm();
        }
    };

    const handleEditSave = async () => {
        if (newItem.itemName && newItem.category && editingId) {
            await updateItem(editingId, {
                itemName: newItem.itemName,
                category: newItem.category,
                stockQty: parseFloat(newItem.stockQuantity) || 0,
                stockUnit: newItem.unitOfMeasure,
                unitPrice: parseFloat(newItem.unitPrice) || 0
            });
            setEditModalOpen(false);
            resetForm();
            setEditingId(null);
        }
    };

    const resetForm = () => {
        setNewItem({ itemName: '', category: '', stockQuantity: '', unitOfMeasure: 'Meters', unitPrice: '' });
    };

    const openEdit = (item) => {
        setNewItem({
            itemName: item.itemName || '',
            category: item.category || '',
            stockQuantity: item.stockQty !== undefined ? item.stockQty : (item.stockQuantity || 0),
            unitOfMeasure: item.stockUnit || item.unitOfMeasure || 'Meters',
            unitPrice: item.unitPrice !== undefined ? item.unitPrice : 0
        });
        setEditingId(item._id);
        setEditModalOpen(true);
    };

    // Derived Statistics
    const totalItems = items.length;
    // Calculate Total Inventory Price (parsing out 'Units' or 'Meters' loosely if string, else treating as Number)
    const totalPrice = items.reduce((sum, item) => {
        // Simplified fallback: if 'stockLevel' is numeric, multiply. Avoids breaking on text strings short-term.
        const stockVal = parseFloat(item.stockLevel) || 1;
        const price = parseFloat(item.unitPrice) || 0;
        return sum + (stockVal * price);
    }, 0);

    // Filter inventory items
    const filteredItems = items.filter(i => {
        const name = (i.itemName || '').toLowerCase();
        const cat = (i.category || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return name.includes(sq) || cat.includes(sq);
    });

    // Calculate generic pagination variables
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
            {/* Top Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-xl)'
            }}>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#DBEAFE', color: '#3B82F6', borderRadius: 'var(--radius-md)' }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: 'var(--text-lg)', margin: '0 0 var(--spacing-xs) 0' }}>Total Items</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalItems}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#D1FAE5', color: '#10B981', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '32px', fontWeight: 'bold' }}>₹</span>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: 'var(--text-lg)', margin: '0 0 var(--spacing-xs) 0' }}>Total Inventory Price</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>₹ {totalPrice.toLocaleString()}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: 'var(--radius-md)' }}>
                        <PackageMinus size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: 'var(--text-lg)', margin: '0 0 var(--spacing-xs) 0' }}>Low Stock Items</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>0</h3> {/* Placeholder until threshold logic builtin */}
                    </div>
                </div>
            </div>

            {/* action bar */}
            <div>
                <button
                    onClick={() => { resetForm(); setAddModalOpen(true); }}
                    style={{ padding: 'var(--spacing-md) var(--spacing-xl)', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: '500' }}>
                    Add Item
                </button>
            </div>

            {/* Inventory List */}
            <div style={{ backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Item Name</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Category</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Stock Details</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Unit Price</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Edit</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: 'var(--spacing-xl)', color: 'var(--text-primary)' }}>{item.itemName}</td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-primary)' }}>{item.category}</td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-primary)' }}>{item.stockQty} {item.stockUnit}</td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '500', color: 'var(--text-primary)' }}>₹ {item.unitPrice}</td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <button onClick={() => openEdit(item)} style={{ padding: '8px', backgroundColor: '#D9F99D', color: '#4D7C0F', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><Edit size={18} /></button>
                                </td>
                                <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <button onClick={() => deleteItem(item._id)} style={{ padding: '8px', backgroundColor: '#FECACA', color: '#B91C1C', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} Entries
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

            {/* Add / Edit Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <h2 style={{ textAlign: 'center', margin: 0, color: '#111827' }}>
                            {isAddModalOpen ? 'Add Item' : 'Edit Item'}
                        </h2>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Item Name :</label>
                            <input type="text" placeholder="e.g., Siyaram or Canvas" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Category :</label>
                            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }}>
                                <option value="">Select Type</option>
                                <option value="Fabric">Fabric</option>
                                <option value="Material">Material</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Stock Quantity :</label>
                                <input type="number" placeholder="e.g., 10" value={newItem.stockQuantity} onChange={(e) => setNewItem({ ...newItem, stockQuantity: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Unit of Measure :</label>
                                <select value={newItem.unitOfMeasure} onChange={(e) => setNewItem({ ...newItem, unitOfMeasure: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }}>
                                    <option value="Meters">Meters</option>
                                    <option value="Pieces">Pieces</option>
                                    <option value="Boxes">Boxes</option>
                                    <option value="Spools">Spools (Thread)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Unit Price :</label>
                            <input type="number" placeholder="0.00" value={newItem.unitPrice} onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }} />
                        </div>

                        <button onClick={isAddModalOpen ? handleAdd : handleEditSave} style={{ padding: '12px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>
                            {isAddModalOpen ? 'Add' : 'Save Changes'}
                        </button>
                        <button onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }} style={{ padding: '12px', backgroundColor: 'transparent', color: '#4F46E5', border: '1px solid #4F46E5', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer' }}>Back</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryScreen;
