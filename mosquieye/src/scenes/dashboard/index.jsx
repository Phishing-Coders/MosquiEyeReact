import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, useTheme, IconButton } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import PestControlOutlinedIcon from '@mui/icons-material/PestControlOutlined';
import FmdBadOutlinedIcon from '@mui/icons-material/FmdBadOutlined';
import EmergencyOutlinedIcon from '@mui/icons-material/EmergencyOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LineChart from "../../components/LineChart";
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';
import axios from "axios";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [map, setMap] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [ovitraps, setOvitraps] = useState([]);
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAP_API;

  // Add default center coordinates
  const DEFAULT_CENTER = { lat: 1.5587898459904728, lng: 103.63767742492678 };

  const [dashboardData, setDashboardData] = useState({
    activeOvitraps: 0,
    totalEggs: 0,
    riskAreas: 0,
    avgEggsPerTrap: 0,
    recentUploads: [],
    weeklyStats: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch both dashboard and ovitrap data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardResponse, ovitrapsResponse] = await Promise.all([
          axios.get('/api/dashboard/statistics'),
          axios.get('/api/ovitraps')
        ]);
        
        setDashboardData(dashboardResponse.data);
        setOvitraps(ovitrapsResponse.data.ovitraps);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

 // Initialize map with markers and heatmap
 useEffect(() => {
  if (!apiKey || !ovitraps.length) return;

  loadGoogleMapsAPI(apiKey)
    .then((googleMaps) => {
      setGoogleMaps(googleMaps);
      
      const mapInstance = new googleMaps.Map(document.getElementById('dashboard-map'), {
        center: { lat: 1.5587898459904728, lng: 103.63767742492678 },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });
      setMap(mapInstance);

      // Add markers for each ovitrap
      ovitraps.forEach((ovitrap) => {
        const marker = new googleMaps.Marker({
          position: { 
            lat: ovitrap.location.coordinates[1],
            lng: ovitrap.location.coordinates[0]
          },
          map: mapInstance,
          title: `Ovitrap ${ovitrap.ovitrapId} (${ovitrap.metadata.area || 'No area'})`
        });

        // Add info window
        const infoWindow = new googleMaps.InfoWindow({
          content: `
            <div style="color: black; padding: 5px;">
              <h3>Ovitrap ${ovitrap.ovitrapId}</h3>
              <p>Area: ${ovitrap.metadata.area || 'No area'}</p>
              <p>Status: ${ovitrap.status}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });
      });

      // Create heatmap layer
      const heatmapData = ovitraps
        .filter(ovitrap => ovitrap.location?.coordinates?.length === 2)
        .map(ovitrap => ({
          location: new googleMaps.LatLng(
            ovitrap.location.coordinates[1],
            ovitrap.location.coordinates[0]
          ),
          weight: ovitrap.status === 'Active' ? 10 : 
                  ovitrap.status === 'Maintenance' ? 5 : 1
        }));

      const heatmapLayer = new googleMaps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapInstance,
        radius: 100,
        opacity: 0.7,
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
      });

      setHeatmap(heatmapLayer);
    })
    .catch(error => console.error('Google Maps API failed to load', error));
}, [apiKey, ovitraps]);

const handleReposition = () => {
  if (map) {
    map.panTo(DEFAULT_CENTER);
    map.setZoom(15);
  }
};

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your operations dashboard" />
      </Box>
  
      {loading ? (
        <Box display="flex" justifyContent="center" m="20px">
          <CircularProgress />
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          {/* ROW 1 - Stats */}
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ 
              borderRadius: "4px"
            }}
          >
            <StatBox
              title={dashboardData.activeOvitraps.toString()}
              subtitle="Active Ovitraps"
              progress="0.75"
              increase="+14%"
              icon={<PestControlOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} />}
            />
          </Box>
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ 
              borderRadius: "4px"
            }}
          >
            <StatBox
              title={dashboardData.totalEggs.toString()}
              subtitle="Total Eggs"
              progress="0.50"
              increase="+21%"
              icon={<FmdBadOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} />}
            />
          </Box>
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ 
              borderRadius: "4px"
            }}
          >
            <StatBox
              title={dashboardData.riskAreas.toString()}
              subtitle="Risk Areas"
              progress="0.30"
              increase="+5%"
              icon={<EmergencyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} />}
            />
          </Box>
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ 
              borderRadius: "4px"
            }}
          >
            <StatBox
              title={dashboardData.avgEggsPerTrap.toString()}
              subtitle="Avg Eggs per Trap"
              progress="0.80"
              increase="+43%"
              icon={<PestControlOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} />}
            />
          </Box>
  
          {/* ROW 2 - Charts & Activity */}
          <Box
            gridColumn="span 8"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            p="30px"
            sx={{ 
              borderRadius: "4px"
            }}
          >
            <Typography variant="h5" fontWeight="600">
              Egg Count Analytics
            </Typography>
            <Box height="250px" mt="-20px">
              <LineChart data={dashboardData.monthlyStats} />
            </Box>
          </Box>
          
          <Box
            gridColumn="span 4"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            overflow="auto"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              colors={colors.grey[100]}
              p="15px"
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                Recent Activity
              </Typography>
            </Box>
            {dashboardData.recentUploads.map((upload, i) => (
              <Box
                key={`${upload.id}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="600">
                    Ovitrap {upload.ovitrapId}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {upload.totalEggs} eggs detected
                  </Typography>
                </Box>
                <Box color={colors.grey[100]}>
                  {new Date(upload.date).toLocaleDateString()}
                </Box>
              </Box>
            ))}
          </Box>
  
          {/* ROW 3 - Map */}
          <Box
            gridColumn="span 12"
            gridRow="span 2"  // Increased from span 2 to span 3
            backgroundColor={colors.primary[400]}
            sx={{ 
              p: "20px",
              height: "315px",
              overflow: "relative",
              borderRadius: "4px"
            }}
          >
            <Typography variant="h5" fontWeight="600" mb={2}>
              Ovitrap Heatmap Overview
            </Typography>
            <Box
              id="dashboard-map"
              sx={{
                height: "calc(100% - 35px)", // Subtract padding and header height
                width: "100%",
                borderRadius: "4px",
                position: "relative" // Ensure proper stacking
              }}
            />
            <IconButton
              onClick={handleReposition}
              sx={{
                position: "absolute",
                bottom: "50px",
                right: "50px",
                backgroundColor: colors.primary[400],
                '&:hover': {
                  backgroundColor: colors.primary[300],
                }
              }}
            >
              <MyLocationIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;