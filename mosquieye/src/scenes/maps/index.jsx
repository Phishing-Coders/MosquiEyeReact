import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';

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

  // const heatmapData = useMemo(() => [
  //   { lat: 1.5644561843974956, lng: 103.63506509867167, weight: 3 },
  //   { lat: 1.5609854914728014, lng: 103.63216432841786, weight: 10 },
  //   { lat: 1.5763398434797995, lng: 103.62099469559664, weight: 2 },
  //   { lat: 1.5664350968417495, lng: 103.62622627526456, weight: 4 },
  //   { lat: 1.5636920140360528, lng: 103.62812342302125, weight: 1 },
  // ], []);

  // const markerData = useMemo(() => [
  //   { lat: 1.5644561843974956, lng: 103.63506509867167, title: 'Ovitrap 1 (KTDI)' },
  //   { lat: 1.5609854914728014, lng: 103.63216432841786, title: 'Ovitrap 2 (KTF)' },
  //   { lat: 1.5763398434797995, lng: 103.62099469559664, title: 'Ovitrap 3 (KDOJ)' },
  //   { lat: 1.5664350968417495, lng: 103.62622627526456, title: 'Ovitrap 4 (KDSE)' },
  //   { lat: 1.5636920140360528, lng: 103.62812342302125, title: 'Ovitrap 5 (KTR)' },
  // ], []);

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

  // Add fetch function
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

  // useEffect(() => {
  //   if (!apiKey) {
  //     console.error('Google Maps API key is missing!');
  //     return;
  //   }

  //   loadGoogleMapsAPI(apiKey)
  //     .then((googleMaps) => {
  //       setGoogleMaps(googleMaps);
        
  //       const mapInstance = new googleMaps.Map(document.getElementById('google-map'), {
  //         center: { lat: 1.5587898459904728, lng: 103.63767742492678 },
  //         zoom: 15,
  //         mapTypeControl: false,
  //       });
  //       setMap(mapInstance);

  //       // Add markers
  //       markerData.forEach((data) => {
  //         const marker = new googleMaps.Marker({
  //           position: { lat: data.lat, lng: data.lng },
  //           map: mapInstance,
  //           title: data.title,
  //         });

  //         const infoWindow = new googleMaps.InfoWindow({
  //           content: `<div style="color: black;">${data.title}</div>`,
  //         });

  //         marker.addListener('click', () => {
  //           if (currentInfoWindow) {
  //             currentInfoWindow.close();
  //           }
  //           infoWindow.open(mapInstance, marker);
  //           setCurrentInfoWindow(infoWindow);
  //         });
  //       });

  //       // Initialize search box
  //       const input = document.getElementById('pac-input');
  //       const searchBoxInstance = new googleMaps.places.SearchBox(input);
  //       setSearchBox(searchBoxInstance);

  //       mapInstance.addListener('bounds_changed', () => {
  //         searchBoxInstance.setBounds(mapInstance.getBounds());
  //       });

  //       searchBoxInstance.addListener('places_changed', () => {
  //         const places = searchBoxInstance.getPlaces();
  //         if (places.length === 0) return;

  //         const bounds = new googleMaps.LatLngBounds();
  //         places.forEach((place) => {
  //           if (place.geometry.viewport) {
  //             bounds.union(place.geometry.viewport);
  //           } else {
  //             bounds.extend(place.geometry.location);
  //       }});
  //         mapInstance.fitBounds(bounds);
  //       });
  //     })
  //     .catch((error) => console.error('Google Maps API failed to load', error));
  // }, [apiKey, markerData]);

  // useEffect(() => {
  //   if (!map || !googleMaps || !heatmapData) return;

  //   const heatmapPoints = heatmapData.map(point => ({
  //     location: new googleMaps.LatLng(point.lat, point.lng),
  //     weight: point.weight
  //   }));

  //   const heatmapLayer = new googleMaps.visualization.HeatmapLayer({
  //     data: heatmapPoints,
  //     map: map,
  //     radius: 100,
  //     maxIntensity: 5,
  //     opacity: 0.6,
  //     dissipating: true,
  //     gradient: [
  //       'rgba(0, 255, 255, 0)',
  //       'rgba(63, 0, 91, 0.4)',
  //       'rgba(127, 0, 63, 0.7)',
  //       'rgba(191, 0, 31, 0.8)',
  //       'rgba(255, 0, 0, 1)'
  //     ]
  //   });

  //   setHeatmap(heatmapLayer);

  //   return () => {
  //     heatmapLayer.setMap(null);
  //   };
  // }, [map, googleMaps, heatmapData]);

    // Update useEffect to fetch data
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
  
          // Fetch ovitraps after map is loaded
          fetchOvitraps();
        })
        .catch(error => console.error('Google Maps API failed to load', error));
    }, [apiKey]);
  
    // Update useEffect for markers and heatmap to depend on ovitraps
    useEffect(() => {
      if (!map || !googleMaps || loading) return;
  
      // Add markers
      markerData.forEach((data) => {
        const marker = new googleMaps.Marker({
          position: { lat: data.lat, lng: data.lng },
          map: map,
          title: data.title,
        });
  
        const infoWindow = new googleMaps.InfoWindow({
          content: `<div style="color: black;">${data.title}</div>`,
        });
  
        marker.addListener('click', () => {
          if (currentInfoWindow) {
            currentInfoWindow.close();
          }
          infoWindow.open(map, marker);
          setCurrentInfoWindow(infoWindow);
        });
      });
  
      // Create heatmap layer
      const heatmapLayer = new googleMaps.visualization.HeatmapLayer({
        data: heatmapData.map(point => ({
          location: new googleMaps.LatLng(point.lat, point.lng),
          weight: point.weight
        })),
        map: map,
        options: {
          radius: 20,
          gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
          ]
        }
      });
  
    }, [map, googleMaps, markerData, heatmapData, loading]);

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