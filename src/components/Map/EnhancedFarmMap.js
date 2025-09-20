import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Map as MapboxMap, Marker, NavigationControl, FullscreenControl, Source, Layer } from 'react-map-gl';
import { LocationOn } from '@mui/icons-material';
import { getProductIcon } from '../../utils/productIcons';
import { mockProductService, mockOrderService } from '../../services/mockServices';
import { cachedReverseGeocode } from '../../utils/geocoding';
import CustomScaleBar from './CustomScaleBar';
import ProductSummaryBar from './ProductSummaryBar';
import storageService from '../../services/storage';
import 'mapbox-gl/dist/mapbox-gl.css';



const EnhancedFarmMap = forwardRef(({ 
  onProductSelect, 
  userType, 
  user,
  purchasedProductIds = [], 
  onFieldCreate,
  searchQuery,
  onFarmsLoad,
  onFarmerCoinsChange,
  onNotification,
  farms: externalFarms,
  onEditField
}, ref) => {
  const mapRef = useRef();

  const [viewState, setViewState] = useState({
    longitude: 120,
    latitude: 0,
    zoom: 1.5,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [purchasedFarms, setPurchasedFarms] = useState(new Set());
  const [rentedFields, setRentedFields] = useState(new Set());
  const [farmerCoins, setFarmerCoins] = useState(1250);
  const [blinkingFarms, setBlinkingFarms] = useState(new Set());
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [productLocations, setProductLocations] = useState(new Map());

  // Function to fetch location for a product
  const fetchLocationForProduct = useCallback(async (product) => {
    if (!product || !product.coordinates) return;
    
    const [longitude, latitude] = product.coordinates;
    const productId = product.id;
    
    // Check if we already have the location for this product
    if (productLocations.has(productId)) {
      return;
    }
    
    try {
      // Fix: Pass latitude first, then longitude to match the geocoding function signature
      const locationName = await cachedReverseGeocode(latitude, longitude);
      setProductLocations(prev => new Map(prev.set(productId, locationName)));
    } catch (error) {
      console.error('Failed to fetch location for product:', error);
      // Set fallback location
      setProductLocations(prev => new Map(prev.set(productId, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)));
    }
  }, [productLocations]);

  const handleProductClick = useCallback((event, product) => {
    event.stopPropagation();
    
    // Use functional update to avoid stale state issues
    setSelectedProduct(prevSelected => {
      // If clicking the same product, close the popup
      if (prevSelected && prevSelected.id === product.id) {
        return null;
      }
      return product;
    });
    
    setSelectedShipping(null);
    setQuantity(1);
    setInsufficientFunds(false);
    
    // Zoom to the product location
    if (mapRef.current && product.coordinates) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: product.coordinates,
        zoom: 8,
        duration: 2000,
        essential: true,
        easing: (t) => t * (2 - t)
      });
    }
    
    // Fetch location for the selected product
    fetchLocationForProduct(product);
    
    if (onProductSelect) {
      onProductSelect(product);
    }
  }, [onProductSelect, fetchLocationForProduct]);

  // Notify parent when farmer coins change
  useEffect(() => {
    if (onFarmerCoinsChange) {
      onFarmerCoinsChange(farmerCoins);
    }
  }, [farmerCoins, onFarmerCoinsChange]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    zoomToFarm: (farm, autoOpenPopup = true) => {
      if (farm && farm.coordinates) {
        setViewState({
          ...viewState,
          longitude: farm.coordinates[0],
          latitude: farm.coordinates[1],
          zoom: 15,
          transitionDuration: 1000
        });
        
        if (autoOpenPopup) {
          // Set the selected product to open the popup
          setSelectedProduct(farm);
          
          // Fetch location for the product
          fetchLocationForProduct(farm);
          
          // Use setTimeout to ensure the map has finished transitioning before calculating popup position
          setTimeout(() => {
            if (mapRef.current) {
              const map = mapRef.current.getMap();
              const [lng, lat] = farm.coordinates || [];
              if (lng !== undefined && lat !== undefined) {
                const point = map.project([lng, lat]);
                const mapContainer = map.getContainer();
                const rect = mapContainer.getBoundingClientRect();
                
                setPopupPosition({
                  left: point.x,
                  top: point.y - 10,
                  transform: 'translate(-50%, -100%)'
                });
              }
            }
          }, 1200); // Wait for zoom transition to complete
        }
      }
    },
    getFarmerCoins: () => farmerCoins
  }), [viewState, farmerCoins, fetchLocationForProduct]);

  // Load farms data
  useEffect(() => {
    if (externalFarms && externalFarms.length > 0) {
      // Use external farms data if provided
      setFarms(externalFarms);
      setFilteredFarms(externalFarms);
      if (onFarmsLoad) {
        onFarmsLoad(externalFarms);
      }
    } else {
      // Load from persistent storage first, then fallback to service
      const loadFarms = async () => {
        try {
          // Load from persistent storage
          const storedFields = storageService.getFields(); // Use getFields instead of getAllFields
          const storedOrders = storageService.getUserOrders();
          const storedRentedFields = storageService.getUserRentedFields();
          
          // Load farmer-created fields
          const farmerCreatedFields = storageService.getFarmerCreatedFields();
          
          // Load mock data for demo purposes
          let mockFields = [];
          try {
            const response = await mockProductService.getProducts();
            mockFields = response.data.products || [];
          } catch (error) {
            console.error('Failed to load mock data:', error);
          }
          
          // Combine all fields (mock data + stored fields + farmer-created fields)
          const allFields = [...mockFields, ...storedFields, ...farmerCreatedFields];
          
          // Mark purchased fields
          const purchasedFieldIds = new Set([
            ...storedOrders.map(order => order.fieldId),
            ...storedRentedFields.map(field => field.id)
          ]);
          
          // Set rented fields for glow animation
          const rentedFieldIds = new Set(storedRentedFields.map(field => field.id));
          setRentedFields(rentedFieldIds);
          
          // Update fields with purchase status and farmer-created indicator
          const fieldsWithPurchaseStatus = allFields.map(field => ({
            ...field,
            isPurchased: purchasedFieldIds.has(field.id),
            isFarmerCreated: farmerCreatedFields.some(f => f.id === field.id)
          }));
          
          setFarms(fieldsWithPurchaseStatus);
          setFilteredFarms(fieldsWithPurchaseStatus);
          if (onFarmsLoad) {
            onFarmsLoad(fieldsWithPurchaseStatus);
          }
        } catch (error) {
          console.error('Failed to load farms:', error);
          // Fallback to mock data on error
          try {
            const response = await mockProductService.getProducts();
            setFarms(response.data.products);
            setFilteredFarms(response.data.products);
            if (onFarmsLoad) {
              onFarmsLoad(response.data.products);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback farms:', fallbackError);
          }
        }
      };
      loadFarms();
    }
  }, [onFarmsLoad, externalFarms]);

  // Filter farms based on search query (keep all farms visible on map)
  useEffect(() => {
    // For the dropdown search, we don't filter the map display
    // All farms remain visible on the map
    setFilteredFarms(farms);
  }, [searchQuery, farms]);

  const isPurchased = useCallback((productId) => {
    const farm = farms.find(f => f.id === productId);
    return farm ? farm.isPurchased : false || purchasedFarms.has(productId) || purchasedProductIds.includes(productId);
  }, [farms, purchasedFarms, purchasedProductIds]);

  const handleBuyNow = async (product) => {
    const totalCostInDollars = (product.price_per_m2 || 0.55) * quantity;
    const totalCostInCoins = Math.ceil(totalCostInDollars); // 1 coin = $100, so we need totalCostInDollars/100 coins
    const availableInDollars = farmerCoins * 100; // Convert coins to dollar equivalent
    
    // Reset insufficient funds error
    setInsufficientFunds(false);
    
    if (availableInDollars < totalCostInDollars) {
      setInsufficientFunds(true);
      return;
    }
    
    // Check if user is trying to purchase from their own farm
    const currentUserId = storageService.getCurrentUserId();
    if (product.farmer_id === currentUserId || product.created_by === currentUserId) {
      if (onNotification) {
        onNotification('You cannot purchase from your own farm!', 'error');
      }
      return;
    }
    
    try {
      // Create order data
      const orderData = {
        id: Date.now(),
        fieldId: product.id,
        product_name: product.name,
        name: product.name,
        farmer_name: product.farmer_name || 'Farm Owner',
        farmer_id: product.farmer_id || product.created_by,
        location: product.location || 'Unknown Location',
        area_rented: quantity,
        area: quantity,
        crop_type: product.category || 'Mixed Crops',
        total_cost: totalCostInDollars,
        cost: totalCostInDollars,
        price_per_unit: product.price || 0.55,
        monthly_rent: Math.round(totalCostInDollars / 6), // Assuming 6-month rental
        status: 'confirmed',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        progress: 0,
        notes: `Purchased via marketplace. Shipping: ${selectedShipping || 'Delivery'}`,
        shipping_method: selectedShipping || 'Delivery',
        created_at: new Date().toISOString()
      };
      
      // Save order to persistent storage
      storageService.saveOrder(orderData);
      
      // Create rented field data
      const rentedFieldData = {
        id: product.id,
        fieldId: product.id,
        name: product.name,
        farmer_name: product.farmer_name || 'Farm Owner',
        farmer_id: product.farmer_id || product.created_by,
        location: product.location || 'Unknown Location',
        area_rented: quantity,
        crop_type: product.category || 'Mixed Crops',
        total_cost: totalCostInDollars,
        monthly_rent: Math.round(totalCostInDollars / 6),
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        coordinates: product.coordinates,
        created_at: new Date().toISOString()
      };
      
      // Save rented field to persistent storage
      storageService.saveRentedField(rentedFieldData);
      
      // Also create order via mock service for compatibility
      await mockOrderService.createOrder(orderData);
      
      // Update field as purchased in storage
      const updatedField = { ...product, isPurchased: true };
      storageService.updateField(updatedField);
      
      // Update UI state
      setPurchasedFarms(prev => new Set([...prev, product.id]));
      setFarmerCoins(prev => prev - totalCostInCoins);
      if (onNotification) {
        onNotification(`Successfully purchased ${product.name}! Order created and saved to your order history.`, 'success');
      }
      setSelectedProduct(null);
      setQuantity(1);
      setInsufficientFunds(false);
      
      setBlinkingFarms(prev => new Set([...prev, product.id]));
      setTimeout(() => {
        setBlinkingFarms(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      }, 3000);
      
      // Reload farms to reflect purchase status
      const storedFields = storageService.getAllFields();
      const storedOrders = storageService.getUserOrders();
      const storedRentedFields = storageService.getUserRentedFields();
      
      // Load farmer-created fields
      const farmerCreatedFields = storageService.getFarmerCreatedFields();
      
      // Combine stored fields with farmer-created fields
      const allFields = [...storedFields, ...farmerCreatedFields];
      
      // Mark purchased fields
      const purchasedFieldIds = new Set([
        ...storedOrders.map(order => order.fieldId),
        ...storedRentedFields.map(field => field.id)
      ]);
      
      // Update fields with purchase status and farmer-created indicator
      const fieldsWithPurchaseStatus = allFields.map(field => ({
        ...field,
        isPurchased: purchasedFieldIds.has(field.id),
        isFarmerCreated: farmerCreatedFields.some(f => f.id === field.id)
      }));
      
      setFarms(fieldsWithPurchaseStatus);
      setFilteredFarms(fieldsWithPurchaseStatus);
      
      // If this is a farmer-created field, create a farm order and send notification
      if (product.isFarmerCreated) {
        const farmOrder = {
          id: `order_${Date.now()}`,
          fieldId: product.id,
          fieldName: product.name,
          buyerId: 'buyer@test.com', // Current buyer
          buyerName: 'Test Buyer',
          farmerId: product.createdBy || 'farmer@test.com',
          quantity: quantity,
          totalPrice: totalCostInCoins,
          status: 'pending',
          createdAt: new Date().toISOString(),
          shippingMethod: selectedShipping || 'Delivery'
        };
        
        // Add farm order
        storageService.addFarmOrder(farmOrder);
        
        // Send notification to farmer
        const notification = {
          id: `notif_${Date.now()}`,
          type: 'new_order',
          title: 'New Field Purchase Order',
          message: `${farmOrder.buyerName} purchased ${quantity}m² of your field "${product.name}" for $${totalCostInCoins}`,
          fieldId: product.id,
          orderId: farmOrder.id,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        storageService.addNotification(farmOrder.farmerId, notification);
        
        if (onNotification) {
          onNotification(`Order sent to farmer! You will be notified when the farmer responds.`, 'success');
        }
      }
      
    } catch (error) {
      console.error('Failed to create order:', error);
      if (onNotification) {
        onNotification('Purchase failed. Please try again.', 'error');
      }
      setSelectedProduct(null);
      setInsufficientFunds(false);
      setQuantity(1);
    }
  };

  // EnhancedFarmMap.js
// Add this useEffect to reset selected product when farms change
useEffect(() => {
  // Reset selected product when farms array changes (new product added)
  setSelectedProduct(null);
  setPopupPosition(null);
  setInsufficientFunds(false);
}, [farms]); // Reset when farms array changes

  // In your EnhancedFarmMap component, add this:
useEffect(() => {
  if (selectedProduct) {
    console.log('Selected product data:', selectedProduct);
    console.log('Product category:', selectedProduct.category);
    console.log('Icon URL:', getProductIcon(selectedProduct.category));
  }
}, [selectedProduct]);

// Debug selected product changes
useEffect(() => {
  console.log('Selected Product Changed:', selectedProduct);
  if (selectedProduct) {
    console.log('Product Data:', {
      id: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      coordinates: selectedProduct.coordinates
    });
  }
}, [selectedProduct]);

// Debug farms changes
useEffect(() => {
  console.log('Farms Updated:', farms.length, 'farms');
  if (farms.length > 0) {
    console.log('Latest Farm:', farms[farms.length - 1]);
  }
}, [farms]);

  // Update popup position whenever selectedProduct or map view changes
  useEffect(() => {
    if (selectedProduct && mapRef.current) {
      const map = mapRef.current.getMap();
      const [lng, lat] = selectedProduct.coordinates || [];
      if (typeof lng === 'number' && typeof lat === 'number') {
        const point = map.project([lng, lat]);
        
        // Get map container dimensions
        const mapContainer = mapRef.current.getContainer();
        const mapWidth = mapContainer.offsetWidth;
        const mapHeight = mapContainer.offsetHeight;
        
        // Popup dimensions (approximate)
        const popupWidth = 380;
        const popupHeight = 400;
        
        // Calculate optimal position to prevent cropping
        let left = point.x;
        let top = point.y;
        let transform = 'translate(-50%, -100%)';
        
        // Adjust horizontal position if popup would be cropped
        if (point.x - popupWidth / 2 < 0) {
          // Too close to left edge
          left = popupWidth / 2 + 10;
          transform = 'translate(-50%, -100%)';
        } else if (point.x + popupWidth / 2 > mapWidth) {
          // Too close to right edge
          left = mapWidth - popupWidth / 2 - 10;
          transform = 'translate(-50%, -100%)';
        }
        
        // Adjust vertical position if popup would be cropped
        if (point.y - popupHeight < 0) {
          // Too close to top edge, show popup below the marker
          top = point.y + 20;
          transform = transform.replace('-100%', '0%');
        } else if (point.y > mapHeight - 50) {
          // Too close to bottom edge, show popup above
          top = point.y - 20;
          transform = transform.replace('-100%', '-100%');
        }
        
        setPopupPosition({ left, top, transform });
      } else {
        setPopupPosition(null);
      }
    } else {
      setPopupPosition(null);
    }
  }, [selectedProduct, viewState]);


  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative'}}>
      <MapboxMap
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={() => {
              setSelectedProduct(null);
              setPopupPosition(null); // Also clear popup position
              setInsufficientFunds(false);
            }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        style={{ width: '100%', height: '100%', marginTop: '-65px' }}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        projection="globe"
        initialViewState={{
          longitude: 120,
          latitude: 0,
          zoom: 1.5,
        }}
      >

        <NavigationControl position="top-right" style={{ marginTop: '80px', marginRight: '10px' }} />
        <FullscreenControl position="top-right" style={{ marginTop: '35px', marginRight: '10px' }} />
        
        {/* Home Control Button */}
        <div 
          style={{
            position: 'absolute',
            top: '170px',
            right: '10px',
            zIndex: 1
          }}
        >
          <button
            onClick={() => {
              setSelectedProduct(null); // Close any open popup
              setPopupPosition(null); // Also clear popup position
        setInsufficientFunds(false);
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [120, 0],
                  zoom: 1.5,
                  duration: 2000,
                  easing: (t) => t * (2 - t)
                });
              }
            }}
            style={{
              background: '#fff',
              border: '2px solid rgba(0,0,0,.1)',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              boxShadow: '0 0 0 2px rgba(0,0,0,.1)',
              width: '29px',
              height: '29px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Reset to home view"
          >
            🏠
          </button>
        </div>

        {/* Farm Markers */}
        {filteredFarms.map((product) => (
          <Marker
            key={product.id}
            longitude={product.coordinates[0]}
            latitude={product.coordinates[1]}
            anchor="center"
          >
            <div style={{ position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={(e) => handleProductClick(e, product)} >
              <img
                src={getProductIcon(product.category)}
                alt={product.name}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: product.isFarmerCreated ? '3px solid #4CAF50' : 'none',
                  filter: blinkingFarms.has(product.id) 
                    ? 'drop-shadow(0 0 15px rgba(255, 193, 7, 0.9)) drop-shadow(0 0 30px rgba(255, 193, 7, 0.7))'
                    : isPurchased(product.id) 
                    ? 'brightness(1) drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.7))'
                    : rentedFields.has(product.id)
                    ? 'brightness(1.1) drop-shadow(0 0 10px rgba(76, 175, 80, 0.8)) drop-shadow(0 0 20px rgba(76, 175, 80, 0.6))'
                    : product.isFarmerCreated
                    ? 'brightness(1.1) drop-shadow(0 0 8px rgba(76, 175, 80, 0.6)) drop-shadow(0 0 16px rgba(76, 175, 80, 0.4))'
                    : 'none',
                  backgroundColor: 'transparent',
                  padding: '0',
                  transition: 'all 0.3s ease',

                  animation: blinkingFarms.has(product.id) 
                    ? 'glow-blink 0.8s infinite' 
                    : isPurchased(product.id) 
                    ? 'glow-pulse-white 1.5s infinite, heartbeat 2s infinite' 
                    : rentedFields.has(product.id)
                    ? 'glow-steady-green 2s infinite'
                    : product.isFarmerCreated
                    ? 'glow-farmer-created 3s infinite'
                    : 'none',
                }}
              />
              {/* Farmer Created Badge */}
              {product.isFarmerCreated && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#4CAF50',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 10
                }}>
                  F
                </div>
              )}
            </div>
          </Marker>
        ))}
      </MapboxMap>

      {/* Custom Scale Bar */}
      <CustomScaleBar map={mapRef.current?.getMap()} />

      {/* Product Summary Bar */}
      <ProductSummaryBar 
        mapRef={mapRef} 
        farms={farms} 
        onProductClick={handleProductClick}
      />

      {/* Custom Popup */}
      {selectedProduct && popupPosition && (
  <div
  key={`popup-${selectedProduct.id}-${Date.now()}`}
    style={{
      position: 'absolute',
      left: popupPosition.left,
      top: popupPosition.top,
      transform: popupPosition.transform || 'translate(-50%, -100%)',
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0',
        width: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #e9ecef',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Header with close button and webcam icon */}
      <div style={{ position: 'relative', padding: '8px 16px 0' }}>
        <div
          onClick={() => {
          setSelectedProduct(null);
          setInsufficientFunds(false);
        }}
          style={{
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6c757d',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          ✕
        </div>
        
        {/* Edit button for farmers - only show for farmer's own fields */}
        {userType === 'farmer' && selectedProduct.isOwnField && onEditField && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '72px',
            width: '32px',
            height: '32px',
            backgroundColor: '#28a745',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.2s ease',
            border: '2px solid white',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
          }}
          onClick={() => onEditField(selectedProduct)}
          title="Edit Field"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
        )}

        {/* Webcam icon - positioned in header */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '40px',
          width: '32px',
          height: '32px',
          backgroundColor: '#007bff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
          transition: 'all 0.2s ease',
          border: '2px solid white',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#0056b3';
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#007bff';
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
        }}
        title="View Live Camera Feed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
          </svg>
        </div>
        
        {/* Location */}
        <div style={{
          fontSize: '10px',
          color: '#6c757d',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500
        }}>
          {productLocations.get(selectedProduct.id) || selectedProduct.location || 'LOADING LOCATION...'}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 16px' }}>
        {/* Main Content Row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          {/* Left side - Product Image */}
          <div style={{ 
            width: '70px', 
            height: '70px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            flexShrink: 0
          }}>
            <img
              src={selectedProduct.image || getProductIcon(selectedProduct.category)}
              alt={selectedProduct.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
            />
          </div>

          {/* Middle - Product Info */}
          <div style={{ flex: 1 }}>
            {/* Product Name and Category */}
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
              {selectedProduct.category || 'Category'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#212529', marginBottom: '2px' }}>
              {selectedProduct.name || 'Product Name'}
            </div>
            
            {/* Farm Name */}
            {selectedProduct.farmName && (
              <div style={{ fontSize: '11px', color: '#28a745', marginBottom: '2px', fontWeight: 500 }}>
                🏡 {selectedProduct.farmName}
              </div>
            )}
            
            {/* Farmer Name */}
            <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '8px' }}>
              ({selectedProduct.farmer_name || (selectedProduct.isOwnField && user?.name) || user?.name || 'Farmer Name'})
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1px', marginBottom: '2px' }}>
              {[1,2,3,4,5].map((star) => (
                <span key={star} style={{ color: star <= 4 ? '#ffc107' : '#e9ecef', fontSize: '12px' }}>★</span>
              ))}
            </div>

            {/* Weather */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '12px' }}>🌤️</span>
              <div style={{ fontSize: '11px', color: '#6c757d' }}>
                {selectedProduct.weather || '6.4°C - overcast clouds'}
              </div>
            </div>
          </div>

          {/* Right side - Area Info */}
          <div style={{ 
            width: '70px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>
              {selectedProduct.occupied_area || 0}/{selectedProduct.total_area || selectedProduct.fieldSize || 0}m²
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e9ecef',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '3px'
            }}>
              <div style={{
                width: `${Math.round(((selectedProduct.occupied_area || 0) / (selectedProduct.total_area || selectedProduct.fieldSize || 1)) * 100)}%`,
                height: '100%',
                backgroundColor: '#28a745'
              }} />
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#28a745', 
              fontWeight: 600,
              textAlign: 'right'
            }}>
              {Math.round(((selectedProduct.occupied_area || 0) / (selectedProduct.total_area || selectedProduct.fieldSize || 1)) * 100)}%
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '12px 0' }} />

        {/* Harvest Dates */}
        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '12px' }}>
          {(() => {
            const harvestDates = selectedProduct.harvestDates;
            const singleDate = selectedProduct.harvest_date || selectedProduct.harvestDate;
            
            // Function to format a date
            const formatDate = (date) => {
              if (!date) return null;
              
              // If it's already in the desired format, return as is
              if (typeof date === 'string' && /^\d{1,2}\s\w{3}\s\d{4}$/.test(date)) {
                return date;
              }
              
              // Try to parse and format the date
              try {
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) return date; // Return original if invalid
                
                const day = parsedDate.getDate();
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = months[parsedDate.getMonth()];
                const year = parsedDate.getFullYear();
                
                return `${day} ${month} ${year}`;
              } catch (e) {
                return date; // Return original if parsing fails
              }
            };
            
            // Handle multiple harvest dates
            if (harvestDates && Array.isArray(harvestDates) && harvestDates.length > 0) {
              const validDates = harvestDates.filter(hd => hd.date && hd.date.trim() !== '');
              
              if (validDates.length === 0) {
                return 'Estimated harvest Date: Not specified';
              }
              
              if (validDates.length === 1) {
                const formattedDate = formatDate(validDates[0].date);
                const label = validDates[0].label ? ` (${validDates[0].label})` : '';
                return `Estimated harvest Date: ${formattedDate}${label}`;
              }
              
              // Multiple dates
              return (
                <div>
                  <div style={{ marginBottom: '4px', fontWeight: '500' }}>Estimated harvest Dates:</div>
                  {validDates.map((hd, index) => {
                    const formattedDate = formatDate(hd.date);
                    const label = hd.label ? ` (${hd.label})` : '';
                    return (
                      <div key={index} style={{ marginLeft: '8px', fontSize: '11px' }}>
                        • {formattedDate}{label}
                      </div>
                    );
                  })}
                </div>
              );
            }
            
            // Fallback to single date
            const formattedDate = formatDate(singleDate);
            return `Estimated harvest Date: ${formattedDate || 'Not specified'}`;
          })()}
        </div>

        {/* Bottom Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left Side - Quantity, Price, Shipping */}
          <div style={{ flex: 1 }}>
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '24px',
                    height: '24px',
                    fontSize: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '3px',
                    border: '1px solid #e9ecef',
                    color: '#6c757d',
                    cursor: 'pointer'
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, value));
                    setInsufficientFunds(false);
                  }}
                  style={{
                    width: '40px',
                    height: '24px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    border: '1px solid #e9ecef',
                    borderRadius: '3px',
                    backgroundColor: '#fff',
                    color: '#212529',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '24px',
                    height: '24px',
                    fontSize: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '3px',
                    border: '1px solid #e9ecef',
                    color: '#6c757d',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>m²</div>
              </div>
            </div>

            {/* Price Info */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                Price {(selectedProduct.price_per_m2 || selectedProduct.price || selectedProduct.sellingPrice || 0).toFixed(2)}$/m²
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                Exp Prod {selectedProduct.production_rate || selectedProduct.productionRate || 'N/A'} Kg
              </div>
            </div>

            {/* Shipping Options */}
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px', fontWeight: 500 }}>
                {isPurchased(selectedProduct.id) ? 'Selected Shipping:' : 'Shipping Options:'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {isPurchased(selectedProduct.id) ? (
                  // For purchased products, show only the selected shipping option
                  <div
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500
                    }}
                  >
                    {(() => {
                      // Determine selected shipping based on available options
                      const availableOptions = [];
                      if (selectedProduct.shipping_pickup) availableOptions.push('Pickup');
                      if (selectedProduct.shipping_delivery) availableOptions.push('Delivery');
                      
                      // If both are available, show the currently selected one, otherwise show the available one
                      if (availableOptions.length === 2) {
                        return selectedShipping || 'Delivery';
                      } else if (availableOptions.length === 1) {
                        return availableOptions[0];
                      } else {
                        return 'Delivery'; // Default fallback
                      }
                    })()
                    }
                  </div>
                ) : (
                  // For non-purchased products, show selectable options
                  (() => {
                    const availableOptions = [];
                    if (selectedProduct.shipping_pickup) availableOptions.push('Pickup');
                    if (selectedProduct.shipping_delivery) availableOptions.push('Delivery');
                    
                    return (availableOptions.length > 0 ? availableOptions : ['Delivery', 'Pickup']).map((option) => (
                      <div
                        key={option}
                        onClick={() => setSelectedShipping(option)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: selectedShipping === option ? '#007bff' : '#f8f9fa',
                          color: selectedShipping === option ? 'white' : '#6c757d',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          border: selectedShipping === option ? 'none' : '1px solid #e9ecef',
                          fontWeight: 500
                        }}
                      >
                        {option}
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Buy Now Button and Total Price */}
          <div style={{ 
            width: '100px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            marginLeft: '12px'
          }}>
            <button
              onClick={() => handleBuyNow(selectedProduct)}
              disabled={isPurchased(selectedProduct.id) || !selectedShipping}
              style={{
                width: '100%',
                backgroundColor: isPurchased(selectedProduct.id) ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isPurchased(selectedProduct.id) || !selectedShipping ? 'not-allowed' : 'pointer',
                opacity: isPurchased(selectedProduct.id) || !selectedShipping ? 0.7 : 1,
                marginBottom: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {isPurchased(selectedProduct.id) ? 'Purchased' : 'BUY NOW'}
            </button>

            {/* Total Price */}
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#212529', 
              textAlign: 'center',
              marginBottom: '6px'
            }}>
              Total Price ${((selectedProduct.price_per_m2 || selectedProduct.price || 0) * quantity).toFixed(2)}
            </div>

            {/* Farmer Coins */}
            <div style={{
              fontSize: '11px',
              color: '#6c757d',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '1px' }}>Available Farmer Coins: {farmerCoins}</div>
            </div>

            {/* Insufficient Funds Error */}
            {insufficientFunds && (
              <div style={{
                fontSize: '11px',
                color: '#dc3545',
                textAlign: 'center',
                marginTop: '8px',
                fontWeight: 600
              }}>
                Can't be bought - you have insufficient coins!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Keyframes for animations */}
      <style>
        {`
          @keyframes glow-blink {
            0% { 
              filter: drop-shadow(0 0 15px rgba(255, 193, 7, 0.9)) drop-shadow(0 0 30px rgba(255, 193, 7, 0.7));
            }
            50% { 
              filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.5)) drop-shadow(0 0 16px rgba(255, 193, 7, 0.3));
            }
            100% { 
              filter: drop-shadow(0 0 15px rgba(255, 193, 7, 0.9)) drop-shadow(0 0 30px rgba(255, 193, 7, 0.7));
            }
          }

          @keyframes glow-pulse-white {
            0% { 
              filter: brightness(1) drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.7));
              transform: scale(1);
            }
            50% { 
              filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 1)) drop-shadow(0 0 35px rgba(255, 255, 255, 0.9));
              transform: scale(1.05);
            }
            100% { 
              filter: brightness(1) drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.7));
              transform: scale(1);
            }
          }

          @keyframes heartbeat {
            0% {
              transform: scale(1);
            }
            25% {
              transform: scale(1.1);
            }
            50% {
              transform: scale(1);
            }
            75% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes enhanced-pulse {
            0% {
              filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0.7));
            }
            50% {
              filter: brightness(1.2) drop-shadow(0 0 5px rgba(255, 255, 255, 0.9));
            }
            100% {
              filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0.7));
            }
          }

          @keyframes glow-steady-blue {
            0% { 
              filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.6));
            }
            100% { 
              filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.6));
            }
          }

          @keyframes glow-steady-green {
            0% { 
              filter: brightness(1.1) drop-shadow(0 0 10px rgba(76, 175, 80, 0.8)) drop-shadow(0 0 20px rgba(76, 175, 80, 0.6));
            }
            50% { 
              filter: brightness(1.2) drop-shadow(0 0 15px rgba(76, 175, 80, 0.9)) drop-shadow(0 0 25px rgba(76, 175, 80, 0.7));
            }
            100% { 
              filter: brightness(1.1) drop-shadow(0 0 10px rgba(76, 175, 80, 0.8)) drop-shadow(0 0 20px rgba(76, 175, 80, 0.6));
            }
          }

          @keyframes glow-farmer-created {
            0% { 
              filter: brightness(1.05) drop-shadow(0 0 6px rgba(76, 175, 80, 0.5)) drop-shadow(0 0 12px rgba(76, 175, 80, 0.3));
            }
            50% { 
              filter: brightness(1.15) drop-shadow(0 0 10px rgba(76, 175, 80, 0.7)) drop-shadow(0 0 18px rgba(76, 175, 80, 0.5));
            }
            100% { 
              filter: brightness(1.05) drop-shadow(0 0 6px rgba(76, 175, 80, 0.5)) drop-shadow(0 0 12px rgba(76, 175, 80, 0.3));
            }
          }
        `}
      </style>
    </div>
  );
});

export default EnhancedFarmMap;
