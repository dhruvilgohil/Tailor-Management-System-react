import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../domain/store/authStore';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainLayout from './layouts/MainLayout';
import DashboardScreen from './screens/DashboardScreen';
import OrdersScreen from './screens/OrdersScreen';
import CustomersScreen from './screens/CustomersScreen';
import InventoryScreen from './screens/InventoryScreen';
import IncomeScreen from './screens/IncomeScreen';
import MeasurementScreen from './screens/MeasurementScreen';
import TailorsScreen from './screens/TailorsScreen';
import ProfileScreen from './screens/ProfileScreen';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />

                {/* Protected Routes via Layout */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardScreen />} />
                    <Route path="orders" element={<OrdersScreen />} />
                    <Route path="customers" element={<CustomersScreen />} />
                    <Route path="inventory" element={<InventoryScreen />} />
                    <Route path="income" element={<IncomeScreen />} />
                    <Route path="appointment" element={<MeasurementScreen />} />
                    <Route path="tailors" element={<TailorsScreen />} />
                    <Route path="profile" element={<ProfileScreen />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
