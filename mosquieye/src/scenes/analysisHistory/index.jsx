import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Button, useTheme, Dialog, DialogContent, CircularProgress } from '@mui/material';
import { tokens } from "../../theme";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import DetailedAnalysisReport from './DetailedAnalysisReport';
import generatePDFReport from './generatePDFReport';
import { computeRiskLevel, NUMBER_HOUSES_INSPECTED, TOTAL_OVID_TRAPS } from './utils';
import logoImage from '../../assets/favicon-9.png'; 
import { useGridApiRef, gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid'; // Add ref to access sorted/filtered rows
import AnalysisHistoryTable from './AnalysisHistoryTable'; // <-- Import the new component

const AnalysisHistory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [users, setUsers] = useState([]);
  const [openRowId, setOpenRowId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  

  // For DataGrid references
  const apiRef = useGridApiRef();

  // Add state for column visibility
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    singlesTotalArea: false,
    singlesAvg: false,
    clustersTotalArea: false,
    avgClusterArea: false,
    avgEggsPerCluster: false,
    affectedAreaSingles: false,
    affectedAreaClusters: false,
    breteauIndex: false,  // Hide BI by default
    moi: false,           // Hide MOI by default
    riskLevel: false      // Hide risk level by default
  });

  useEffect(() => {
    fetchAnalyses();
    fetchUsers();
  }, []);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/images');
      setAnalyses(response.data.images);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setError('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
      
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleBack = () => {
    navigate('/analysis');
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => prev + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleClose = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const generateReport = async () => { // Remove the parameter
    setIsGeneratingReport(true);
    try {
      const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef.current.state); // Retrieve row IDs from the grid
      const displayedRows = filteredSortedRowIds.map((id) => {
        const row = rows.find(r => r.id === id);
        return row;
      }).filter(row => row !== undefined);

      await generatePDFReport(displayedRows, users, logoImage); // Pass the rows instead of apiRef
    } catch (error) {
      console.error('Error generating report:', error);
      // Optionally, set an error state here to notify the user
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleOpenDeleteDialog = (imageId) => {
    setDeleteTargetId(imageId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.delete(`/api/images/${deleteTargetId}`);
      setAnalyses((prev) => prev.filter((a) => a.imageId !== deleteTargetId));
      setOpenRowId(null);
    } catch (err) {
      console.error('Error deleting analysis:', err);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleDelete = (imageId) => {
    handleOpenDeleteDialog(imageId);
  };

  // Moved columns, row generation, handleExportCSV to AnalysisHistoryTable.jsx
  // Now just generate 'rows' in the same way or you can pass 'analyses' to AnalysisHistoryTable for row-building there.

  // Example row building here:
  // Build a userMap to map clerkUserId to full name
  const userMap = users.reduce((acc, user) => {
    acc[user.clerkUserId] = `${user.firstName} ${user.lastName}`;
    return acc;
  }, {});

  const rows = analyses.map((analysis, index) => {
    console.log('Raw createdAt:', analysis.createdAt); // Log 1: Raw date from API
    const dateObj = new Date(analysis.createdAt);
    console.log('Parsed Date object:', dateObj); // Log 2: Date object after parsing

    const totalEggs = analysis.analysisData.totalEggs || 0;
    const singleEggs = analysis.analysisData.singleEggs || 0;
    const clusterEggs = analysis.analysisData.clustersCount || 0;
    const imageType = analysis.analysisData.ovitrap_type || 'Unknown';

    const singlesTotalArea = analysis.analysisData.singlesTotalArea || 0;
    const singlesAvg = analysis.analysisData.singlesAvg || 0;
    const clustersTotalArea = analysis.analysisData.clustersTotalArea || 0;
    const avgClusterArea = analysis.analysisData.avgClusterArea || 0;
    const avgEggsPerCluster = analysis.analysisData.avgEggsPerCluster || 0;

    const affectedAreaSingles = singleEggs ? (singlesTotalArea / singleEggs).toFixed(2) : '0';
    const affectedAreaClusters = clusterEggs ? (clustersTotalArea / clusterEggs).toFixed(2) : '0';

    const breteauIndex = parseFloat(((clusterEggs / NUMBER_HOUSES_INSPECTED) * 100).toFixed(2));
    const positiveOvitraps = singleEggs > 0 || clusterEggs > 0 ? 1 : 0; // Assuming each row represents one ovitrap
    const moi = parseFloat(((positiveOvitraps / TOTAL_OVID_TRAPS) * 100).toFixed(2));
    const riskLevel = computeRiskLevel(breteauIndex, moi);

    // Validate and extract a unique primitive ID
    let uniqueId;
    if (typeof analysis.imageId === 'string' || typeof analysis.imageId === 'number') {
      uniqueId = String(analysis.imageId);
    } else if (typeof analysis.imageId === 'object' && analysis.imageId !== null) {
      // If imageId is an object, extract a unique property or use the index as a fallback
      uniqueId = analysis.imageId.id ? String(analysis.imageId.id) : `unknown-id-${index}`;
      console.warn(`imageId is an object. Assigned uniqueId: ${uniqueId}`);
    } else {
      // Fallback for unexpected imageId types
      uniqueId = `invalid-id-${index}`;
      console.error(`Invalid imageId type: ${typeof analysis.imageId}. Assigned uniqueId: ${uniqueId}`);
    }

    const rowData = {
      id: uniqueId, // Ensure id is a unique string
      imageUrl: `${window.location.origin}/api/images/${uniqueId}`, // Ensure imageUrl is absolute
      ovitrapId: analysis.ovitrapId || 'N/A', // Add ovitrapId to row data
      imageType,
      totalEggs,
      singleEggs,
      clusterEggs,
      breteauIndex,
      moi,
      riskLevel,
      date: dateObj, // Store the Date object directly
      scanBy: userMap[analysis.analysisData.scan_by] || 'Unknown',
      analysisData: analysis.analysisData,
      singlesTotalArea,
      singlesAvg,
      clustersTotalArea,
      avgClusterArea,
      avgEggsPerCluster,
      affectedAreaSingles,
      affectedAreaClusters,
    };

    console.log('Row data:', rowData); // Verify the row data
    return rowData;
  }).filter(row => row !== null && row.id); // Ensure no rows have null or undefined ids
  console.log('Rows:', rows); // Added log

  const toggleRow = (id) => {
    setOpenRowId(openRowId === id ? null : id);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Header title="ANALYSIS HISTORY" subtitle="View all previous analyses" />
        </Box>
        <Button
          variant="contained"
          onClick={generateReport}
          disabled={isGeneratingReport}
          sx={{ backgroundColor: colors.blueAccent[600],'&:hover': { backgroundColor: colors.blueAccent[600] },minWidth: '140px',fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',}}
        >
          {isGeneratingReport ? <CircularProgress size={24} color="inherit" /> : 'Generate Report'}
        </Button>
      </Box>

      <Typography variant="subtitle2" sx={{ marginBottom: 2, color: colors.grey[300], fontStyle: 'italic' }}>
        Note: Breteau Index (BI), Mosquito Ovitrap Index (MOI), and Risk Level calculations are for reference purposes only.
      </Typography>

      <AnalysisHistoryTable
        apiRef={apiRef}
        rows={rows}
        columnVisibilityModel={columnVisibilityModel}
        setColumnVisibilityModel={setColumnVisibilityModel}
        isExportingXLSX={isExportingXLSX}
        setIsExportingXLSX={setIsExportingXLSX}
        onToggleRow={toggleRow}
        openRowId={openRowId}
        loading={loading} 
        handleDelete={handleDelete} // Pass handleDelete as a prop
        users={users}
        refreshData={fetchAnalyses}  // Add this prop
      />

      {/* Collapsible Details Panel */}
      <DetailedAnalysisReport
        openRowId={openRowId}
        analyses={analyses}
        userMap={userMap}
        computeRiskLevel={computeRiskLevel}
        colors={colors}
        handleDelete={handleDelete}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogContent>
          <Typography>Are you sure you want to delete this analysis?</Typography>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button color='white' onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleConfirmDelete}>
              Confirm
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!selectedImage} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Button 
              onClick={handleZoomOut} 
              style={{ fontSize: '24px', color: 'white' }}
            >
              -
            </Button>
            <Typography variant="body1" mx={2}>{Math.round(zoomLevel * 100)}%</Typography>
            <Button 
              onClick={handleZoomIn} 
              style={{ fontSize: '24px', color: 'white' }}
            >
              +
            </Button>
          </Box>
          <img
            src={selectedImage}
            alt="Zoomed analysis"
            style={{ width: `${100 * zoomLevel}%`, height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AnalysisHistory;
