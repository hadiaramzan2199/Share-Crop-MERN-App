import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  Button,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Agriculture,
  TrendingUp,
  MoreVert,
  Visibility,
  Edit,
  Assessment,
  Schedule,
} from '@mui/icons-material';
import { authService } from '../services/auth';
import { getPurchasedFarms } from '../data/mockFarms';
import storageService from '../services/storage';

const RentedFields = () => {
  // Mock user data since we're using authService
  const user = { name: 'John Doe', email: 'john@example.com' };
  const [rentedFields, setRentedFields] = useState([]);
  const [userCurrency, setUserCurrency] = useState('USD');
  
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
  
  // Exchange rates (mock data - in real app this would come from API)
  const exchangeRates = {
    'PKR': { 'USD': 0.0036, 'EUR': 0.0033, 'GBP': 0.0028, 'JPY': 0.54, 'CAD': 0.0049, 'AUD': 0.0054, 'CHF': 0.0032 },
    'USD': { 'PKR': 278.50, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.80, 'CAD': 1.35, 'AUD': 1.50, 'CHF': 0.88 }
  };

  // Load user preferences
  useEffect(() => {
    const loadUserPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          setUserCurrency(preferences.currency || 'PKR');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Load rented fields from persistent storage
  useEffect(() => {
    const loadRentedFields = async () => {
      try {
        // Load from persistent storage first
        const storedRentedFields = storageService.getUserRentedFields();
        
        if (storedRentedFields.length > 0) {
          // Transform stored rented fields to display format
          const transformedFields = storedRentedFields.map((field) => {
            const startDate = new Date(field.start_date);
            const endDate = new Date(field.end_date);
            
            // Convert monthly rent to user's preferred currency
            const convertPrice = (amountUSD, targetCurrency) => {
              if (targetCurrency === 'USD') return amountUSD;
              const rate = exchangeRates['USD']?.[targetCurrency] || 1;
              return Math.floor(amountUSD * rate);
            };
            
            const monthlyRent = convertPrice(field.monthly_rent || 0, userCurrency);
            const progress = field.progress || Math.floor(Math.random() * 100);
            
            return {
              id: field.id,
              name: field.name,
              location: field.location,
              area: `${(field.area_rented / 4047).toFixed(1)} acres`, // Convert m2 to acres
              cropType: field.crop_type || 'Mixed Crops',
              rentPeriod: calculateRentPeriod(field.start_date, field.end_date),
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              monthlyRent: monthlyRent,
              originalPrice: field.total_cost / field.area_rented,
              totalValue: field.total_cost,
              status: field.status === 'active' ? 'Active' : field.status === 'completed' ? 'Completed' : 'Pending',
              farmer: field.farmer_name,
              image: '/api/placeholder/300/200',
              progress: progress,
              lastUpdate: new Date(field.created_at).toISOString().split('T')[0],
              // Include additional properties
              available_area: field.area_rented,
              total_area: field.area_rented,
              shipping_pickup: true,
              shipping_delivery: true
            };
          });
          
          setRentedFields(transformedFields);
        } else {
          // Fallback to mock data if no stored rented fields
          const purchasedFarms = getPurchasedFarms();
          
          // Transform purchased farms to rented fields format
          const transformedFields = purchasedFarms.map((farm, index) => {
            // Generate realistic rental data based on farm properties
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 6)); // Started 0-6 months ago
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 6 + Math.floor(Math.random() * 6)); // 6-12 month contracts
            
            // Use actual price from farm data and convert to monthly rent
            const totalValue = farm.area_m2 * farm.price_per_m2;
            const monthlyRentPKR = Math.floor(totalValue * 0.08); // 8% of total value per month
            
            // Convert to user's preferred currency
            const convertPrice = (amountPKR, targetCurrency) => {
              if (targetCurrency === 'PKR') return amountPKR;
              const rate = exchangeRates['PKR']?.[targetCurrency] || 0.0036;
              return Math.floor(amountPKR * rate);
            };
            
            const monthlyRent = convertPrice(monthlyRentPKR, userCurrency);
            const progress = Math.floor(Math.random() * 100); // Random progress
            
            return {
              id: farm.id,
              name: farm.name,
              location: farm.location,
              area: `${(farm.area_m2 / 4047).toFixed(1)} acres`, // Convert m2 to acres
              cropType: farm.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              rentPeriod: calculateRentPeriod(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              monthlyRent: monthlyRent,
              originalPrice: farm.price_per_m2,
              totalValue: totalValue,
              status: progress === 100 ? 'Completed' : progress > 50 ? 'Active' : 'Pending',
              farmer: farm.farmer_name,
              image: farm.image,
              progress: progress,
              lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last week
              // Include original farm properties for area and shipping info
              available_area: farm.available_area,
              total_area: farm.total_area,
              shipping_pickup: farm.shipping_pickup,
              shipping_delivery: farm.shipping_delivery
            };
          });
          
          setRentedFields(transformedFields);
        }
      } catch (error) {
        console.error('Error loading rented fields:', error);
      }
    };
    
    loadRentedFields();
  }, [userCurrency]);
  
  // Helper function to calculate rent period
  const calculateRentPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return `${diffMonths} months`;
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'primary';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  // Calculate stats for overview
  const totalFields = rentedFields.length;
  const activeFields = rentedFields.filter(f => f.status === 'Active').length;
  const totalMonthlyRent = rentedFields.reduce((sum, field) => sum + (field.monthlyRent || 0), 0);
  const avgProgress = rentedFields.length > 0 ? Math.round(rentedFields.reduce((sum, field) => sum + field.progress, 0) / rentedFields.length) : 0;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      p: 3
    }}>
      {/* Header Section */}
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
              My Rented Fields
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Monitor and manage your agricultural field rentals with real-time insights
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
            Field Report
          </Button>
        </Stack>

        {/* Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
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
                  <Agriculture sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {totalFields}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Total Fields
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
                    {activeFields}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Active Rentals
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
                  <Assessment sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {avgProgress}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Avg Progress
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
                  <Schedule sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {currencySymbols[userCurrency]}{totalMonthlyRent.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Monthly Revenue
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Fields Grid */}
        <Grid container spacing={2}>
          {rentedFields.slice(0, 5).map((field) => (
            <Grid item xs={12} sm={6} lg={4} key={field.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                    borderColor: '#3b82f6'
                  }
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 0 } }}>
                  {/* Card Header */}
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#1a202c',
                            fontSize: '1rem',
                            mb: 0.25,
                            lineHeight: 1.3
                          }}
                        >
                          {field.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ fontSize: 14, color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            {field.location}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" sx={{ color: '#64748b' }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Chip 
                      label={field.status} 
                      color={getStatusColor(field.status)}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        borderRadius: 1.5
                      }}
                    />
                  </Box>

                  <Divider sx={{ mx: 2 }} />

                  {/* Field Details */}
                  <Box sx={{ p: 2, py: 1.5 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Agriculture sx={{ fontSize: 16, color: '#10b981', mr: 0.75 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            Crop Type
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c', fontSize: '0.8rem' }}>
                          {field.cropType}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: 16, color: '#3b82f6', mr: 0.75 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            Duration
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c' }}>
                          {field.rentPeriod}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Area: {field.area}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c' }}>
                          {field.available_area}m² available
                        </Typography>
                      </Box>

                      {/* Progress Bar */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c' }}>
                            {field.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={field.progress} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: field.progress === 100 ? '#10b981' : field.progress > 50 ? '#3b82f6' : '#f59e0b'
                            }
                          }} 
                        />
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ mx: 2 }} />

                  {/* Card Footer */}
                  <Box sx={{ p: 2, pt: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#059669',
                          fontSize: '1.25rem'
                        }}
                      >
                        {currencySymbols[userCurrency]}{field.monthlyRent?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                        /month
                      </Typography>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<Visibility />}
                        sx={{ 
                          flex: 1,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                          py: 0.75,
                          '&:hover': {
                            borderColor: '#059669',
                            color: '#059669',
                            bgcolor: '#f0fdf4'
                          }
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Edit />}
                        sx={{ 
                          flex: 1,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: '#4caf50',
                          py: 0.75,
                          '&:hover': {
                            bgcolor: '#a1eda4'
                          }
                        }}
                      >
                        Manage
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Show More Button */}
        {rentedFields.length > 8 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  bgcolor: '#f8fafc'
                }
              }}
            >
              View All Fields ({rentedFields.length})
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RentedFields;