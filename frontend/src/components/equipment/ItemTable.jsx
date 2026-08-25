import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  Printer,
  QrCode,
  Search,
  Trash2,
} from 'lucide-react';
import { StatusBadge, TypeBadge, ZoneBadge } from '../common/Badges';
import { ZONES, ITEM_TYPES } from '../../constants/itemConstants';

export default function ItemTable({
  items = [],
  onEdit,
  onDelete,
  onQr,
  loading,
  onAddNew,
  onBatchQr,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZona, setFilterZona] = useState('');
  const [filterGedung, setFilterGedung] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const availableGedungList = useMemo(() => {
    if (!filterZona) return [];
    const set = new Set();
    items
      .filter((item) => String(item.zona) === String(filterZona))
      .forEach((item) => {
        if (item.gedung) set.add(item.gedung);
      });
    return Array.from(set).sort();
  }, [items, filterZona]);

  function handleZonaChange(val) {
    setFilterZona(val);
    setFilterGedung('');
    setCurrentPage(1);
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchZona = !filterZona || String(item.zona) === String(filterZona);
      const matchGedung = !filterGedung || item.gedung === filterGedung;
      const matchJenis = !filterJenis || item.jenis === filterJenis;
      const matchSearch =
        !searchTerm ||
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gedung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipeMedia?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchZona && matchGedung && matchJenis && matchSearch;
    });
  }, [items, filterZona, filterGedung, filterJenis, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <section className="card p-5 space-y-4 bg-white border border-gray-200 shadow-xs">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 tracking-wide">
            Master Data Equipment ({filteredItems.length} Total)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar seluruh APAR & Hydrant terdaftar di Zona 1–4 ARFF Bandara YIA
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin text-gray-400" size={16} /> : null}

          {onBatchQr ? (
            <button
              className="h-8.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs transition"
              type="button"
              onClick={onBatchQr}
            >
              <Printer size={13} />
              <span>Cetak Lembar QR</span>
            </button>
          ) : null}

          {onAddNew ? (
            <button
              className="h-8.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-sm transition"
              type="button"
              onClick={onAddNew}
            >
              <Plus size={14} />
              <span>Tambah Equipment</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-12">

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              1. Pilih Zona <span className="text-blue-600">*</span>
            </label>
            <select
              className="field text-xs h-9 cursor-pointer w-full font-semibold border-blue-300 focus:border-blue-500"
              value={filterZona}
              onChange={(e) => handleZonaChange(e.target.value)}
            >
              <option value="">-- Semua Zona --</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  Zona {z}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              2. Pilih Gedung / Area
            </label>
            <select
              className={`field text-xs h-9 w-full ${
                !filterZona
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'cursor-pointer bg-white'
              }`}
              value={filterGedung}
              disabled={!filterZona}
              onChange={(e) => {
                setFilterGedung(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">
                {!filterZona ? '-- Pilih Zona Terlebih Dahulu --' : '-- Semua Gedung di Zona ' + filterZona + ' --'}
              </option>
              {availableGedungList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              3. Jenis
            </label>
            <select
              className="field text-xs h-9 cursor-pointer w-full"
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Semua Jenis</option>
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              4. Cari Kode / Lokasi
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={14} />
              <input
                className="field field-with-icon text-xs h-9 w-full"
                placeholder="Cari kode, nama, lokasi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {(filterZona || filterGedung || filterJenis || searchTerm) && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
            <span>
              Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{items.length}</strong> equipment
              {filterZona ? ` (Zona ${filterZona}${filterGedung ? ` - ${filterGedung}` : ''})` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setFilterZona('');
                setFilterGedung('');
                setFilterJenis('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Kode Item</th>
              <th className="px-4 py-3 whitespace-nowrap">Gedung & Lantai</th>
              <th className="px-4 py-3">Nama & Titik Lokasi</th>
              <th className="px-4 py-3 whitespace-nowrap">Spesifikasi</th>
              <th className="px-4 py-3 whitespace-nowrap">Kategori</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedItems.length ? (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-4 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                    {item.kodeItem}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-gray-800 block truncate max-w-[200px]" title={item.gedung}>
                      {item.gedung || '-'}
                    </span>
                    <span className="text-[11px] text-gray-500">{item.lantai || '-'}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-gray-900 truncate max-w-[320px]" title={item.namaItem}>
                      {item.namaItem}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate max-w-[320px]" title={item.lokasi}>
                      {item.lokasi}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {item.jenis === 'apar' ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 text-[10px] font-bold">
                          {item.tipeMedia || 'DCP'}
                        </span>
                        <span className="text-[11px]">{item.ukuran || '-'}</span>
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 text-[10px] font-bold">
                        {item.tipeHydrant || 'IHB'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <ZoneBadge zone={item.zona} />
                      <TypeBadge type={item.jenis} />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
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
                  <td className="px-4 py-2.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => onQr(item)}
                        title="Lihat & Cetak QR"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => onEdit(item)}
                        title="Edit Data"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="icon-button-danger"
                        type="button"
                        onClick={() => onDelete(item)}
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-xs">
                  Tidak ada equipment yang cocok dengan filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            className="border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white cursor-pointer"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>per halaman</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 mr-2">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({filteredItems.length} data)
          </span>

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
