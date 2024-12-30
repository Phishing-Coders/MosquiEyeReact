import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  IconButton,
  Button,
  useTheme 
} from '@mui/material';
import { tokens } from "../../theme";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";

const AnalysisHistory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get('/api/images');
      setAnalyses(response.data.images);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setError('Failed to load analysis history');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/analysis');
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        {/* <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton> */}
        <Header title="ANALYSIS HISTORY" subtitle="View all previous analyses" />
      </Box>

      <Grid container spacing={3}>
        {analyses.map((analysis) => (
          <Grid item xs={12} sm={6} md={4} key={analysis.imageId}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={`http://localhost:5000/api/images/${analysis.imageId}`}
                alt="Analysis result"
                sx={{ objectFit: 'contain' }}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Analysis Results
                </Typography>
                <Typography>
                  Total Eggs: {analysis.analysisData.totalEggs}
                </Typography>
                <Typography>
                  Single Eggs: {analysis.analysisData.singleEggs}
                </Typography>
                <Typography>
                  Clusters: {analysis.analysisData.clustersCount}
                </Typography>
                <Typography>
                  Image Size: {analysis.analysisData.imageSize}
                </Typography>
                <Typography>
                  Date: {new Date(analysis.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AnalysisHistory;
