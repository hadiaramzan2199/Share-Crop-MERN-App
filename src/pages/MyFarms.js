import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Assessment,
  Nature,
  WaterDrop,
} from '@mui/icons-material';
import storageService from '../services/storage';

const MyFarms = () => {
  const [myFarms, setMyFarms] = useState([]);
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

  // Load my farms data
  useEffect(() => {
    const loadMyFarms = () => {
      // Load farms from persistent storage
      const userFarms = storageService.getUserFarms();
      
      // If no user farms exist, show mock data for demo
      if (userFarms.length === 0) {
        const mockFarms = [
          {
            id: 1,
            name: 'Green Valley Farm',
            location: 'California, USA',
            area: '25 acres',
            cropType: 'Wheat',
            status: 'Active',
            progress: 75,
            monthlyRevenue: 5400,
            totalInvestment: 90000,
            plantingDate: '2024-01-15',
            harvestDate: '2024-05-20',
            soilType: 'Loamy',
            irrigationType: 'Drip Irrigation',
            image: '/api/placeholder/300/200'
          },
          {
            id: 2,
            name: 'Sunrise Orchards',
            location: 'Florida, USA',
            area: '40 acres',
            cropType: 'Mango',
            status: 'Growing',
            progress: 60,
            monthlyRevenue: 7200,
            totalInvestment: 144000,
            plantingDate: '2023-12-01',
            harvestDate: '2024-06-15',
            soilType: 'Sandy Loam',
            irrigationType: 'Flood Irrigation',
            image: '/api/placeholder/300/200'
          },
          {
            id: 3,
            name: 'Golden Fields',
            location: 'Texas, USA',
            area: '30 acres',
            cropType: 'Rice',
            status: 'Harvesting',
            progress: 95,
            monthlyRevenue: 6480,
            totalInvestment: 115200,
            plantingDate: '2024-02-10',
            harvestDate: '2024-06-30',
            soilType: 'Clay',
            irrigationType: 'Sprinkler',
            image: '/api/placeholder/300/200'
          },
          {
            id: 4,
            name: 'Organic Paradise',
            location: 'Oregon, USA',
            area: '15 acres',
            cropType: 'Vegetables',
            status: 'Planning',
            progress: 20,
            monthlyRevenue: 2880,
            totalInvestment: 54000,
            plantingDate: '2024-03-01',
            harvestDate: '2024-07-15',
            soilType: 'Sandy',
            irrigationType: 'Drip Irrigation',
            image: '/api/placeholder/300/200'
          }
        ];
        setMyFarms(mockFarms);
      } else {
        // Transform stored farms to match the expected format
        const transformedFarms = userFarms.map(farm => ({
          id: farm.id,
          name: farm.farmerName || farm.name,
          location: farm.location,
          area: '25 acres', // Default area
          cropType: 'Mixed', // Default crop type
          status: 'Active',
          progress: 75,
          monthlyRevenue: 5400,
          totalInvestment: 90000,
          plantingDate: farm.created_at ? new Date(farm.created_at).toISOString().split('T')[0] : '2024-01-15',
          harvestDate: '2024-05-20',
          soilType: 'Loamy',
          irrigationType: 'Drip Irrigation',
          image: '/api/placeholder/300/200',
          description: farm.description
        }));
        setMyFarms(transformedFarms);
      }
    };
    
    loadMyFarms();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Growing': return 'info';
      case 'Harvesting': return 'warning';
      case 'Planning': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    const symbol = currencySymbols[userCurrency] || '₨';
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Calculate stats for overview
  const totalFarms = myFarms.length;
  const activeFarms = myFarms.filter(f => f.status === 'Active').length;
  const totalMonthlyRevenue = myFarms.reduce((sum, farm) => sum + (farm.monthlyRevenue || 0), 0);
  const avgProgress = myFarms.length > 0 ? Math.round(myFarms.reduce((sum, farm) => sum + farm.progress, 0) / myFarms.length) : 0;

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
              My Farms
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Monitor and manage your agricultural farm properties with real-time insights
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
            Farm Report
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
                    {totalFarms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Total Farms
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
                    {activeFarms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Active Farms
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
                  <Nature sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.5rem' }}>
                    {currencySymbols[userCurrency]}{totalMonthlyRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Monthly Revenue
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
        </Grid>

        {/* Farms Grid */}
        <Grid container spacing={2}>
          {myFarms.slice(0, 5).map((farm) => (
            <Grid item xs={12} sm={6} lg={4} key={farm.id}>
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
                          {farm.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ fontSize: 14, color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            {farm.location}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" sx={{ color: '#64748b' }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Chip 
                      label={farm.status} 
                      color={getStatusColor(farm.status)}
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

                  {/* Farm Details */}
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
                          {farm.cropType}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: 16, color: '#3b82f6', mr: 0.75 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            Area
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c' }}>
                          {farm.area}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Nature sx={{ fontSize: 16, color: '#8b5cf6', mr: 0.75 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            Soil Type
                          </Typography>
                        </Box>
                        <Chip 
                          icon={<Nature />} 
                          label={farm.soilType} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20,
                            backgroundColor: '#f3f4f6',
                            color: '#374151'
                          }} 
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WaterDrop sx={{ fontSize: 16, color: '#06b6d4', mr: 0.75 }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                            Irrigation
                          </Typography>
                        </Box>
                        <Chip 
                          icon={<WaterDrop />} 
                          label={farm.irrigationType} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20,
                            backgroundColor: '#e0f2fe',
                            color: '#0277bd'
                          }} 
                        />
                      </Box>

                      {/* Progress Bar */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c' }}>
                            {farm.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={farm.progress} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: farm.progress === 100 ? '#10b981' : farm.progress > 50 ? '#3b82f6' : '#f59e0b'
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
                        {formatCurrency(farm.monthlyRevenue)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                        /month
                      </Typography>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        size="small" 
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
                        View Details
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small" 
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

        {myFarms.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <Agriculture sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No farms found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by adding your first farm to begin managing your agricultural properties.
            </Typography>
            <Button
              variant="contained"
              sx={{ 
                mt: 2,
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049'
                }
              }}
            >
              Add New Farm
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default MyFarms;