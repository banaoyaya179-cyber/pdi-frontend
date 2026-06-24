import api from './axiosConfig';

export const creerMenage = (data) =>
  api.post('/agent/menages', data);

export const getMenageById = (id) =>
  api.get(`/agent/menages/${id}`);

export const designerChef = (idMenage, idPdi) =>
  api.put(`/agent/menages/${idMenage}/chef/${idPdi}`);
