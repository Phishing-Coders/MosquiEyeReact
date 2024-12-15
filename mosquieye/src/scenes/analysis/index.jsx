import React, { useState, useEffect, useContext, useRef } from 'react';
import eventBus from '../../eventBus'; // Assuming you have an event bus setup in your React project
import cv from "@techstark/opencv-js";
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardActions, Button, Tooltip, Slider, TextField, Dialog, List, ListItem, ListItemText, IconButton, Icon, CircularProgress, Box, Typography} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PublishIcon from '@mui/icons-material/Publish';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Import styled from '@mui/material/styles'
import { styled } from '@mui/material/styles';

// Create a custom Tooltip with increased font size
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .MuiTooltip-tooltip`]: {
    fontSize: '1.1em', // Adjust the font size as needed
  },
});

const Analysis = () => {

const [drawer, setDrawer] = useState(false);
const [infoExpanded, setInfoExpanded] = useState(false);
const [eggsize, setEggsize] = useState(null);
const [analyzedImage, setAnalyzedImage] = useState(null);
const [imageSize, setImageSize] = useState('');
const [imageDepth, setImageDepth] = useState('');
const [imageChannels, setImageChannels] = useState('');
const [imageType, setImageType] = useState('');
const [showAnalysis, setShowAnalysis] = useState(true);
const [showBottom, setShowBottom] = useState(false);
const [firstRun, setFirstRun] = useState(true);
const [active, setActive] = useState(null);
const [analyzedImages, setAnalyzedImages] = useState([
  { output: 'src', source: 'src2' },
  { output: 'threshold', source: 'src3' },
  { output: 'objects', source: 'src5' },
  { output: 'outlines', source: 'src6' },
  { output: 'overlay', source: 'src7' }
]);
const [analyzedImagesPretty, setAnalyzedImagesPretty] = useState([
  'Source Image',
  'Threshold',
  'Detected Objects',
  'Sorted Markers',
  'Outlined Overlay'
]);
const [analysisStarted, setAnalysisStarted] = useState(false);
const [analysisComplete, setAnalysisComplete] = useState(false);
const [threshValue, setThreshValue] = useState(120);
const [minEggRadius, setMinEggRadius] = useState(5);
const [maxEggRadius, setMaxEggRadius] = useState(13);
const [maxEggCluster, setMaxEggCluster] = useState(30);
const [singlesCount, setSinglesCount] = useState(0);
const [clustersCount, setClustersCount] = useState(0);
const [singlesArray, setSinglesArray] = useState([]);
const [singlesTotalArea, setSinglesTotalArea] = useState(0);
const [clustersTotalArea, setClustersTotalArea] = useState(0);
const [avgClusterArea, setAvgClusterArea] = useState(0);
const [avgEggsPerCluster, setAvgEggsPerCluster] = useState(0);
const [singlesAvg, setSinglesAvg] = useState(0);
const [clustersArray, setClustersArray] = useState([]);
const [singlesCalculated, setSinglesCalculated] = useState(0);
const [eggBoxes, setEggBoxes] = useState(0);
const [detectedObjectsArray, setDetectedObjectsArray] = useState([]);
const [detectedObjectsArrayList, setDetectedObjectsArrayList] = useState([]);
const [totalEggs, setTotalEggs] = useState(0);
const [window, setWindow] = useState(0);
const [length, setLength] = useState(5);
const [detailsDialog, setDetailsDialog] = useState(false);
const location = useLocation();
const { imageData, imageType: locationImageType, additionalData } = location.state || {};
const navigate = useNavigate();

// Create a ref for the canvas container
const canvasContainerRef = useRef(null);

useEffect(() => {

  const handleImageType = (imageType) => {
    if (imageType === 'paper') {
      setThreshValue(116);
      setMinEggRadius(1);
      setMaxEggRadius(8);
      setMaxEggCluster(8);
    } else if (imageType === 'magnified') {
      setThreshValue(120);
      setMinEggRadius(5);
      setMaxEggRadius(13);
      setMaxEggCluster(30);
    } else if (imageType === 'micro') {
      setThreshValue(120);
      setMinEggRadius(4);
      setMaxEggRadius(14);
      setMaxEggCluster(20);
    }
  };


  if (imageData) {
    setAnalyzedImage(imageData);
  } else {
    // const fallbackImage = '../../assets/download.png'; // Ensure this path is correct and accessible
    // setAnalyzedImage(fallbackImage);
  }

  if (locationImageType) {
    handleImageType(locationImageType);
  }

  const handleRawImageReady = (data) => {
    setAnalyzedImage(data);
  };

  eventBus.on('imageType', handleImageType);
  eventBus.on('rawImageReady', handleRawImageReady);

  return () => {
    eventBus.off('imageType', handleImageType);
    eventBus.off('rawImageReady', handleRawImageReady);
  };
}, [imageData, additionalData, locationImageType]);

useEffect(() => {
  if (analyzedImage) {
    load();
  }

  // Remove window resize event listener
  // const handleResize = () => {
  //   analyzeCanvasOrImage("analyzedCanvas");
  // };

  // if (typeof window !== 'undefined') {
  //   window.addEventListener('resize', handleResize);
  // }

  // return () => {
  //   if (typeof window !== 'undefined') {
  //     window.removeEventListener('resize', handleResize);
  //   }
  // };
}, [analyzedImage]);

// Add useEffect to re-run analyzeCanvasOrImage when settings change
useEffect(() => {
  if (analyzedImage) {
    analyzeCanvasOrImage("analyzedCanvas");
  }
}, [analyzedImage, minEggRadius, maxEggRadius, threshValue, maxEggCluster]);

const load = async () => {
  eventBus.emit('loadingDialog');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  analyzeCanvasOrImage("analyzedCanvas"); // Ensure this matches the actual ID
  turnImages();
};
  
  const rerender = () => {
    eventBus.emit('forceRerender');
    navigate('/scan');
  };
  
  const imageMenu = (index) => {
    setActive(index);
  };
  
  const next = () => {
    setWindow((window + 1) === length ? 0 : window + 1);
  };
  
  const previous = () => {
    setWindow((window - 1) < 0 ? length - 1 : window - 1);
  };
  
//console.log('load3: analyzedImage', analyzedImage); // Log the value of analyzedImage
const analyzeCanvasOrImage = async (id) => {
  // Check if the provided ID is a valid string
  if (!id || typeof id !== "string") {
    console.error("Invalid ID provided:", id);
    return;
  }

  // Get the canvas or image element by ID
  const canvasElement = document.getElementById(id);

  // Check if the element exists
  if (!canvasElement) {
    console.error(`Element with ID "${id}" not found in the DOM.`);
    return;
  }

  // Ensure the canvas has valid dimensions
  if (canvasElement.width === 0 || canvasElement.height === 0) {
    console.error("Canvas has invalid dimensions.");
    return;
  }

  if (!analyzedImage) {
    console.error('No analyzed image available.');
    return;
  }

  // Show 'analysis' components in React
  setAnalysisStarted(true);

  // Ensure the analyzedImage is a valid image element or URL
  const img = new Image();
  img.src = analyzedImage;
  img.onload = () => {
    // Set static canvas dimensions
    canvasElement.width = 800; // Set your desired width
    canvasElement.height = 200; // Set your desired height

    // Set canvas dimensions and draw the image
    canvasElement.width = img.width;
    canvasElement.height = img.height;
    const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('Canvas context not found');
      return;
    }
    ctx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);

    // Ensure the canvas has valid dimensions after drawing the image
    if (canvasElement.width === 0 || canvasElement.height === 0) {
      console.error("Canvas has invalid dimensions after drawing the image.");
      return;
    }

    // Load image into OpenCV using getElementById
    try {
      const src = cv.imread(id);
      const overlay = src.clone();

      // Show source image via OpenCV
      cv.imshow('src', src);

      // Image Info for debugging
      setImageSize(`${src.size().width} x ${src.size().height}`);
      setImageDepth(src.depth());
      setImageChannels(src.channels());
      setImageType(src.type());

      // Create matrices for various analysis activities
      const gray = new cv.Mat();
      const threshold = new cv.Mat();
      const dilate = new cv.Mat();
      let boundingBoxes = new cv.Mat();
      const objects = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
      const outlines = new cv.Mat(src.rows, src.cols, cv.CV_8UC3, new cv.Scalar(255, 255, 255, 0));

      // TRANSFORMATIONS
      // Source to Grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Grayscale to Threshold (binary, not adaptive)
      cv.threshold(gray, threshold, threshValue, 255, cv.THRESH_BINARY);

      // Threshold to Dilate [and erode](create new matrix that can be written upon and anchor point (center))
      const M = cv.Mat.ones(3, 3, cv.CV_8U);
      const anchor = new cv.Point(-1, -1);
      cv.dilate(threshold, dilate, M, anchor, 0, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

      // DRAW CONTOURS
      // Create matrices to hold contour counts
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      const contoursObject = [];
      let contoursValues = [];

      // Find contours
      cv.findContours(dilate, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

      // CALCULATE SINGLE EGGS AND CLUSTERS
      // Initialize and/or reset single and cluster arrays, counts, and area placeholders for computation
      const detectedObjectsArray = [];
      let localSinglesArray = [];
      let localClustersArray = [];
      let localSinglesCount = 0;
      let localClustersCount = 0;
      let localSinglesTotalArea = 0;
      let localClustersTotalArea = 0;

      // Define colors for contour object detection (boxes) and contour overlay (green=small, blue=single-egg, red=cluster)
      const contoursColor = new cv.Scalar(255, 255, 255);
      const blue = new cv.Scalar(255, 0, 0, 255); // Blue color
      const red = new cv.Scalar(0, 0, 255, 255);  // Red color
      const green = new cv.Scalar(0, 255, 0, 255); // Green color
      const grayColor = new cv.Scalar(100, 100, 100, 255); // Gray color
      const minEggArea = Math.PI * (minEggRadius * minEggRadius);
      const maxEggArea = Math.PI * (maxEggRadius * maxEggRadius);
      const maxClusterArea = Math.PI * (maxEggCluster * maxEggCluster);

      // Main loop
      for (let i = 1; i < contours.size(); ++i) {
        contoursObject.push(cv.contourArea(contours.get(i)));
        contoursValues = Object.values(contoursObject);
        const contourMax = Math.max(...contoursValues);
        if (contourMax === cv.contourArea(contours.get(i))) {
        } else {
          // Draw contours and bounding boxes for all objects detected from 'contours' matrix
          const cnt = contours.get(i);
          const rect = cv.boundingRect(cnt);
          cv.drawContours(objects, contours, i, contoursColor, 1, 8, hierarchy, 100);
          const point1 = new cv.Point((rect.x - 5), (rect.y - 5));
          const point2 = new cv.Point(rect.x + rect.width + 5, rect.y + rect.height + 5);
          if (hierarchy.intPtr(0, i)[0] === -1 || hierarchy.intPtr(0, i)[1] === -1 || hierarchy.intPtr(0, i)[2] === -1 || hierarchy.intPtr(0, i)[3] === -1) {
            cv.rectangle(objects, point1, point2, green, 1, cv.LINE_AA, 0);
          } else {
            cv.rectangle(objects, point1, point2, green, 3, cv.LINE_AA, 0);
          }

          // Create matrix for points of objects for all objects, even if not calculated immediately (until individual boxes invoked)
          boundingBoxes = src.roi(rect);
          detectedObjectsArray.push(boundingBoxes);

          // Loop through all contours and sort/color by size, drawing on both outlines and overlay images (as well as counting towards array counts)
          if (cv.contourArea(contours.get(i)) <= minEggArea) {
            cv.drawContours(outlines, contours, i, grayColor, -1, cv.LINE_8, hierarchy, 0);
            cv.drawContours(overlay, contours, i, grayColor, 1, cv.LINE_8, hierarchy, 0);
          } else if (cv.contourArea(contours.get(i)) > minEggArea && cv.contourArea(contours.get(i)) <= maxEggArea) {
            cv.drawContours(outlines, contours, i, blue, -1, cv.LINE_8, hierarchy, 0);
            cv.drawContours(overlay, contours, i, blue, 1, cv.LINE_8, hierarchy, 0);
            localSinglesArray.push(cv.contourArea(contours.get(i)));
            localSinglesCount += 1;
          } else if (cv.contourArea(contours.get(i)) > maxEggArea && cv.contourArea(contours.get(i)) <= maxClusterArea) {
            cv.drawContours(outlines, contours, i, red, -1, cv.LINE_8, hierarchy, 0);
            cv.drawContours(overlay, contours, i, red, 1, cv.LINE_8, hierarchy, 0);
            localClustersArray.push(cv.contourArea(contours.get(i)));
            localClustersCount += 1;
          } else if (cv.contourArea(contours.get(i)) > maxClusterArea) {
            cv.drawContours(outlines, contours, i, grayColor, -1, cv.LINE_8, hierarchy, 0);
            cv.drawContours(overlay, contours, i, grayColor, 1, cv.LINE_8, hierarchy, 0);
          }
        }
      }

      // CALCULATIONS
      // Use array counts to calculate single size averages, single size area, cluster average, and cluster area
      localSinglesTotalArea = localSinglesArray.reduce((sum, area) => sum + area, 0);
      const singlesAvg = localSinglesArray.length ? (localSinglesTotalArea / localSinglesArray.length) : 0;

      localClustersTotalArea = localClustersArray.reduce((sum, area) => sum + area, 0);

      const singlesCalculated = singlesAvg ? (localClustersTotalArea / singlesAvg) : 0;
      const avgClusterArea = localClustersCount ? (localClustersTotalArea / localClustersCount) : 0;
      const avgEggsPerCluster = singlesAvg ? (avgClusterArea / singlesAvg) : 0;
      const totalEggs = localSinglesCount + Math.round(singlesCalculated);

      // Update state variables after calculations
      setSinglesArray(localSinglesArray);
      setClustersArray(localClustersArray);
      setSinglesCount(localSinglesCount);
      setClustersCount(localClustersCount);
      setSinglesTotalArea(localSinglesTotalArea);
      setClustersTotalArea(localClustersTotalArea);
      setSinglesAvg(singlesAvg.toFixed(2));
      setSinglesCalculated(singlesCalculated.toFixed(0));
      setAvgClusterArea(avgClusterArea.toFixed(2));
      setAvgEggsPerCluster(avgEggsPerCluster.toFixed(1));
      setTotalEggs(totalEggs);

      // Show images
      cv.imshow('src', src);
      cv.imshow('src2', src);
      cv.imshow('src3', src);
      cv.imshow('src5', src);
      cv.imshow('src6', src);
      cv.imshow('src7', src);
      cv.imshow('threshold', threshold);
      cv.imshow('objects', objects);
      cv.imshow('outlines', outlines);
      cv.imshow('overlay', overlay);

      // Show legend image
      const legend = new cv.Mat(100, 100, cv.CV_8UC3, new cv.Scalar(255, 255, 255));

      // Draw circles representing the sizes
      const center = new cv.Point(50, 50);
      cv.circle(legend, center, minEggRadius, blue, 2); // Blue circle for min egg size
      cv.circle(legend, center, maxEggRadius, red, 2); // Red circle for max egg size
      cv.circle(legend, center, maxEggCluster, grayColor, 2); // Gray circle for max cluster size

      cv.imshow('legendCanvas', legend);
      legend.delete();

      // Delete matrices to save on memory
      src.delete();
      gray.delete();
      threshold.delete();
      dilate.delete();
      objects.delete();
      outlines.delete();
      overlay.delete();
      M.delete();
      contours.delete();
      hierarchy.delete();

    } catch (error) {
      console.error("Error during OpenCV processing:", error);
    }
  };
  img.onerror = () => {
    console.error('Failed to load analyzed image');
  };
};

const handleSliderChange = (setter, name) => (_, value) => {
  setter(value);
  analyzeCanvasOrImage("analyzedCanvas");
};

const handleTextFieldChange = (setter, name) => (event) => {
  const value = parseInt(event.target.value) || 0;
  setter(value);
  analyzeCanvasOrImage("analyzedCanvas");
};

document.addEventListener("DOMContentLoaded", function () {
  analyzeCanvasOrImage("analyzedCanvas"); // Ensure this matches the actual ID
});

  const turnImages = async () => {
    // Use time delays to display calculation images and rotate when done calculating
    for (let i = 0; i < length; ++i) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWindow(i);
    }
  
    // After timeout, show analysis results
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAnalysisComplete(true);
  
    // After timeout, show bottom menu
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowBottom(true);

  };

  return (
    <Container fluid="true">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={8} xl={9} style={{ display: analysisStarted ? 'block' : 'none' }}>
          <Card className="elevation-5">
            <div ref={canvasContainerRef} style={{ 
              width: '100%', 
              height: 'calc(100vh - 280px)', // Adjust this value based on your header/footer heights
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {analyzedImages.map((item, index) => (
                <div key={item.output} style={{ 
                  display: window === index ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}>
                  <canvas
                    id={item.output}
                    className="imageCanvasOuter"
                    style={{ 
                      display: showAnalysis ? 'block' : 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></canvas>
                  <canvas
                    id={item.source}
                    className="imageCanvasOuter"
                    style={{ 
                      display: !showAnalysis ? 'block' : 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></canvas>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: 'none' }}>
            <canvas id="analyzedCanvas"></canvas> 
          </div>
          <Card className="my-3">
            <CardContent>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <h1>{analyzedImagesPretty[window]}</h1>
                  <h2>({window + 1} of {analyzedImages.length})</h2>
                </Grid>
                <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton color="primary" onClick={previous} style={{ background: 'white', borderRadius: '50%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={next} style={{ background: 'white', borderRadius: '50%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} lg={3} xl={3} style={{ paddingLeft: analysisComplete ? '0' : '3' }}>
          {drawer && (
            <Card className="mb-2" style={{ width: '120%', marginRight: '10%', marginLeft: '5%' }}> {/* Modified this line */}
              <CardContent>
                <h4>Filters</h4>
                <Grid container>
                  <CustomTooltip title="Use this slider to separate background image 'noise' and scan for just the eggs.">
                    <Grid item>
                      <span>Image Threshold Adjustment</span>
                    </Grid>
                  </CustomTooltip>
                  <Grid item xs={9}>
                    <Slider style={{ color: 'white' }} value={threshValue} max={255} onChange={handleSliderChange(setThreshValue, 'Threshold')} />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField 
                      value={threshValue}
                      onChange={handleTextFieldChange(setThreshValue, 'Threshold')}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container>
                  <CustomTooltip title="The minimum (smallest single egg) radius for the algorithm - anything smaller will be 'grayed out' and not calculated.">
                    <Grid item>
                      <span>Minimum Egg Size</span>
                    </Grid>
                  </CustomTooltip>
                  <Grid item xs={9}>
                    <Slider style={{ color: 'white' }} value={minEggRadius} min={0} max={100} onChange={handleSliderChange(setMinEggRadius, 'Minimum Egg Size')} />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField 
                      value={minEggRadius}
                      onChange={handleTextFieldChange(setMinEggRadius, 'Minimum Egg Size')}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container>
                  <CustomTooltip title="The maximum radius for the eggs - anything larger will be considered a cluster">
                    <Grid item>
                      <span>Maximum Egg Size</span>
                    </Grid>
                  </CustomTooltip>
                  <Grid item xs={9}>
                    <Slider style={{ color: 'white' }} value={maxEggRadius} min={0} max={100} onChange={handleSliderChange(setMaxEggRadius, 'Maximum Egg Size')} />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField 
                      value={maxEggRadius}
                      onChange={handleTextFieldChange(setMaxEggRadius, 'Maximum Egg Size')}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container>
                  <CustomTooltip title="The maximum radius for the cluster of eggs - anything larger will be discarded.">
                    <Grid item>
                      <span>Maximum Cluster Size</span>
                    </Grid>
                  </CustomTooltip>
                  <Grid item xs={9}>
                    <Slider style={{ color: 'white' }} value={maxEggCluster} min={0} max={100} onChange={handleSliderChange(setMaxEggCluster, 'Maximum Cluster Size')} />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField 
                      value={maxEggCluster}
                      onChange={handleTextFieldChange(setMaxEggCluster, 'Maximum Cluster Size')}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems="center">
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={6}>
                      <CustomTooltip title="Use these slider to set the minimum (smaller single egg) radius for the algorithm.">
                        <div>
                          <p>Egg Size Scale</p>
                          <p style={{ display: 'flex', alignItems: 'center' }}>
                            <FiberManualRecordIcon style={{ color: 'blue' }}/>
                            <span style={{ marginLeft: '4px' }}>Minimum Egg Size</span>
                          </p>
                          <p style={{ display: 'flex', alignItems: 'center' }}>
                            <FiberManualRecordIcon style={{ color: 'red' }}/>
                            <span style={{ marginLeft: '4px' }}>Maximum Egg Size</span>
                          </p>
                          <p style={{ display: 'flex', alignItems: 'center' }}>
                            <FiberManualRecordIcon style={{ color: 'grey' }}/>
                            <span style={{ marginLeft: '4px' }}>Too Large / Too Small</span>
                          </p>
                        </div>
                      </CustomTooltip>
                    </Grid>
                    <Grid item xs={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <canvas id="legendCanvas" width="100" height="100"></canvas>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          <Card style={{ width: '120%', marginRight: '10%', marginLeft: '5%' }}> {/* Added same styling as filter card */}
            <CardContent>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <h4>Analysis</h4>
                </Grid>
                <Grid item>
                  <Button color="primary" onClick={() => setDetailsDialog(true)} style={{  background: 'white' }}>Details</Button>
                </Grid>
              </Grid>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <FiberManualRecordIcon style={{ color: 'blue' }}/>
                        <span style={{ marginLeft: '4px' }}>Single Eggs</span>
                      </div>
                    } 
                    secondary={<div style={{ paddingLeft: '28px' }}>{singlesCount}</div>} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <FiberManualRecordIcon style={{ color: 'red' }}/>
                        <span style={{ marginLeft: '4px' }}>Calculated from Clusters</span>
                      </div>
                    } 
                    secondary={<div style={{ paddingLeft: '28px' }}>{singlesCalculated}</div>} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Total Egg Estimation" secondary={totalEggs} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
        <Card>
          <CardContent>
            <h2>Details</h2>
            <List>
              <ListItem>
                <ListItemText primary="Total Single Egg Area" secondary={singlesTotalArea} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Single Egg Average Size" secondary={singlesAvg} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Egg Clusters" secondary={clustersCount} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Total Egg Clusters Area" secondary={clustersTotalArea} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Average Cluster Area" secondary={avgClusterArea} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Average Eggs per Cluster" secondary={avgEggsPerCluster} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Image Size" secondary={imageSize} />
              </ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button color="primary" onClick={() => setDetailsDialog(false)}>Close</Button>
          </CardActions>
        </Card>
      </Dialog>
      <div style={{    bottom: 0, width: '80%', display: showBottom ? 'flex' : 'none', justifyContent: 'space-around', height: '50px' }}>
        <Button color="primary" onClick={rerender} style={{ color: 'white' }}>
          <span>Reset</span>
          <RestartAltIcon/>
        </Button>
        <Button color="primary" onClick={() => setDrawer(!drawer)} style={{ color: 'white' }}>
          <span>Show Filters</span>
          <FilterAltIcon/>
        </Button>
        <Button color="primary" style={{ color: 'white' }}>
          <span>Submit</span>
          <PublishIcon/>
        </Button>
      </div>
    </Container>
  );
};

export default Analysis;

