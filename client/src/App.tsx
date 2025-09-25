import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

import Home from './pages/Home';
import PolicyList from './pages/PolicyList';
import PolicyDetails from './pages/PolicyDetails';
import PolicyNews from './pages/PolicyNews';
import Methodology from './pages/Methodology';
import Header from './components/Header';
import Footer from './components/Footer';

const Layout: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#f9f9f9',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Header />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
    <Footer />
  </Box>
);

const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        {/* All pages use the same layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="list" element={<PolicyList />} />
          <Route path="policies/:id" element={<PolicyDetails />} />
          <Route path="news" element={<PolicyNews />} />
          <Route path="methodology" element={<Methodology />} />
          {/* 404 fallback */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
