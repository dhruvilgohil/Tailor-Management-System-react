import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './presentation/App.jsx';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Add a request interceptor to inject the token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '166296830142-ntm847ldhagp3phlc4dlt30l13dr4f5f.apps.googleusercontent.com'}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
