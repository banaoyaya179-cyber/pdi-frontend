import api from './axiosConfig';

export const enrolerPdi = (data) =>
  api.post('/agent/pdi', data);

export const getPdiById = (id) =>
  api.get(`/agent/pdi/${id}`);

export const rechercherPdi = (params) =>
  api.get('/agent/pdi', { params });

export const mettreAJourPdi = (id, data) =>
  api.put(`/agent/pdi/${id}`, data);

export const supprimerPdi = (id) =>
  api.delete(`/agent/pdi/${id}`);
