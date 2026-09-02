import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { History, RefreshCcw, Search } from 'lucide-react';
import ImagePreviewModal from '../../components/common/ImagePreviewModal';
import InspectionCard from '../../components/inspection/InspectionCard';

export default function PetugasRiwayatPage() {
  const { history, loadHistory, loadingHistory } = useOutletContext();
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const filteredHistory = useMemo(() => {
    return history.filter((lap) => {
      const item = lap.item || lap.equipment || {};
      const matchStatus = !filterStatus || lap.status === filterStatus;
      const matchSearch =
        !searchTerm ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gedung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lap.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [history, filterStatus, searchTerm]);

  return (
    <div className="space-y-3.5">
      <ImagePreviewModal
        imageUrl={previewImage?.url}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />

      {/* Filter and Search Bar */}
      <section className="card p-3 space-y-2 bg-white border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <History size={14} className="text-gray-600" />
            Riwayat Pemeriksaan ({filteredHistory.length})
          </h2>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loadingHistory}
            className="text-gray-500 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-gray-100 transition"
            title="Segarkan Data"
          >
            <RefreshCcw size={13} className={loadingHistory ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-12 text-xs">
          <div className="relative sm:col-span-7 flex items-center">
            <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
            <input
              className="field field-with-icon text-xs h-8"
              placeholder="Cari kode, nama, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:col-span-5">
            <select
              className="field text-xs h-8 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Kondisi</option>
              <option value="baik">Kondisi Baik</option>
              <option value="perlu_perhatian">Perlu Perhatian</option>
              <option value="rusak">Kondisi Rusak</option>
            </select>
          </div>
        </div>
      </section>

      {/* History Cards List */}
      <section className="space-y-1.5">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((lap) => (
            <InspectionCard
              key={lap.id}
              lap={lap}
              onPreviewImage={setPreviewImage}
            />
          ))
        ) : (
          <div className="card p-6 text-center text-gray-400 text-xs space-y-1 bg-white border border-gray-200">
            <History size={20} className="mx-auto text-gray-300 mb-1" />
            <p className="font-medium text-gray-600">Tidak ada riwayat ditemukan.</p>
            <p className="text-[11px]">Coba ubah kata kunci atau filter status.</p>
          </div>
        )}
      </section>
    </div>
  );
}
