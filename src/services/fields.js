import api from './api';

export const fieldService = {
  getFields: () => api.get('/fields'),
  getField: (id) => api.get(`/fields/${id}`),
  createField: (fieldData) => api.post('/fields', fieldData),
  updateField: (id, fieldData) => api.put(`/fields/${id}`, fieldData),
  deleteField: (id) => api.delete(`/fields/${id}`),
  getAllFields: () => api.get('/fields/all'),
};