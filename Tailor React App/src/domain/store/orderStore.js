import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

export const useOrderStore = create((set) => ({
    orders: [],
    filterStatus: 'All Orders', // Pending, On Working, Complete
    isLoading: false,
    error: null,

    setFilterStatus: (status) => set({ filterStatus: status }),

    fetchOrders: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(API_URL);
            set({ orders: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error fetching orders', isLoading: false });
        }
    },

    createOrder: async (orderData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(API_URL, orderData);
            set((state) => ({ orders: [response.data, ...state.orders], isLoading: false }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error creating order', isLoading: false });
        }
    },

    updateOrderStatus: async (id, newStatus) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, { status: newStatus });
            set((state) => ({
                orders: state.orders.map(order => order._id === id ? response.data : order)
            }));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    },

    updateOrder: async (id, updatedData) => {
        set({ isLoading: true });
        try {
            const response = await axios.put(`${API_URL}/${id}`, updatedData);
            set((state) => ({
                orders: state.orders.map(order => order._id === id ? response.data : order),
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error updating order', isLoading: false });
        }
    },

    deleteOrder: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            set((state) => ({
                orders: state.orders.filter(order => order._id !== id)
            }));
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    }
}));
