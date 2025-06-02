import axios from 'axios';

// Base URL for API
axios.defaults.baseURL = 'http://localhost:5000';

// Include credentials in requests (needed for cookies)
axios.defaults.withCredentials = true;

// Add a response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors globally
    if (error.response?.status === 401) {
      // If we're not already on the login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;