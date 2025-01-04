import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Box, Typography, Alert, Snackbar, Button } from '@mui/material';
import Header from "../../components/Header";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const QRScan = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');

  const handleScan = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100,
      });

      const result = await decodeQRCode(photo.dataUrl);
      setScanResult(result);
    } catch (error) {
      setError('Failed to scan QR code: ' + error.message);
    }
  };

  const decodeQRCode = async (dataUrl) => {
    const img = new Image();
    img.src = dataUrl;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve(code.data);
        } else {
          reject(new Error('QR code not found'));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  };

  return (
    <Box m="20px">
      <Header 
        title="QR Scanner" 
        subtitle="Scan QR codes to retrieve ovitrap information" 
      />
      
      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid item xs={8}>
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
        )}

        {scanResult && (
          <Box mt={2} textAlign="center">
            <Typography variant="h6">Scanned Result:</Typography>
            <Typography>{scanResult}</Typography>
          </Box>
        )}

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default QRScan;