import api from './axiosConfig';

export const login = (email, motDePasse) =>
  api.post('/auth/login', { email, motDePasse });

export const verify2FA = (email, code) =>
  api.post('/auth/verify-2fa', { email, code });

export const setup2FA = () =>
  api.post('/auth/setup-2fa');

export const activate2FA = (code) =>
  api.post('/auth/activate-2fa', { code });

export const disable2FA = () =>
  api.post('/auth/disable-2fa');

export const getMe = () =>
  api.get('/auth/me');
