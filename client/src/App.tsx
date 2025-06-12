import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PolicyList from './pages/PolicyList';
import PolicyDetails from './pages/PolicyDetails';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/policylist" element={<PolicyList />} />
        <Route path="/policydetails" element={<PolicyList />} />
      </Routes>
    </Router>
  );
};

export default App;
