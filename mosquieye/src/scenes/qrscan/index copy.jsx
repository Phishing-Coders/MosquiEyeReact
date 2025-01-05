import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert, 
  useTheme 
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Header from "../../components/Header";
import { Html5Qrcode } from 'html5-qrcode';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const QRScans = () => {
  // Use useNavigate instead of Navigate component
  const navigate = useNavigate();
  const theme = useTheme();
  const { isSignedIn, isLoaded, user } = useUser();
  
  // State management with more robust initial states
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [qrCodeErrorMessage, setQrCodeErrorMessage] = useState('');

  // Redirect logic moved to useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Memoized scanning function
  const startScanning = useCallback(() => {
    // Ensure scanning only starts if user is signed in
    if (!isSignedIn) return;

    const html5QrCode = new Html5Qrcode("reader");
    const qrCodeSuccessCallback = (decodedText) => {
      setIsScanning(false);
      setScanResult(decodedText);
      setOpenDialog(true);
      html5QrCode.stop();
    };

    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      qrCodeSuccessCallback,
      (errorMessage) => {
        console.error("QR Scan Error:", errorMessage);
        setQrCodeErrorMessage(errorMessage || "Scanning failed");
      }
    ).catch(err => {
      console.error("Error starting QR code scanner:", err);
      setQrCodeErrorMessage("Failed to start scanning. Check camera permissions.");
    });

    setIsScanning(true);
  }, [isSignedIn]);

  // Dialog and scanning management functions
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setScanResult(null);
  }, []);

  const handleScanAgain = useCallback(() => {
    handleCloseDialog();
    startScanning();
  }, [handleCloseDialog, startScanning]);

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCode.stop();
      } catch (error) {
        console.warn("Error stopping QR scanner:", error);
      }
    };
  }, []);

  // Render loading state while authentication is checking
  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  // Main render
  return (
    <Box m="20px">
      <Header 
        title="QR Code Scanner" 
        subtitle="Scan QR codes from ovitraps to retrieve location and metadata" 
      />
      
      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box 
                  id="reader" 
                  sx={{ 
                    width: '100%', 
                    height: isScanning ? '400px' : '200px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    border: `2px dashed ${theme.palette.grey[400]}`,
                    transition: 'height 0.3s ease',
                    borderRadius: '8px',
                    backgroundColor: isScanning 
                      ? theme.palette.grey[200] 
                      : theme.palette.background.paper
                  }}
                >
                  {!isScanning ? (
                    <Box textAlign="center">
                      <QrCodeScannerIcon 
                        sx={{ 
                          fontSize: 80, 
                          color: theme.palette.grey[600] 
                        }} 
                      />
                      <Typography variant="h6" color="textSecondary">
                        Ready to Scan QR Code
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="h6" color="textSecondary">
                      Scanning...
                    </Typography>
                  )}
                </Box>
                
                <Box mt={2} textAlign="center">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={startScanning}
                    disabled={isScanning || !isSignedIn}
                    sx={{ 
                      padding: '10px 20px', 
                      fontSize: '16px' 
                    }}
                  >
                    Start Scanning
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Scan Result Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code Scanned</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Scanned Result: {scanResult || 'No result'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            onClick={handleScanAgain} 
            color="primary" 
            variant="contained"
          >
            Scan Again
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!qrCodeErrorMessage}
        autoHideDuration={6000}
        onClose={() => setQrCodeErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setQrCodeErrorMessage('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {qrCodeErrorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRScans;