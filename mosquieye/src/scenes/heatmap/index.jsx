import React, { useEffect, useState } from 'react';

// Utility function to load Google Maps API
const loadGoogleMapsAPI = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps); // If already loaded, return the maps object
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`; // Load visualization library for heatmap
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    }
  });
};

const Heatmap = () => {
  const [googleMaps, setGoogleMaps] = useState(null);
  const [map, setMap] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API;

  useEffect(() => {
    if (apiKey) {
      loadGoogleMapsAPI(apiKey)
        .then((googleMaps) => {
          setGoogleMaps(googleMaps);
          const mapElement = document.getElementById('heatmap');
          const mapInstance = new googleMaps.Map(mapElement, {
            center: { lat: 1.4927, lng: 103.7414 }, // Coordinates for Johor Bahru, Malaysia
            zoom: 13,
          });
          setMap(mapInstance);

          const heatmapData = [
            new googleMaps.LatLng(1.4927, 103.7414),
            // Add more LatLng points here
          ];

          const heatmapInstance = new googleMaps.visualization.HeatmapLayer({
            data: heatmapData,
            map: mapInstance,
            radius: 50,
          });
          setHeatmap(heatmapInstance);
        })
        .catch((error) => {
          console.error('Google Maps API failed to load', error);
        });
    } else {
      console.error('Google Maps API key is missing!');
    }
  }, [apiKey]);

  return <div id="heatmap" style={{ height: '100vh', width: '100%' }}></div>;
};

export default Heatmap;