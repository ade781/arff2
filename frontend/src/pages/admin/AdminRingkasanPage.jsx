import React, { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, History } from 'lucide-react';
import ItemTable from '../../components/equipment/ItemTable';
import QrModal from '../../components/equipment/QrModal';
import { itemService } from '../../api/itemService';
import { getErrorMessage } from '../../api/axiosInstance';

export default function AdminRingkasanPage() {
  const { items, laporanAnggota, laporanNonAnggota, loadingItems, loadItems, setNotice } =
    useOutletContext();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);

  const summary = useMemo(() => {
    const activeCount = items.filter((it) => it.status === 'aktif').length;
    const attentionCount =
      laporanAnggota.filter((l) => l.status !== 'baik').length + laporanNonAnggota.length;

    return {
      totalItems: items.length,
      activeItems: activeCount,
      totalLaporan: laporanAnggota.length,
      totalAduan: laporanNonAnggota.length,
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
    <div className="space-y-4">
      <QrModal qrData={qrData} onClose={() => setQrData(null)} />

      {/* Summary Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-3">
          <p className="text-xs text-gray-500 font-medium">Total Equipment</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{summary.totalItems}</p>
        </div>

        <div className="card p-3">
          <p className="text-xs text-gray-500 font-medium">Laporan Anggota</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{summary.totalLaporan}</p>
        </div>

        <div className="card p-3">
          <p className="text-xs text-gray-500 font-medium">Aduan Non-Anggota</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{summary.totalAduan}</p>
        </div>

        <div className="card p-3">
          <p className="text-xs text-gray-500 font-medium">Perlu Perhatian</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{summary.needsAttention}</p>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="h-8 inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-sm"
          type="button"
          onClick={() => navigate('/admin/items')}
        >
          <Plus size={13} /> Tambah Equipment
        </button>
        <button
          className="h-8 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
          type="button"
          onClick={() => navigate('/admin/monitoring')}
        >
          <History size={13} /> Lihat Log Monitoring
        </button>
      </div>

      {/* Equipment Terbaru */}
      <div>
        <h3 className="text-xs font-semibold uppercase text-gray-700 mb-2">Equipment Terbaru</h3>
        <ItemTable
          items={items.slice(0, 5)}
          onEdit={() => navigate('/admin/items')}
          onDelete={deleteItem}
          onQr={openQr}
          loading={loadingItems}
        />
      </div>
    </div>
  );
}
