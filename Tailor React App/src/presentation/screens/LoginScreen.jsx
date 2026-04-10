import React, { useState } from 'react';
import { useAuthStore } from '../../domain/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = useAuthStore(state => state.login);
    const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
    const isLoading = useAuthStore(state => state.isLoading);
    const error = useAuthStore(state => state.error);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
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
                    margin: 0
                }}>
                    Tailor Management
                </h1>
            </div>

            {/* Right Login Pane */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    backgroundColor: 'var(--bg-base)',
                    padding: 'var(--spacing-2xl)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                            Welcome Back
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
                            login your account
                        </p>
                    </div>

                    {error && (
                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)', textAlign: 'center', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)', fontWeight: '500' }}>
                                Email :
                            </label>
                            <input
                                type="email"
                                placeholder="Enter Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-md)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-base)',
                                    outline: 'none',
                                    transition: 'border-color var(--motion-fast)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)', fontWeight: '500' }}>
                                Password :
                            </label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-md)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-base)',
                                    outline: 'none',
                                    transition: 'border-color var(--motion-fast)'
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
                                transition: 'background-color var(--motion-fast)'
                            }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
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
                                    console.error('Login Failed');
                                }}
                                useOneTap
                            />
                        </div>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#4F46E5', fontWeight: '500', textDecoration: 'none' }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
