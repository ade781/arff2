import React, { useEffect, useState } from 'react';
import { Loader2, LogOut, RefreshCcw, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { itemService } from '../../api/itemService';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import ItemSummary from '../../components/equipment/ItemSummary';
import FormPemeriksaanAnggota from '../../components/inspection/FormPemeriksaanAnggota';
import NoticeAlert from '../../components/common/NoticeAlert';
import StatusBadge from '../../components/common/StatusBadge';

export default function PetugasPemeriksaanPage() {
  const { user, logout } = useAuth();
  const [kodeQr, setKodeQr] = useState('');
  const [itemData, setItemData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await laporanAnggotaService.getAllLaporan({ limit: 6 });
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

  async function lookupItem(nextKodeQr = kodeQr) {
    const cleanKode = nextKodeQr.trim();
    if (!cleanKode) {
      setNotice({ type: 'error', message: 'Kode QR wajib diisi' });
      return;
    }

    setLoadingLookup(true);
    setNotice(null);

    try {
      const data = await itemService.getItemByQr(cleanKode);
      setItemData(data);
      setKodeQr(cleanKode);
    } catch (err) {
      setItemData(null);
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingLookup(false);
    }
  }

  async function submitPemeriksaan(payload) {
    setLoadingSubmit(true);
    setNotice(null);

    try {
      await laporanAnggotaService.submitLaporan({
        kodeQr,
        idItem: itemData?.item?.id || itemData?.equipment?.id,
        ...payload,
      });

      setNotice({ type: 'success', message: 'Laporan pemeriksaan berhasil disimpan' });
      setItemData(null);
      setKodeQr('');
      await loadHistory();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Pemeriksaan Lapangan ARFF</h1>
            <p className="text-xs text-gray-500">Petugas: {user?.nama || user?.username}</p>
          </div>
          <button
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 border border-gray-300 rounded px-2.5 py-1.5 cursor-pointer"
            type="button"
            onClick={logout}
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <NoticeAlert notice={notice} />

          <section className="card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Input Kode Equipment / QR</h2>

            <div className="flex gap-2">
              <input
                className="field text-xs"
                value={kodeQr}
                placeholder="Kode equipment (contoh: ARFF-YIA:APAR-A-001 atau APAR-A-001)"
                onChange={(e) => setKodeQr(e.target.value)}
              />
              <button
                className="h-9 px-3 rounded bg-gray-800 text-xs font-medium text-white hover:bg-gray-900 cursor-pointer shrink-0 disabled:opacity-50"
                type="button"
                onClick={() => lookupItem()}
                disabled={loadingLookup}
              >
                {loadingLookup ? <Loader2 className="animate-spin" size={13} /> : <Search size={13} />}
              </button>
            </div>
          </section>

          <ItemSummary item={itemData?.item || itemData?.equipment} />

          {itemData ? (
            <FormPemeriksaanAnggota
              checklist={itemData.checklist || []}
              onSubmit={submitPemeriksaan}
              loading={loadingSubmit}
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <h2 className="text-xs font-semibold uppercase text-gray-700">Riwayat Terakhir</h2>
              <button className="text-gray-500 hover:text-gray-800 cursor-pointer" type="button" onClick={loadHistory}>
                {loadingHistory ? <Loader2 className="animate-spin" size={12} /> : <RefreshCcw size={12} />}
              </button>
            </div>

            <div className="space-y-2">
              {history.length ? history.map((lap) => {
                const tone = lap.status === 'baik' ? 'good' : lap.status === 'rusak' ? 'bad' : 'warn';
                return (
                  <div key={lap.id} className="rounded border border-gray-200 p-2.5 text-xs">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="font-medium text-gray-900">
                          {lap.item?.namaItem || lap.equipment?.nama || `Pemeriksaan #${lap.id}`}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(lap.createdAt || lap.waktuPemeriksaan).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <StatusBadge tone={tone}>{lap.status}</StatusBadge>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-center text-xs text-gray-400 py-3">Belum ada riwayat.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
