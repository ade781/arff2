import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Printer,
  QrCode as QrIcon,
  Search,
  Square,
  XCircle,
} from 'lucide-react';
import { ZONES, ITEM_TYPES } from '../../constants/itemConstants';
import TypeBadge from '../common/TypeBadge';
import ZoneBadge from '../common/ZoneBadge';
import StatusBadge from '../common/StatusBadge';

const ITEMS_PER_PAGE = 12; // 3 kolom x 4 baris = 12 stiker per lembar A4

export default function TemplateQrView({ items = [] }) {
  // 1. Selection State
  const [selectedIds, setSelectedIds] = useState(() => items.slice(0, 48).map((it) => it.id));

  // 2. Filter State untuk Selector Kanan
  const [filterZona, setFilterZona] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterGedung, setFilterGedung] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Pagination & Print State
  const [currentPage, setCurrentPage] = useState(1);
  const [printAllPages, setPrintAllPages] = useState(true);
  const [qrCache, setQrCache] = useState({});
  const [generating, setGenerating] = useState(false);

  // Bottom table pagination
  const [bottomPage, setBottomPage] = useState(1);
  const [bottomPageSize, setBottomPageSize] = useState(25);

  // Daftar gedung unik untuk filter dropdown
  const uniqueGedungList = useMemo(() => {
    const set = new Set();
    items.forEach((item) => {
      if (item.gedung) set.add(item.gedung);
    });
    return Array.from(set).sort();
  }, [items]);

  // Sync initial selection
  useEffect(() => {
    if (items.length > 0 && selectedIds.length === 0) {
      setSelectedIds(items.slice(0, 48).map((it) => it.id));
    }
  }, [items]);

  // Toggle selection per item
  function toggleItemSelection(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  // Filter list untuk panel pemilih sebelah kanan
  const filteredSelectorItems = useMemo(() => {
    return items.filter((item) => {
      const matchZona = !filterZona || String(item.zona) === String(filterZona);
      const matchJenis = !filterJenis || item.jenis === filterJenis;
      const matchGedung = !filterGedung || item.gedung === filterGedung;
      const matchSearch =
        !searchTerm ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gedung?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchZona && matchJenis && matchGedung && matchSearch;
    });
  }, [items, filterZona, filterJenis, filterGedung, searchTerm]);

  // Equipment yang sudah DIPILIH (masuk ke template preview A4)
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  // Pilih Semua yang ada di hasil filter
  function handleSelectAllFiltered() {
    const filteredIds = filteredSelectorItems.map((it) => it.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  }

  // Batal Pilih Semua yang ada di hasil filter
  function handleDeselectAllFiltered() {
    const filteredIds = new Set(filteredSelectorItems.map((it) => it.id));
    setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
  }

  // Total Halaman A4 untuk item terpilih
  const totalPages = Math.max(1, Math.ceil(selectedItems.length / ITEMS_PER_PAGE));

  // Reset page saat totalPages mengecil
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Generate QR Code untuk item yang terpilih
  useEffect(() => {
    let mounted = true;

    async function generateQrs() {
      setGenerating(true);
      const newCache = { ...qrCache };
      let updated = false;

      for (const item of selectedItems) {
        if (!newCache[item.kodeItem]) {
          try {
            const payload = `ARFF-YIA:${item.kodeItem}`;
            const dataUrl = await QRCode.toDataURL(payload, {
              width: 240,
              margin: 1,
              errorCorrectionLevel: 'M',
            });
            newCache[item.kodeItem] = dataUrl;
            updated = true;
          } catch (err) {
            console.error(`Gagal membuat QR untuk ${item.kodeItem}:`, err);
          }
        }
      }

      if (mounted) {
        if (updated) setQrCache(newCache);
        setGenerating(false);
      }
    }

    if (selectedItems.length > 0) {
      generateQrs();
    }
  }, [selectedItems]);

  // Memecah item terpilih ke dalam halaman A4 (masing-masing 12 item)
  const paginatedPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < selectedItems.length; i += ITEMS_PER_PAGE) {
      pages.push(selectedItems.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [selectedItems]);

  // Item pada halaman A4 yang sedang aktif
  const currentPageItems = paginatedPages[currentPage - 1] || [];

  // Bottom table pagination
  const totalBottomPages = Math.ceil(items.length / bottomPageSize) || 1;
  const paginatedBottomItems = useMemo(() => {
    const start = (bottomPage - 1) * bottomPageSize;
    return items.slice(start, start + bottomPageSize);
  }, [items, bottomPage, bottomPageSize]);

  // Trigger Print Browser
  function handlePrint(all = true) {
    setPrintAllPages(all);
    setTimeout(() => {
      window.print();
    }, 150);
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* BAGIAN ATAS: SPLIT VIEW (KIRI: PREVIEW A4, KANAN: CHECKLIST SELECTOR)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* KOLOM KIRI (7 Kolom): PREVIEW KERTAS A4 GRID 3x4 */}
        <section className="lg:col-span-7 card p-4 space-y-3 bg-white border border-gray-200 shadow-xs">
          {/* Header Kontrol Preview */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-xs font-bold uppercase text-gray-900 flex items-center gap-1.5">
                <QrIcon size={14} className="text-blue-600" />
                Preview Kertas A4 (Grid 3x4)
              </h2>
              <p className="text-[11px] text-gray-500">
                Menampilkan <strong>{selectedItems.length}</strong> stiker terpilih
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePrint(true)}
                disabled={selectedItems.length === 0}
                className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-40"
              >
                <Printer size={13} />
                <span>Cetak / PDF ({selectedItems.length})</span>
              </button>
            </div>
          </div>

          {/* Baris Navigasi Halaman A4 */}
          <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded border border-gray-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Lembar A4:</span>
              <span className="font-bold text-gray-900">
                Halaman {currentPage} dari {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                className="h-6 w-6 inline-flex items-center justify-center rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="font-medium text-gray-800 text-[11px]">
                {currentPage} / {totalPages}
              </span>
              <button
                className="h-6 w-6 inline-flex items-center justify-center rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                title="Halaman Selanjutnya"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Kertas Preview A4 */}
          <div className="overflow-x-auto p-1 bg-gray-100 rounded border border-gray-200 flex justify-center">
            <div
              className="bg-white border border-gray-300 shadow rounded-sm p-3 w-full max-w-[195mm] min-h-[250mm] flex flex-col justify-between"
              style={{ boxSizing: 'border-box' }}
            >
              {/* Header Kertas */}
              <div className="border-b border-gray-200 pb-1 mb-1.5 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                <span className="font-bold">ARFF YIA - LEMBAR STIKER QR</span>
                <span>
                  HALAMAN {currentPage} / {totalPages}
                </span>
              </div>

              {/* Grid 3x4 Kotak Stiker */}
              {currentPageItems.length > 0 ? (
                <div className="grid grid-cols-3 grid-rows-4 gap-1.5 flex-1">
                  {currentPageItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-dashed border-gray-300 rounded p-1.5 flex flex-col items-center justify-between text-center bg-white hover:border-blue-400 transition"
                      style={{ minHeight: '52mm' }}
                    >
                      <div className="w-full flex items-center justify-between border-b border-gray-100 pb-0.5 text-[9px]">
                        <span className="font-extrabold text-red-600">ARFF YIA</span>
                        <span className="font-semibold text-gray-600 text-[8px]">
                          Zona {item.zona}
                        </span>
                      </div>

                      <div className="my-auto py-0.5 flex items-center justify-center">
                        {qrCache[item.kodeItem] ? (
                          <img
                            src={qrCache[item.kodeItem]}
                            alt={`QR ${item.kodeItem}`}
                            className="h-20 w-20 object-contain"
                          />
                        ) : (
                          <div className="h-20 w-20 border border-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
                            {generating ? <Loader2 className="animate-spin" size={14} /> : 'QR'}
                          </div>
                        )}
                      </div>

                      <div className="w-full border-t border-gray-100 pt-0.5 leading-tight">
                        <p className="font-mono text-[10px] font-bold text-gray-900">
                          {item.kodeItem}
                        </p>
                        <p className="text-[8px] text-gray-600 truncate max-w-[120px] mx-auto">
                          {item.gedung ? `${item.gedung}` : item.namaItem}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Kotak Kosong jika kurang dari 12 */}
                  {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - currentPageItems.length) }).map(
                    (_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="border border-dashed border-gray-200 rounded p-2 flex items-center justify-center text-[10px] text-gray-300 select-none"
                        style={{ minHeight: '52mm' }}
                      >
                        Slot Kosong
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16 text-xs space-y-2">
                  <Square size={28} className="text-gray-300" />
                  <p>Belum ada equipment yang dicentang.</p>
                  <p className="text-[11px]">Centang equipment pada panel di sebelah kanan.</p>
                </div>
              )}

              {/* Footer Kertas */}
              <div className="border-t border-gray-200 pt-1 mt-1.5 flex items-center justify-between text-[8px] text-gray-400">
                <span>Airport Rescue and Fire Fighting - YIA</span>
                <span>Ukuran Kertas: A4 (3x4 Grid)</span>
              </div>
            </div>
          </div>
        </section>

        {/* KOLOM KANAN (5 Kolom): FILTER & CHECKLIST SELECTOR */}
        <section className="lg:col-span-5 card p-4 space-y-3 bg-white border border-gray-200 shadow-xs flex flex-col max-h-[750px]">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-xs font-bold uppercase text-gray-900">
                Pilih Equipment Masuk Template
              </h2>
              <p className="text-[11px] text-gray-500">
                Centang item untuk dimasukkan ke template A4
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              {selectedIds.length} Terpilih
            </span>
          </div>

          {/* Filter Bar */}
          <div className="space-y-2 text-xs">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
              <input
                className="field field-with-icon text-xs h-8"
                placeholder="Cari kode, nama, gedung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <select
                className="field text-xs h-8 cursor-pointer"
                value={filterZona}
                onChange={(e) => setFilterZona(e.target.value)}
              >
                <option value="">Zona</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    Zona {z}
                  </option>
                ))}
              </select>

              <select
                className="field text-xs h-8 cursor-pointer"
                value={filterGedung}
                onChange={(e) => setFilterGedung(e.target.value)}
              >
                <option value="">Gedung</option>
                {uniqueGedungList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <select
                className="field text-xs h-8 cursor-pointer"
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
              >
                <option value="">Jenis</option>
                {ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-gray-500">
                Filter: <strong>{filteredSelectorItems.length}</strong> item
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllFiltered}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Batal Pilih
                </button>
              </div>
            </div>
          </div>

          {/* List Equipment dengan Checklist (1 Baris Ringkas) */}
          <div className="flex-1 overflow-y-auto max-h-[480px] divide-y divide-gray-100 border border-gray-200 rounded bg-white">
            {filteredSelectorItems.length > 0 ? (
              filteredSelectorItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs cursor-pointer transition select-none ${
                      isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded text-blue-600 cursor-pointer shrink-0"
                      />
                      <span className="font-mono font-bold text-gray-900 shrink-0">
                        {item.kodeItem}
                      </span>
                      <span
                        className="text-gray-600 truncate text-[11px]"
                        title={`${item.namaItem} (${item.gedung || ''} - ${item.lokasi})`}
                      >
                        {item.gedung ? `${item.gedung} - ${item.namaItem}` : item.namaItem}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                        Z{item.zona}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          item.jenis === 'apar'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {item.jenis?.toUpperCase()}
                      </span>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs">
                Tidak ada equipment yang cocok dengan filter.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN BAWAH: TABEL DATA KESELURUHAN EQUIPMENT (FULL WIDTH)               */}
      {/* ========================================================================= */}
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
              onClick={() => setSelectedIds(items.map((it) => it.id))}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Centang Semua ({items.length})
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Hapus Semua Pilihan
            </button>
          </div>
        </div>

        {/* Tabel Data Keseluruhan */}
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
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <td
                        className="px-3 py-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item.id)}
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

        {/* Bottom Pagination Controls */}
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

      {/* ========================================================================= */}
      {/* TARGET DOM KHUSUS CETAK PRINT / SIMPAN PDF (A4 FULL LAYOUT)               */}
      {/* ========================================================================= */}
      <div id="printable-a4-sheet" className="hidden print:block">
        {(printAllPages ? paginatedPages : [currentPageItems]).map((pageItems, pageIndex) => (
          <div
            key={`print-page-${pageIndex}`}
            className="a4-print-page bg-white p-3 flex flex-col justify-between"
            style={{
              width: '100%',
              height: '100%',
              pageBreakAfter:
                pageIndex < (printAllPages ? paginatedPages.length - 1 : 0)
                  ? 'always'
                  : 'auto',
            }}
          >
            {/* Header Cetak */}
            <div className="border-b border-gray-300 pb-1 mb-2 flex items-center justify-between text-[9pt] font-mono text-gray-600">
              <span className="font-bold">ARFF YIA - LEMBAR STIKER QR EQUIPMENT</span>
              <span>
                HALAMAN {pageIndex + 1} DARI {paginatedPages.length}
              </span>
            </div>

            {/* Grid 3x4 Cetak */}
            <div className="grid grid-cols-3 grid-rows-4 gap-2 flex-1">
              {pageItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-dashed border-gray-400 rounded p-2 flex flex-col items-center justify-between text-center break-inside-avoid"
                  style={{ minHeight: '62mm', boxSizing: 'border-box' }}
                >
                  <div className="w-full flex items-center justify-between border-b border-gray-200 pb-1 text-[10pt]">
                    <span className="font-extrabold text-black tracking-wider">ARFF YIA</span>
                    <span className="font-bold text-gray-700 text-[9pt]">Zona {item.zona}</span>
                  </div>

                  <div className="my-auto py-1 flex items-center justify-center">
                    {qrCache[item.kodeItem] ? (
                      <img
                        src={qrCache[item.kodeItem]}
                        alt={`QR ${item.kodeItem}`}
                        className="h-28 w-28 object-contain"
                      />
                    ) : (
                      <div className="h-28 w-28 border border-gray-200 flex items-center justify-center text-[8pt]">
                        QR
                      </div>
                    )}
                  </div>

                  <div className="w-full border-t border-gray-200 pt-1">
                    <p className="font-mono text-[11pt] font-bold text-black tracking-wide">
                      {item.kodeItem}
                    </p>
                    <p className="text-[8pt] text-gray-600 truncate max-w-[140px] mx-auto">
                      {item.gedung ? `${item.gedung}` : item.namaItem}
                    </p>
                  </div>
                </div>
              ))}

              {/* Slot Kosong pelengkap grid 3x4 pada halaman print terakhir */}
              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - pageItems.length) }).map(
                (_, idx) => (
                  <div
                    key={`print-empty-${idx}`}
                    className="border border-dashed border-gray-200 rounded p-2"
                    style={{ minHeight: '62mm' }}
                  />
                )
              )}
            </div>

            {/* Footer Cetak */}
            <div className="border-t border-gray-300 pt-1 mt-2 flex items-center justify-between text-[8pt] text-gray-500">
              <span>Airport Rescue and Fire Fighting - Yogyakarta International Airport</span>
              <span>3x4 Grid A4 Format</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
