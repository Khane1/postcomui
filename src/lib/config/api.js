// Inside lib/config/api.js [5]
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL || '';
const EPOSTA_URL = import.meta.env.VITE_APP_EPOSTA_URL || '';
const SHIPPING_URL = import.meta.env.VITE_APP_SHIPPING_URL || '';
const API_KEY = import.meta.env.VITE_APP_API_KEY || '';
const API_SECRET = import.meta.env.VITE_APP_API_SECRET || '';

const SKIP_REFRESH_ENDPOINTS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/set-password'
];

function shouldSkipRefresh(url) {
  if (!url) return false;
  return SKIP_REFRESH_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

export const publicApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true
});

export const authApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

export const integrationApi = axios.create({
  baseURL: `${EPOSTA_URL}/api/v1`
});

export const shippingApi = axios.create({
  baseURL: `${SHIPPING_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'api-key': API_KEY,
    'api-secret': API_SECRET
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// FIXED: Parses Bearer access_token from the "credentials" JSON object
const addTokenInterceptor = (config) => {
  if (typeof window !== 'undefined') {
    const credsStr = sessionStorage.getItem('credentials');
    if (credsStr) {
      try {
        const credentials = JSON.parse(credsStr);
        const token = credentials.access_token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("[Token Interceptor] Could not parse stored credentials object.", e);
      }
    }
  }
  return config;
};

authApi.interceptors.request.use(addTokenInterceptor, (err) => Promise.reject(err));
shippingApi.interceptors.request.use(addTokenInterceptor, (err) => Promise.reject(err));

// FIXED: Manages the auto-refresh loop using the nested refresh_token properties
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !shouldSkipRefresh(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return authApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let refreshToken = null;
        const credsStr = sessionStorage.getItem('credentials');
        if (credsStr) {
          const credentials = JSON.parse(credsStr);
          refreshToken = credentials.refresh_token;
        }

        const response = await publicApi.post('auth/refresh-token', { refresh_token: refreshToken });
        const { access_token, refresh_token } = response.data;
        
        if (access_token) {
          // Write updated credentials block back to sessionStorage
          const updatedCredentials = {
            access_token,
            refresh_token: refresh_token || refreshToken
          };
          sessionStorage.setItem('credentials', JSON.stringify(updatedCredentials));
          
          authApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          processQueue(null, access_token);
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          window.dispatchEvent(new Event('unauthorized-session'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);