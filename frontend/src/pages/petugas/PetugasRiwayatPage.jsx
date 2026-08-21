import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Clock,
  History,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  Search,
} from 'lucide-react';
import ImagePreviewModal from '../../components/common/ImagePreviewModal';
import StatusBadge from '../../components/common/StatusBadge';
import TypeBadge from '../../components/common/TypeBadge';
import ZoneBadge from '../../components/common/ZoneBadge';

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
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lap.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [history, filterStatus, searchTerm]);

  return (
    <div className="space-y-4">
      <ImagePreviewModal
        imageUrl={previewImage?.url}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />

      <section className="card p-3 space-y-2.5 bg-white border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
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
            <RefreshCcw size={13} className={loadingHistory ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-12 text-xs">
          <div className="relative sm:col-span-7 flex items-center">
            <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
            <input
              className="field field-with-icon text-xs h-8"
              placeholder="Cari kode, nama, lokasi, catatan..."
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

      <section className="space-y-2">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((lap) => {
            const item = lap.item || lap.equipment || {};
            const tone =
              lap.status === 'baik' ? 'good' : lap.status === 'rusak' ? 'bad' : 'warn';

            return (
              <div
                key={lap.id}
                className="card p-3 text-xs space-y-2 bg-white border border-gray-200 shadow-xs"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span className="font-mono text-sm">
                        {item.kodeItem || item.kodeEquipment || `Item #${lap.idItem}`}
                      </span>
                      {item.zona ? <ZoneBadge zone={item.zona} /> : null}
                      {item.jenis ? <TypeBadge type={item.jenis} /> : null}
                    </div>
                    <p className="text-xs text-gray-700 font-medium mt-0.5">
                      {item.namaItem || item.nama || 'Equipment ARFF'}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.lokasi || '-'}</p>
                  </div>

                  <StatusBadge tone={tone}>{lap.status}</StatusBadge>
                </div>

                {lap.keterangan && (
                  <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="font-semibold text-gray-600">Catatan Temuan:</span>{' '}
                    {lap.keterangan}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1.5 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(lap.createdAt || lap.waktuPemeriksaan).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>

                  {lap.foto ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          url: lap.foto,
                          title: `Foto Bukti ${item.kodeItem || ''}`,
                        })
                      }
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                    >
                      <ImageIcon size={12} /> Lihat Foto
                    </button>
                  ) : (
                    <span className="text-gray-400">Tanpa Foto</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center text-gray-400 text-xs space-y-1 bg-white border border-gray-200">
            <History size={24} className="mx-auto text-gray-300 mb-1" />
            <p className="font-semibold text-gray-600">Tidak ada riwayat ditemukan.</p>
            <p className="text-[11px]">Coba ubah kata kunci pencarian atau filter status.</p>
          </div>
        )}
      </section>
    </div>
  );
}
