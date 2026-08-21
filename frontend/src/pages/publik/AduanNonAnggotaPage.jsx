import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Loader2,
  MessageSquareWarning,
  QrCode,
  Search,
  Send,
} from 'lucide-react';
import { itemService } from '../../api/itemService';
import { laporanNonAnggotaService } from '../../api/laporanNonAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import ItemSummary from '../../components/equipment/ItemSummary';

export default function AduanNonAnggotaPage({ onBackToLogin }) {
  const navigate = useNavigate();
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
      setNotice({ type: 'error', message: 'Kode QR / nomor item wajib diisi' });
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
        message: 'Laporan aduan kerusakan berhasil dikirimkan ke Tim ARFF YIA. Terima kasih atas partisipasi Anda.',
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
    <main className="min-h-screen bg-slate-100/70 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-7 space-y-4">
        {/* Header Form Aduan */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <MessageSquareWarning size={18} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Form Aduan Fasilitas ARFF
              </h1>
              <p className="text-[11px] text-slate-500">
                Bandara Internasional Yogyakarta (YIA)
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg px-2.5 py-1.5 cursor-pointer transition"
            type="button"
            onClick={() => {
              if (onBackToLogin) onBackToLogin();
              else navigate('/login');
            }}
          >
            <ArrowLeft size={13} />
            <span>Login Petugas</span>
          </button>
        </div>

        {/* Notice Alert */}
        {notice ? (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs animate-in fade-in duration-150 ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="shrink-0 mt-0.5" size={15} />
            ) : (
              <AlertCircle className="shrink-0 mt-0.5" size={15} />
            )}
            <span className="leading-relaxed">{notice.message}</span>
          </div>
        ) : null}

        {/* Form Isi Aduan */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama / Instansi Pelapor <span className="text-red-500">*</span>
              </label>
              <input
                className="field text-xs h-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: Budi (Staf Terminal)"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. HP / Kontak (Opsional)
              </label>
              <input
                className="field text-xs h-9"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="0812xxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor / Kode Equipment QR <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <QrCode className="absolute left-2.5 text-slate-400 pointer-events-none" size={14} />
                <input
                  className="field field-with-icon text-xs h-9 font-mono"
                  value={kodeQr}
                  placeholder="Ketik kode (misal: A.001, B.045)..."
                  onChange={(e) => setKodeQr(e.target.value)}
                  required
                />
              </div>

              <button
                className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-xs font-semibold text-white cursor-pointer shrink-0 transition flex items-center gap-1.5"
                type="button"
                onClick={() => lookupItem()}
                disabled={loadingLookup}
              >
                {loadingLookup ? <Loader2 className="animate-spin" size={13} /> : <Search size={13} />}
                <span>Cari</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Kode tertera pada stiker QR APAR / Kotak Hydrant (contoh: A.001, C.012).
            </p>
          </div>

          {/* Equipment Preview Summary */}
          <ItemSummary item={itemData} />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Temuan / Kerusakan <span className="text-red-500">*</span>
            </label>
            <textarea
              className="field-textarea min-h-20 text-xs"
              value={keterangan}
              placeholder="Jelaskan kendala, misalnya: tekanan jarum di area merah, segel putus, pintu box macet..."
              onChange={(e) => setKeterangan(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            type="submit"
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>Mengirimkan Aduan...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Kirimkan Aduan ke ARFF</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
