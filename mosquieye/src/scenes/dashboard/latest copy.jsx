import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Typography, useTheme, IconButton } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import PestControlOutlinedIcon from '@mui/icons-material/PestControlOutlined';
import FmdBadOutlinedIcon from '@mui/icons-material/FmdBadOutlined';
import EmergencyOutlinedIcon from '@mui/icons-material/EmergencyOutlined';
import LineChart from "../../components/LineChart";
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
          >
            <StatBox
              title={dashboardData.activeOvitraps.toString()}
              subtitle="Active Ovitraps"
              progress="0.75"
              increase="+14%"
              icon={<PestControlOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Box>
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={dashboardData.totalEggs.toString()}
              subtitle="Total Eggs"
              progress="0.50"
              increase="+21%"
              icon={<FmdBadOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Box>
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={dashboardData.riskAreas.toString()}
              subtitle="Risk Areas"
              progress="0.30"
              increase="+5%"
              icon={<EmergencyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Box>
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={dashboardData.avgEggsPerTrap.toString()}
              subtitle="Avg Eggs per Trap"
              progress="0.80"
              increase="+43%"
              icon={<PestControlOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Box>
  
          {/* ROW 2 - Charts */}
          <Box
            gridColumn="span 8"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            p="30px"
          >
            <Typography variant="h5" fontWeight="600">
              Egg Count Analytics
            </Typography>
            <Box height="250px" mt="-20px">
              <LineChart data={dashboardData.monthlyStats} />
            </Box>
          </Box>
          
          {/* Recent Activity */}
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
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;