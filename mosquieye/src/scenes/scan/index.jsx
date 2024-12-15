import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import paperImage from '../../assets/type-paper-thumb.jpg';
import magnifiedImage from '../../assets/type-magnified-thumb.jpg';
import microImage from '../../assets/type-microscope-thumb.jpg';
import Header from "../../components/Header";
import Cropper from 'react-easy-crop';
import { PhotoCamera, RotateRight, Cancel, CheckCircle } from '@mui/icons-material';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Button, TextField, Slider, Container, Grid, Card, CardMedia, CardContent, Typography, Dialog } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const Scan = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
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

  useEffect(() => {
    setImageType('paper');
  }, []);

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
        // Reset other states related to cropping when a new image is uploaded
        setCroppedImage(null);
        setCroppedAreaPixels(null);
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

  const getCroppedImg = (imageSrc, crop, fileName) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
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
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = fileName;
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/jpeg');
    });
  };
  
  const handleCrop = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels, 'croppedImage.jpg');
      setCroppedImage(croppedImageUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormSubmit = (values) => {
    console.log(values);
  };

  const handleSwitchToAnalysis = (values) => {
    navigate('/analysis', { state: { imageSrc, imageType, ...values } });
  };

  const handleToAnalysis = (values) => {
    const formData = new FormData();
    formData.append('address2', values.address2);
    formData.append('picture', imageSrc);

    navigate('/analysis', { state: { imageData: imageSrc, imageType, ...values } }); 
  };

  const resetCroppa = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setCroppedAreaPixels(null);
  };

  const loadDemoImage = () => {
    let demoImageSrc;
    if (imageType === 'paper') demoImageSrc = '/mecvision/img/type-paper.jpg';
    if (imageType === 'magnified') demoImageSrc = '/mecvision/img/type-magnified.jpg';
    if (imageType === 'micro') demoImageSrc = '/mecvision/img/type-microscope.jpg';
    setImageSrc(demoImageSrc);
  };

  const accept = async () => {
    try {
      const rawImage = await getCroppedImg(imageSrc, croppedAreaPixels, 'rawImage.jpg');
      navigate('/analysis', { state: { imageSrc: rawImage, imageType } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box m="20px">
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
      <Box mb="20px" sx={{ mt: 5 }}>
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

      {/* image information, get user information from database */}
      {/* enable gps function */}

      <Box m="20px">
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={checkoutSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              {/* <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="First Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  name="firstName"
                  error={!!touched.firstName && !!errors.firstName}
                  helperText={touched.firstName && errors.firstName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Last Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  name="lastName"
                  error={!!touched.lastName && !!errors.lastName}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Contact Number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.contact}
                  name="contact"
                  error={!!touched.contact && !!errors.contact}
                  helperText={touched.contact && errors.contact}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Address 1"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.address1}
                  name="address1"
                  error={!!touched.address1 && !!errors.address1}
                  helperText={touched.address1 && errors.address1}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Address 2"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.address2}
                  name="address2"
                  error={!!touched.address2 && !!errors.address2}
                  helperText={touched.address2 && errors.address2}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box> */}
              <Box display="flex" justifyContent="center" mt="-10px">
                <Button type="submit" color="secondary" variant="contained" onClick={() => handleSwitchToAnalysis(values)}>
                  Submit
                </Button>
                <Box width="20px" />
                <Button type="submit" color="secondary" variant="contained" onClick={() => handleToAnalysis(values)}>
                  to analysis
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address1: yup.string().required("required"),
  address2: yup.string().required("required"),
});
const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  address1: "",
  address2: "",
};

export default Scan;