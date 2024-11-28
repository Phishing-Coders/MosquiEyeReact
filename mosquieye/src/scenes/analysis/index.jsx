import { Box, Button, Card, Typography, Slider, TextField, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";

import React, { useState, useEffect, useRef } from 'react';
//import { Button, Card, Typography, Slider, TextField, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ChevronLeft, ChevronRight, Refresh, Compare, Tune } from '@mui/icons-material';
import Cv from "./opencv"



const Analysis = () => {
  const [drawer, setDrawer] = useState(false);
  const [analyzedImage, setAnalyzedImage] = useState(null);
  const [imageSize, setImageSize] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showBottom, setShowBottom] = useState(false);
  const [active, setActive] = useState(null);
  const [windowIndex, setWindowIndex] = useState(0);
  const [threshValue, setThreshValue] = useState(120);
  const [minEggRadius, setMinEggRadius] = useState(5);
  const [maxEggRadius, setMaxEggRadius] = useState(13);
  const [maxEggCluster, setMaxEggCluster] = useState(30);
  const [singlesCount, setSinglesCount] = useState(0);
  const [clustersCount, setClustersCount] = useState(0);
  const [singlesTotalArea, setSinglesTotalArea] = useState(0);
  const [clustersTotalArea, setClustersTotalArea] = useState(0);
  const [avgClusterArea, setAvgClusterArea] = useState(0);
  const [avgEggsPerCluster, setAvgEggsPerCluster] = useState(0);
  const [singlesAvg, setSinglesAvg] = useState(0);
  const [totalEggs, setTotalEggs] = useState(0);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Refs for canvas elements
  const analyzedCanvasRef = useRef(null);
  const legendCanvasRef = useRef(null);


  const analyzedImages = [
    { output: 'src', source: 'src2' },
    { output: 'threshold', source: 'src3' },
    { output: 'objects', source: 'src5' },
    { output: 'outlines', source: 'src6' },
    { output: 'overlay', source: 'src7' }
  ];

  const analyzedImagesPretty = [
    'Source Image',
    'Threshold',
    'Detected Objects',
    'Sorted Markers',
    'Outlined Overlay'
  ];

  const handleNext = () => {
    setWindowIndex((windowIndex + 1) % analyzedImages.length);
  };

  const handlePrevious = () => {
    setWindowIndex((windowIndex - 1 + analyzedImages.length) % analyzedImages.length);
  };

  // const handleAnalyze = async () => {
  //   setAnalysisStarted(true);
  //   // Load and process image with OpenCV (example only; replace with your specific logic)
  //   const src = cv.imread(analyzedCanvasRef.current);
  //   const overlay = src.clone();

  //   // Other image analysis steps (converted from Vue to OpenCV.js)
  //   // Set your OpenCV image processing logic here as per the Vue code

  //   // Cleanup OpenCV resources
  //   src.delete();
  //   overlay.delete();

  //   setAnalysisComplete(true);
  //   setShowBottom(true);
  // };

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  const reset = () => {
    // Logic to reset state
  };

  const toggleDetailsDialog = () => {
    setDetailsDialog(!detailsDialog);
  };

  // Similar logic for handling image thresholds, OpenCV analysis, and results calculation

  return (
    <Box>
      
      <Header title="Analysis" subtitle="" />
      
      <Card className="analysis-card">
        <Typography variant="h4">Analysis</Typography>
        <Button color="primary" onClick={toggleDetailsDialog}>Details</Button>

        {/* Image canvas for analysis */}
        <canvas ref={analyzedCanvasRef} className="imageCanvasOuter" style={{ display: showAnalysis ? 'block' : 'none' }} />
        <canvas className="imageCanvasOuter" style={{ display: !showAnalysis ? 'block' : 'none' }} />

        <Card>
          {/* Analysis Controls */}
          <Typography variant="h6">{analyzedImagesPretty[windowIndex]}</Typography>
          <IconButton onClick={handlePrevious}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={handleNext}>
            <ChevronRight />
          </IconButton>
        </Card>

        {/* Filters */}
        {drawer && (
          <Card>
            <Typography variant="h6">Filters</Typography>
            <Tooltip title="Image Threshold Adjustment">
              <Slider value={threshValue} onChange={(e, val) => setThreshValue(val)} max={255} />
            </Tooltip>
            <TextField value={threshValue} />
            {/* Similar structure for min/max egg size and cluster size */}
          </Card>
        )}

        {/* Bottom navigation for actions */}
        <div className="bottom-nav">
          <Button onClick={reset} color="primary" startIcon={<Refresh />}>Reset</Button>
          <Button onClick={() => setShowAnalysis(!showAnalysis)} color="primary" startIcon={<Compare />}>Compare</Button>
          <Button onClick={toggleDrawer} color="primary" startIcon={<Tune />}>Show Filters</Button>
        </div>
      </Card>

      {/* Dialog for Details */}
      <Dialog open={detailsDialog} onClose={toggleDetailsDialog} maxWidth="sm">
        <DialogTitle>Details</DialogTitle>
        <DialogContent>
          <Typography>Total Single Egg Area: {singlesTotalArea}</Typography>
          <Typography>Single Egg Average Size: {singlesAvg}</Typography>
          {/* Other analysis details */}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDetailsDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>

    
  );
};

<script>
  <script async src="https://docs.opencv.org/4.x/opencv.js" type="text/javascript"></script>
</script>

export default Analysis;
