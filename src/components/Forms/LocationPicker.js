import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Search, MyLocation, Close } from '@mui/icons-material';
import { Map as MapboxMap, Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const LocationPicker = ({ open, onClose, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocationLoaded, setUserLocationLoaded] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [viewState, setViewState] = useState({
    longitude: -74.0060, // Default fallback
    latitude: 40.7128,   // Default fallback
    zoom: 13
  });

  // Get user's current location when component opens
  useEffect(() => {
    if (open && !userLocationLoaded) {
      if (initialLocation) {
        setSelectedLocation(initialLocation);
        setViewState(prev => ({
          ...prev,
          longitude: initialLocation.lng,
          latitude: initialLocation.lat
        }));
        setUserLocationLoaded(true);
      } else {
        // Get user's current location
        if (navigator.geolocation) {
          setLoading(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setSelectedLocation(location);
              setViewState(prev => ({
                ...prev,
                longitude: location.lng,
                latitude: location.lat
              }));
              setUserLocationLoaded(true);
              setLoading(false);
            },
            (error) => {
              console.error('Error getting current location:', error);
              // Fallback to default location (New York)
              const fallbackLocation = { lat: 40.7128, lng: -74.0060 };
              setSelectedLocation(fallbackLocation);
              setViewState(prev => ({
                ...prev,
                longitude: fallbackLocation.lng,
                latitude: fallbackLocation.lat
              }));
              setUserLocationLoaded(true);
              setLoading(false);
            }
          );
        } else {
          // Geolocation not supported, use fallback
          const fallbackLocation = { lat: 40.7128, lng: -74.0060 };
          setSelectedLocation(fallbackLocation);
          setViewState(prev => ({
            ...prev,
            longitude: fallbackLocation.lng,
            latitude: fallbackLocation.lat
          }));
          setUserLocationLoaded(true);
        }
      }
    }
  }, [open, initialLocation, userLocationLoaded]);

  // Update view state when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: selectedLocation.lng,
        latitude: selectedLocation.lat
      }));
      reverseGeocode(selectedLocation);
    }
  }, [selectedLocation]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUserLocationLoaded(false);
      setSearchQuery('');
      setSearchResults([]);
      setAddress('');
    }
  }, [open]);

  const reverseGeocode = async (location) => {
    setLoading(true);
    try {
      // Use Mapbox Geocoding API for reverse geocoding
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${location?.lng?.toFixed(6) || 0},${location?.lat?.toFixed(6) || 0}.json?access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].place_name);
      } else {
        setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Use Mapbox Geocoding API for search suggestions worldwide
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}&limit=5&types=place,locality,neighborhood,address`
      );
      const data = await response.json();
      
      if (data.features) {
        const results = data.features.map(feature => ({
          name: feature.text,
          formatted_address: feature.place_name,
          coordinates: feature.center,
          context: feature.context || []
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSearchResultClick = (place) => {
    const location = {
      lat: place.coordinates[1],
      lng: place.coordinates[0]
    };
    setSelectedLocation(location);
    setAddress(place.formatted_address);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(location);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setLoading(false);
        }
      );
    }
  };

  const handleConfirm = () => {
    if (onLocationSelect) {
      onLocationSelect({
        coordinates: [selectedLocation.lng, selectedLocation.lat],
        address: address
      });
    }
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    setSelectedLocation({ lat, lng });
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        Select Farm Location
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Search Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={getCurrentLocation} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : <MyLocation />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#4caf50'
                }
              }
            }}
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <Paper 
              sx={{ 
                mt: 1, 
                maxHeight: 200, 
                overflow: 'auto',
                borderRadius: '12px',
                border: '1px solid #e8f5e8',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
                '& .MuiBox-root:first-of-type': {
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                },
                '& .MuiBox-root:last-of-type': {
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  borderBottom: 'none !important',
                }
              }}
            >
              {searchResults.map((place, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #f0f7f0' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      backgroundColor: '#f8fdf8',
                      borderLeft: '3px solid #4caf50',
                      paddingLeft: '22px',
                    },
                    '&:active': {
                      backgroundColor: '#e8f5e8',
                    }
                  }}
                  onClick={() => handleSearchResultClick(place)}
                >
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ 
                      color: '#2e7d32',
                      mb: 0.2,
                      fontSize: '10px'
                    }}
                  >
                    {place.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666',
                      fontSize: '12px',
                      lineHeight: 0.5
                    }}
                  >
                    {place.formatted_address}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Map Container */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapboxMap
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={handleMapClick}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          >
            <NavigationControl position="top-right" />
            
            {selectedLocation && (
              <Marker
                longitude={selectedLocation.lng}
                latitude={selectedLocation.lat}
                anchor="bottom"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#4CAF50',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    transform: 'rotate(45deg)',
                    color: 'white',
                    fontSize: '16px'
                  }}>
                    📍
                  </div>
                </div>
              </Marker>
            )}
          </MapboxMap>
          
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255,255,255,0.8)',
              p: 2,
              borderRadius: 1
            }}>
              <CircularProgress />
            </Box>
          )}
        </Box>

        {/* Location Info */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Location:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address || `${selectedLocation?.lat?.toFixed(6) || 0}, ${selectedLocation?.lng?.toFixed(6) || 0}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Coordinates: {selectedLocation?.lat?.toFixed(6) || 0}, {selectedLocation?.lng?.toFixed(6) || 0}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={!selectedLocation}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationPicker;