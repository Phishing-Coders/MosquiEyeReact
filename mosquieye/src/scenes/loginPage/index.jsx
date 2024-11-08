import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Button, Grid, InputAdornment, Snackbar, Alert, TextField, Typography } from "@mui/material"; // Ensure Grid is imported
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation to track the location
import { useAuth0 } from "@auth0/auth0-react"; // Import useAuth0 hook

import background from "../../assets/medicalbackground1.png";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0(); // Destructure loginWithRedirect from useAuth0
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // To track the URL and detect back navigation

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // // Simulate a login process
    // if (username === "admin" && password === "password") {
    //   setIsAuthenticated(true); // Set authentication state
    //   navigate("/dashboard"); // Navigate to the dashboard on successful login
    // } else {
    //   setError("Invalid username or password");
    //   setOpenSnackbar(true);
    // }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Grid container component="main" sx={{ height: "100vh" }}>
        {/* Left-side background image */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Right-side login form */}
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Box}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            sx={{
              mt: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5" sx={{ fontSize: 20 }}>
              LOGIN
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              Welcome to Moquieye Web Application
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {/* <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              /> */}
              <Button
                // type="submit"
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => loginWithRedirect()}
                sx={{
                  mt: 3,
                  mb: 2,
                  background:
                    "linear-gradient(180deg, rgb(145,129,244) 0%, rgb(80,56,237) 100%)",
                }}
              >
                Login with Auth0
              </Button>
              {/* <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 0,
                  mb: 2,
                  background:
                    "linear(180deg, rgb(255,0,0) 0%, rgb(80,56,237) 100%)",
                }}
              >
                Forgot Password?
              </Button> */}
            </Box>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity="error">
                {error}
              </Alert>
            </Snackbar>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
