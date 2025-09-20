import React, { useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import {
  Box,
} from '@mui/material';
import EnhancedFarmMap from '../components/Map/EnhancedFarmMap';
import EnhancedHeader from '../components/Layout/EnhancedHeader';
import NotificationSystem from '../components/Notification/NotificationSystem';
import useNotifications from '../hooks/useNotifications';
import RentedFields from './RentedFields';
import Orders from './Orders';
import Profile from './Profile';
import Messages from './Messages';
import ChangeCurrency from './ChangeCurrency';
import Settings from './Settings';

const BuyerView = ({ user, onLogout }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [farms, setFarms] = useState([]);
  const [farmerCoins, setFarmerCoins] = useState(1250);
  const mapRef = useRef(null);
  const { notifications, addNotification, removeNotification } = useNotifications();
  const isMapPage = location.pathname === '/buyer' || location.pathname === '/buyer/';
  const isMessagesPage = location.pathname === '/buyer/messages';
  const isCurrencyPage = location.pathname === '/buyer/currency';
  const isSettingsPage = location.pathname === '/buyer/settings';

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

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EnhancedHeader 
        user={user} 
        onLogout={onLogout} 
        onSearchChange={handleSearchChange}
        farms={farms}
        onFarmSelect={handleFarmSelect}
        farmerCoins={farmerCoins}
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
              onProductSelect={null}
              userType="buyer"
              searchQuery={searchQuery}
              onFarmsLoad={handleFarmsLoad}
              onFarmerCoinsChange={handleFarmerCoinsChange}
              onNotification={addNotification}
            />
          } />
          <Route path="/rented-fields" element={<RentedFields />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/currency" element={<ChangeCurrency />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
      
      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </Box>
  );
};

export default BuyerView;