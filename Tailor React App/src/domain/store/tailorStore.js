import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tailors';

export const useTailorStore = create((set) => ({
    tailors: [],
    isLoading: false,
    error: null,

    fetchTailors: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(API_URL);
            set({ tailors: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error fetching tailors', isLoading: false });
        }
    },

    addTailor: async (tailorData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(API_URL, tailorData);
            set((state) => ({ tailors: [response.data, ...state.tailors], isLoading: false }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error adding tailor', isLoading: false });
            throw error;
        }
    },

    updateTailor: async (id, tailorData) => {
        set({ isLoading: true });
        try {
            const response = await axios.put(`${API_URL}/${id}`, tailorData);
            set((state) => ({
                tailors: state.tailors.map(t => t._id === id ? response.data : t),
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error updating tailor', isLoading: false });
            throw error;
        }
    },

    deleteTailor: async (id) => {
        set({ isLoading: true });
        try {
            await axios.delete(`${API_URL}/${id}`);
            set((state) => ({
                tailors: state.tailors.filter(t => t._id !== id),
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error deleting tailor', isLoading: false });
        }
    }
}));
