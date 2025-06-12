import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

import Home from './pages/Home';
import PolicyList from './pages/PolicyList';
import PolicyDetails from './pages/PolicyDetails';
import PolicyNews from './pages/PolicyNews';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <Router>
      {/* Reset default margins/paddings */}
      <CssBaseline />

      {/* App layout container */}
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<PolicyList />} />
            <Route path="/policydetails" element={<PolicyDetails />} />
            <Route path="/news" element={<PolicyNews />} />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  );
};

export default App;
