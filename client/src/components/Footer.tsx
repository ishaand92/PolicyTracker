import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © 2025 Policy Tracker. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
