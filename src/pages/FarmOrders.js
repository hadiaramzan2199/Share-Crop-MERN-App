import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Button,
  IconButton,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Agriculture,
  TrendingUp,
  MoreVert,
  Visibility,
  Assessment,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import storageService from '../services/storage';

const FarmOrders = () => {
  const [orders, setOrders] = useState([]);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [tabValue, setTabValue] = useState(0);
  
  // Currency symbols mapping
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'PKR': '₨',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF'
  };

  // Load user preferences
  useEffect(() => {
    const loadUserPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          setUserCurrency(preferences.currency || 'USD');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Load farm orders data
  useEffect(() => {
    const loadOrders = () => {
      try {
        // Load orders from persistent storage first
        const storedOrders = storageService.getFarmOrders();
        
        if (storedOrders && storedOrders.length > 0) {
          // Convert stored orders to the expected format
          const formattedOrders = storedOrders.map(order => ({
            id: order.id,
            buyerName: order.buyerName || 'Unknown Buyer',
            buyerEmail: order.buyerEmail || order.buyerId || 'N/A',
            farmName: order.fieldName || order.farmName || 'Unknown Farm',
            cropType: order.cropType || order.productName || 'Field Purchase',
            quantity: `${order.quantity || 0} m²`,
            pricePerKg: order.pricePerUnit || order.totalPrice / (order.quantity || 1) || 0,
            totalAmount: order.totalPrice || order.totalAmount || order.totalCost || 0,
            orderDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            deliveryDate: order.deliveryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: order.status === 'pending' ? 'Pending' : order.status || 'Pending',
            paymentStatus: order.paymentStatus || 'Pending',
            location: order.location || 'Unknown Location',
            shippingMethod: order.shippingMethod || 'Delivery',
            fieldId: order.fieldId,
            farmerId: order.farmerId,
            isFarmerCreated: true // Mark as farmer-created order
          }));
          
          setOrders(formattedOrders);
          return;
        }
      } catch (error) {
        console.error('Error loading orders from storage:', error);
      }
      
      // Fallback to mock data if no stored orders
      const mockOrders = [
        {
          id: 'ORD-001',
          buyerName: 'John Smith',
          buyerEmail: 'john@example.com',
          farmName: 'Green Valley Farm',
          cropType: 'Wheat',
          quantity: '500 kg',
          pricePerKg: 4.32,
          totalAmount: 2160,
          orderDate: '2024-01-15',
          deliveryDate: '2024-01-25',
          status: 'Delivered',
          paymentStatus: 'Paid',
          location: 'Los Angeles, CA'
        },
        {
          id: 'ORD-002',
          buyerName: 'Sarah Johnson',
          buyerEmail: 'sarah@example.com',
          farmName: 'Sunrise Orchards',
          cropType: 'Mango',
          quantity: '200 kg',
          pricePerKg: 10.80,
          totalAmount: 2160,
          orderDate: '2024-01-20',
          deliveryDate: '2024-01-30',
          status: 'Processing',
          paymentStatus: 'Pending',
          location: 'Miami, FL'
        },
        {
          id: 'ORD-003',
          buyerName: 'Michael Davis',
          buyerEmail: 'michael@example.com',
          farmName: 'Golden Fields',
          cropType: 'Rice',
          quantity: '1000 kg',
          pricePerKg: 2.88,
          totalAmount: 2880,
          orderDate: '2024-01-18',
          deliveryDate: '2024-01-28',
          status: 'Shipped',
          paymentStatus: 'Paid',
          location: 'Houston, TX'
        },
        {
          id: 'ORD-004',
          buyerName: 'Emily Wilson',
          buyerEmail: 'emily@example.com',
          farmName: 'Organic Paradise',
          cropType: 'Vegetables',
          quantity: '300 kg',
          pricePerKg: 5.40,
          totalAmount: 1620,
          orderDate: '2024-01-22',
          deliveryDate: '2024-02-01',
          status: 'Cancelled',
          paymentStatus: 'Refunded',
          location: 'Portland, OR'
        },
        {
          id: 'ORD-005',
          buyerName: 'David Brown',
          buyerEmail: 'david@example.com',
          farmName: 'Green Valley Farm',
          cropType: 'Wheat',
          quantity: '750 kg',
          pricePerKg: 4.32,
          totalAmount: 3240,
          orderDate: '2024-01-25',
          deliveryDate: '2024-02-05',
          status: 'Pending',
          paymentStatus: 'Pending',
          location: 'Phoenix, AZ'
        }
      ];
      
      setOrders(mockOrders);
    };
    
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Shipped': return 'info';
      case 'Processing': return 'warning';
      case 'Pending': return 'default';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle />;
      case 'Shipped': return <LocalShipping />;
      case 'Processing': return <Pending />;
      case 'Pending': return <Pending />;
      case 'Cancelled': return <Cancel />;
      default: return <ShoppingCart />;
    }
  };

  const formatCurrency = (amount) => {
    const symbol = currencySymbols[userCurrency] || '₨';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
  };

  const getFilteredOrders = () => {
    switch (tabValue) {
      case 0: return orders;
      case 1: return filterOrdersByStatus('pending');
      case 2: return filterOrdersByStatus('processing');
      case 3: return filterOrdersByStatus('shipped');
      case 4: return filterOrdersByStatus('delivered');
      default: return orders;
    }
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    
    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  };

  const stats = getOrderStats();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      p: 3
    }}>
      <Box sx={{ 
        maxWidth: '1400px', 
        mx: 'auto',
        mb: 4
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: '#1e293b',
                mb: 0.5,
                fontSize: '1.75rem'
              }}
            >
              Farm Orders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Manage and track your farm product orders with comprehensive insights
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#a1eda4' },
              borderRadius: 2,
              px: 2.5,
              py: 1
            }}
          >
            Order Report
          </Button>
        </Stack>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                backgroundColor: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    width: 40,
                    height: 40
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {stats.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Total Orders
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                backgroundColor: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#059669',
                    width: 40,
                    height: 40
                  }}
                >
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Total Revenue
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                backgroundColor: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    width: 40,
                    height: 40
                  }}
                >
                  <Pending sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {stats.pendingOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Pending Orders
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                backgroundColor: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    backgroundColor: '#f3e8ff',
                    color: '#7c3aed',
                    width: 40,
                    height: 40
                  }}
                >
                  <CheckCircle sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {stats.deliveredOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Delivered Orders
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter Buttons */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant={tabValue === 0 ? "contained" : "outlined"}
              onClick={() => setTabValue(0)}
              size="small"
              sx={{
                borderRadius: 2,
                ...(tabValue === 0 && {
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' }
                })
              }}
            >
              All Orders ({orders.length})
            </Button>
            <Button
              variant={tabValue === 1 ? "contained" : "outlined"}
              onClick={() => setTabValue(1)}
              size="small"
              sx={{
                borderRadius: 2,
                ...(tabValue === 1 && {
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' }
                })
              }}
            >
              Pending ({stats.pendingOrders})
            </Button>
            <Button
              variant={tabValue === 2 ? "contained" : "outlined"}
              onClick={() => setTabValue(2)}
              size="small"
              sx={{
                borderRadius: 2,
                ...(tabValue === 2 && {
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' }
                })
              }}
            >
              Processing ({orders.filter(o => o.status === 'Processing').length})
            </Button>
            <Button
              variant={tabValue === 3 ? "contained" : "outlined"}
              onClick={() => setTabValue(3)}
              size="small"
              sx={{
                borderRadius: 2,
                ...(tabValue === 3 && {
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' }
                })
              }}
            >
              Shipped ({orders.filter(o => o.status === 'Shipped').length})
            </Button>
            <Button
              variant={tabValue === 4 ? "contained" : "outlined"}
              onClick={() => setTabValue(4)}
              size="small"
              sx={{
                borderRadius: 2,
                ...(tabValue === 4 && {
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' }
                })
              }}
            >
              Delivered ({stats.deliveredOrders})
            </Button>
          </Stack>
        </Paper>

        {/* Orders Cards */}
        <Grid container spacing={3}>
          {getFilteredOrders().map((order) => (
            <Grid item xs={12} sm={6} lg={3} key={order.id}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    borderColor: '#4caf50'
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                        {order.id}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {order.location}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    <Divider />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Buyer
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {order.buyerName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Farm
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {order.farmName}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Crop Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {order.cropType}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Quantity
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {order.quantity}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Ordered: {new Date(order.orderDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {getFilteredOrders().length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 ? 'No orders have been placed yet.' : `No ${['all', 'pending', 'processing', 'shipped', 'delivered'][tabValue]} orders found.`}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default FarmOrders;