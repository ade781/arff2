import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { itemService } from '../../api/itemService';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';
import { laporanNonAnggotaService } from '../../api/laporanNonAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import AdminSidebar from './AdminSidebar';
import NoticeAlert from '../common/NoticeAlert';

export default function AdminLayout() {
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [laporanAnggota, setLaporanAnggota] = useState([]);
  const [laporanNonAnggota, setLaporanNonAnggota] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadItems() {
    setLoadingItems(true);
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadMonitoring(filters = {}) {
    setLoadingMonitoring(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const [resAnggota, resNonAnggota] = await Promise.allSettled([
        laporanAnggotaService.getAllLaporan(params),
        laporanNonAnggotaService.getAllLaporan(),
      ]);

      if (resAnggota.status === 'fulfilled') {
        setLaporanAnggota(resAnggota.value);
      }
      if (resNonAnggota.status === 'fulfilled') {
        setLaporanNonAnggota(resNonAnggota.value);
      }
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingMonitoring(false);
    }
  }

  useEffect(() => {
    loadItems();
    loadMonitoring();
  }, []);

  // Judul halaman dinamis berdasarkan URL path
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin/items')) return 'Master Data Equipment';
    if (path.includes('/admin/template-qr')) return 'Template Stiker QR (A4)';
    if (path.includes('/admin/rekap-laporan')) return 'Rekap Laporan Zona (Format ARFF)';
    if (path.includes('/admin/monitoring')) return 'Monitoring & Aduan';
    return 'Ringkasan Sistem';
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col lg:flex-row">
      <AdminSidebar
        session={session}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        itemsCount={items.length}
        laporanCount={laporanAnggota.length}
        aduanCount={laporanNonAnggota.length}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 no-print">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 border rounded text-gray-600"
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu size={16} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-none">{pageTitle}</h2>
              <span className="text-[11px] text-gray-500">Admin ARFF YIA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              type="button"
              onClick={() => {
                loadItems();
                loadMonitoring();
              }}
              title="Refresh Data"
            >
              <RefreshCcw size={13} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 max-w-6xl w-full mx-auto space-y-4">
          <NoticeAlert notice={notice} />
          <Outlet
            context={{
              items,
              laporanAnggota,
              laporanNonAnggota,
              loadItems,
              loadMonitoring,
              notice,
              setNotice,
              loadingItems,
              loadingMonitoring,
            }}
          />
        </main>
      </div>
    </div>
  );
}
