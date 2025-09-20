import { mockAuthService } from './mockServices';

// Use mock services for development since there's no backend
export const authService = {
  login: (email, password) => mockAuthService.login({ email, password }),
  register: (userData) => mockAuthService.register(userData),
  getProfile: () => mockAuthService.getProfile(),
  updateProfile: (userData) => mockAuthService.updateProfile(userData),
  changePassword: (passwordData) => mockAuthService.changePassword(passwordData),
};