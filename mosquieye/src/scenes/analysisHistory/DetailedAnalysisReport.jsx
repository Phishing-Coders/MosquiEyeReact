import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';

const DetailedAnalysisReport = ({ openRowId, analyses, userMap, computeRiskLevel, colors, handleDelete }) => {
  if (!openRowId) return null;

  const analysis = analyses.find(a => a.imageId === openRowId);
  const data = analysis?.analysisData || {};
  const breteauIndex = computeRiskLevel(data.clustersCount, data.singleEggs);
  const moi = computeRiskLevel(data.singlesTotalArea, data.clustersTotalArea);
  const riskLevel = computeRiskLevel(breteauIndex, moi);

  const detailsToShow = [
    { label: 'Date', value: new Date(analysis?.createdAt).toLocaleDateString() },
    { label: 'Ovitrap ID', value: analysis?.ovitrapId || 'N/A' }, // Add Ovitrap ID here
    { label: 'Image Type', value: data.ovitrap_type || 'Unknown' },
    { label: 'Scan By', value: userMap[data.scan_by] || 'Unknown' },
    { label: 'Single Eggs', value: data.singleEggs },
    { label: 'Cluster Eggs', value: data.clustersCount },
    { label: 'Total Eggs', value: data.totalEggs },
    { label: 'Singles Total Area', value: `${data.singlesTotalArea?.toFixed(2) || 0}` },
    { label: 'Singles Average Size', value: `${data.singlesAvg?.toFixed(2) || 0} ` },
    { label: 'Clusters Total Area', value: `${data.clustersTotalArea?.toFixed(2) || 0} ` },
    { label: 'Average Cluster Area', value: `${data.avgClusterArea?.toFixed(2) || 0} ` },
    { label: 'Average Eggs Per Cluster', value: data.avgEggsPerCluster?.toFixed(2) || 0 },
    { label: 'Breteau Index (BI)', value: breteauIndex },
    { label: 'Mosquito Ovitrap Index (MOI)', value: `${moi}%` },
    { label: 'Risk Level', value: riskLevel },
    { label: 'Affected Area (Singles)', value: `${(data.singlesTotalArea / (data.singleEggs || 1)).toFixed(2)} px²` },
    { label: 'Affected Area (Clusters)', value: `${(data.clustersTotalArea / (data.clustersCount || 1)).toFixed(2)} px²` }
  ];

  return (
    <Paper style={{ margin: '20px 0', padding: '20px', marginBottom: '100px' }}>
      <Typography variant="h6" gutterBottom>
        Detailed Analysis Report
      </Typography>
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3}>
        {detailsToShow.map(({ label, value }) => (
          <Box key={label} bgcolor={colors.primary[400]} p={2} borderRadius="4px">
            <Typography variant="subtitle2" color={colors.grey[100]} fontWeight="bold">
              {label}
            </Typography>
            <Typography variant="body1" color={colors.grey[100]}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box mt={2}>
        <Button variant="contained" color="error" onClick={() => handleDelete(openRowId)}>
          Delete
        </Button>
      </Box>
    </Paper>
  );
};

export default DetailedAnalysisReport;