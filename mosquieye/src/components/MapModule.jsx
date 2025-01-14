import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { loadGoogleMapsAPI } from '../scenes/utils/googleMapsLoader';

const MapModule = ({ data = [], height = "400px", isEmbedded = true }) => {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API;

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      setError('API key not configured');
      setIsLoading(false);
      return;
    }

    if (!mapRef.current) return;

    loadGoogleMapsAPI(apiKey)
      .then((google) => {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 1.5587898459904728, lng: 103.63767742492678 },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          styles: [] // Light mode
        });

        if (data.length > 0) {
          try {
            const heatmapData = data
              .filter(point => point.location?.coordinates?.length === 2)
              .map(point => ({
                location: new google.maps.LatLng(
                  point.location.coordinates[1],
                  point.location.coordinates[0]
                ),
                weight: point.totalEggs || 1
              }));

            new google.maps.visualization.HeatmapLayer({
              data: heatmapData,
              map: map,
              radius: 20,
              opacity: 0.8
            });
          } catch (err) {
            console.error('Error creating heatmap:', err);
            setError('Error creating heatmap');
          }
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Google Maps API failed to load', error);
        setError('Failed to load map');
        setIsLoading(false);
      });
  }, [apiKey, data]);

  return (
    <Box sx={{ height, width: "100%", position: "relative" }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box
          ref={mapRef}
          sx={{
            height: "100%",
            width: "100%",
            borderRadius: "4px"
          }}
        />
      )}
    </Box>
  );
};

export default MapModule;