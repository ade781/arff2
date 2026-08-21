import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import AduanNonAnggotaPage from './pages/publik/AduanNonAnggotaPage';
import PetugasPemeriksaanPage from './pages/petugas/PetugasPemeriksaanPage';

// Admin Layout & Subpages
import AdminLayout from './components/layout/AdminLayout';
import AdminRingkasanPage from './pages/admin/AdminRingkasanPage';
import AdminEquipmentPage from './pages/admin/AdminEquipmentPage';
import AdminTemplateQrPage from './pages/admin/AdminTemplateQrPage';
import AdminMonitoringPage from './pages/admin/AdminMonitoringPage';

function AdminRoute({ children }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (session.user?.role !== 'admin') {
    return <Navigate to="/petugas" replace />;
  }
  return children;
}

function PetugasRoute({ children }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RootRedirect() {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (session.user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/petugas" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth & Publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/aduan" element={<AduanNonAnggotaPage />} />

        {/* Petugas Lapangan */}
        <Route
          path="/petugas"
          element={
            <PetugasRoute>
              <PetugasPemeriksaanPage />
            </PetugasRoute>
          }
        />

        {/* Admin Modular Subpages */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminRingkasanPage />} />
          <Route path="ringkasan" element={<Navigate to="/admin" replace />} />
          <Route path="items" element={<AdminEquipmentPage />} />
          <Route path="template-qr" element={<AdminTemplateQrPage />} />
          <Route path="monitoring" element={<AdminMonitoringPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
