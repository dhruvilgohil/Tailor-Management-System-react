import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

export const useAuthStore = create((set) => ({
    isAuthenticated: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null,

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            // Backend User model uses 'username' field. We use email as the username.
            const payload = {
                username: userData.email,
                password: userData.password,
                fullName: userData.fullName,
                shopName: userData.shopName,
            };
            const response = await axios.post(API_URL + 'register', payload);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            set({ isAuthenticated: true, user: response.data, isLoading: false, error: null });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to register'
            });
            return false;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            // Backend expects 'username' (we use email as the username)
            const response = await axios.post(API_URL + 'login', { username: email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            set({ isAuthenticated: true, user: response.data, isLoading: false, error: null });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Invalid email or password'
            });
            return false;
        }
    },

    loginWithGoogle: async (googleToken) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(API_URL + 'google', { googleToken });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            set({ isAuthenticated: true, user: response.data, isLoading: false, error: null });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Google login failed. Please use email/password login instead.'
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isAuthenticated: false, user: null, error: null });
    },

    setCredentials: (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ isAuthenticated: true, user: userData });
    },
}));
