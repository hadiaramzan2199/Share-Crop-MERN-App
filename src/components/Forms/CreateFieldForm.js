import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Card,
  CardContent,
  InputAdornment,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close,
  PhotoCamera,
  LocationOn,
  Add,
  Remove,
  ExpandMore,
  MyLocation,
  Agriculture,
  Grass,
  Nature,
  LocalFlorist,
  Park,
  Terrain,
  Yard
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LocationPicker from './LocationPicker';

// Styled components for SaaS design
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e7ff',
    maxWidth: '800px',
    width: '100%',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.5rem',
  textAlign: 'center',
  padding: '24px',
  borderRadius: '20px 20px 0 0',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '32px',
  background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 100%)',
  maxHeight: '80vh',
  overflowY: 'auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '270px !important',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '2px solid #e8f5e8',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#c8e6c9',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
    },
    '&.Mui-focused': {
      borderColor: '#4caf50',
      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#4a5568',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#4caf50',
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '270px !important',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '2px solid #e8f5e8',
    minWidth: '200px',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#c8e6c9',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
    },
    '&.Mui-focused': {
      borderColor: '#4caf50',
      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#4a5568',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#4caf50',
    },
  },
  '& .MuiSelect-select': {
    paddingRight: '48px !important',
    width: '270px !important',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
  },
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #c8e6c9',
  borderRadius: '16px',
  padding: '40px 20px',
  textAlign: 'center',
  backgroundColor: '#f8fffe',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#4caf50',
    backgroundColor: '#f1f8e9',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: '#2d3748',
  marginBottom: '16px',
  fontSize: '1.25rem',
  borderBottom: '2px solid #e8f5e8',
  paddingBottom: '8px',
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  '& .MuiFormControlLabel-root': {
    backgroundColor: '#ffffff',
    margin: '4px',
    borderRadius: '12px',
    border: '2px solid #e8f5e8',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#c8e6c9',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
    },
  },
  '& .MuiRadio-root.Mui-checked + .MuiFormControlLabel-label': {
    color: '#4caf50',
    fontWeight: 600,
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8fffe',
  border: '1px solid #e8f5e8',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
  '& .MuiTypography-root': {
    color: '#4a5568',
    fontSize: '0.875rem',
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '24px 32px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e8f5e8',
  borderRadius: '0 0 20px 20px',
  gap: '12px',
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: '24px',
  marginBottom: '24px',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e8f5e8',
}));

// Farm icons mapping
const farmIcons = [
  { value: 'agriculture', label: 'Agriculture', icon: <Agriculture sx={{ color: '#8bc34a' }} /> },
  { value: 'grass', label: 'Grass Field', icon: <Grass sx={{ color: '#4caf50' }} /> },
  { value: 'eco', label: 'Eco Farm', icon: <Nature sx={{ color: '#2e7d32' }} /> },
  { value: 'flower', label: 'Flower Farm', icon: <LocalFlorist sx={{ color: '#e91e63' }} /> },
  { value: 'park', label: 'Park Farm', icon: <Park sx={{ color: '#388e3c' }} /> },
  { value: 'terrain', label: 'Terrain', icon: <Terrain sx={{ color: '#795548' }} /> },
  { value: 'nature', label: 'Nature Farm', icon: <Nature sx={{ color: '#689f38' }} /> },
  { value: 'yard', label: 'Yard', icon: <Yard sx={{ color: '#558b2f' }} /> }
];

