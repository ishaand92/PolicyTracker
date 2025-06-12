import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Policy List', path: '/list' },
    { label: 'Policy News', path: '/news' },
    { label: 'Methodology', path: '/methodology' },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #ddd',
        color: '#333',
        px: 2,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Brand */}
        <Typography
          variant="h6"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', fontWeight: 600 }}
        >
          Policy Tracker
        </Typography>

        {/* Navigation */}
        <Box display="flex" alignItems="center">
          {navItems.map((item, index) => (
            <Box
              key={item.path}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {index > 0 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 1, borderColor: '#ccc' }}
                />
              )}
              <Button
                onClick={() => navigate(item.path)}
                sx={{
                  color: '#333',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Button>
            </Box>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
