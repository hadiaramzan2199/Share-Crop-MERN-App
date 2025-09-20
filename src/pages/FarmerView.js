import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import EnhancedFarmMap from '../components/Map/EnhancedFarmMap';
import AddFieldForm from '../components/Forms/AddFieldForm';
import { storageService } from '../services/storage';
import EnhancedHeader from '../components/Layout/EnhancedHeader';
import NotificationSystem from '../components/Notification/NotificationSystem';
import CreateFieldForm from '../components/Forms/CreateFieldForm';
import AddFarmForm from '../components/Forms/AddFarmForm';
import useNotifications from '../hooks/useNotifications';
import { cachedReverseGeocode } from '../utils/geocoding';
import RentedFields from './RentedFields';
import MyFarms from './MyFarms';
import Orders from './Orders';
import FarmOrders from './FarmOrders';
import LicenseInfo from './LicenseInfo';
import Transaction from './Transaction';
import Profile from './Profile';
import Messages from './Messages';
import ChangeCurrency from './ChangeCurrency';
import Settings from './Settings';

const FarmerView = ({ user, onLogout }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [farmerFields, setFarmerFields] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { notifications: hookNotifications, addNotification, removeNotification } = useNotifications();

  // Load farmer data on component mount
  useEffect(() => {
    const currentUser = storageService.getCurrentUser();
    if (!currentUser) {
      // Set test farmer user for development
      const testUsers = storageService.getTestUsers();
      storageService.setCurrentUser(testUsers.farmer);
    }
    
    // Load farmer's fields and notifications
    loadFarmerData();
    
    // Load farms from storage
    loadFarmsData();
    
    // Load all fields (including created fields) from storage
    loadAllFieldsFromStorage();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadFarmerData, 5000);
    return () => clearInterval(interval);
  }, [addNotification]);

  const loadFarmsData = () => {
    const savedFarms = storageService.getFarms();
    setFarmsList(savedFarms);
  };

  const loadAllFieldsFromStorage = async () => {
    // Load all fields from storage including farmer-created fields
    const storedFields = storageService.getFields(); // Use getFields instead of getAllFields
    const farmerCreatedFields = storageService.getFarmerCreatedFields();
    
    // Load mock data for demo purposes
    let mockFields = [];
    try {
      const { mockProductService } = await import('../services/mockServices');
      const response = await mockProductService.getProducts();
      mockFields = response.data.products || [];
    } catch (error) {
      console.error('Failed to load mock data:', error);
    }
    
    // Combine all fields (mock data + stored fields + farmer-created fields)
    const allFields = [...mockFields, ...storedFields, ...farmerCreatedFields];
    
    // Set the farms state with all fields
    setFarms(allFields);
  };

  const loadFarmerData = () => {
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      const fields = storageService.getFarmerCreatedFields();
      const userFields = fields.filter(field => field.farmerId === currentUser.id);
      setFarmerFields(userFields);
      
      const userNotifications = storageService.getUserNotifications(currentUser.id);
      const unreadNotifications = userNotifications.filter(n => !n.read);
      
      // Show unread notifications
      unreadNotifications.forEach(notification => {
        addNotification(notification.message, 'info', 8000);
        // Mark as read after showing
        storageService.markNotificationAsRead(currentUser.id, notification.id);
      });
      
      setNotifications(userNotifications);
    }
  };

  const handleFieldAdded = (newField) => {
    setFarmerFields(prev => [...prev, newField]);
    setShowAddFieldForm(false);
    loadFarmerData(); // Refresh data
  };

  const [farms, setFarms] = useState([]);
  const [farmerCoins, setFarmerCoins] = useState(1250);
  const [editingField, setEditingField] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [createFieldOpen, setCreateFieldOpen] = useState(false);
  const [createFarmOpen, setCreateFarmOpen] = useState(false);
  const [farmsList, setFarmsList] = useState([]);
  const mapRef = useRef(null);
  const isMapPage = location.pathname === '/farmer' || location.pathname === '/farmer/';
  const isMessagesPage = location.pathname === '/farmer/messages';
  const isCurrencyPage = location.pathname === '/farmer/currency';
  const isSettingsPage = location.pathname === '/farmer/settings';

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleFarmSelect = (farm) => {
    if (mapRef.current && mapRef.current.zoomToFarm) {
      mapRef.current.zoomToFarm(farm);
    }
  };

  const handleFarmsLoad = (loadedFarms) => {
    setFarms(loadedFarms);
  };

  const handleFarmerCoinsChange = (newCoins) => {
    setFarmerCoins(newCoins);
  };

  const handleCreateField = () => {
    setCreateFieldOpen(true);
  };

  const handleCreateFarm = () => {
    setCreateFarmOpen(true);
  };

  const handleCreateFarmClose = () => {
    setCreateFarmOpen(false);
  };

  const handleCreateFieldClose = () => {
    setCreateFieldOpen(false);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setIsEditMode(true);
    setCreateFieldOpen(true);
  };

  const handleFarmSubmit = (formData) => {
    const newFarm = {
      id: Date.now(),
      farmName: formData.farmName, // Use farmName instead of farmerName
      farmIcon: formData.farmIcon,
      location: formData.location,
      coordinates: formData.coordinates,
      webcamUrl: formData.webcamUrl,
      description: formData.description,
      createdAt: new Date().toISOString()
    };

    // Save to storage first
    storageService.addFarm(newFarm);
    
    // Then update local state
    setFarmsList(prevFarms => [...prevFarms, newFarm]);
    addNotification('New Farm Created', 'success');
    setCreateFarmOpen(false);
  };

  const handleFieldSubmit = async (formData) => {
    let fieldToZoom = null; // Declare this variable to store the field data for zooming
    
    if (isEditMode && editingField) {
      // Update existing field
      const updatedFarms = farms.map(farm => 
        farm.id === editingField.id ? { ...farm, ...formData } : farm
      );
      setFarms(updatedFarms);
      
      // Update in persistent storage
      const updatedField = { ...editingField, ...formData };
      storageService.updateField(updatedField);
      
      addNotification(
        `Your field "${formData.productName}" has been updated successfully.`,
        'success'
      );
      
      // Set fieldToZoom for existing field
      fieldToZoom = {
        ...editingField,
        ...formData,
        coordinates: [
          parseFloat(formData.longitude) || 8.5417,
          parseFloat(formData.latitude) || 47.3769
        ]
      };
    } else {
      // Create a new farm/field object with the submitted data
      const longitude = parseFloat(formData.longitude);
      const latitude = parseFloat(formData.latitude);
      
      // Debug logging to see what coordinates we're getting
      console.log('Form Data Coordinates:', {
        longitude: formData.longitude,
        latitude: formData.latitude,
        parsedLongitude: longitude,
        parsedLatitude: latitude,
        isLongitudeValid: !isNaN(longitude),
        isLatitudeValid: !isNaN(latitude)
      });
      
      // Get the actual location using reverse geocoding
      let actualLocation = 'Unknown Location';
      try {
        if (!isNaN(latitude) && !isNaN(longitude)) {
          actualLocation = await cachedReverseGeocode(latitude, longitude);
        }
      } catch (error) {
        console.error('Failed to get location:', error);
        actualLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      const newField = {
        id: Date.now(),
        name: formData.productName,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.sellingPrice) || 0,
        price_per_m2: formData.fieldSize ? (parseFloat(formData.sellingPrice) / parseFloat(formData.fieldSize)) : 0, // Calculate price per m²
        unit: formData.fieldSizeUnit,
        quantity: parseFloat(formData.sellingAmount) || 0,
        coordinates: [
          !isNaN(longitude) ? longitude : 8.5417, // Default to Switzerland coordinates
          !isNaN(latitude) ? latitude : 47.3769
        ],
        location: actualLocation,
        image: formData.imagePreview || formData.image || '/api/placeholder/300/200',
        farmId: formData.farmId,
        farmName: formData.farmId ? farmsList.find(farm => farm.id === formData.farmId)?.farmerName : null,
        farmer_name: user?.name || 'Unknown Farmer',
        farmer: 'You',
        farmer_name: 'You', // Add this for popup compatibility
        isOwnField: true,
        available: true,
        rating: 0,
        reviews: 0,
        fieldSize: formData.fieldSize,
        fieldSizeUnit: formData.fieldSizeUnit,
        productionRate: formData.productionRate,
        production_rate: formData.productionRate, // Add this for popup compatibility
        productionRateUnit: formData.productionRateUnit,
        harvestDates: formData.harvestDates || [],
        harvestDate: formData.harvestDates && formData.harvestDates.length > 0 ? formData.harvestDates[0].date : '',
        harvest_date: formData.harvestDates && formData.harvestDates.length > 0 ? formData.harvestDates[0].date : '', // Add this for popup compatibility
        shippingOption: formData.shippingOption,
        shipping_pickup: formData.shippingOption !== 'Shipping', // Add for popup compatibility
        shipping_delivery: formData.shippingOption !== 'Pickup', // Add for popup compatibility
        deliveryCharges: formData.deliveryCharges,
        hasWebcam: formData.hasWebcam,
        area_m2: formData.fieldSize, // Add for popup compatibility
        available_area: formData.fieldSize, // Add for popup compatibility
        total_area: formData.fieldSize, // Add for popup compatibility
        weather: 'Sunny', // Add default weather for popup compatibility
        created_at: new Date().toISOString()
      };

      // Save to persistent storage as farmer field
      storageService.addFarmerField(newField);

      // Add the new field to the farms array
      setFarms(prevFarms => [...prevFarms, newField]);
      addNotification(
        `New product "${formData.productName}" has been created and is now visible on the map!`,
        'success'
      );
      
      // Set fieldToZoom for new field
      fieldToZoom = newField;
    }

    // Close the form and reset states
    setCreateFieldOpen(false);
    setEditingField(null);
    setIsEditMode(false);

    // Zoom to the field location on the map using the zoomToFarm method
    if (mapRef.current && mapRef.current.zoomToFarm && fieldToZoom) {
      // Call zoomToFarm with autoOpenPopup = true (default) to automatically open popup
      mapRef.current.zoomToFarm(fieldToZoom, true);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EnhancedHeader 
        user={user} 
        onLogout={onLogout} 
        onSearchChange={handleSearchChange}
        farms={farms}
        onFarmSelect={handleFarmSelect}
        farmerCoins={farmerCoins}
        onCreateField={handleCreateField}
        onCreateFarm={handleCreateFarm}
      />
      
      <Box sx={{
        flexGrow: 1,
        mt: '64px', // Account for fixed header height
        height: 'calc(100vh - 64px)', // Subtract AppBar height from viewport
        overflow: (isMapPage || isMessagesPage || isCurrencyPage || isSettingsPage) ? 'hidden' : 'auto', // No scroll for map, messages, currency, and settings pages, scroll for other pages
        position: 'relative'
      }}>
        <Routes>
          <Route path="/" element={
            <EnhancedFarmMap
              ref={mapRef}
              onProductSelect={handleFarmSelect}
              userType="farmer"
              user={user}
              searchQuery={searchQuery}
              onFarmsLoad={handleFarmsLoad}
              onFarmerCoinsChange={handleFarmerCoinsChange}
              onNotification={addNotification}
              farms={farms}
              onEditField={handleEditField}
              onFieldCreate={handleCreateField}
            />
          } />
          <Route path="/add-field" element={
            <Box sx={{ p: 3 }}>
              <AddFieldForm 
                onFieldAdded={handleFieldAdded}
                onClose={() => window.history.back()}
              />
            </Box>
          } />
          <Route path="/my-fields" element={
            <Box sx={{ p: 3 }}>
              <h2>My Fields</h2>
              {farmerFields.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>You haven't added any fields yet.</p>
                  <button 
                    onClick={() => window.location.href = '/farmer/add-field'}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '16px'
                    }}
                  >
                    Add Your First Field
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {farmerFields.map(field => (
                    <div key={field.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>{field.name}</h3>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Crop:</strong> {field.crop}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Price:</strong> ${field.price}/unit
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Area:</strong> {field.area} acres
                      </div>
                      {field.location && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Location:</strong> {field.location}
                        </div>
                      )}
                      {field.description && (
                        <div style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>
                          {field.description}
                        </div>
                      )}
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '8px 12px', 
                        background: field.isAvailable ? '#dcfce7' : '#fef3c7',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: field.isAvailable ? '#166534' : '#92400e'
                      }}>
                        {field.isAvailable ? 'Available for Purchase' : 'Sold'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Box>
          } />
          <Route path="/rented-fields" element={<RentedFields />} />
          <Route path="/my-farms" element={<MyFarms />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/farm-orders" element={<FarmOrders />} />
          <Route path="/license-info" element={<LicenseInfo />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/currency" element={<ChangeCurrency />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
      
      {/* Notification System */}
      <NotificationSystem 
        notifications={hookNotifications} 
        onRemove={removeNotification} 
      />

      {/* Create Field Form Dialog */}
      <CreateFieldForm
        open={createFieldOpen}
        onClose={() => {
          setCreateFieldOpen(false);
          setEditingField(null);
          setIsEditMode(false);
        }}
        onSubmit={handleFieldSubmit}
        editMode={isEditMode}
        initialData={editingField}
        farmsList={farmsList}
      />

      {/* Add Farm Form Dialog */}
      <AddFarmForm
        open={createFarmOpen}
        onClose={handleCreateFarmClose}
        onSubmit={handleFarmSubmit}
      />
    </Box>
  );
};

export default FarmerView;