import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import AduanNonAnggotaPage from './pages/publik/AduanNonAnggotaPage';
import PetugasPemeriksaanPage from './pages/petugas/PetugasPemeriksaanPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  const { session } = useAuth();
  const [publicReportMode, setPublicReportMode] = useState(false);

  if (publicReportMode) {
    return <AduanNonAnggotaPage onBackToLogin={() => setPublicReportMode(false)} />;
  }

  if (!session) {
    return (
      <LoginPage
        onOpenPublicReport={() => setPublicReportMode(true)}
      />
    );
  }

  if (session.user?.role === 'admin') {
    return <AdminDashboardPage />;
  }

  return <PetugasPemeriksaanPage />;
}
