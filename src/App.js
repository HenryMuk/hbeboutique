import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Connexion from './ecrans/Authentification/Connexion';
import OTP from './ecrans/Authentification/OTP';
import Deconnexion from './ecrans/Authentification/Deconnexion';
import Inscription from './ecrans/Authentification/Inscription';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/otp" element={<OTP />} />
        <Route
          path="/deconnexion"
          element={
            <ProtectedRoute>
              <Deconnexion />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/connexion" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;