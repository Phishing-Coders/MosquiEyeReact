import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import paperImage from "../../assets/type-paper-thumb.jpg";
import magnifiedImage from "../../assets/type-magnified-thumb.jpg";
import microImage from "../../assets/type-microscope-thumb.jpg";
import Header from "../../components/Header";
import { PhotoCamera, Cancel } from "@mui/icons-material";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { 
  Box, Button, Container, Grid, Card, CardMedia, CardContent, 
  Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar 
} from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

const Scan = () => {
  const isMobile = useMediaQuery("(min-width:600px)");
  const location = useLocation();
  const { ovitrapId, ovitrapData } = location.state || {};
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const { t } = useTranslation();
  const [imageType, setImageType] = useState(null);
  const [showBottomOptions, setShowBottomOptions] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bottomSectionRef = useRef(null);
  const [ovitraps, setOvitraps] = useState([]);
  const [selectedOvitrapId, setSelectedOvitrapId] = useState('');
  const [showError, setShowError] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const handleOvitrapSelect = (e) => {
    setSelectedOvitrapId(e.target.value);
    setShowImageOptions(!!e.target.value || !!ovitrapId);
  };

  useEffect(() => {
    const fetchOvitraps = async () => {
      try {
        const response = await axios.get('/api/ovitraps');
        setOvitraps(response.data.ovitraps);
        
        // If ovitrapId exists from QR scan, set it as selected
        if (ovitrapId) {
          setSelectedOvitrapId(ovitrapId);
          setShowImageOptions(true);
        }
      } catch (error) {
        console.error('Error fetching ovitraps:', error);
      }
    };

    fetchOvitraps();
    setImageType('paper');
  }, [ovitrapId]);

  const handleToggle = (type) => {
    setImageType(type);
    // Do not reset the image source when changing the image type
    // resetCroppa();
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        console.log("Image uploaded:", reader.result); // Debug log
        setCroppedImage(null);
        setCroppedAreaPixels(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const getCroppedImg = (imageSrc, crop, fileName) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        blob.name = fileName;
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    });
  };

  const handleCrop = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        "croppedImage.jpg"
      );
      setCroppedImage(croppedImageUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormSubmit = (values) => {
    console.log(values);
  };

  const handleSwitchToAnalysis = (values) => {
    navigate("/analysis", { state: { imageSrc, imageType, ...values } });
  };

  const handleToAnalysis = (values) => {
    if (!selectedOvitrapId && !ovitrapId) {
      setShowError(true);
      return;
    }
    
    const formData = new FormData();
    formData.append("address2", values.address2);
    formData.append("picture", imageSrc);

    navigate('/analysis', { 
      state: { 
        imageData: imageSrc, 
        imageType,
        additionalData: {
          ovitrapId: ovitrapId || selectedOvitrapId,
          ...ovitrapData
        },
        ...values 
      } }); 
  };

  const resetCroppa = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setCroppedAreaPixels(null);
  };

  const loadDemoImage = () => {
    let demoImageSrc;
    if (imageType === "paper") demoImageSrc = "/mecvision/img/type-paper.jpg";
    if (imageType === "magnified")
      demoImageSrc = "/mecvision/img/type-magnified.jpg";
    if (imageType === "micro")
      demoImageSrc = "/mecvision/img/type-microscope.jpg";
    setImageSrc(demoImageSrc);
  };

  const accept = async () => {
    try {
      const rawImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        "rawImage.jpg"
      );
      navigate("/analysis", { state: { imageSrc: rawImage, imageType } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box
      m={isMobile ? "30px" : "30px"}
      sx={{
        overflow: "auto",
      }}
    >
      <Header
        title="Scan"
        subtitle="Upload Image to algorithmically detect mosquito eggs and egg cluster on ovitrap paper using computer vision."
      />
        <Container
          maxWidth="lg"
          sx={{
            mt: 0,
            mb: isMobile ? 9 : 10,
            px: isMobile ? 0 : 0, // Adjust padding for mobile
          }}
        >
        <Box mb={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          <FormControl fullWidth variant="outlined"
            sx={{ 
              width: '30%',
            }}>
            <InputLabel 
            sx={{ 
              fontSize: '1.0rem',
              fontWeight: 'bold',
              justifyContent: 'center',
            }}
            >Select Ovitrap</InputLabel>
            <Select
              value={selectedOvitrapId}
              onChange={handleOvitrapSelect}
              label="Select Ovitrap"
              disabled={!!ovitrapId} // Disable if ovitrapId exists from QR scan
            >
              {ovitraps.map((ovitrap) => (
                <MenuItem key={ovitrap.ovitrapId} value={ovitrap.ovitrapId}>
                  {`Ovitrap ${ovitrap.ovitrapId} - ${ovitrap.metadata.area || 'No area'}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {ovitrapId && (
            <Typography 
              variant="caption" 
              color="textSecondary" 
              sx={{ display: 'block', mt: 1 }}
            >
              Ovitrap ID locked from QR scan
            </Typography>
          )}
        </Box>

        {showImageOptions && (
          <>
          
          </>
        )}
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} md={9}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              align="center"
              sx={{ mb: 3, fontWeight: "bold", fontSize: "1.4rem" }}
            >
              Select the ovitrap image type
            </Typography>

            <Grid
              container
              spacing={1.5}
              justifyContent="center"
              sx={{
                width: "100%",
                margin: "0 auto",
              }}
            >
              {/* Paper Type Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  onClick={() => handleToggle("paper")}
                  sx={{
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: (theme) =>
                      imageType === "paper"
                        ? `2px solid ${theme.palette.common.white}`
                        : "none",
                    boxShadow: imageType === "paper" ? 3 : 1,
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    alt="Paper"
                    height="200"
                    image={paperImage}
                    title="Paper"
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Paper Strip
                    </Typography>
                    <Typography color="textSecondary" component="p">
                      {t(
                        "Ovitrap paper is rectangular in shape (approx. 32cm X 8cm), on white pellon fabric with gray-black mosquito eggs."
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Magnified Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  onClick={() => handleToggle("magnified")}
                  sx={{
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: (theme) =>
                      imageType === "magnified"
                        ? `2px solid ${theme.palette.common.white}`
                        : "none",
                    boxShadow: imageType === "magnified" ? 3 : 1,
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    alt="Magnified"
                    height="200"
                    image={magnifiedImage}
                    title="Magnified"
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Magnified
                    </Typography>
                    <Typography color="textSecondary" component="p">
                      {t(
                        "Ovitrap paper is less narrow than a paper strip, on white pellon fabric with gray-black mosquito eggs that appear larger in the image."
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Micro Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  onClick={() => handleToggle("micro")}
                  sx={{
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: (theme) =>
                      imageType === "micro"
                        ? `2px solid ${theme.palette.common.white}`
                        : "none",
                    boxShadow: imageType === "micro" ? 3 : 1,
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    alt="Micro"
                    height="200"
                    image={microImage}
                    title="Micro"
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Micro
                    </Typography>
                    <Typography color="textSecondary" component="p">
                      {t(
                        "Ovitrap paper photographed under microscope, showing detailed view of mosquito eggs."
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* image upload */}
      <Box mb="40px" sx={{ mt: -7, display: "flex", justifyContent: "center" }}>
        <Container>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12} md={8.8}>
              <Card>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
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
                      flexDirection="column"
                      height="120px"
                      width="100%"
                      sx={{
                        cursor: "pointer",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: "40px", color: "#999" }} />
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        align="center"
                        sx={{ mt: 1 }}
                      >
                        Click to upload an image
                      </Typography>
                    </Box>
                  )}
                </label>
                {imageSrc && (
                  <Box mt={2}>
                    <CardMedia
                      component="img"
                      alt="Uploaded Image"
                      height="200"
                      image={imageSrc}
                      title="Uploaded Image"
                      style={{
                        objectFit: "contain",
                        marginBottom: "15px",
                        borderRadius: "8px",
                      }}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleRemoveImage}
                      startIcon={<Cancel />}
                      fullWidth
                      sx={{
                        marginBottom: "0px",
                        textTransform: "none",
                        fontWeight: "bold",
                      }}
                    >
                      Remove Image
                    </Button>
                  </Box>
                )}
              </Card>
              {/* Analyze Button */}
              {imageSrc && (
                <>
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  mt={2}
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    marginBottom: '100px'
                  }}
                >
                  <Button 
                    color="secondary" 
                    variant="contained" 
                    onClick={() => handleToAnalysis({})}
                    size="large"
                    sx={{
                      padding: '10px 30px',
                      fontSize: '1.1rem',
                      fontWeight: "bold",
                    }}
                  >
                    Analyze Image
                  </Button>
                </Box>
                <Snackbar 
                  open={showError} 
                  autoHideDuration={3000} 
                  onClose={() => setShowError(false)}
                  anchorOrigin={{ 
                    vertical: 'top', 
                    horizontal: 'right' 
                  }}
                  sx={{
                    marginTop: '20px',
                    marginRight: '20px'
                  }}
                >
                  <Alert 
                    onClose={() => setShowError(false)} 
                    severity="warning"
                  >
                    Please select an Ovitrap ID first
                  </Alert>
                </Snackbar>
              </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Scan;
