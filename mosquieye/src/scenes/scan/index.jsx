import React, { useState, useCallback } from 'react';
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
import { Box, Button, TextField, Slider, Container, Grid, Card, CardMedia, CardContent, Typography } from "@mui/material";
import AppAnalysis from './AppAnalysis';
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
  const navigate = useNavigate();
  const handleToggle = (type) => {
    setImageType(type);
    
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
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (imageSrc, crop, fileName) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // change to make it magnifize the content
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

  const handleSwitchToAnalysis = () => {
    navigate('./Analysis', { state: { imageSrc } });
  };

  const handleToAnalysis = () => {
    navigate('/Analysis', { state: { imageSrc } }); // Pass any necessary state here
  };

 
  



  return (
    //information about the image types
    <Box m="20px">
      <Header title="Scan" subtitle="Upload Image to algorithmically detect mosquito eggs and egg cluster on ovitrap paper using computer vision." />
      <Container>
        <Grid container justify="center">
          <Grid item xs={10} md={20}>
            <Container>
              <h2 align="center">Select the ovitrap image type</h2>

              <Grid container spacing={3} justify="center" style={{ display: 'flex' }}>
                <Grid item xs={1} md={3} style={{ display: 'flex' }}>
                  <Card
                    onClick={() => handleToggle('paper')}
                    style={{
                      border: imageType === 'paper' ? '2px solid var(--v-primary-base)' : '',
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
                      border: imageType === 'magnified' ? '2px solid var(--v-primary-base)' : '',
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
                      border: imageType === 'micro' ? '2px solid var(--v-primary-base)' : '',
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
      <Box mb="20px">
      
      <Container>
        <Grid container justify="center">
          <Grid item xs={10} md={20}>
            <Container>
              <Grid container spacing={3} justify="center" style={{ display: 'flex' }}>
                <Grid item xs={1} md={10} style={{ display: 'flex' }}>
                  <Card>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="upload-image"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="upload-image">
                      <Button variant="contained" align="center" color="primary" component="span" startIcon={<PhotoCamera />}>
                        Select Image
                      </Button>
                    </label>
                    {imageSrc && (
                      <div>
                        <CardMedia
                          component="img"
                          alt="Uploaded Image"
                          height="300"
                          image={imageSrc}
                          title="Uploaded Image"
                        />
                        {/* <Button variant="contained" color="primary" onClick={handleSwitchToAnalysis} startIcon={<CheckCircle />}>
                          Switch to Analysis
                        </Button> */}
                        <Button variant="contained" color="secondary" onClick={() => setImageSrc(null)} startIcon={<Cancel />}>
                          Remove
                        </Button>
                      </div>
                    )}
                    <CardContent>
                      <Typography variant="h2">Microscope</Typography>
                      <Typography variant="body2" color="textSecondary" component="p">
                        Image is square, and mosquito eggs are clearly visible as large objects.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Grid>
        </Grid>
      </Container>
      
      </Box>

      {/* image information */}
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
            <Box
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
            </Box>
             <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained" onclick="handleSwitchToAnalysis" >
                Submit
              </Button>

              
            </Box> 
          </form>
        )}
      </Formik>

      <Button type="submit" color="secondary" variant="contained"  onClick={handleToAnalysis}>
                
                to analysis
              </Button>
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


