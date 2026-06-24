import api from './axiosConfig';

export const login = (email, motDePasse) =>
  api.post('/auth/login', { email, motDePasse });

export const getMe = () =>
  api.get('/auth/me');
