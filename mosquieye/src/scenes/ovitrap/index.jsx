import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';
import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  DialogActions, 
  useTheme,
  Typography 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import GoogleMapReact from 'google-map-react';
import { QRCodeCanvas } from 'qrcode.react';

const Ovitrap = () => {
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useUser();
  const [ovitraps, setOvitraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOvitrap, setSelectedOvitrap] = useState(null);
  const [qrDialog, setQrDialog] = useState({
    open: false,
    ovitrapId: ''
  });
  const [formData, setFormData] = useState({
    ovitrapId: "",
    location: {
      coordinates: [103.6372, 1.5535] // [longitude, latitude]
    },
    status: "active",
    metadata: {
      area: "",
      district: "",
      address: ""
    }
  });
  const [mapCenter, setMapCenter] = useState({
    lat: 1.5535,
    lng: 103.6372
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 1.5535,
    lng: 103.6372
  });

  // Google Maps configuration
  const defaultProps = {
    center: {
      lat: 1.5535,
      lng: 103.6372
    },
    zoom: 15,
    options: {
      styles: [], // Empty styles array for light mode
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true
    }
  };

  const fetchOvitraps = async () => {
    try {
      const response = await axios.get('/api/ovitraps');
      console.log('Fetched ovitraps:', response.data);
      setOvitraps(response.data.ovitraps);
    } catch (error) {
      console.error('Error fetching ovitraps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleMapsAPI(apiKey).then(() => {
      fetchOvitraps();
    })
  }, [apiKey]);

  const handleCreateClick = () => {
    setSelectedOvitrap(null);
    setFormData({
      ovitrapId: "",
      location: {
        coordinates: [103.6372, 1.5535]
      },
      status: "Active",
      metadata: {
        area: "",
        district: "",
        address: ""
      }
    });
    setOpenDialog(true);
  };

  const handleEditClick = (ovitrap) => {
    setSelectedOvitrap(ovitrap);
    setMapCenter({
      lat: ovitrap.location.coordinates[1],
      lng: ovitrap.location.coordinates[0]
    });
    setFormData({
      ovitrapId: ovitrap.ovitrapId,
      location: ovitrap.location,
      status: ovitrap.status,
      metadata: ovitrap.metadata
    });
    setOpenDialog(true);
  };

  const handleMapClick = async ({ lat, lng, x, y }) => {
    try {
      setMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        location: {
          coordinates: [lng, lat] // MongoDB uses [longitude, latitude]
        }
      }));
  
      // Get address from coordinates using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const address = data.results[0].formatted_address;
        const addressComponents = data.results[0].address_components;
        
        let area = "";
        let district = "";
        
        addressComponents.forEach(component => {
          if (component.types.includes("sublocality")) {
            area = component.long_name;
          }
          if (component.types.includes("administrative_area_level_2")) {
            district = component.long_name;
          }
        });
  
        setFormData(prev => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            area,
            district,
            address
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };
  
  const handleSubmit = async () => {
    try {
      if (selectedOvitrap) {
        await axios.put(`/api/ovitraps/${selectedOvitrap.ovitrapId}`, formData);
      } else {
        await axios.post('/api/ovitraps', {
          ...formData,
          assignedUsers: [user.id]
        });
      }
      fetchOvitraps();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving ovitrap:', error);
    }
  };

  const handleDelete = async (ovitrapId) => {
    if (window.confirm('Are you sure you want to delete this ovitrap?')) {
      try {
        await axios.delete(`/api/ovitraps/${ovitrapId}`);
        fetchOvitraps();
      } catch (error) {
        console.error('Error deleting ovitrap:', error);
      }
    }
  };
  
  const columns = [
    { field: "ovitrapId", headerName: "ID", flex: 1 },
    { 
      field: "location", 
      headerName: "Location", 
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Typography 
            variant="body2"
            sx={{ 
              fontWeight: "bold",
              fontSize: "14px",
              lineHeight: 1.6
            }}
          >
            {params.row.metadata.address || 'No address'}
          </Typography>
          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{ 
              fontSize: "14px",
              lineHeight: 2,
              mt: '0px'
            }}
          >
            {`${params.row.location.coordinates[1].toFixed(6)}, ${params.row.location.coordinates[0].toFixed(6)}`}
          </Typography>
        </Box>
      )
    },
    { 
      field: "status", 
      headerName: "Status", 
      flex: 1,
      renderCell: (params) => (
        <Box
          width="90px"
          height="35px"
          p="0px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          backgroundColor={
            params.row.status === 'Active'
              ? colors.greenAccent[600]
              : params.row.status === 'Maintenance'
              ? colors.blueAccent[700]
              : colors.redAccent[700]
          }
          borderRadius="5px"
          sx={{ 
            marginTop: 1, 
            fontSize: "16px",
          }}
        >
          {params.row.status}
        </Box>
      )
    },
    { 
      field: "actions", 
      headerName: "Actions", 
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={() => handleEditClick(params.row)}
            sx={{ marginRight: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={() => handleDelete(params.row.ovitrapId)}
            sx={{ marginRight: 1, marginTop: 0 }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            onClick={() => setQrDialog({ open: true, ovitrapId: params.row.ovitrapId })}
          >
            Generate QR
          </Button>
        </Box>
      )
    }
  ];

  if (loading) {
    return <Box m="20px">Loading ovitraps...</Box>;
  }

  return (
    <Box m="20px">
      <Header title="OVITRAP MANAGEMENT" subtitle="Manage and Monitor Ovitraps" />
      
      <Box display="flex" justifyContent="end" mt="20px">
        <Button
          onClick={handleCreateClick}
          color="secondary"
          variant="contained"
          sx={{
            fontWeight: "bold"
          }}
        >
          Add New Ovitrap
        </Button>
      </Box>
  
      {loading ? (
      <Box m="20px">Loading ovitraps...</Box>
    ) : !ovitraps || ovitraps.length === 0 ? (
      <Box m="40px 0 0 0">No ovitraps found. Create one to get started.</Box>
    ) : (
      <Box
        m="40px 0 0 0"
        height="73vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            fontSize: "15px"
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            fontWeight: "bold",
            fontSize: "15px"
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          }
        }}
      >
        <DataGrid
          loading={loading}
          rows={ovitraps}
          columns={columns}
          getRowId={(row) => row.ovitrapId}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Box>
    )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOvitrap ? 'Edit Ovitrap' : 'Create New Ovitrap'}
        </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Ovitrap ID"
                value={formData.ovitrapId}
                onChange={(e) => setFormData({ ...formData, ovitrapId: e.target.value })}
                disabled={!!selectedOvitrap}
                required
                sx={{ mb: 2 }}
              />
              
              {/* Google Maps Picker */}
              <Box sx={{ height: '400px', width: '100%', mb: 2, position: 'relative' }}>
                <GoogleMapReact
                  bootstrapURLKeys={{ 
                    key: apiKey,
                    libraries: ['places'],
                    v: 'weekly'
                  }}
                  center={mapCenter}
                  defaultZoom={defaultProps.zoom}
                  options={defaultProps.options}
                  onChange={({ center }) => {
                    const newLat = center.lat;
                    const newLng = center.lng;
                    setFormData(prev => ({
                      ...prev,
                      location: {
                        coordinates: [newLng, newLat]
                      }
                    }));
                    handleMapClick({ lat: newLat, lng: newLng });
                  }}
                />
                {/* Center Marker - Outside GoogleMapReact */}
                <Box 
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    color: 'red',
                    fontSize: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  📍
                </Box>
              </Box>
        
              {/* Location Details */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Location Details
                </Typography>
                <TextField
                  fullWidth
                  label="Coordinates"
                  value={`${formData.location.coordinates[1].toFixed(6)}, ${formData.location.coordinates[0].toFixed(6)}`}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Area"
                  value={formData.metadata.area}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, area: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="District"
                  value={formData.metadata.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, district: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Address"
                  value={formData.metadata.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, address: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
              </Box>
        
              {/* Status Selection */}
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </TextField>
            </Box>
          </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.ovitrapId || !formData.metadata.address}
          >
            {selectedOvitrap ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Separate QR Dialog */}
    <Dialog 
      open={qrDialog.open} 
      onClose={() => setQrDialog({ open: false, ovitrapId: '' })}
    >
      <DialogTitle>QR Code for {qrDialog.ovitrapId}</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <QRCodeCanvas 
            value={qrDialog.ovitrapId}
            size={200}
            level={'H'}
            includeMargin={true}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => {
              const canvas = document.querySelector('canvas');
              const link = document.createElement('a');
              link.download = `qr-${qrDialog.ovitrapId}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
            }}
          >
            Download QR Code
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
    </Box>
  );
};

export default Ovitrap;