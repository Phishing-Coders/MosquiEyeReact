import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import paperImage from '../../assets/type-paper-thumb.jpg';
import magnifiedImage from '../../assets/type-magnified-thumb.jpg';
import microImage from '../../assets/type-microscope-thumb.jpg';
import Header from "../../components/Header";
import Cropper from 'react-easy-crop';
import { PhotoCamera, RotateRight, Cancel, CheckCircle } from '@mui/icons-material';
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Button, TextField, Slider, Container, Grid, Card, CardMedia, CardContent, Typography, Dialog } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';  // Update this line

const Scan = () => {
  const isMobile = useMediaQuery("(min-width:600px)");
  const [imageSrc, setImageSrc] = useState(null);
  const { t } = useTranslation();
  const [imageType, setImageType] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bottomSectionRef = useRef(null);

  useEffect(() => {
    setImageType('paper');
  }, []);

  const handleToggle = (type) => {
    setImageType(type);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        // Reset other states related to cropping when a new image is uploaded
        setCroppedImage(null);
        setCroppedAreaPixels(null);
        
        // Add scroll behavior
        setTimeout(() => {
          bottomSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Reset the file input
    }
  };
  
  const handleToAnalysis = () => {
    if (!imageSrc) {
      alert('Please upload an image first');
      return;
    }
  
    try {
      const analysisData = {
        imageData: imageSrc,
        imageType: imageType,
        timestamp: new Date().toISOString()
      };
  
      navigate('/analysis', { 
        state: analysisData
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
  const loadDemoImage = () => {
    let demoImageSrc;
    if (imageType === 'paper') demoImageSrc = '/mecvision/img/type-paper.jpg';
    if (imageType === 'magnified') demoImageSrc = '/mecvision/img/type-magnified.jpg';
    if (imageType === 'micro') demoImageSrc = '/mecvision/img/type-microscope.jpg';
    setImageSrc(demoImageSrc);
  };

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      <Header title="Scan" subtitle="Upload Image to algorithmically detect mosquito eggs and egg cluster on ovitrap paper using computer vision." />
      <Container sx={{ mb: 5 }}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} md={10}>
            <Container>
              <h2 style={{ textAlign: 'center' }}>Select the ovitrap image type</h2>

              <Grid container spacing={3} justifyContent="center" alignItems="center">
                <Grid item xs={1} md={3} style={{ display: 'flex' }}>
                  <Card
                    onClick={() => handleToggle('paper')}
                    style={{
                      border: imageType === 'paper' ? '2px solid white' : 'none',
                      boxShadow: imageType === 'paper' ? '0px 4px 20px rgba(0, 0, 0, 0.1)' : '',
                      flex: 1 // Ensure the card takes full height
                    }}
                  >
                    <CardMedia
                      component="img"
                      alt="Paper"
                      height="140"
                      image={paperImage}
                      title="Paper"
                    />
                    <CardContent>
                      <h2>Paper Strip</h2>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {t('Ovitrap paper is rectangular in shape (approx. 32cm X 8cm), on white pellon fabric with gray-black mosquito eggs.')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={1} md={3} style={{ display: 'flex' }}>
                  <Card
                    onClick={() => handleToggle('magnified')}
                    style={{
                      border: imageType === 'magnified' ? '2px solid white' : 'none',
                      boxShadow: imageType === 'magnified' ? '0px 4px 20px rgba(0, 0, 0, 0.1)' : '',
                      flex: 1 // Ensure the card takes full height
                    }}
                  >
                    <CardMedia
                      component="img"
                      alt="Magnified"
                      height="140"
                      image={magnifiedImage}
                      title="Magnified"
                    />
                    <CardContent>
                      <h2>Magnified</h2>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {t('Ovitrap paper is less narrow than a paper strip, on white pellon fabric with gray-black mosquito eggs that appear larger in the image.')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={1} md={3} style={{ display: 'flex' }}>
                  <Card
                    onClick={() => handleToggle('micro')}
                    style={{
                      border: imageType === 'micro' ? '2px solid white' : 'none',
                      boxShadow: imageType === 'micro' ? '0px 4px 20px rgba(0, 0, 0, 0.1)' : '',
                      flex: 1 // Ensure the card takes full height
                    }}
                  >
                    <CardMedia
                      component="img"
                      alt="Micro"
                      height="140"
                      image={microImage}
                      title="Micro"
                    />
                    <CardContent>
                      <h2>Microscope</h2>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {t('Image is square, and mosquito eggs are clearly visible as large objects.')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Grid>
        </Grid>
      </Container>

      {/* image upload */}
      <Box mb="20px" sx={{ mt: -1 }}>
        <Container>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12} md={8}>
              <Container>
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                  <Grid item xs={12}>
                    <Card style={{ width: '100%' }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="upload-image"
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      <label htmlFor="upload-image">
                        {!imageSrc && (
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="300px"
                            width="100%"
                            style={{ cursor: 'pointer' }}
                          >
                            <Button variant="contained" align="center" color="primary" component="span" startIcon={<PhotoCamera />}>
                              Select Image
                            </Button>
                          </Box>
                        )}
                        <Typography variant="body2" color="textSecondary" align="center">
                          Please make sure the image only shows the part where the mosquito eggs are.
                        </Typography>
                      </label>
                      {imageSrc && (
                        <div>
                          <CardMedia
                            component="img"
                            alt="Uploaded Image"
                            height="300"
                            image={imageSrc}
                            title="Uploaded Image"
                            style={{ objectFit: 'contain' }}
                          />
                          <Button variant="contained" color="secondary" onClick={handleRemoveImage} startIcon={<Cancel />}>
                            Remove
                          </Button>
                        </div>
                      )}
                      <CardContent>
                        
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Container>
            </Grid>
          </Grid>
        </Container>
      </Box>      

      <Box m="20px" ref={bottomSectionRef}>  
        <Box display="flex" justifyContent="center" mt="-10px">
          <Button 
              color="secondary" 
              variant="contained" 
              onClick={() => handleToAnalysis()}
              disabled={!imageSrc}
            >
              Submit
            </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Scan;