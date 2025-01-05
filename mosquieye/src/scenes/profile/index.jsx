import { Check, PhotoCamera } from "@mui/icons-material";
import { Avatar, Box, Button, IconButton, TextField, Typography, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const Profile = () => {
  const { user } = useUser();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const [profilePicture, setProfilePicture] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const imageUrl = user.imageUrl || user.profileImageUrl;
      setProfilePicture(imageUrl);
    }
  }, [user]);

  // Validation schema
  const profileSchema = yup.object().shape({
    firstName: yup.string().required("required"),
    lastName: yup.string().required("required"),
    email: yup.string().email("invalid email").required("required"),
    address: yup.string().required("required"),
    contact: yup
      .string()
      .matches(/^\d+$/, "Contact must be numeric")
      .required("required"),
    city: yup.string().required("required"),
    state: yup.string().required("required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("required"),
  });

  const initialValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.primaryEmailAddress.emailAddress || "",
    address: user?.address || "",
    contact: user?.contact || "",
    city: user?.city || "",
    state: user?.state || "",
    password: "", // For security, don't populate password field
  };

  if(loading){
    return <CircularProgress />;
  }

  console.log("User Data: ", user);

  
  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/users/${user.id}`,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          address: values.address,
          contact: values.contact,
          city: values.city,
          state: values.state
        }
      );

      if (response.status === 200) {
        setSaveSuccess(true);
        // Update the user profile in Clerk if needed
        await user.update({
          firstName: values.firstName,
          lastName: values.lastName,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveSuccess(false);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Update profile image using Clerk's API
        await user.setProfileImage({ file });
        
        // Get the updated image URL
        const newImageUrl = user.imageUrl;
        setProfilePicture(newImageUrl);
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    }
  };

  return (
    <Box m="20px">
      <Header title="EDIT PROFILE" subtitle="Update your profile information" />

      <Box display="flex" gap={2} mb="20px" alignItems="center">
        <Avatar src={profilePicture || "https://via.placeholder.com/120"} alt="User" sx={{ width: 150, height: 150 }} />
        <Box>
          <IconButton
            component="label"
            sx={{
              bgcolor: "primary.main",
              color: theme.palette.mode === "dark" ? "white" : "black", // Adjust icon color based on theme
              "&:hover": {
                bgcolor: "primary.dark",
                color: theme.palette.mode === "dark" ? "lightgray" : "gray",
              },
              padding: 2,
              borderRadius: "50%",
              transition: "all 0.3s ease",
            }}
          >
            <PhotoCamera fontSize="large" />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePictureChange}
            />
          </IconButton>
          <Typography variant="caption" color="text.secondary" mt={1}>
            Upload Profile Picture
          </Typography>
        </Box>
      </Box>

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={profileSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
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
                variant="outlined"
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
                variant="outlined"
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
                variant="outlined"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
                InputProps={{
                  endAdornment: <Check fontSize="large" sx={{ color: "#23b000" }} />,
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={!!touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="outlined"
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
                variant="outlined"
                label="City"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.city}
                name="city"
                error={!!touched.city && !!errors.city}
                helperText={touched.city && errors.city}
                sx={{ gridColumn: "span 2" }}
                select
                SelectProps={{ native: true }}
              >
                <option value="Mehrab">Mehrab</option>
                <option value="Kabul">Kabul</option>
              </TextField>
              <TextField
                fullWidth
                variant="outlined"
                label="State"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.state}
                name="state"
                error={!!touched.state && !!errors.state}
                helperText={touched.state && errors.state}
                sx={{ gridColumn: "span 2" }}
                select
                SelectProps={{ native: true }}
              >
                <option value="Bozorgi">Bozorgi</option>
                <option value="Kabul">Kabul</option>
              </TextField>
              <TextField
                fullWidth
                variant="outlined"
                label="Password"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
                InputProps={{
                  endAdornment: <Check fontSize="large" sx={{ color: "#23b000" }} />,
                }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px" gap={2}>
              <Button
                type="button"
                variant="outlined"
                disabled={isSubmitting || loading}
                sx={{
                  width: "182px",
                  height: "55px",
                  borderColor: theme.palette.warning.main,
                  color: theme.palette.mode === "dark" ? theme.palette.warning.light : theme.palette.warning.dark,
                  "&:hover": {
                    bgcolor: theme.palette.warning.light,
                    borderColor: theme.palette.warning.dark,
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || loading}
                sx={{
                  width: "182px",
                  height: "55px",
                  bgcolor: theme.palette.warning.main,
                  color: theme.palette.getContrastText(theme.palette.warning.main),
                  "&:hover": {
                    bgcolor: theme.palette.warning.dark,
                  },
                }}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Profile;