import api from './axiosConfig';

export const declarerBesoin = (data) =>
  api.post('/agent/besoins', data);

export const cloturerBesoin = (id) =>
  api.put(`/agent/besoins/${id}/cloturer`);

export const getBesoinsByPdi = (idPdi) =>
  api.get(`/agent/besoins/pdi/${idPdi}`);

export const enregistrerAide = (data) =>
  api.post('/agent/aides', data);
