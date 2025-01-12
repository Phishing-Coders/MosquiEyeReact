
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, CircularProgress } from '@mui/material';

const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: 'rgba(18, 18, 18, 0.9)',
  ...theme.applyStyles('light', {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  }),
}));

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.primary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const CustomLoadingOverlay = () => {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <StyledGridOverlay>
      <CircularProgressWithLabel value={progress} />
      <Box sx={{ mt: 2 }}>Loading rows…</Box>
    </StyledGridOverlay>
  );
};

export default CustomLoadingOverlay;