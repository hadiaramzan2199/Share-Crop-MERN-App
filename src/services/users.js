import api from './api';

export const userService = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Change password
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  
  // Get farm coins balance
  getBalance: () => api.get('/users/balance'),
  
  // Get transaction history
  getTransactions: (params) => api.get('/users/transactions', { params }),
  
  // Add farm coins (deposit)
  deposit: (amount) => api.post('/users/deposit', { amount }),
};