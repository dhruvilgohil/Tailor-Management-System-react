import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/income';

export const useIncomeStore = create((set) => ({
    transactions: [],
    isLoading: false,
    error: null,

    fetchIncome: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(API_URL);
            set({ transactions: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error fetching income', isLoading: false });
        }
    },

    addIncome: async (incomeData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(API_URL, incomeData);
            set((state) => ({ transactions: [response.data, ...state.transactions], isLoading: false }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error adding income', isLoading: false });
        }
    }
}));
