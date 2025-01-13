import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Box, Typography, Alert, Snackbar, Button, Card, CardContent } from '@mui/material';
import Header from "../../components/Header";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useMediaQuery from "@mui/material/useMediaQuery";

const QRScan = () => {
  const navigate = useNavigate();
  const isMobile = !useMediaQuery('(min-width:600px)');
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  const [ovitrap, setOvitrap] = useState(null);

  const handleScan = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100,
      });

      const result = await decodeQRCode(photo.dataUrl);
      if (result) {
        await fetchOvitrapData(result);
      }
    } catch (error) {
      setError('Failed to scan QR code: ' + error.message);
    }
  };

  const fetchOvitrapData = async (ovitrapId) => {
    try {
      const response = await axios.get(`/api/ovitraps/${ovitrapId}`);
      setOvitrap(response.data);
      // Navigate to scan page with ovitrap data
      navigate('/scan', { 
        state: { 
          ovitrapId: ovitrapId,
          ovitrapData: response.data 
        } 
      });
    } catch (error) {
      setError('Failed to fetch ovitrap data: ' + error.message);
    }
  };

  const handleWebScan = (err, result) => {
    if (result) {
      fetchOvitrapData(result.text);
    }
  };

  return (
    <Box m="20px">
      <Header 
        title="QR Scanner" 
        subtitle="Scan QR code to identify ovitrap and proceed with image upload" 
      />

      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
        <CardContent>
          {isMobile ? (
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleScan}
                sx={{ mb: 2 }}
              >
                Open Camera to Scan QR
              </Button>
              {scanResult && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Scanned Ovitrap ID: {scanResult}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please use a mobile device to scan QR codes
              </Typography>
              <BarcodeScannerComponent
                width="100%"
                height={400}
                onUpdate={handleWebScan}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRScan;