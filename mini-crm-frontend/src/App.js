// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SegmentBuilder from './components/SegmentBuilder';
import CampaignsPage from './components/CampaignsPage';
import Login from './components/Login';
import Register from './components/Register';
import { AuthContext } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const PrivateRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" />;
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute element={<SegmentBuilder />} />} />
          <Route path="/campaigns" element={<PrivateRoute element={<CampaignsPage />} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
