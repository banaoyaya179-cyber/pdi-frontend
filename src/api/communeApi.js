import api from './axiosConfig';
export const getAllCommunes = () => api.get('/admin/communes');
