import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react';
import { itemService } from '../../api/itemService';
import { laporanNonAnggotaService } from '../../api/laporanNonAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import ItemSummary from '../../components/equipment/ItemSummary';

export default function AduanNonAnggotaPage({ onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [kontak, setKontak] = useState('');
  const [kodeQr, setKodeQr] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [itemData, setItemData] = useState(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [notice, setNotice] = useState(null);

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
      setItemData(data.item || data.equipment);
      setKodeQr(cleanKode);
    } catch (err) {
      setItemData(null);
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingLookup(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoadingSubmit(true);
    setNotice(null);

    try {
      await laporanNonAnggotaService.submitAduan({
        username,
        kontak,
        kodeQr,
        idItem: itemData?.id,
        keterangan,
      });

      setNotice({
        type: 'success',
        message: 'Laporan aduan berhasil dikirim. Terima kasih.',
      });
      setUsername('');
      setKontak('');
      setKodeQr('');
      setKeterangan('');
      setItemData(null);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded border border-gray-200 p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <h1 className="text-base font-bold text-gray-900">Form Aduan Fasilitas</h1>
            <p className="text-xs text-gray-500">ARFF YIA</p>
          </div>
          <button
            className="text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-2.5 py-1 cursor-pointer"
            type="button"
            onClick={onBackToLogin}
          >
            Kembali ke Login
          </button>
        </div>

        {notice ? (
          <div
            className={`flex items-start gap-2 rounded border p-2.5 text-xs mb-4 ${
              notice.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
            ) : (
              <AlertCircle className="shrink-0 mt-0.5" size={14} />
            )}
            <span>{notice.message}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nama / Instansi <span className="text-red-600">*</span>
              </label>
              <input
                className="field text-xs"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: Budi / Staf Terminal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                No. HP / Kontak (Opsional)
              </label>
              <input
                className="field text-xs"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="0812xxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Kode Equipment / QR <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2">
              <input
                className="field text-xs"
                value={kodeQr}
                placeholder="Contoh: ARFF-YIA:APAR-A-001"
                onChange={(e) => setKodeQr(e.target.value)}
                required
              />
              <button
                className="h-9 px-3 rounded bg-gray-800 text-xs font-medium text-white hover:bg-gray-900 cursor-pointer shrink-0"
                type="button"
                onClick={() => lookupItem()}
                disabled={loadingLookup}
              >
                {loadingLookup ? <Loader2 className="animate-spin" size={13} /> : <Search size={13} />}
              </button>
            </div>
          </div>

          <ItemSummary item={itemData} />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Keterangan Kendala / Kerusakan <span className="text-red-600">*</span>
            </label>
            <textarea
              className="field-textarea min-h-20 text-xs"
              value={keterangan}
              placeholder="Jelaskan kondisi atau kendala fasilitas..."
              onChange={(e) => setKeterangan(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full h-9 rounded bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 mt-2"
            type="submit"
            disabled={loadingSubmit}
          >
            {loadingSubmit ? <Loader2 className="animate-spin inline mr-1" size={14} /> : null}
            Kirim Aduan
          </button>
        </form>
      </div>
    </main>
  );
}
