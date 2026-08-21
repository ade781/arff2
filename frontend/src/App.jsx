import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import AduanNonAnggotaPage from './pages/publik/AduanNonAnggotaPage';

import PetugasLayout from './components/layout/PetugasLayout';
import PetugasScanPage from './pages/petugas/PetugasScanPage';
import PetugasRiwayatPage from './pages/petugas/PetugasRiwayatPage';

import AdminLayout from './components/layout/AdminLayout';
import AdminRingkasanPage from './pages/admin/AdminRingkasanPage';
import AdminEquipmentPage from './pages/admin/AdminEquipmentPage';
import AdminTemplateQrPage from './pages/admin/AdminTemplateQrPage';
import AdminRekapLaporanPage from './pages/admin/AdminRekapLaporanPage';
import AdminMonitoringPage from './pages/admin/AdminMonitoringPage';
import AdminPenggunaPage from './pages/admin/AdminPenggunaPage';

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

        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/aduan" element={<AduanNonAnggotaPage />} />

        <Route
          path="/petugas"
          element={
            <PetugasRoute>
              <PetugasLayout />
            </PetugasRoute>
          }
        >
          <Route index element={<PetugasScanPage />} />
          <Route path="riwayat" element={<PetugasRiwayatPage />} />
        </Route>

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
          <Route path="rekap-laporan" element={<AdminRekapLaporanPage />} />
          <Route path="monitoring" element={<AdminMonitoringPage />} />
          <Route path="pengguna" element={<AdminPenggunaPage />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
