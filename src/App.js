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
import AdminSignalements from './ecrans/Admin/AdminSignalements';
import { ToastProvider } from './contexts/ToastContext';
import { PanierProvider } from './contexts/PanierContext';
import { ROLES, STAFF_ROLES } from './constants/roles';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }
  const role = localStorage.getItem('role');
  if (role !== ROLES.ADMIN && !allowedRoles.includes(role)) {
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
                <RoleRoute allowedRoles={STAFF_ROLES}>
                  <AdminLayout />
                </RoleRoute>
              }
            >
              <Route index element={<Navigate to="produits" replace />} />
              <Route
                path="produits"
                element={
                  <RoleRoute allowedRoles={[ROLES.GESTIONNAIRE_BOUTIQUE]}>
                    <AdminProduits />
                  </RoleRoute>
                }
              />
              <Route
                path="utilisateurs"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminUtilisateurs />
                  </RoleRoute>
                }
              />
              <Route
                path="signalements"
                element={
                  <RoleRoute allowedRoles={[ROLES.GESTIONNAIRE_BOUTIQUE]}>
                    <AdminSignalements />
                  </RoleRoute>
                }
              />
            </Route>
            <Route path="/" element={<Navigate to="/connexion" replace />} />
          </Routes>
        </BrowserRouter>
      </PanierProvider>
    </ToastProvider>
  );
}

export default App;
