import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Paper,
  MenuList,
  ClickAwayListener,
  Popper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Tune,
  AccountCircle,
  Menu as MenuIcon,
  History,
  ExitToApp,
  Close,
  Landscape,
  Person,
  Message,
  CurrencyExchange,
  Settings,
  Agriculture,
  Receipt,
  Nature,
  AccountBalance,
  Add,
  HomeWork,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const EnhancedHeader = ({ user, onLogout, onSearchChange, farms = [], onFarmSelect, farmerCoins = 1250, onCreateField, onCreateFarm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    products: [],
    locations: []
  });

  const handleProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleProfileClose();
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // Filter logic functions
  const applyFilters = (farmsToFilter) => {
    let filtered = farmsToFilter;

    // Apply category filters
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(farm => 
        activeFilters.categories.some(category => 
          farm.category?.toLowerCase().includes(category.toLowerCase()) ||
          farm.type?.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply product filters
    if (activeFilters.products.length > 0) {
      filtered = filtered.filter(farm => 
        farm.products && farm.products.some(product => 
          activeFilters.products.some(filterProduct => 
            product.name?.toLowerCase().includes(filterProduct.toLowerCase()) ||
            product.category?.toLowerCase().includes(filterProduct.toLowerCase())
          )
        )
      );
    }

    return filtered;
  };

  const handleFilterApply = () => {
    const filtered = applyFilters(farms);
    setFilteredFarms(filtered);
    if (onSearchChange) {
      onSearchChange(searchQuery, filtered);
    }
    setFilterAnchorEl(null);
  };

  const handleFilterClear = () => {
    setActiveFilters({ categories: [], products: [], locations: [] });
    setFilteredFarms(farms);
    if (onSearchChange) {
      onSearchChange(searchQuery, farms);
    }
  };

  const farmerMenuItems = [
    { text: 'Rented Fields', icon: <Landscape />, path: '/farmer/rented-fields' },
    { text: 'My Farms', icon: <Agriculture />, path: '/farmer/my-farms' },
    { text: 'My Orders', icon: <History />, path: '/farmer/orders' },
    { text: 'Farm Orders', icon: <Receipt />, path: '/farmer/farm-orders' },
    { text: 'License Info', icon: <Nature />, path: '/farmer/license-info' },
    { text: 'Transaction', icon: <AccountBalance />, path: '/farmer/transaction' },
    { text: 'Profile', icon: <Person />, path: '/farmer/profile' },
    { text: 'Messages', icon: <Message />, path: '/farmer/messages' },
    { text: 'Change Currency', icon: <CurrencyExchange />, path: '/farmer/currency' },
    { text: 'Settings', icon: <Settings />, path: '/farmer/settings' },
  ];

  const buyerMenuItems = [
    { text: 'Rented Fields', icon: <Landscape />, path: '/buyer/rented-fields' },
    { text: 'My Orders', icon: <History />, path: '/buyer/orders' },
    { text: 'Profile', icon: <Person />, path: '/buyer/profile' },
    { text: 'Messages', icon: <Message />, path: '/buyer/messages' },
    { text: 'Change Currency', icon: <CurrencyExchange />, path: '/buyer/currency' },
    { text: 'Settings', icon: <Settings />, path: '/buyer/settings' },
  ];

  const menuItems = user?.user_type === 'farmer' ? farmerMenuItems : buyerMenuItems;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'text.primary',
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          zIndex: 1300,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          {/* Left Section - Menu Button */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Center Section - Company Logo/Name */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }} 
            onClick={() => navigate('/')}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🌱 ShareCrop
            </Typography>
          </Box>

          {/* Right Section - Search, Filter, Coins, Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Search Bar */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 25,
                px: 2,
                py: 0.5,
                minWidth: 250,
                position: 'relative',
              }}
            >
              <Search sx={{ color: 'grey.500', mr: 1 }} />
              <InputBase
                placeholder="Search farms, crops..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  
                  if (query.trim()) {
                    // First apply filters, then search within filtered results
                    let farmsToSearch = applyFilters(farms);
                    
                    // Filter farms based on search query
                    const filtered = farmsToSearch.filter(farm => {
                      const searchTerm = query.toLowerCase();
                      return (
                        farm.name?.toLowerCase().includes(searchTerm) ||
                        farm.category?.toLowerCase().includes(searchTerm) ||
                        farm.farmer?.toLowerCase().includes(searchTerm) ||
                        farm.description?.toLowerCase().includes(searchTerm) ||
                        farm.location?.toLowerCase().includes(searchTerm) ||
                        farm.products?.some(product => 
                          product.name?.toLowerCase().replace(/-/g, ' ').includes(searchTerm)
                        )
                      );
                    });
                    setFilteredFarms(filtered.slice(0, 5)); // Limit to 5 suggestions
                    setSearchAnchorEl(e.currentTarget.parentElement);
                  } else {
                    // If no search query, show filtered results or all farms
                    const baseResults = applyFilters(farms);
                    setFilteredFarms([]);
                    setSearchAnchorEl(null);
                  }
                  
                  if (onSearchChange) {
                    onSearchChange(query);
                  }
                }}
                onFocus={(e) => {
                  if (searchQuery.trim() && filteredFarms.length > 0) {
                    setSearchAnchorEl(e.currentTarget.parentElement);
                  }
                }}
                sx={{ flex: 1, fontSize: '14px', pr: searchQuery ? 4 : 0 }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredFarms([]);
                    setSearchAnchorEl(null);
                    if (onSearchChange) {
                      onSearchChange('');
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    padding: '2px',
                    color: 'grey.500',
                    '&:hover': {
                      color: 'grey.700',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Close sx={{ fontSize: '16px' }} />
                </IconButton>
              )}
            </Box>

            {/* Filter Icon */}
            <Badge 
              badgeContent={activeFilters.categories.length + activeFilters.products.length}
              color="primary"
              invisible={activeFilters.categories.length + activeFilters.products.length === 0}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 16,
                  minWidth: 16,
                }
              }}
            >
              <IconButton
                color="inherit"
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
                  ...(filterAnchorEl && {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    color: 'primary.main'
                  }),
                  ...(activeFilters.categories.length + activeFilters.products.length > 0 && {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    color: 'primary.main'
                  })
                }}
              >
                <Tune />
              </IconButton>
            </Badge>

            {/* Create Farm Button */}
            <Tooltip title="Create New Farm">
              <IconButton
                color="inherit"
                onClick={onCreateFarm}
                sx={{ 
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3',
                  '&:hover': { 
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }}
              >
                <HomeWork />
              </IconButton>
            </Tooltip>

            {/* Create Field Button */}
            <Tooltip title="Create New Field">
              <IconButton
                color="inherit"
                onClick={onCreateField}
                sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  color: '#4CAF50',
                  '&:hover': { 
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>

            {/* Farmer Coins */}
            <Tooltip 
              title={
                <Box sx={{ textAlign: 'center', py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Farmer Coins Balance
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    1 Farmer Coin = $100
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'success.light' }}>
                    You have {farmerCoins.toLocaleString()} coins = ${(farmerCoins * 100).toLocaleString()}
                  </Typography>
                </Box>
              }
              arrow
              placement="bottom"
            >
              <Chip
                icon={<span style={{ fontSize: '16px' }}>🪙</span>}
                label={farmerCoins.toLocaleString()}
                variant="outlined"
                sx={{ 
                  fontWeight: 'bold',
                  borderColor: '#FF9800',
                  color: '#F57C00',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  cursor: 'pointer',
                  '& .MuiChip-label': {
                    fontSize: '13px'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    borderColor: '#F57C00',
                  }
                }}
              />
            </Tooltip>

            {/* Profile */}
            <IconButton onClick={handleProfileMenu} color="inherit">
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  fontSize: '14px'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Collapsible Side Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            pt: 8, // Account for fixed header
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              🌱 ShareCrop
            </Typography>
            <IconButton onClick={toggleDrawer} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {user?.name || 'User'}
              </Typography>
              <Chip
                label={user?.user_type || 'User'}
                size="small"
                color={user?.user_type === 'farmer' ? 'primary' : 'secondary'}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </Box>

        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider />

        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Search Dropdown */}
      <Popper
        open={Boolean(searchAnchorEl) && filteredFarms.length > 0}
        anchorEl={searchAnchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [-40, 8],
            },
          },
        ]}
        sx={{ zIndex: 1400, width: Math.max(searchAnchorEl?.offsetWidth || 250, 250) }}
      >
        <ClickAwayListener onClickAway={() => setSearchAnchorEl(null)}>
          <Paper
            sx={{
              mt: 0.5,
              maxHeight: 'none',
              overflow: 'visible',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 2,
            }}
          >
            <MenuList sx={{ py: 0.5 }}>
              {filteredFarms.map((farm) => (
                <MenuItem
                  key={farm.id}
                  onClick={() => {
                    if (onFarmSelect) {
                      onFarmSelect(farm);
                    }
                    setSearchQuery(farm.name);
                    setSearchAnchorEl(null);
                    setFilteredFarms([]);
                  }}
                  sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      py: 0.8,
                      px: 2,
                      minHeight: 'auto',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      },
                      '&:not(:last-child)': {
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                      },
                    }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      color: 'text.primary',
                      mb: 0.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {farm.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{
                      fontSize: '0.7rem',
                      color: 'text.secondary',
                      mb: 0.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {farm.farmer} • {farm.location}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{
                      fontSize: '0.65rem',
                      color: 'success.main',
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {farm.products?.map(p => p.name).join(', ')}
                  </Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>

      {/* Filter Menu */}
      <Popper
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        placement="bottom-end"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [110, 5],
            },
          },
        ]}
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setFilterAnchorEl(null)}>
          <Paper
            elevation={8}
            sx={{
              width: 260,
              maxHeight: 400,
              overflow: 'auto',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 2,
              mt: 0.5,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, fontSize: '0.8rem', color: 'text.primary' }}>
                Filter Farms
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Categories Filter */}
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.7rem', color: 'text.secondary' }}>
                Categories
              </Typography>
              <FormGroup sx={{ mb: 1.5 }}>
                {['Organic', 'Conventional', 'Hydroponic', 'Greenhouse'].map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        size="small"
                        checked={activeFilters.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters(prev => ({
                              ...prev,
                              categories: [...prev.categories, category]
                            }));
                          } else {
                            setActiveFilters(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c !== category)
                            }));
                          }
                        }}
                      />
                    }
                    label={category}
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '0.65rem',
                        color: 'text.primary'
                      },
                      '& .MuiCheckbox-root': {
                        color: 'rgba(76, 175, 80, 0.6)',
                        '&.Mui-checked': {
                          color: '#4CAF50'
                        }
                      }
                    }}
                  />
                ))}
              </FormGroup>
              <Divider sx={{ mb: 1.5 }} />

              {/* Products Filter */}
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.7rem', color: 'text.secondary' }}>
                Products
              </Typography>
              <FormGroup sx={{ mb: 2 }}>
                {['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy', 'Livestock'].map((product) => (
                  <FormControlLabel
                    key={product}
                    control={
                      <Checkbox
                        size="small"
                        checked={activeFilters.products.includes(product)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters(prev => ({
                              ...prev,
                              products: [...prev.products, product]
                            }));
                          } else {
                            setActiveFilters(prev => ({
                              ...prev,
                              products: prev.products.filter(p => p !== product)
                            }));
                          }
                        }}
                      />
                    }
                    label={product}
                    sx={{ 
                       '& .MuiFormControlLabel-label': { 
                         fontSize: '0.65rem',
                         color: 'text.primary'
                       },
                       '& .MuiCheckbox-root': {
                         color: 'rgba(76, 175, 80, 0.6)',
                         '&.Mui-checked': {
                           color: '#4CAF50'
                         }
                       }
                     }}
                  />
                ))}
              </FormGroup>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleFilterClear}
                  sx={{ flex: 1 }}
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleFilterApply}
                  sx={{ flex: 1 }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileClose(); }}>
          <AccountCircle sx={{ mr: 2 }} /> Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 2 }} /> Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default EnhancedHeader;