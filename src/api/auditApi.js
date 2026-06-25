import api from './axiosConfig';

export const getAuditLogs = (params) => api.get('/admin/audit', { params });
