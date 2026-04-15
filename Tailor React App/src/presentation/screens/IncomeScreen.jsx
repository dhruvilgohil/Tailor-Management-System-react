import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Wallet, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIncomeStore } from '../../domain/store/incomeStore';
import { useSearchStore } from '../../domain/store/searchStore';

const IncomeScreen = () => {
    const { transactions, fetchIncome, addIncome, updateIncome, deleteIncome } = useIncomeStore();
    const { searchQuery } = useSearchStore();
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    // New Income State (matches backend model)
    const [newIncome, setNewIncome] = useState({ customerName: '', paymentMethod: '', date: '', amount: '' });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchIncome();
    }, [fetchIncome]);

    // Reset page to 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleAdd = () => {
        if (newIncome.customerName && newIncome.amount) {
            addIncome(newIncome);
            setAddModalOpen(false);
            setNewIncome({ customerName: '', paymentMethod: '', date: '', amount: '' });
        }
    };

    const handleEditSave = async () => {
        if (newIncome.customerName && newIncome.amount && editingId) {
            await updateIncome(editingId, newIncome);
            setEditModalOpen(false);
            setNewIncome({ customerName: '', paymentMethod: '', date: '', amount: '' });
            setEditingId(null);
        }
    };

    const openEdit = (transaction) => {
        setNewIncome({
            customerName: transaction.customerName,
            paymentMethod: transaction.paymentMethod,
            date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
            amount: transaction.amount
        });
        setEditingId(transaction._id);
        setEditModalOpen(true);
    };

    // Calculate dynamic incomes
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7); // 'YYYY-MM'

    let todayTotal = 0;
    let monthTotal = 0;
    let grandTotal = 0;

    transactions.forEach(txn => {
        const amount = Number(txn.amount) || 0;
        grandTotal += amount;

        // Safety check if date exists
        if (txn.date) {
            // Because txn.date might be an ISO string like "2026-02-24T00:00:00.000Z" from MongoDB, parse it.
            const txnDate = txn.date.split('T')[0];

            if (txnDate === today) {
                todayTotal += amount;
            }
            if (txnDate.startsWith(currentMonth)) {
                monthTotal += amount;
            }
        }
    });

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const name = (t.customerName || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return name.includes(sq);
    });

    // Calculate generic pagination variables
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
            {/* Top Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-xl)'
            }}>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#BAE6FD', color: '#0284C7', borderRadius: 'var(--radius-md)' }}>
                        <CalendarIcon size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: 'var(--text-lg)', margin: '0 0 var(--spacing-xs) 0' }}>Today Income</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>₹ {todayTotal.toLocaleString()}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#A7F3D0', color: '#059669', borderRadius: 'var(--radius-md)' }}>
                        <CalendarIcon size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: 'var(--text-lg)', margin: '0 0 var(--spacing-xs) 0' }}>This Month</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>₹ {monthTotal.toLocaleString()}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FECACA', color: '#DC2626', borderRadius: 'var(--radius-md)' }}>
                        <Wallet size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: 'var(--text-lg)', margin: '0 0 var(--spacing-xs) 0' }}>Total Income</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>₹ {grandTotal.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* action bar */}
            <div>
                <button
                    onClick={() => { setNewIncome({ customerName: '', paymentMethod: '', date: '', amount: '' }); setAddModalOpen(true); }}
                    style={{ padding: 'var(--spacing-md) var(--spacing-xl)', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: '500' }}>
                    Add Income
                </button>
            </div>

            {/* Income List */}
            <div style={{ backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Customer Name</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Payment Method</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Date</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'right', fontWeight: '600', paddingRight: '48px', color: 'var(--text-primary)' }}>Amount</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Edit</th>
                            <th style={{ padding: 'var(--spacing-xl)', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTransactions.map((inc) => {
                            const displayDate = typeof inc.date === 'string'
                                ? inc.date.split('T')[0]
                                : new Date(inc.date).toLocaleDateString('en-GB');

                            return (
                                <tr key={inc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: 'var(--spacing-xl)', color: 'var(--text-primary)' }}>{inc.customerName}</td>
                                    <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 16px',
                                            borderRadius: 'var(--radius-full)',
                                            backgroundColor: inc.paymentMethod === 'Online' ? '#C7D2FE' : '#A7F3D0',
                                            color: inc.paymentMethod === 'Online' ? '#4338CA' : '#047857',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: '500'
                                        }}>
                                            {inc.paymentMethod}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-primary)' }}>{displayDate}</td>
                                    <td style={{ padding: 'var(--spacing-xl)', textAlign: 'right', fontWeight: '500', paddingRight: '48px', color: 'var(--text-primary)' }}>₹ {inc.amount}</td>
                                    <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                        <button onClick={() => openEdit(inc)} style={{ padding: '8px', backgroundColor: '#D9F99D', color: '#4D7C0F', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><Edit size={18} /></button>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                        <button onClick={() => deleteIncome(inc._id)} style={{ padding: '8px', backgroundColor: '#FECACA', color: '#B91C1C', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} Entries
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
                            {isAddModalOpen ? 'Add Income' : 'Edit Income'}
                        </h2>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Customer Name :</label>
                            <input type="text" placeholder="e.g., Jonathan Streling" value={newIncome.customerName} onChange={(e) => setNewIncome({ ...newIncome, customerName: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Payment Method :</label>
                            <select value={newIncome.paymentMethod} onChange={(e) => setNewIncome({ ...newIncome, paymentMethod: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }}>
                                <option value="">Select Type</option>
                                <option value="Cash">Cash</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Date :</label>
                                <input type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Amount :</label>
                                <input type="number" placeholder="0.00" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', color: '#111827' }} />
                            </div>
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

export default IncomeScreen;
