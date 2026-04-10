import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/measurements';

export const useMeasurementStore = create((set) => ({
    measurements: [],
    isLoading: false,
    error: null,

    fetchMeasurements: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(API_URL);
            set({ measurements: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error fetching measurements', isLoading: false });
        }
    },

    saveMeasurement: async (measurementData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(API_URL, measurementData);
            set((state) => ({ measurements: [response.data, ...state.measurements], isLoading: false }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error saving measurement', isLoading: false });
        }
    },

    updateMeasurement: async (id, updatedData) => {
        set({ isLoading: true });
        try {
            const response = await axios.put(`${API_URL}/${id}`, updatedData);
            set((state) => ({
                measurements: state.measurements.map(m => m._id === id ? response.data : m),
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error updating measurement', isLoading: false });
        }
    },

    deleteMeasurement: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            set((state) => ({
                measurements: state.measurements.filter(m => m._id !== id)
            }));
        } catch (error) {
            console.error('Error deleting measurement:', error);
        }
    }
}));
