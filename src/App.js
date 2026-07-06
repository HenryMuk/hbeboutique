import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Connexion from './ecrans/Authentification/Connexion';
import OTP from './ecrans/Authentification/OTP';
import Inscription from './ecrans/Authentification/Inscription';
import Accueil from './ecrans/Boutique/Accueil';
import DetailProduit from './ecrans/Boutique/DetailProduit';
import Panier from './ecrans/Boutique/Panier';
import AdminLayout from './ecrans/Admin/AdminLayout';
import AdminProduits from './ecrans/Admin/AdminProduits';
import AdminUtilisateurs from './ecrans/Admin/AdminUtilisateurs';
import { ToastProvider } from './contexts/ToastContext';
import { PanierProvider } from './contexts/PanierContext';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  if (localStorage.getItem('role') !== 'admin') {
    return <Navigate to="/accueil" replace />;
  }
  return children;
};

function App() {
  return (
    <ToastProvider>
      <PanierProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/otp" element={<OTP />} />
            <Route
              path="/accueil"
              element={
                <ProtectedRoute>
                  <Accueil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produit/:id"
              element={
                <ProtectedRoute>
                  <DetailProduit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panier"
              element={
                <ProtectedRoute>
                  <Panier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="produits" element={<AdminProduits />} />
              <Route path="utilisateurs" element={<AdminUtilisateurs />} />
            </Route>
            <Route path="/" element={<Navigate to="/connexion" replace />} />
          </Routes>
        </BrowserRouter>
      </PanierProvider>
    </ToastProvider>
  );
}

export default App;
