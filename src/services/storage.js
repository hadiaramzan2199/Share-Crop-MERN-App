// Persistent storage service using localStorage
class StorageService {
  constructor() {
    this.STORAGE_KEYS = {
      USER_FIELDS: 'sharecrop_user_fields',
      USER_ORDERS: 'sharecrop_user_orders',
      USER_RENTED_FIELDS: 'sharecrop_user_rented_fields',
      USER_COINS: 'sharecrop_user_coins',
      CURRENT_USER: 'sharecrop_current_user',
      FARMER_CREATED_FIELDS: 'sharecrop_farmer_fields',
      FARM_ORDERS: 'sharecrop_farm_orders',
      USER_NOTIFICATIONS: 'sharecrop_user_notifications'
    };
  }
}

export const storageService = new StorageService();
Object.assign(storageService, {
  // Generic storage methods
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Farm-specific storage
  saveFarms: (farms) => {
    storageService.setItem('farms', farms);
  },

  getFarms: () => {
    return storageService.getItem('farms', []);
  },

  addFarm: (farm) => {
    const farms = storageService.getFarms();
    const newFarm = {
      ...farm,
      id: Date.now(),
      created_at: new Date().toISOString(),
      owner_id: getCurrentUserId()
    };
    farms.push(newFarm);
    storageService.saveFarms(farms);
    return newFarm;
  },

  // Field-specific storage
  saveFields: (fields) => {
    storageService.setItem('fields', fields);
  },

  getFields: () => {
    return storageService.getItem('fields', []);
  },

  addField: (field) => {
    const fields = storageService.getFields();
    const newField = {
      ...field,
      id: Date.now(),
      created_at: new Date().toISOString(),
      owner_id: getCurrentUserId()
    };
    fields.push(newField);
    storageService.saveFields(fields);
    return newField;
  },

  updateField: (updatedField) => {
    const fields = storageService.getFields();
    const fieldIndex = fields.findIndex(field => field.id === updatedField.id);
    if (fieldIndex !== -1) {
      fields[fieldIndex] = { ...fields[fieldIndex], ...updatedField };
      storageService.saveFields(fields);
      return fields[fieldIndex];
    }
    return null;
  },

  // Product-specific storage
  saveProducts: (products) => {
    storageService.setItem('products', products);
  },

  getProducts: () => {
    return storageService.getItem('products', []);
  },

  addProduct: (product) => {
    const products = storageService.getProducts();
    const newProduct = {
      ...product,
      id: Date.now(),
      created_at: new Date().toISOString(),
      owner_id: getCurrentUserId()
    };
    products.push(newProduct);
    storageService.saveProducts(products);
    return newProduct;
  },

  // Order-specific storage
  saveOrders: (orders) => {
    storageService.setItem('orders', orders);
  },

  getOrders: () => {
    return storageService.getItem('orders', []);
  },

  addOrder: (order) => {
    const orders = storageService.getOrders();
    const newOrder = {
      ...order,
      id: Date.now(),
      created_at: new Date().toISOString(),
      buyer_id: getCurrentUserId(),
      status: 'active'
    };
    orders.push(newOrder);
    storageService.saveOrders(orders);
    return newOrder;
  },

  // Rented fields storage
  saveRentedFields: (rentedFields) => {
    storageService.setItem('rentedFields', rentedFields);
  },

  getRentedFields: () => {
    return storageService.getItem('rentedFields', []);
  },

  addRentedField: (rentedField) => {
    const rentedFields = storageService.getRentedFields();
    const newRentedField = {
      ...rentedField,
      id: Date.now(),
      rented_at: new Date().toISOString(),
      renter_id: getCurrentUserId()
    };
    rentedFields.push(newRentedField);
    storageService.saveRentedFields(rentedFields);
    return newRentedField;
  },

  // User-specific data filtering
  getUserFarms: (userId = null) => {
    const currentUserId = userId || getCurrentUserId();
    return storageService.getFarms().filter(farm => farm.owner_id === currentUserId);
  },

  getUserFields: (userId = null) => {
    const currentUserId = userId || getCurrentUserId();
    return storageService.getFields().filter(field => field.owner_id === currentUserId);
  },

  getUserProducts: (userId = null) => {
    const currentUserId = userId || getCurrentUserId();
    return storageService.getProducts().filter(product => product.owner_id === currentUserId);
  },

  getUserOrders: (userId = null) => {
    const currentUserId = userId || getCurrentUserId();
    return storageService.getOrders().filter(order => order.buyer_id === currentUserId);
  },

  getUserRentedFields: (userId = null) => {
    const currentUserId = userId || getCurrentUserId();
    return storageService.getRentedFields().filter(field => field.renter_id === currentUserId);
  },

  // Farm orders (orders for farmer's products)
  getFarmOrders: (userId = null) => {
    const currentUserId = userId || getCurrentUserId();
    const userProducts = storageService.getUserProducts(currentUserId);
    const productIds = userProducts.map(p => p.id);
    return storageService.getOrders().filter(order => productIds.includes(order.product_id));
  },

  // User authentication methods
  setCurrentUser: (user) => {
    storageService.setItem(storageService.STORAGE_KEYS.CURRENT_USER, user);
  },

  getCurrentUser: () => {
    return storageService.getItem(storageService.STORAGE_KEYS.CURRENT_USER);
  },

  // Test users for development
  getTestUsers: () => {
    return {
      farmer: {
        id: 'farmer_001',
        email: 'farmer@test.com',
        password: 'farmer123',
        type: 'farmer',
        name: 'John Farmer'
      },
      buyer: {
        id: 'buyer_001', 
        email: 'buyer@test.com',
        password: 'buyer123',
        type: 'buyer',
        name: 'Jane Buyer'
      }
    };
  },

  // Farmer-created fields methods
  addFarmerField: (field) => {
    const currentUser = storageService.getCurrentUser();
    if (!currentUser || currentUser.type !== 'farmer') return false;
    
    const farmerFields = storageService.getItem(storageService.STORAGE_KEYS.FARMER_CREATED_FIELDS) || [];
    const newField = {
      ...field,
      id: `farmer_field_${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      createdAt: new Date().toISOString(),
      isAvailable: true
    };
    
    farmerFields.push(newField);
    storageService.setItem(storageService.STORAGE_KEYS.FARMER_CREATED_FIELDS, farmerFields);
    return newField;
  },

  getFarmerCreatedFields: () => {
    return storageService.getItem(storageService.STORAGE_KEYS.FARMER_CREATED_FIELDS) || [];
  },

  // Farm orders methods (orders placed by buyers to farmers)
  addFarmOrder: (order) => {
    const farmOrders = storageService.getItem(storageService.STORAGE_KEYS.FARM_ORDERS) || [];
    const newOrder = {
      ...order,
      id: `farm_order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    farmOrders.push(newOrder);
    storageService.setItem(storageService.STORAGE_KEYS.FARM_ORDERS, farmOrders);
    
    // Add notification for farmer
    storageService.addNotification(order.farmerId, {
      type: 'new_order',
      message: `New order received from ${order.buyerName}`,
      orderId: newOrder.id,
      fieldName: order.fieldName
    });
    
    return newOrder;
  },

  getFarmOrders: (farmerId = null) => {
    const farmOrders = storageService.getItem(storageService.STORAGE_KEYS.FARM_ORDERS) || [];
    if (farmerId) {
      return farmOrders.filter(order => order.farmerId === farmerId);
    }
    return farmOrders;
  },

  // Notification methods
  addNotification: (userId, notification) => {
    const notifications = storageService.getItem(storageService.STORAGE_KEYS.USER_NOTIFICATIONS) || {};
    if (!notifications[userId]) {
      notifications[userId] = [];
    }
    
    const newNotification = {
      ...notification,
      id: `notification_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    notifications[userId].push(newNotification);
    storageService.setItem(storageService.STORAGE_KEYS.USER_NOTIFICATIONS, notifications);
    return newNotification;
  },

  getUserNotifications: (userId) => {
    const notifications = storageService.getItem(storageService.STORAGE_KEYS.USER_NOTIFICATIONS) || {};
    return notifications[userId] || [];
  },

  markNotificationAsRead: (userId, notificationId) => {
    const notifications = storageService.getItem(storageService.STORAGE_KEYS.USER_NOTIFICATIONS) || {};
    if (notifications[userId]) {
      const notification = notifications[userId].find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        storageService.setItem(storageService.STORAGE_KEYS.USER_NOTIFICATIONS, notifications);
      }
    }
  },

  // Clear all stored data
  clearAll: () => {
    Object.values(storageService.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
});

// Helper function to get current user ID
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

export default storageService;