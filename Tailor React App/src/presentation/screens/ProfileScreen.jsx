import React, { useState } from 'react';
import { useAuthStore } from '../../domain/store/authStore';
import { UserCircle, Mail, Briefcase, Calendar, CheckCircle, Edit3 } from 'lucide-react';
import axios from 'axios';

const ProfileScreen = () => {
    const user = useAuthStore(state => state.user);
    const setCredentials = useAuthStore(state => state.setCredentials);

    // Local State for Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: user?.fullName || '',
        shopName: user?.shopName || ''
    });

    // Status Trackers
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        if (!editForm.fullName || !editForm.shopName) {
            setMessage('Full Name and Shop Name cannot be empty.');
            return;
        }

        try {
            setIsSaving(true);
            setMessage('');

            // Assume the backend is running on 5000 based on previous configurations
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/auth/profile', editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update Zustand Store correctly
            setCredentials(response.data.user, token);
            setIsEditing(false);
            setMessage('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>

            {/* Header / Avatar Section */}
            <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                    zIndex: 0
                }} />

                <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 1,
                    marginTop: '40px'
                }}>
                    <UserCircle size={80} color="#4F46E5" strokeWidth={1.5} />
                </div>

                <div style={{ zIndex: 1, marginTop: '50px', flex: 1 }}>
                    <h1 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '800' }}>
                        {user?.fullName || 'Tailor Name'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563', fontSize: '16px', fontWeight: '500' }}>
                        <Briefcase size={18} />
                        {user?.shopName || 'Shop Name'}
                    </div>
                </div>

                <div style={{ zIndex: 1, marginTop: '50px' }}>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                backgroundColor: 'var(--surface)',
                                color: '#4F46E5',
                                border: '1px solid #E0E7FF',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '15px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <Edit3 size={18} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Alert Message */}
            {message && (
                <div style={{
                    padding: '16px',
                    backgroundColor: message.includes('success') ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${message.includes('success') ? '#A7F3D0' : '#FECACA'}`,
                    borderRadius: '8px',
                    color: message.includes('success') ? '#065F46' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                }}>
                    <CheckCircle size={20} />
                    {message}
                </div>
            )}

            {/* User Details Grid */}
            <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                    Personal Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                            Full Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #6366F1',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    color: '#111827',
                                    fontWeight: '500'
                                }}
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#111827', fontWeight: '500', padding: '12px 0' }}>
                                <UserCircle size={20} color="#9CA3AF" />
                                {user?.fullName}
                            </div>
                        )}
                    </div>

                    {/* Shop Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                            Shop Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.shopName}
                                onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #6366F1',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    color: '#111827',
                                    fontWeight: '500'
                                }}
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#111827', fontWeight: '500', padding: '12px 0' }}>
                                <Briefcase size={20} color="#9CA3AF" />
                                {user?.shopName}
                            </div>
                        )}
                    </div>

                    {/* Email (Read Only - Typically tied to auth identity) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                            Email Address (Login ID)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#6B7280', fontWeight: '500', padding: '12px 0', backgroundColor: '#F9FAFB', borderRadius: '8px', paddingLeft: '16px' }}>
                            <Mail size={20} color="#9CA3AF" />
                            {user?.email}
                        </div>
                    </div>

                    {/* Member Since (Read Only) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                            Member Since
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#111827', fontWeight: '500', padding: '12px 0' }}>
                            <Calendar size={20} color="#9CA3AF" />
                            {/* Assuming createdAt is populated. Defaulting if not loaded yet */}
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently Joined'}
                        </div>
                    </div>
                </div>

                {/* Edit Controls */}
                {isEditing && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: '#4F46E5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '16px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditForm({ fullName: user?.fullName, shopName: user?.shopName });
                            }}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: 'transparent',
                                color: '#4B5563',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProfileScreen;
