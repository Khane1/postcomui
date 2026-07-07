// lib/config/api.js
import axios from 'axios';

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

// Map relative paths to hit SvelteKit server endpoints directly
export const publicApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true
});

export const authApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

export const integrationApi = axios.create({
  baseURL: '/api/v1/eposta',
  withCredentials: true
});

export const shippingApi = axios.create({
  baseURL: '/api/v1/shipping',
  withCredentials: true
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

        const response = await publicApi.post('/auth/refresh-token', { refresh_token: refreshToken });
        const { access_token, refresh_token } = response.data;
        
        if (access_token) {
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