import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import PestControlOutlinedIcon from '@mui/icons-material/PestControlOutlined';
import FmdBadOutlinedIcon from '@mui/icons-material/FmdBadOutlined';
import EmergencyOutlinedIcon from '@mui/icons-material/EmergencyOutlined';
import axios from "axios";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [stats, setStats] = useState({
    activeOvitraps: 0,
    totalEggs: 0,
    riskAreas: 0,
    avgEggsPerTrap: 0
  });
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
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/statistics');
        console.log('Dashboard data:', response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);

  return (
    <Box m="20px">
      <Header title="DASHBOARD" subtitle="Welcome to your operations dashboard" />
      
      {loading ? (
        <Box display="flex" justifyContent="center" m="20px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Ovitrap Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <StatBox
              title={dashboardData.activeOvitraps.toString()}
              subtitle="Active Ovitraps"
              progress="0.75"
              increase="+14%"
              icon={<PestControlOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Grid>

          {/* Total Eggs */}
          <Grid item xs={12} sm={6} md={3}>
            <StatBox
              title={dashboardData.totalEggs.toString()}
              subtitle="Total Eggs Detected"
              progress="0.50"
              increase="+21%"
              icon={<FmdBadOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Grid>

          {/* Risk Areas */}
          <Grid item xs={12} sm={6} md={3}>
            <StatBox
              title={dashboardData.riskAreas.toString()}
              subtitle="Risk Areas"
              progress="0.30"
              increase="+5%"
              icon={<EmergencyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Grid>

          {/* Average Eggs */}
          <Grid item xs={12} sm={6} md={3}>
            <StatBox
              title={dashboardData.avgEggsPerTrap.toString()}
              subtitle="Avg Eggs per Trap"
              progress="0.80"
              increase="+43%"
              icon={<PestControlOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Grid>

          {/* Recent Uploads */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[400]}
              p="20px"
              borderRadius="4px"
            >
              <Typography variant="h5" mb={2}>Recent Uploads</Typography>
              <Grid container spacing={2}>
                {dashboardData.recentUploads.map((upload) => (
                  <Grid item xs={12} key={upload.id}>
                    <Box
                      backgroundColor={colors.primary[400]}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      borderRadius="4px"
                    >
                      <Box>
                        <Typography variant="h6">Ovitrap {upload.ovitrapId}</Typography>
                        <Typography variant="body2" color={colors.grey[100]}>
                          {upload.totalEggs} eggs detected
                        </Typography>
                      </Box>
                      <Typography variant="body2" color={colors.grey[100]}>
                        {new Date(upload.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;