import React, { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardCheck,
  FileSpreadsheet,
  History,
  MessageSquareWarning,
  Plus,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import ItemTable from '../../components/equipment/ItemTable';
import QrModal from '../../components/equipment/QrModal';
import { itemService } from '../../api/itemService';
import { getErrorMessage } from '../../api/axiosInstance';

export default function AdminRingkasanPage() {
  const {
    items,
    laporanAnggota,
    laporanNonAnggota,
    loadingItems,
    loadItems,
    setNotice,
  } = useOutletContext();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);

  const summary = useMemo(() => {
    const activeCount = items.filter((it) => it.status === 'aktif').length;
    const problemAnggota = laporanAnggota.filter((l) => l.status === 'rusak' || l.status === 'perlu_perhatian').length;
    const totalAduan = laporanNonAnggota.length;
    const attentionCount = problemAnggota + totalAduan;

    return {
      totalItems: items.length,
      activeItems: activeCount,
      totalLaporan: laporanAnggota.length,
      totalAduan,
      needsAttention: attentionCount,
    };
  }, [items, laporanAnggota, laporanNonAnggota]);

  async function openQr(item) {
    try {
      const data = await itemService.getItemQrCode(item.id);
      setQrData(data);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    }
  }

  async function deleteItem(item) {
    const confirmed = window.confirm(`Hapus equipment ${item.kodeItem || item.kodeEquipment}?`);
    if (!confirmed) return;

    try {
      await itemService.deleteItem(item.id);
      setNotice({ type: 'success', message: 'Equipment berhasil dihapus' });
      await loadItems();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-5">
      {/* Modal Single QR */}
      <QrModal qrData={qrData} onClose={() => setQrData(null)} />

      {/* Summary Stat Cards */}
      <section className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Master Equipment */}
        <div className="card p-4 bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Equipment
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary.totalItems}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {summary.activeItems} Unit Siap / Aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Boxes size={22} />
          </div>
        </div>

        {/* Card 2: Laporan Pemeriksaan Petugas */}
        <div className="card p-4 bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Laporan Anggota
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary.totalLaporan}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Inspeksi lapangan tercatat
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ClipboardCheck size={22} />
          </div>
        </div>

        {/* Card 3: Aduan Non-Anggota */}
        <div className="card p-4 bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Aduan Publik
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary.totalAduan}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Laporan temuan non-anggota
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <MessageSquareWarning size={22} />
          </div>
        </div>

        {/* Card 4: Perlu Perhatian */}
        <div className="card p-4 bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Perlu Perhatian
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {summary.needsAttention}
            </p>
            <p className="text-[11px] text-amber-600/90 font-medium mt-0.5">
              Temuan & butuh tindakan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <ShieldAlert size={22} />
          </div>
        </div>
      </section>

      {/* Quick Action Hub */}
      <section className="card p-4 bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Pintasan Menu Cepat
          </h2>
          <span className="text-[11px] text-slate-400">Aksi Operasional Admin ARFF</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/items')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 text-left transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Plus size={16} />
            </div>
            <p className="text-xs font-bold text-slate-900">Kelola Equipment</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tambah / Edit Master APAR & Hydrant</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/template-qr')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 text-left transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <QrCode size={16} />
            </div>
            <p className="text-xs font-bold text-slate-900">Cetak Stiker QR</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Template Cetak Format Lembar A4</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/rekap-laporan')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 text-left transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <FileSpreadsheet size={16} />
            </div>
            <p className="text-xs font-bold text-slate-900">Rekap Laporan Zona</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Format Standar Resmi & Export Excel</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/monitoring')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 text-left transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <History size={16} />
            </div>
            <p className="text-xs font-bold text-slate-900">Log Monitoring</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Riwayat Inspeksi & Aduan Masuk</p>
          </button>
        </div>
      </section>

      {/* Snapshot Master Equipment Preview */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Master Equipment Terdaftar ({items.length})
            </h2>
            <p className="text-[11px] text-slate-500">Tampilan ringkas titik fasilitas terkini</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/items')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Master Data Penuh</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <ItemTable
          items={items}
          onEdit={() => navigate('/admin/items')}
          onDelete={deleteItem}
          onQr={openQr}
          loading={loadingItems}
          onAddNew={() => navigate('/admin/items')}
          onBatchQr={() => navigate('/admin/template-qr')}
        />
      </section>
    </div>
  );
}
