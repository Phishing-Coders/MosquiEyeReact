import React, { useEffect, useState } from 'react';

// Utility function to load Google Maps API
const loadGoogleMapsAPI = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps); // If already loaded, return the maps object
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`; // Libraries can be added here
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    }
  });
};

const MapPage = () => {
  const [googleMaps, setGoogleMaps] = useState(null);
  const [map, setMap] = useState(null);
  const apiKey = 'AIzaSyCoaxAUA18nH_mzQi9X7JwSnTXSPpMlmg4'; // Provided API Key

  useEffect(() => {
    // Load Google Maps API once the component is mounted
    loadGoogleMapsAPI(apiKey)
      .then((googleMaps) => {
        setGoogleMaps(googleMaps); // Store Google Maps in state
        const mapElement = document.getElementById('google-map');
        const mapInstance = new googleMaps.Map(mapElement, {
          center: { lat: 1.4927, lng: 103.7414 }, // Example center (New York)
          zoom: 13,
          mapTypeControl: false, // Optional controls
        });
        setMap(mapInstance); // Store the map instance in state
      })
      .catch((error) => {
        console.error('Google Maps API failed to load', error);
      });
  }, [apiKey]);

  return (
    <div style={{ height: '100vh', margin: 0 }}>
      {/* Container for Google Map */}
      <div id="google-map" style={{ height: '100%' }}></div>
    </div>
  );
};

export default MapPage;
