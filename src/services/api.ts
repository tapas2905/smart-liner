import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store';
import { setLogout } from '../store/userSlice';

 const apiBaseUrl = process.env.REACT_APP_API_BASE_URL ?? "";
// Create a custom Axios instance
const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    console.error('Response Interceptor Error:', error.response);

    // Global error handling for 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - redirecting to login.');
      store.dispatch(setLogout());
    }

    if (error.response && error.response.status >= 500) {
        console.error('Server error encountered.');
    }

    return Promise.reject(error);
  }
);

export default api;