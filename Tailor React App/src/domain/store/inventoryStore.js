import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/inventory';

export const useInventoryStore = create((set) => ({
    items: [],
    isLoading: false,
    error: null,

    fetchItems: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(API_URL);
            set({ items: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error fetching inventory', isLoading: false });
        }
    },

    addItem: async (itemData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(API_URL, itemData);
            set((state) => ({ items: [...state.items, response.data], isLoading: false }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error adding inventory item', isLoading: false });
        }
    },

    deleteItem: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            set((state) => ({
                items: state.items.filter(item => item._id !== id)
            }));
        } catch (error) {
            console.error('Error deleting inventory item:', error);
        }
    },

    updateItem: async (id, itemData) => {
        set({ isLoading: true });
        try {
            const response = await axios.put(`${API_URL}/${id}`, itemData);
            set((state) => ({
                items: state.items.map(item => (item._id === id ? response.data : item)),
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error updating inventory item', isLoading: false });
        }
    }
}));
