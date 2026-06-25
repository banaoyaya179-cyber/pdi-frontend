import api from './axiosConfig';

export const getAllUtilisateurs = () => api.get('/admin/utilisateurs');
export const creerUtilisateur = (data) => api.post('/admin/utilisateurs', data);
export const toggleCompte = (id) => api.put(`/admin/utilisateurs/${id}/toggle`);
export const changerRole = (id, role) => api.put(`/admin/utilisateurs/${id}/role/${role}`);
