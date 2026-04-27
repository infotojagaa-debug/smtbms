import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import App from './App.jsx'
import { store } from './redux/store'
import './index.css'

// Global configuration for raw axios instances across all un-migrated components
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.interceptors.request.use((config) => {
  try {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (error) {
    console.error('Global Axios Interceptor Error:', error);
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
