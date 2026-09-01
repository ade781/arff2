import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AduanNonAnggotaPage = lazy(() => import('./pages/publik/AduanNonAnggotaPage'));

const PetugasLayout = lazy(() => import('./components/layout/PetugasLayout'));
const PetugasScanPage = lazy(() => import('./pages/petugas/PetugasScanPage'));
const PetugasRiwayatPage = lazy(() => import('./pages/petugas/PetugasRiwayatPage'));

const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminRingkasanPage = lazy(() => import('./pages/admin/AdminRingkasanPage'));
const AdminEquipmentPage = lazy(() => import('./pages/admin/AdminEquipmentPage'));
const AdminTemplateQrPage = lazy(() => import('./pages/admin/AdminTemplateQrPage'));
const AdminRekapLaporanPage = lazy(() => import('./pages/admin/AdminRekapLaporanPage'));
const AdminMonitoringPage = lazy(() => import('./pages/admin/AdminMonitoringPage'));
const AdminPenggunaPage = lazy(() => import('./pages/admin/AdminPenggunaPage'));

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-slate-400 space-y-2">
      <Loader2 className="animate-spin text-blue-600" size={24} />
      <span className="text-xs font-medium text-slate-500">Memuat halaman...</span>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
