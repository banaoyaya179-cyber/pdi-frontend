import api from './axiosConfig';

export const getAllSites = () =>
  api.get('/agent/sites');

export const getSiteById = (id) =>
  api.get(`/agent/sites/${id}`);

export const creerSite = (data) =>
  api.post('/agent/sites', data);
