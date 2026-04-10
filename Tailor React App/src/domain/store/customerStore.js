import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/customers/';

export const useCustomerStore = create((set) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(API_URL);
      set({ customers: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addCustomer: async (customer) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(API_URL, customer);
      set((state) => ({
        customers: [data, ...state.customers],
        isLoading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(API_URL + id);
      set((state) => ({
        customers: state.customers.filter(c => c._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateCustomer: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.put(API_URL + id, updatedData);
      set((state) => ({
        customers: state.customers.map(c => (c._id === id ? data : c)),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));
