import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import {
  Close,
  LocationOn,
  Agriculture,
  Grass,
  Eco,
  LocalFlorist,
  Park,
  Terrain,
  Nature,
  Yard
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LocationPicker from './LocationPicker';
import storageService from '../../services/storage';

// Styled components matching CreateFieldForm
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e7ff',
    maxWidth: '800px',
    width: '400px',
    background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 100%)',
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
  padding: '5px 32px 32px 32px !important',
  paddingTop: '10px !important',
  background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 100%)',
  maxHeight: '80vh',
  overflowY: 'auto',
  marginLeft: '30px !important',
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
    width: '270px !important',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 32px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

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

const AddFarmForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    farmName: '',
    farmIcon: '',
    location: '',
    coordinates: { lat: null, lng: null },
    webcamUrl: '',
    description: ''
  });
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationSelect = (locationData) => {
    // Convert array coordinates [lng, lat] to object format
    const coordinates = Array.isArray(locationData.coordinates) 
      ? { lng: locationData.coordinates[0], lat: locationData.coordinates[1] }
      : locationData.coordinates;
      
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      coordinates: coordinates
    }));
    setLocationPickerOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.farmName.trim()) {
      newErrors.farmName = 'Farm name is required';
    }
    
    if (!formData.farmIcon) {
      newErrors.farmIcon = 'Please select a farm icon';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate webcam URL if provided
    if (formData.webcamUrl.trim()) {
      try {
        new URL(formData.webcamUrl);
      } catch {
        newErrors.webcamUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Save farm to persistent storage
      const farmData = {
        ...formData,
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      
      storageService.addFarm(farmData);
      
      onSubmit(farmData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      farmName: '',
      farmIcon: '',
      location: '',
      coordinates: { lat: null, lng: null },
      webcamUrl: '',
      description: ''
    });
    setErrors({});
    onClose();
  };

  const selectedIcon = farmIcons.find(icon => icon.value === formData.farmIcon);

  return (
    <>
      <StyledDialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <StyledDialogTitle>
          Add New Farm
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
          <Grid container spacing={4}>
            {/* Farm Name */}
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Farm Name"
                value={formData.farmName}
                onChange={(e) => handleInputChange('farmName', e.target.value)}
                error={!!errors.farmName}
                helperText={errors.farmName}
                variant="outlined"
                placeholder="Enter farm's name"
              />
            </Grid>

            {/* Farm Icon */}
            <Grid item xs={12}>
              <StyledFormControl fullWidth error={!!errors.farmIcon}>
                <InputLabel>Select Farm Icon</InputLabel>
                <Select
                  value={formData.farmIcon}
                  onChange={(e) => handleInputChange('farmIcon', e.target.value)}
                  label="Select Farm Icon"
                  renderValue={(selected) => {
                    const selectedIcon = farmIcons.find(icon => icon.value === selected);
                    return selectedIcon ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedIcon.icon}
                                              </Box>
                    ) : '';
                  }}
                >
                  {farmIcons.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
                        {icon.icon}
                        </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.farmIcon && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.farmIcon}
                  </Typography>
                )}
              </StyledFormControl>
            </Grid>

            {/* Location and Webcam URL in two columns */}
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Farm Location"
                value={formData.location}
                error={!!errors.location}
                helperText={errors.location || 'Click the location icon to select on map'}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setLocationPickerOpen(true)}
                        edge="end"
                        sx={{ 
                          color: '#4caf50',
                          '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                        }}
                      >
                        <LocationOn />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formData.coordinates.lat && formData.coordinates.lng && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Webcam URL (Optional)"
                value={formData.webcamUrl}
                onChange={(e) => handleInputChange('webcamUrl', e.target.value)}
                error={!!errors.webcamUrl}
                helperText={errors.webcamUrl || 'Enter webcam URL for live farm monitoring'}
                variant="outlined"
                placeholder="https://example.com/webcam-feed"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Farm Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Describe your farm, crops, farming methods, etc."
              />
            </Grid>
          </Grid>
        </StyledDialogContent>

        <DialogActions sx={{ p: 3, pt: 2, background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 100%)' }}>
          <StyledButton 
            onClick={handleClose}
            variant="outlined"
            sx={{ 
              color: '#666',
              borderColor: '#ddd',
              '&:hover': { 
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderColor: '#bbb'
              }
            }}
          >
            Cancel
          </StyledButton>
          <StyledButton 
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' },
              px: 3
            }}
          >
            Save Farm
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Location Picker Dialog */}
      <LocationPicker
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={formData.coordinates.lat ? formData.coordinates : null}
      />
    </>
  );
};

export default AddFarmForm;