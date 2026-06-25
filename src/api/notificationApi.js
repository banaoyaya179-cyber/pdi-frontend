import api from './axiosConfig';

export const getNonLues = () => api.get('/notifications/non-lues');
export const getToutes = () => api.get('/notifications/toutes');
export const getCount = () => api.get('/notifications/count');
export const marquerLue = (id) => api.put(`/notifications/${id}/lue`);
export const marquerToutesLues = () => api.put('/notifications/toutes-lues');
