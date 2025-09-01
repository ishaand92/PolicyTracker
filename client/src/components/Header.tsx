import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
        {/* Brand with Icon */}
        <Box display="flex" alignItems="center" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          <img
            src="/icon.png"
            alt="Policy Tracker Icon"
            style={{ width: 28, height: 28, marginRight: 8 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Policy Tracker
          </Typography>
        </Box>

        {/* Navigation */}
        <Box display="flex" alignItems="center">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
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
                    color: isActive ? '#0C134F' : '#333',
                    textTransform: 'none',
                    fontWeight: isActive ? 700 : 500,
                    borderBottom: isActive ? '2px solid #0C134F' : 'none',
                    borderRadius: 0,
                  }}
                >
                  {item.label}
                </Button>
              </Box>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
