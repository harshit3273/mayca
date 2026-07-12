import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(sessionStorage.getItem('ca_user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if we are already on the auth pages (login/register)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        sessionStorage.removeItem('ca_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
