import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  Agriculture,
  Store,
  ShoppingCart,
  AccountCircle,
  ExitToApp,
  History,
  Map,
  Landscape,
  Person,
  Message,
  CurrencyExchange,
  Settings,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout, open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const farmerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/farmer' },
    { text: 'My Fields', icon: <Agriculture />, path: '/farmer/fields' },
    { text: 'Products', icon: <Store />, path: '/farmer/products' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/farmer/orders' },
    { text: 'Map View', icon: <Map />, path: '/farmer/map' },
  ];

  const buyerMenuItems = [
    { text: 'Rented Fields', icon: <Landscape />, path: '/buyer/rented-fields' },
    { text: 'My Orders', icon: <History />, path: '/buyer/orders' },
    { text: 'Profile', icon: <Person />, path: '/buyer/profile' },
    { text: 'Messages', icon: <Message />, path: '/buyer/messages' },
    { text: 'Change Currency', icon: <CurrencyExchange />, path: '/buyer/currency' },
    { text: 'Settings', icon: <Settings />, path: '/buyer/settings' },
  ];

  const menuItems = user.user_type === 'farmer' ? farmerMenuItems : buyerMenuItems;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.02) 0%, rgba(46, 125, 50, 0.02) 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🌱 ShareCrop
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        
        {/* User Profile Card */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'primary.main',
              mr: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 0.5,
                fontSize: '0.95rem',
              }}
            >
              {user.name}
            </Typography>
            <Chip
              label={user.user_type}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: '24px',
                fontWeight: 500,
                textTransform: 'capitalize',
                backgroundColor: user.user_type === 'farmer' 
                  ? alpha('#4CAF50', 0.1) 
                  : alpha('#2196F3', 0.1),
                color: user.user_type === 'farmer' ? '#2E7D32' : '#1565C0',
                border: `1px solid ${user.user_type === 'farmer' 
                  ? alpha('#4CAF50', 0.2) 
                  : alpha('#2196F3', 0.2)}`,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <Tooltip key={item.text} title={item.text} placement="right" arrow>
                <ListItem
                  button
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    minHeight: 48,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: isSelected 
                      ? alpha('#4CAF50', 0.08)
                      : 'transparent',
                    border: isSelected 
                      ? `1px solid ${alpha('#4CAF50', 0.2)}`
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: isSelected 
                        ? alpha('#4CAF50', 0.12)
                        : alpha('#000', 0.04),
                      transform: 'translateX(4px)',
                      boxShadow: isSelected 
                        ? `0 4px 12px ${alpha('#4CAF50', 0.15)}`
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: isSelected ? '#2E7D32' : 'text.secondary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? '#2E7D32' : 'text.primary',
                    }}
                  />
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* Logout Section */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      }}>
        <Tooltip title="Logout" placement="right" arrow>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              minHeight: 48,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: alpha('#f44336', 0.08),
                transform: 'translateX(4px)',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40,
                color: '#d32f2f',
                transition: 'color 0.2s ease',
              }}
            >
              <ExitToApp />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#d32f2f',
              }}
            />
          </ListItem>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;