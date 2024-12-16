import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

export default function LinearIndeterminate() {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress 
        sx={{
          height: 10, // Increase the thickness of the progress bar
          backgroundColor: '#F5F5F5', // Change the background color
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#D3D3D3', 
           // Change the progress bar color (optional)
          },
        }} 
      />
    </Box>
  );
}
