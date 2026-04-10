import React, { useState } from 'react';
import { useAuthStore } from '../../domain/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const RegisterScreen = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        shopName: ''
    });

    const [errorText, setErrorText] = useState('');

    const register = useAuthStore(state => state.register);
    const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
    const isLoading = useAuthStore(state => state.isLoading);
    const error = useAuthStore(state => state.error);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.fullName || !formData.shopName) {
            setErrorText('Please fill in all fields');
            return;
        }

        setErrorText('');
        const success = await register(formData);

        if (success) {
            navigate('/dashboard');
        } else {
            setErrorText(useAuthStore.getState().error || 'Registration failed');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: 'var(--bg-base)'
        }}>
            {/* Left Blue Pane */}
            <div style={{
                flex: 1,
                backgroundColor: '#6366F1', // Indigo matched from design
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-2xl)'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: '600',
                    margin: 0,
                    textAlign: 'center'
                }}>
                    Tailor Management <br /> System
                </h1>
            </div>

            {/* Right Register Pane */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface)',
                padding: 'var(--spacing-2xl)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '520px',
                    backgroundColor: 'var(--bg-base)',
                    padding: 'var(--spacing-2xl)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                            Create an Account
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
                            Register your Tailor Shop
                        </p>
                    </div>

                    {(errorText || error) && (
                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)', textAlign: 'center', fontWeight: '500' }}>
                            {errorText || error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)', fontWeight: '500' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="e.g. Able Tailor"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--text-base)',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)', fontWeight: '500' }}>
                                    Shop Name *
                                </label>
                                <input
                                    type="text"
                                    name="shopName"
                                    placeholder="e.g. Able Men's Wear"
                                    value={formData.shopName}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--text-base)',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)', fontWeight: '500' }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g. hello@tailor.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-md)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-base)',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)', fontWeight: '500' }}>
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-md)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-base)',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: 'var(--spacing-md)',
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                backgroundColor: '#818CF8', // Match the lighter purple button color
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-base)',
                                fontWeight: '500',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                transition: 'all var(--motion-fast)'
                            }}
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--spacing-md) 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                            <span style={{ margin: '0 10px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    const success = await loginWithGoogle(credentialResponse.credential);
                                    if (success) {
                                        navigate('/dashboard');
                                    }
                                }}
                                onError={() => {
                                    console.error('Registration/Login Failed');
                                }}
                            />
                        </div>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link to="/login" style={{ color: '#4F46E5', fontWeight: '500', textDecoration: 'none' }}>Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
