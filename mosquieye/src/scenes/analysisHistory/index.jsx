import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Box, Typography, IconButton,Button,useTheme,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogContent, Collapse } from '@mui/material';
import { tokens } from "../../theme";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DataGrid } from '@mui/x-data-grid';
import logoImage from '../../assets/favicon-9.png'; // Add this import for your logo

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

  useEffect(() => {
    fetchAnalyses();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
      console.log('Fetched Users:', response.data.users); // Added log
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

  const generatePDFReport = async () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Load and add logo to title
    const logo = new Image();
    logo.src = logoImage;
    await new Promise((resolve) => {
      logo.onload = resolve;
    });

    // Add logo next to title
    doc.addImage(logo, 'PNG', 14, 10, 20, 20);
    doc.setFontSize(16);
    doc.text('Analysis History Report', 40, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 30);

    // Add watermark with opacity
    const watermarkWidth = 40;
    const watermarkHeight = 40;
    doc.addImage(
      logo,
      'PNG',
      doc.internal.pageSize.width - watermarkWidth - 10,
      doc.internal.pageSize.height - watermarkHeight - 10,
      watermarkWidth,
      watermarkHeight,
      undefined,
      'NONE',
      0.5  // opacity value
    );

    // Main table
    const mainTableData = rows.map((row, index) => [
      index + 1,
      row.imageType,
      row.totalEggs,
      row.singleEggs,
      row.clusterEggs,
      row.breteauIndex,
      row.moi,
      row.riskLevel,
      row.date,
      row.scanBy
    ]);

    doc.autoTable({
      startY: 40,
      head: [['No.', 'Image Type', 'Total Eggs', 'Single Eggs', 'Cluster Eggs', 'Breteau Index (BI)', 'Mosquito Ovitrap Index (MOI)', 'Risk Level', 'Date', 'Scan By']],
      body: mainTableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    // Additional pages for each analysis
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const analysis = analyses[i];
      const analysisId = analysis?.imageId || 'N/A';

      // Image page (portrait)
      doc.addPage('portrait');
      // Add watermark to new page with opacity
      doc.addImage(
        logo,
        'PNG',
        doc.internal.pageSize.width - watermarkWidth - 10,
        doc.internal.pageSize.height - watermarkHeight - 10,
        watermarkWidth,
        watermarkHeight,
        undefined,
        'NONE',
        0.1
      );

      doc.setFontSize(14);
      doc.text(`No. ${i + 1}`, 14, 20);
      doc.text(`Analysis ID: ${analysisId}`, 14, 30);

      try {
        const response = await axios.get(`http://localhost:5000/api/images/${analysisId}`, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        
        // Calculate dimensions to fit page
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = pageWidth - (2 * margin);
        const maxHeight = pageHeight - 60; // Account for header text
        
        // Create temporary image to get dimensions
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Calculate scaled dimensions
        let imgWidth = maxWidth;
        let imgHeight = (img.height * maxWidth) / img.width;
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (img.width * maxHeight) / img.height;
        }
        
        // Center the image horizontally
        const xOffset = (pageWidth - imgWidth) / 2;
        
        doc.addImage(
          `data:image/jpeg;base64,${base64Image}`,
          'JPEG',
          xOffset,
          40,
          imgWidth,
          imgHeight
        );
      } catch (error) {
        doc.text('Image not available.', 14, 40);
      }

      // Data table page (portrait)
      doc.addPage('portrait');
      // Add watermark to new page with opacity
      doc.addImage(
        logo,
        'PNG',
        doc.internal.pageSize.width - watermarkWidth - 10,
        doc.internal.pageSize.height - watermarkHeight - 10,
        watermarkWidth,
        watermarkHeight,
        undefined,
        'NONE',
        0.1
      );

      doc.setFontSize(14);
      doc.text(`No. ${i + 1}`, 14, 20);
      doc.text(`Analysis ID: ${analysisId}`, 14, 30);

      const fields = Object.entries(analysis.analysisData || {});
      const extraData = fields.map(([key, value]) => [key, String(value)]);

      doc.autoTable({
        startY: 40,
        head: [['Field', 'Value']],
        body: extraData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [39, 174, 96] }
      });
    }

    doc.save('analysis-history-report.pdf');
  };

  // Define constants for calculations
  const NUMBER_HOUSES_INSPECTED = 10; // Adjust as needed
  const TOTAL_OVID_TRAPS = 10; // Adjust as needed

  const computeRiskLevel = (bi, moi) => {
    if (bi >= 20 || moi >= 40) return 'High';
    if (bi >= 5 || moi >= 10) return 'Medium';
    return 'Low';
  };

  const columns = [
    {
      field: 'expand',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(params.row.id);
          }}
          size="small"
        >
          {openRowId === params.row.id ? '-' : '+'}
        </IconButton>
      ),
    },
    {
      field: 'image',
      headerName: 'Image',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" padding={1.5}>
          <img
            src={params.row.imageUrl}
            alt="Analysis result"
            style={{ width: '80px', cursor: 'pointer' }}
            onClick={() => setSelectedImage(params.row.imageUrl)}
          />
        </Box>
      ),
    },
    { field: 'imageType', headerName: 'Image Type', flex: 1 },
    { field: 'totalEggs', headerName: 'Total Eggs', flex: 1 },
    { field: 'singleEggs', headerName: 'Single Eggs', flex: 1 },
    { field: 'clusterEggs', headerName: 'Cluster Eggs', flex: 1 },
    { field: 'breteauIndex', headerName: 'Breteau Index (BI)', flex: 1 },
    { field: 'moi', headerName: 'Mosquito Ovitrap Index (MOI)', flex: 1 },
    { field: 'riskLevel', headerName: 'Risk Level', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'scanBy', headerName: 'Scan By', flex: 1 },
  ];

  const userMap = users.reduce((acc, user) => {
    acc[user.clerkUserId] = `${user.firstName} ${user.lastName}`;
    return acc;
  }, {});
  console.log('User Map:', userMap); // Added log

  const rows = analyses.map((analysis) => {
    const totalEggs = analysis.analysisData.totalEggs || 0;
    const singleEggs = analysis.analysisData.singleEggs || 0;
    const clusterEggs = analysis.analysisData.clustersCount || 0;
    const imageType = analysis.analysisData.ovitrap_type || 'Unknown';

    const breteauIndex = parseFloat(((clusterEggs / NUMBER_HOUSES_INSPECTED) * 100).toFixed(2));
    const positiveOvitraps = singleEggs > 0 || clusterEggs > 0 ? 1 : 0; // Assuming each row represents one ovitrap
    const moi = parseFloat(((positiveOvitraps / TOTAL_OVID_TRAPS) * 100).toFixed(2));
    const riskLevel = computeRiskLevel(breteauIndex, moi);

    return {
      id: analysis.imageId,
      imageUrl: `http://localhost:5000/api/images/${analysis.imageId}`,
      imageType,
      totalEggs,
      singleEggs,
      clusterEggs,
      breteauIndex,
      moi,
      riskLevel,
      date: new Date(analysis.createdAt).toLocaleDateString(),
      scanBy: userMap[analysis.analysisData.scan_by] || 'Unknown',
    };
  });
  console.log('Rows:', rows); // Added log

  const toggleRow = (id) => {
    setOpenRowId(openRowId === id ? null : id);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

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
          onClick={generatePDFReport}
          sx={{
            backgroundColor: colors.blueAccent[700],
            '&:hover': { backgroundColor: colors.blueAccent[600] },
          }}
        >
          Generate Report
        </Button>
      </Box>

      <Typography 
        variant="subtitle2" 
        sx={{ 
          marginBottom: 2,
          color: colors.grey[300],
          fontStyle: 'italic'
        }}
      >
        Note: Breteau Index (BI), Mosquito Ovitrap Index (MOI), and Risk Level calculations are for reference purposes only.
      </Typography>

      <Box style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          pagination  // Add this line to enable pagination
          components={{
            NoRowsOverlay: () => (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography>No records found</Typography>
              </Box>
            ),
          }}
        />
      </Box>

      {/* Collapsible Details Panel */}
      {openRowId && (
        <Paper style={{ margin: '20px 0', padding: '20px', marginBottom: '100px' }}>
          <Typography variant="h6" gutterBottom>
            Detailed Analysis Report
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3}>
            {(() => {
              const analysis = analyses.find(a => a.imageId === openRowId);
              const data = analysis?.analysisData || {};
              const breteauIndex = parseFloat(((data.clustersCount || 0) / NUMBER_HOUSES_INSPECTED * 100).toFixed(2));
              const positiveOvitraps = (data.singleEggs > 0 || data.clusterEggs > 0) ? 1 : 0; // Adjust as needed
              const moi = parseFloat(((positiveOvitraps / TOTAL_OVID_TRAPS) * 100).toFixed(2));
              const riskLevel = computeRiskLevel(breteauIndex, moi);

              const affectedAreaSingles = data.singleEggs > 0 ? (data.singlesTotalArea || 0) / positiveOvitraps : 0;
              const affectedAreaClusters = data.clustersCount > 0 ? (data.clustersTotalArea || 0) / data.clustersCount : 0;

              const detailsToShow = [
                { label: 'Date', value: new Date(analysis?.createdAt).toLocaleDateString() },
                { label: 'Image Type', value: data.ovitrap_type || 'Unknown' },
                { label: 'Scan By', value: userMap[data.scan_by] || 'Unknown' },
                { label: 'Single Eggs', value: data.singleEggs },
                { label: 'Cluster Eggs', value: data.clustersCount },
                { label: 'Total Eggs', value: data.totalEggs },
                { label: 'Singles Total Area', value: `${data.singlesTotalArea?.toFixed(2) || 0} px²` },
                { label: 'Singles Average Size', value: `${data.singlesAvg?.toFixed(2) || 0} px²` },
                { label: 'Clusters Count', value: data.clustersCount },
                { label: 'Clusters Total Area', value: `${data.clustersTotalArea?.toFixed(2) || 0} px²` },
                { label: 'Average Cluster Area', value: `${data.avgClusterArea?.toFixed(2) || 0} px²` },
                { label: 'Average Eggs Per Cluster', value: data.avgEggsPerCluster?.toFixed(2) || 0 },
                { label: 'Breteau Index (BI)', value: breteauIndex },
                { label: 'Mosquito Ovitrap Index (MOI)', value: `${moi}%` },
                { label: 'Risk Level', value: riskLevel },
                { label: 'Affected Area (Singles)', value: `${affectedAreaSingles.toFixed(2)} px²` },
                { label: 'Affected Area (Clusters)', value: `${affectedAreaClusters.toFixed(2)} px²` },
              ];

              return detailsToShow.map(({ label, value }) => (
                <Box key={label} bgcolor={colors.primary[400]} p={2} borderRadius="4px">
                  <Typography variant="subtitle2" color={colors.grey[100]} fontWeight="bold">
                    {label}
                  </Typography>
                  <Typography variant="body1" color={colors.grey[100]}>
                    {value}
                  </Typography>
                </Box>
              ));
            })()}
          </Box>
        </Paper>
      )}

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
