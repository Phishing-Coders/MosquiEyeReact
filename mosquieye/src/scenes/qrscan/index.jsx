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

      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '500px',
          margin: '20px auto' 
        }}
      >
        {Capacitor.getPlatform() === 'web' ? (
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={(err, result) => {
              if (result) {
                setScanResult(result.text);
                setError('');
              } else {
                setScanResult('');
                setError('Not Found');
              }
            }}
          />
        ) : (
          <Button variant="contained" color="primary" onClick={handleScan}>
            Scan QR Code
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