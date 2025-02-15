import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';

const MapPage = () => {
  const [googleMaps, setGoogleMaps] = useState(null);
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(true);
  const [currentInfoWindow, setCurrentInfoWindow] = useState(null);
  const [ovitraps, setOvitraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API;

  const heatmapData = useMemo(() => 
    ovitraps.map(ovitrap => ({
      lat: ovitrap.location.coordinates[1],
      lng: ovitrap.location.coordinates[0],
      weight: ovitrap.status === 'Active' ? 10 : 
              ovitrap.status === 'Maintenance' ? 5 : 1
    })), [ovitraps]);

  const markerData = useMemo(() => 
    ovitraps.map(ovitrap => ({
      lat: ovitrap.location.coordinates[1],
      lng: ovitrap.location.coordinates[0],
      title: `Ovitrap ${ovitrap.ovitrapId} (${ovitrap.metadata.area})`
    })), [ovitraps]);

  const fetchOvitraps = async () => {
    try {
      const response = await axios.get('/api/ovitraps');
      setOvitraps(response.data.ovitraps);
      console.log('Fetched ovitraps:', response.data.ovitraps);
    } catch (error) {
      console.error('Error fetching ovitraps:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHeatmap = useCallback(() => {
    if (heatmap) {
      setIsHeatmapVisible(prev => {
        heatmap.setMap(!prev ? map : null);
        return !prev;
      });
    }
  }, [heatmap, map]);

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is missing!');
      return;
    }

    loadGoogleMapsAPI(apiKey)
      .then((googleMaps) => {
        setGoogleMaps(googleMaps);
        
        const mapInstance = new googleMaps.Map(document.getElementById('google-map'), {
          center: { lat: 1.5587898459904728, lng: 103.63767742492678 },
          zoom: 15,
          mapTypeControl: false,
        });
        setMap(mapInstance);

        const heatmapPoints = heatmapData.map(point => ({
          location: new googleMaps.LatLng(point.lat, point.lng),
          weight: point.weight
        }));

        const heatmapLayer = new googleMaps.visualization.HeatmapLayer({
          data: heatmapPoints,
          map: mapInstance,
          radius: 100,
          opacity: 0.7,
        });
        setHeatmap(heatmapLayer);

        const input = document.getElementById('pac-input');
        const searchBoxInstance = new googleMaps.places.SearchBox(input);
        setSearchBox(searchBoxInstance);

        mapInstance.addListener('bounds_changed', () => {
          searchBoxInstance.setBounds(mapInstance.getBounds());
        });

        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (places.length === 0) return;

          const bounds = new googleMaps.LatLngBounds();
          places.forEach((place) => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          mapInstance.fitBounds(bounds);
        });

        markerData.forEach((data) => {
          const marker = new googleMaps.Marker({
            position: { lat: data.lat, lng: data.lng },
            map: mapInstance,
            title: data.title,
          });

          const infoWindow = new googleMaps.InfoWindow({
            content: `<div style="color: black;">${data.title}</div>`,
          });

          marker.addListener('click', () => {
            if (currentInfoWindow) {
              currentInfoWindow.close();
            }
            infoWindow.open(mapInstance, marker);
            setCurrentInfoWindow(infoWindow);
          });
        });
      })
      .catch((error) => console.error('Google Maps API failed to load', error));
  }, [apiKey, heatmapData, markerData]);

  useEffect(() => {
    fetchOvitraps();
  }, []);

  return (
    <div style={{ height: '100vh', margin: 0, position: 'relative' }}>
      <input
        id="pac-input"
        className="controls"
        type="search"
        placeholder="Search Box"
        style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '300px',
        }}
      />
      <button
        onClick={toggleHeatmap}
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          padding: '8px 16px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {isHeatmapVisible ? 'Hide Heatmap' : 'Show Heatmap'}
      </button>
      <div id="google-map" style={{ height: '93%' }}></div>
    </div>
  );
};

export default MapPage;