const CreateFieldForm = ({ open, onClose, onSubmit, editMode = false, initialData = null, farmsList = [] }) => {
  // Helper function to get farm icon component
  const getFarmIcon = (farmIconValue) => {
    const iconData = farmIcons.find(icon => icon.value === farmIconValue);
    return iconData ? iconData.icon : null;
  };

  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null,
    category: '',
    productName: '',
    description: '',
    fieldSize: '',
    fieldSizeUnit: 'm²',
    productionRate: '',
    productionRateUnit: 'Kg',
    sellingAmount: '',
    sellingPrice: '',
    retailPrice: '',
    virtualProductionRate: '',
    virtualCostPerUnit: '',
    appFees: '',
    userAreaVirtualRentPrice: '',
    harvestDates: [{ date: '', label: '' }],
    shippingOption: 'Both',
    deliveryTime: '',
    deliveryTimeUnit: 'Days',
    deliveryCharges: [{ upto: '', amount: '' }],
    hasWebcam: false,
    latitude: '',
    longitude: '',
    shippingScope: 'Global',
    farmId: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('basic');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const categories = [
  'Select Category',
  'Green Apple',
  'Red Apple',
  'Corn',
  'Eggplant',
  'Lemon',
  'Peach',
  'Strawberry',
  'Tangerine',
  'Tomato',
  'Watermelon',
  'Vegetables',
  'Fruits',
  'Grains',
  'Herbs',
  'Flowers',
  'Organic Produce',
  'Dairy Products',
  'Livestock'
];

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && editMode) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        productName: initialData.name || '',
        category: initialData.category || '',
        description: initialData.description || '',
        sellingPrice: initialData.price || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        imagePreview: initialData.image || null,
        harvestDates: initialData.harvestDates || [{ date: '', label: '' }]
      }));
    } else if (!editMode) {
      setFormData({
        image: null,
        imagePreview: null,
        category: '',
        productName: '',
        description: '',
        fieldSize: '',
        fieldSizeUnit: 'm²',
        productionRate: '',
        productionRateUnit: 'Kg',
        sellingAmount: '',
        sellingPrice: '',
        retailPrice: '',
        virtualProductionRate: '',
        virtualCostPerUnit: '',
        appFees: '',
        userAreaVirtualRentPrice: '',
        harvestDates: [{ date: '', label: '' }],
        shippingOption: 'Both',
        deliveryTime: '',
        deliveryTimeUnit: 'Days',
        deliveryCharges: [{ upto: '', amount: '' }],
        hasWebcam: false,
        latitude: '',
        longitude: '',
        shippingScope: 'Global',
        farmId: ''
      });
    }
  }, [initialData, editMode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle harvest date changes
  const handleHarvestDateChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      harvestDates: (prev.harvestDates || []).map((date, i) => 
        i === index ? { ...date, [field]: value } : date
      )
    }));
    
    if (errors.harvestDates) {
      setErrors(prev => ({
        ...prev,
        harvestDates: ''
      }));
    }
  };

  // Add new harvest date
  const addHarvestDate = () => {
    setFormData(prev => ({
      ...prev,
      harvestDates: [...(prev.harvestDates || []), { date: '', label: '' }]
    }));
  };

  // Remove harvest date
  const removeHarvestDate = (index) => {
    const currentHarvestDates = formData.harvestDates || [];
    if (currentHarvestDates.length > 1) {
      setFormData(prev => ({
        ...prev,
        harvestDates: (prev.harvestDates || []).filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addDeliveryCharge = () => {
    setFormData(prev => ({
      ...prev,
      deliveryCharges: [...prev.deliveryCharges, { upto: '', amount: '' }]
    }));
  };

  const removeDeliveryCharge = (index) => {
    setFormData(prev => ({
      ...prev,
      deliveryCharges: prev.deliveryCharges.filter((_, i) => i !== index)
    }));
  };

  const updateDeliveryCharge = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      deliveryCharges: prev.deliveryCharges.map((charge, i) => 
        i === index ? { ...charge, [field]: value } : charge
      )
    }));
  };

  // Handle location selection from LocationPicker
  const handleLocationSelect = (locationData) => {
    // LocationPicker returns { coordinates: [lng, lat], address: string }
    const [lng, lat] = locationData.coordinates;
    setFormData(prev => ({
      ...prev,
      latitude: lat?.toString() || '',
      longitude: lng?.toString() || ''
    }));
    setLocationPickerOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.category || formData.category === 'Select Category') newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.fieldSize) newErrors.fieldSize = 'Field size is required';
    if (!formData.productionRate) newErrors.productionRate = 'Production rate is required';
    if (!formData.sellingAmount) newErrors.sellingAmount = 'Selling amount is required';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
    if (!formData.retailPrice) newErrors.retailPrice = 'Retail price is required';
    
    // Validate harvest dates
    const harvestDatesArray = formData.harvestDates || [];
    const hasValidHarvestDate = harvestDatesArray.some(date => date.date && date.date.trim() !== '');
    if (!hasValidHarvestDate) newErrors.harvestDates = 'At least one harvest date is required';
    
    if (!formData.latitude) newErrors.latitude = 'Latitude is required';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  
  // Get actual location using reverse geocoding
  let actualLocation = 'Unknown Location';
  try {
    const { cachedReverseGeocode } = await import('../../utils/geocoding');
    actualLocation = await cachedReverseGeocode(
      parseFloat(formData.latitude), 
      parseFloat(formData.longitude)
    );
  } catch (error) {
    console.error('Failed to get location:', error);
    // Fallback to coordinates if reverse geocoding fails
    actualLocation = `${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}`;
  }
  
  const submitData = {
      productName: formData.productName,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.sellingPrice),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      image: formData.imagePreview,
      fieldSize: formData.fieldSize,
      fieldSizeUnit: formData.fieldSizeUnit,
      productionRate: formData.productionRate,
      productionRateUnit: formData.productionRateUnit,
      sellingAmount: formData.sellingAmount,
      retailPrice: parseFloat(formData.retailPrice),
      virtualProductionRate: formData.virtualProductionRate,
      virtualCostPerUnit: formData.virtualCostPerUnit,
      harvestDates: (formData.harvestDates || []).filter(date => date.date && date.date.trim() !== ''),
      shippingOption: formData.shippingOption,
      deliveryTime: formData.deliveryTime,
      deliveryTimeUnit: formData.deliveryTimeUnit,
      deliveryCharges: formData.deliveryCharges,
      hasWebcam: formData.hasWebcam,
      shippingScope: formData.shippingScope,
      // Add these default values for popup compatibility:
      coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      farmer_name: 'Your Name', // Or get from user profile
      location: actualLocation,
      available_area: formData.fieldSize || 100,
      total_area: formData.fieldSize || 100,
      weather: 'Sunny', // Default weather
      price_per_m2: formData.fieldSize ? (parseFloat(formData.sellingPrice) / parseFloat(formData.fieldSize)) : 0,
      production_rate: formData.productionRate || 0.50,
      shipping_pickup: formData.shippingOption !== 'Shipping',
      shipping_delivery: formData.shippingOption !== 'Pickup',
      harvest_date: (formData.harvestDates || []).length > 0 && formData.harvestDates[0].date ? formData.harvestDates[0].date : '15 Sep, 2025',
      isOwnField: true // Mark as your own field for edit button
    };

  setTimeout(() => {
    onSubmit(submitData);
    setIsSubmitting(false);
    handleClose();
  }, 1000);
};


  const handleClose = () => {
    setFormData({
      image: null,
      imagePreview: null,
      category: '',
      productName: '',
      description: '',
      fieldSize: '',
      fieldSizeUnit: 'm²',
      productionRate: '',
      productionRateUnit: 'Kg',
      sellingAmount: '',
      sellingPrice: '',
      retailPrice: '',
      virtualProductionRate: '',
      virtualCostPerUnit: '',
      appFees: '',
      userAreaVirtualRentPrice: '',
      harvestDate: '',
      shippingOption: 'Both',
      deliveryTime: '',
      deliveryTimeUnit: 'Days',
      deliveryCharges: [{ upto: '', amount: '' }],
      hasWebcam: false,
      latitude: '',
      longitude: '',
      shippingScope: 'Global',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
    >
      <StyledDialogTitle>
        {editMode ? 'Edit Field' : 'Create New Field'}
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white'
          }}
        >
          <Close />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Box sx={{ width: '100%' }}>
          {/* Image Upload Section */}
          <FormSection sx={{ textAlign: 'center' }}>
            <UploadBox
              onClick={() => document.getElementById('image-upload').click()}
              sx={{ mb: 2 }}
            >
              {formData.imagePreview ? (
                <Box>
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Typography variant="body2" sx={{ mt: 2, color: '#4a5568' }}>
                    Click to change image
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <PhotoCamera sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#4a5568', mb: 1 }}>
                    Click to upload
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    SVG, PNG, or JPG
                  </Typography>
                </Box>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </UploadBox>
          </FormSection>

          {/* Basic Information Section */}
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <Grid container spacing={3}>
              {/* Farm Selection Dropdown */}
              <Grid item xs={12}>
                <StyledFormControl fullWidth error={!!errors.farmId} sx={{ maxWidth: '270px' }}>
                  <InputLabel sx={{ fontWeight: 500 }}>Select Farm</InputLabel>
                  <Select
                    value={formData.farmId}
                    onChange={(e) => handleInputChange('farmId', e.target.value)}
                    label="Select Farm"
                    renderValue={(selected) => {
                      if (!selected) return '';
                      const selectedFarm = farmsList.find(farm => farm.id === selected);
                      if (!selectedFarm) return '';
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFarmIcon(selectedFarm.farmIcon)}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {selectedFarm.farmName}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choose a farm for this field
                    </MenuItem>
                    {farmsList.map((farm) => (
                      <MenuItem key={farm.id} value={farm.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFarmIcon(farm.farmIcon)}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {farm.farmName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {farm.location}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>

              {/* Category Dropdown */}
              <Grid item xs={12}>
                <StyledFormControl fullWidth error={!!errors.category}>
                  <InputLabel sx={{ fontWeight: 500 }}>Select Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    label="Select Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category} disabled={category === 'Select Category'}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>

              {/* Product Name */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Product Name"
                  placeholder="The Name of The Product"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  error={!!errors.productName}
                  helperText={errors.productName}
                />
              </Grid>

              {/* Product Description */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  placeholder="The Description of The Product"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>
            </Grid>
          </FormSection>

          {/* Field Details Section */}
          <FormSection>
            <SectionTitle>Field Details</SectionTitle>
            <Grid container spacing={3}>
              {/* Field Size */}
              <Grid item xs={8}>
                <StyledTextField
                  fullWidth
                  label="Field Size"
                  placeholder="How big is your field"
                  value={formData.fieldSize}
                  onChange={(e) => handleInputChange('fieldSize', e.target.value)}
                  error={!!errors.fieldSize}
                  helperText={errors.fieldSize}
                />
              </Grid>

              <Grid item xs={4}>
                <StyledFormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={formData.fieldSizeUnit}
                    onChange={(e) => handleInputChange('fieldSizeUnit', e.target.value)}
                    label="Unit"
                  >
                    <MenuItem value="m²">m²</MenuItem>
                    <MenuItem value="acres">acres</MenuItem>
                    <MenuItem value="hectares">hectares</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>

              {/* Production Rate */}
              <Grid item xs={8}>
                <StyledTextField
                  fullWidth
                  label="Production Rate"
                  placeholder="Which is your usual production per harvest"
                  value={formData.productionRate}
                  onChange={(e) => handleInputChange('productionRate', e.target.value)}
                  error={!!errors.productionRate}
                  helperText={errors.productionRate}
                />
              </Grid>

              <Grid item xs={4}>
                <StyledFormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={formData.productionRateUnit}
                    onChange={(e) => handleInputChange('productionRateUnit', e.target.value)}
                    label="Unit"
                  >
                    <MenuItem value="Kg">Kg</MenuItem>
                    <MenuItem value="tons">tons</MenuItem>
                    <MenuItem value="lbs">lbs</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>

              {/* Coordinates - Now grouped together */}
              <Grid item xs={6}>
                <StyledTextField
                  fullWidth
                  label="Latitude"
                  placeholder="Enter Farm Latitude"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  error={!!errors.latitude}
                  helperText={errors.latitude}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setLocationPickerOpen(true)}
                          sx={{ 
                            color: '#4CAF50',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)'
                            }
                          }}
                        >
                          <LocationOn />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <StyledTextField
                  fullWidth
                  label="Longitude"
                  placeholder="Enter Farm Longitude"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  error={!!errors.longitude}
                  helperText={errors.longitude}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setLocationPickerOpen(true)}
                          sx={{ 
                            color: '#4CAF50',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)'
                            }
                          }}
                        >
                          <LocationOn />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Harvest Dates */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#2d3748' }}>
                  Estimated Harvest Dates
                </Typography>
                {(formData.harvestDates || []).map((harvestDate, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      <Box sx={{ flex: '1 1 40%' }}>
                        <StyledTextField
                          fullWidth
                          type="date"
                          label="Date"
                          value={harvestDate.date}
                          onChange={(e) => handleHarvestDateChange(index, 'date', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 40%' }}>
                        <StyledTextField
                          fullWidth
                          label="Label (optional)"
                          placeholder="e.g., First harvest, Main crop"
                          value={harvestDate.label}
                          onChange={(e) => handleHarvestDateChange(index, 'label', e.target.value)}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
                        {index === (formData.harvestDates || []).length - 1 && (
                          <IconButton
                            onClick={addHarvestDate}
                            sx={{ 
                              color: '#4caf50',
                              backgroundColor: '#e8f5e8',
                              '&:hover': { backgroundColor: '#c8e6c9' }
                            }}
                            size="small"
                          >
                            <Add />
                          </IconButton>
                        )}
                        {(formData.harvestDates || []).length > 1 && (
                          <IconButton
                            onClick={() => removeHarvestDate(index)}
                            sx={{ 
                              color: '#f44336',
                              backgroundColor: '#ffebee',
                              '&:hover': { backgroundColor: '#ffcdd2' }
                            }}
                            size="small"
                          >
                            <Remove />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
                {errors.harvestDates && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.harvestDates}
                  </Typography>
                )}
              </Grid>

              {/* Webcam Option */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#2d3748' }}>
                  Do you have a Webcam on the field?
                </Typography>
                <RadioGroup
                  row
                  value={formData.hasWebcam ? 'Yes' : 'No'}
                  onChange={(e) => handleInputChange('hasWebcam', e.target.value === 'Yes')}
                  sx={{ 
                    gap: 3,
                    justifyContent: 'center',
                    '& .MuiFormControlLabel-root': {
                      margin: 0,
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#e8f5e8',
                        borderColor: '#4caf50'
                      }
                    }
                  }}
                >
                  <FormControlLabel value="Yes" control={<Radio sx={{ color: '#4caf50' }} />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio sx={{ color: '#4caf50' }} />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>
          </FormSection>

          {/* Pricing Information Section */}
          <FormSection>
            <SectionTitle>Pricing Information</SectionTitle>
            <Grid container spacing={3}>
              {/* Selling Amount */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Selling Amount"
                  placeholder="How much product to sell by app?"
                  value={formData.sellingAmount}
                  onChange={(e) => handleInputChange('sellingAmount', e.target.value)}
                  error={!!errors.sellingAmount}
                  helperText={errors.sellingAmount}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Kg</InputAdornment>
                  }}
                />
              </Grid>

              {/* Selling Price */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Selling Price"
                  placeholder="How much do you sell your product to the app?"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                  error={!!errors.sellingPrice}
                  helperText={errors.sellingPrice || "Suggested product price on the app $/Kg"}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">$/Kg</InputAdornment>
                  }}
                />
              </Grid>

              {/* Retail Price */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Retail Price"
                  placeholder="What is the retail price in the supermarket?"
                  value={formData.retailPrice}
                  onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                  error={!!errors.retailPrice}
                  helperText={errors.retailPrice}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">$/Kg</InputAdornment>
                  }}
                />
              </Grid>

              {/* Virtual Production Rate */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Virtual Production Rate"
                  placeholder="How much do you want to sell your product to users?"
                  value={formData.virtualProductionRate}
                  onChange={(e) => handleInputChange('virtualProductionRate', e.target.value)}
                  helperText="This is your virtual production rate per area (Kg/m²)"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">$/Kg</InputAdornment>
                  }}
                />
              </Grid>

              {/* Virtual Cost Per Unit */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  mb: 1,
                  pl: 1
                }}>
                  This is your virtual cost of your land (per unit): $/m²
                </Typography>
              </Grid>

              {/* App Fees */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  mb: 1,
                  pl: 1
                }}>
                  These are the app fees: $
                </Typography>
              </Grid>

              {/* User Area Virtual Rent Price */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  mb: 1,
                  pl: 1
                }}>
                  This is the user area virtual "rent" price per unit: $/m²
                </Typography>
              </Grid>
            </Grid>
          </FormSection>

          {/* Shipping & Delivery Section */}
          <FormSection>
            <SectionTitle>Shipping & Delivery</SectionTitle>
            <Grid container spacing={3}>
              {/* Shipping Options */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  Shipping Options
                </Typography>
                <RadioGroup
                  row
                  value={formData.shippingOption}
                  onChange={(e) => handleInputChange('shippingOption', e.target.value)}
                  sx={{ 
                    display: 'flex', 
                    gap: 2,
                    '& .MuiFormControlLabel-root': {
                      flex: 1,
                      margin: 0,
                      padding: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }
                  }}
                >
                  <FormControlLabel 
                    value="Shipping" 
                    control={<Radio />} 
                    label="Shipping"
                    sx={{ textAlign: 'center' }}
                  />
                  <FormControlLabel 
                    value="Pickup" 
                    control={<Radio />} 
                    label="Pickup"
                    sx={{ textAlign: 'center' }}
                  />
                  <FormControlLabel 
                    value="Both" 
                    control={<Radio />} 
                    label="Both"
                    sx={{ textAlign: 'center' }}
                  />
                </RadioGroup>
              </Grid>

              {/* Delivery Time */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Delivery Time"
                  placeholder="Delivery time after the harvest?"
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Days</InputAdornment>
                  }}
                />
              </Grid>

              {/* Delivery Charges */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#2d3748' }}>
                  Enter your delivery charges
                </Typography>
                {formData.deliveryCharges.map((charge, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <StyledTextField
                      label="Upto"
                      placeholder="Upto"
                      value={charge.upto}
                      onChange={(e) => updateDeliveryCharge(index, 'upto', e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">Kg</InputAdornment>
                      }}
                      sx={{ flex: 1 }}
                    />
                    <StyledTextField
                      label="Amount"
                      placeholder="Amount"
                      value={charge.amount}
                      onChange={(e) => updateDeliveryCharge(index, 'amount', e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">$</InputAdornment>
                      }}
                      sx={{ flex: 1 }}
                    />
                    {formData.deliveryCharges.length > 1 && (
                      <IconButton 
                        onClick={() => removeDeliveryCharge(index)}
                        sx={{ 
                          color: '#f56565',
                          backgroundColor: '#fed7d7',
                          '&:hover': {
                            backgroundColor: '#feb2b2'
                          }
                        }}
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <StyledButton
                  startIcon={<Add />}
                  onClick={addDeliveryCharge}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Add More
                </StyledButton>
              </Grid>

              {/* Shipping Scope */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#2d3748' }}>
                  Shipping Scope
                </Typography>
                <RadioGroup
                  value={formData.shippingScope}
                  onChange={(e) => handleInputChange('shippingScope', e.target.value)}
                  sx={{ 
                    gap: 2,
                    '& .MuiFormControlLabel-root': {
                      margin: 0,
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#e8f5e8',
                        borderColor: '#4caf50'
                      }
                    }
                  }}
                >
                  <FormControlLabel 
                    value="Global" 
                    control={<Radio sx={{ color: '#4caf50' }} />} 
                    label="Global"
                  />
                  <FormControlLabel 
                    value="Country" 
                    control={<Radio sx={{ color: '#4caf50' }} />} 
                    label="Country"
                  />
                  <FormControlLabel 
                    value="City" 
                    control={<Radio sx={{ color: '#4caf50' }} />} 
                    label="City"
                  />
                </RadioGroup>
                <Typography variant="body2" sx={{ mt: 2, color: '#718096', fontStyle: 'italic' }}>
                  After clicking the city radio button, the process begins by selecting the country, followed by the state, and finally the city
                </Typography>
              </Grid>
            </Grid>
          </FormSection>
        </Box>
      </StyledDialogContent>

      {/* Location Picker Dialog */}
      <LocationPicker
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          formData.latitude && formData.longitude ? {
            lat: parseFloat(formData.latitude) || 0,
            lng: parseFloat(formData.longitude) || 0
          } : null
        }
      />

      <StyledDialogActions>
        <StyledButton 
          onClick={handleClose}
          variant="outlined"
        >
          Cancel
        </StyledButton>
        <StyledButton 
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ 
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049'
            }
          }}
        >
          {isSubmitting ? 'Creating...' : (editMode ? 'Update Field' : 'Create Field')}
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default CreateFieldForm;