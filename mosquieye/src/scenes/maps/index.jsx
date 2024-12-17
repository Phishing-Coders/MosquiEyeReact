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
  const [searchBox, setSearchBox] = useState(null);
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API;

  // Variable to track the currently open InfoWindow
  let currentInfoWindow = null;

  useEffect(() => {
    // Load Google Maps API once the component is mounted
    if (apiKey) {
      loadGoogleMapsAPI(apiKey)
        .then((googleMaps) => {
          setGoogleMaps(googleMaps); // Store Google Maps in state
          const mapElement = document.getElementById('google-map');
          const mapInstance = new googleMaps.Map(mapElement, {
            center: { lat: 1.5587898459904728, lng: 103.63767742492678 }, // Example center (can be any coordinates)
            zoom: 15,
            mapTypeControl: false, // Optional controls
          });
          setMap(mapInstance); // Store the map instance in state

          // Add marker at specified location
          const markerData = [
            { lat: 1.5644561843974956, lng: 103.63506509867167, title: 'Ovitrap 1 (KTDI)' },
            { lat: 1.5609854914728014, lng: 103.63216432841786, title: 'Ovitrap 2 (KTF)' },
            { lat: 1.5763398434797995, lng: 103.62099469559664, title: 'Ovitrap 3 (KDOJ)' },
            { lat: 1.5664350968417495, lng: 103.62622627526456, title: 'Ovitrap 4 (KDSE)' },
            { lat: 1.5636920140360528, lng: 103.62812342302125, title: 'Ovitrap 5 (KTR)' },
          ];

          const newMarkers = markerData.map((data) => {
            const marker = new googleMaps.Marker({
              position: { lat: data.lat, lng: data.lng },
              map: mapInstance,
              title: data.title,
            });

            const infoWindow = new googleMaps.InfoWindow({
              content: `<div style="color: black;">${data.title}</div>`, // Set font color to black
            });

            marker.addListener('click', () => {
              // Close the previously opened infoWindow if there is one
              if (currentInfoWindow) {
                currentInfoWindow.close();
              }

              // Open the new infoWindow and update the currentInfoWindow reference
              infoWindow.open(mapInstance, marker);
              currentInfoWindow = infoWindow; // Set the current infoWindow
            });

            return marker;
          });

          // Create the search box and link it to the UI element.
          const input = document.getElementById('pac-input');
          const searchBox = new googleMaps.places.SearchBox(input);
          setSearchBox(searchBox);

          // Bias the SearchBox results towards current map's viewport.
          mapInstance.addListener('bounds_changed', () => {
            searchBox.setBounds(mapInstance.getBounds());
          });

          // Listen for the event fired when the user selects a prediction and retrieve
          // more details for that place.
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();

            if (places.length === 0) {
              return;
            }

            // Clear out the old markers.
            //marker.setMap(null);

            // For each place, get the icon, name, and location.
            const bounds = new googleMaps.LatLngBounds();
            places.forEach((place) => {
              if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
              }

              // Create a marker for each place.
              const newMarker = new googleMaps.Marker({
                map: mapInstance,
                title: place.name,
                position: place.geometry.location,
              });

              // Add info window to the new marker
              const newInfoWindow = new googleMaps.InfoWindow({
                content: `<div style="color: black;">${place.name}</div>` // Set font color to black
              });

              newMarker.addListener('click', () => {
                // Close the previously opened infoWindow if there is one
                if (currentInfoWindow) {
                  currentInfoWindow.close();
                }

                // Open the new infoWindow and update the currentInfoWindow reference
                newInfoWindow.open(mapInstance, newMarker);
                currentInfoWindow = newInfoWindow; // Set the current infoWindow
              });

              if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(place.geometry.location);
              }
            });
            mapInstance.fitBounds(bounds);
          });
        })
        .catch((error) => {
          console.error('Google Maps API failed to load', error);
        });
    } else {
      console.error('Google Maps API key is missing!');
    }
  }, [apiKey]);

  return (
    <div style={{ height: '100vh', margin: 0 }}>
      {/* Search input with native X button */}
      <input
      id="pac-input"
      className="controls"
      type="search" // Use "search" type for native clear button
      placeholder="Search Box"
      style={{
      boxSizing: 'border-box',
      border: '1px solid transparent',
      width: '270px',
      height: '32px',
      marginTop: '8px',
      padding: '0 12px',
      borderRadius: '18px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
      fontSize: '14px',
      outline: 'black',
      textOverflow: 'ellipsis',
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
    }}
  />
      {/* Container for Google Map */}
      <div id="google-map" style={{ height: '93%' }}></div>
    </div>
  );
};

export default MapPage;
