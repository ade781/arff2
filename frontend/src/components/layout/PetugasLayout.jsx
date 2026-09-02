import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { History, LogOut, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import NoticeAlert from '../common/NoticeAlert';

export default function PetugasLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await laporanAnggotaService.getAllLaporan({ limit: 50 });
      setHistory(data);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function handleLogout() {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sesi petugas?')) {
      logout();
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center">
      {/* Simple Clean Header */}
      <header className="w-full max-w-md bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-900 uppercase">ARFF YIA</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium">
                Petugas Lapangan
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {user?.nama || user?.username} {user?.regu ? `(${user.regu})` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 border border-gray-200 rounded px-2.5 py-1 cursor-pointer hover:bg-gray-50 transition"
          >
            <LogOut size={12} />
            <span>Keluar</span>
          </button>
        </div>

        {/* Clean Segmented Nav */}
        <nav className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 mt-2.5 text-xs">
          <NavLink
            to="/petugas"
            end
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition ${
                isActive
                  ? 'bg-white text-gray-900 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <QrCode size={14} />
            <span>Scan QR Fisik</span>
          </NavLink>

          <NavLink
            to="/petugas/riwayat"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition ${
                isActive
                  ? 'bg-white text-gray-900 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <History size={14} />
            <span>Riwayat ({history.length})</span>
          </NavLink>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md p-4 space-y-3.5 flex-1 pb-10">
        <NoticeAlert notice={notice} />
        <Outlet
          context={{
            history,
            loadHistory,
            loadingHistory,
            notice,
            setNotice,
          }}
        />
      </main>
    </div>
  );
}
