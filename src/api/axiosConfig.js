import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur requête — injecte le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pdi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponse — gère l'expiration du token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('pdi_token');
      localStorage.removeItem('pdi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
