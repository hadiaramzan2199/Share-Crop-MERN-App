import api from './api';

export const productService = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getAvailableProducts: (params) => api.get('/products/marketplace/available', { params }),
  getProductsByField: (fieldId) => api.get(`/products/field/${fieldId}`),
  getProductsByLocation: (lat, lng, radius = 50) => 
    api.get('/products/nearby', { params: { lat, lng, radius } }),
};