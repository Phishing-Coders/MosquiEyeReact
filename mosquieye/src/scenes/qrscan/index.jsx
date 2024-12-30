import React, { useState } from 'react';
import { Box, Typography, Alert, Snackbar, Button } from '@mui/material';
import Header from "../../components/Header";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const QRScan = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');

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