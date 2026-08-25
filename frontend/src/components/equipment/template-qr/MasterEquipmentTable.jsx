import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge, TypeBadge, ZoneBadge } from '../../common/Badges';

export default function MasterEquipmentTable({
  items,
  selectedIds,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  bottomPage,
  setBottomPage,
  bottomPageSize,
}) {
  const totalBottomPages = Math.ceil(items.length / bottomPageSize) || 1;
  const start = (bottomPage - 1) * bottomPageSize;
  const paginatedBottomItems = items.slice(start, start + bottomPageSize);

  return (
    <section className="card p-4 space-y-3 bg-white border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-900">
            Data Keseluruhan Equipment ({items.length} Total Master Data)
          </h2>
          <p className="text-[11px] text-gray-500">
            Klik baris atau checkbox untuk menyertakan/mengeluarkan equipment dari lembar template A4
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            Centang Semua ({items.length})
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Hapus Semua Pilihan
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
            <tr>
              <th className="px-3 py-2.5 text-center w-12">Pilih</th>
              <th className="px-3 py-2.5">Kode Item</th>
              <th className="px-3 py-2.5">Gedung & Lantai</th>
              <th className="px-3 py-2.5">Nama Equipment</th>
              <th className="px-3 py-2.5">Kategori</th>
              <th className="px-3 py-2.5">Lokasi</th>
              <th className="px-3 py-2.5">Status Master</th>
              <th className="px-3 py-2.5 text-center">Status Template</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedBottomItems.length ? (
              paginatedBottomItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => onToggleItem(item.id)}
                  >
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleItem(item.id)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-gray-900">
                      {item.kodeItem}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-gray-800 block truncate max-w-[140px]">
                        {item.gedung || '-'}
                      </span>
                      <span className="text-[11px] text-gray-500">{item.lantai || '-'}</span>
                    </td>
                    <td className="px-3 py-2 font-medium max-w-[200px] truncate" title={item.namaItem}>
                      {item.namaItem}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <ZoneBadge zone={item.zona} />
                        <TypeBadge type={item.jenis} />
                      </div>
                    </td>
                    <td
                      className="px-3 py-2 text-gray-600 max-w-[180px] truncate"
                      title={item.lokasi}
                    >
                      {item.lokasi}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge
                        tone={
                          item.status === 'aktif'
                            ? 'good'
                            : item.status === 'perbaikan'
                            ? 'warn'
                            : 'bad'
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          ✓ Masuk Template
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                  Tidak ada data equipment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2 text-xs text-gray-600">
        <span className="text-gray-500">
          Halaman <strong>{bottomPage}</strong> dari <strong>{totalBottomPages}</strong> ({items.length} total)
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={bottomPage <= 1}
            onClick={() => setBottomPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={bottomPage >= totalBottomPages}
            onClick={() => setBottomPage((p) => Math.min(totalBottomPages, p + 1))}
            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
