import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px - 53px)',
        overflowY: 'auto',
        background: 'linear-gradient(135deg,rgb(244, 248, 241),rgb(248, 243, 243))',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Welcome to Policy Tracker
        </Typography>
        <Typography variant="h5" color="text.secondary" maxWidth="md" gutterBottom>
          Your gateway to understanding, analyzing, and engaging with real-world policy landscapes.
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth="md">
          Whether you're a student, policymaker, or researcher, Policy Tracker equips you with the tools
          to explore national and global policy trends using data-driven methods.
        </Typography>
      </Box>

      {/* Methodology Section */}
      <Box
        sx={{
          px: 4,
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" mb={2}>
          Methodology
        </Typography>
        <Typography variant="body1" maxWidth="md" margin="auto">
          We combine verified government data, predictive models, and sectoral analysis to evaluate policy effectiveness.
          Our approach ensures transparency, replicability, and actionable insight.
        </Typography>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          px: 4,
          py: 6,
        }}
      >
        <Typography variant="h4" textAlign="center" mb={4}>
          Key Features
        </Typography>
        <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
          {[
            {
              title: 'Live Policy Stats',
              desc: 'Get real-time metrics and updates on policy outcomes.',
            },
            {
              title: 'Filter & Compare',
              desc: 'Easily filter, search, and compare policies by sector or impact.',
            },
            {
              title: 'Data-Driven Insights',
              desc: 'Understand policy implications through visual data analysis.',
            },
          ].map((feature, idx) => (
            <Paper
              key={idx}
              elevation={3}
              sx={{
                p: 3,
                width: 260,
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.desc}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;
