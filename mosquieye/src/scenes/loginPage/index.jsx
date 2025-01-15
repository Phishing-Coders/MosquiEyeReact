import { Box, Button, Grid, Snackbar, Alert, Typography, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import background from "../../assets/login-background.webp";
import logo from "../../assets/favicon.ico";
import { SignIn } from "@clerk/clerk-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username === "admin" && password === "password") {
      login({ username, role: 'admin' });
      navigate('/dashboard');
    } else {
      setError("Invalid username or password");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box>
      <Grid 
        container 
        component="main" 
        sx={{ 
          height: "100vh",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Left side background */}
        <Grid item xs={false} sm={4} md={7} 
          sx={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: '100%',
            display: { xs: 'none', sm: 'block' }
          }}
        />
        {/* Right side login form */}
        <Grid item xs={12} sm={8} md={5} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Box 
            sx={{ 
              width: '80%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* <Typography variant="h4" sx={{ mb: 4 }}>Login</Typography> */}
            <Box
              component="img"
              src={logo}
              alt="MosquiEye Logo"
              sx={{
                width: '150px', // Adjust size as needed
                height: 'auto',
                mb: 4,
                borderRadius: '50%' // Make the image round
              }}
            />
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                '& .cl-card': { // Clerk's default class for the sign-in card
                  padding: { xs: '1rem', sm: '2rem' },
                  width: '100%',
                  maxWidth: '100%',
                  margin: 0,
                  '& > div': {
                    padding: 0
                  }
                }
              }}
            >
              <SignIn />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;