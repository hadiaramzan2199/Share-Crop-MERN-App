import api from './api';

export const orderService = {
  // Create a new order
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Get orders for buyer
  getBuyerOrders: () => api.get('/orders/my-orders'),
  
  // Get orders for farmer
  getFarmerOrders: () => api.get('/orders/farmer-orders'),
  
  // Update order status
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  
  // Get specific order details
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Cancel order
  cancelOrder: (id) => api.delete(`/orders/${id}`),
};