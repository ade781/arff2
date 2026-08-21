import React, { useEffect, useMemo, useState } from 'react';
import { useQrGeneratorCache } from './template-qr/useQrGeneratorCache';
import A4SheetPreview from './template-qr/A4SheetPreview';
import QrSelectorPanel from './template-qr/QrSelectorPanel';
import MasterEquipmentTable from './template-qr/MasterEquipmentTable';
import PrintableA4Document from './template-qr/PrintableA4Document';

const ITEMS_PER_PAGE = 12; // 3 kolom x 4 baris = 12 stiker per lembar A4

export default function TemplateQrView({ items = [] }) {
  // 1. Selection State
  const [selectedIds, setSelectedIds] = useState(() => items.slice(0, 48).map((it) => it.id));

  // 2. Filter State untuk Selector Kanan (Cascading: Zona -> Gedung -> Jenis -> Search)
  const [filterZona, setFilterZona] = useState('');
  const [filterGedung, setFilterGedung] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Pagination & Print State
  const [currentPage, setCurrentPage] = useState(1);
  const [printAllPages, setPrintAllPages] = useState(true);

  // Bottom table pagination
  const [bottomPage, setBottomPage] = useState(1);
  const [bottomPageSize, setBottomPageSize] = useState(25);

  // Cascading: Gedung hanya diambil dari Zona yang dipilih
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
    setFilterGedung(''); // Reset gedung otomatis saat zona berganti
  }

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
      const matchGedung = !filterGedung || item.gedung === filterGedung;
      const matchJenis = !filterJenis || item.jenis === filterJenis;
      const matchSearch =
        !searchTerm ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gedung?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchZona && matchGedung && matchJenis && matchSearch;
    });
  }, [items, filterZona, filterGedung, filterJenis, searchTerm]);

  // Equipment yang sudah DIPILIH (masuk ke template preview A4)
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  // QR Caching Hook
  const { qrCache, generating } = useQrGeneratorCache(selectedItems);

  // Total Halaman A4 untuk item terpilih
  const totalPages = Math.max(1, Math.ceil(selectedItems.length / ITEMS_PER_PAGE));

  // Reset page saat totalPages mengecil
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Memecah item terpilih ke dalam halaman A4 (masing-masing 12 item)
  const paginatedPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < selectedItems.length; i += ITEMS_PER_PAGE) {
      pages.push(selectedItems.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [selectedItems]);

  const currentPageItems = paginatedPages[currentPage - 1] || [];

  // Trigger Print Browser
  function handlePrint(all = true) {
    setPrintAllPages(all);
    setTimeout(() => {
      window.print();
    }, 150);
  }

  return (
    <div className="space-y-6">
      {/* BAGIAN ATAS: SPLIT VIEW (KIRI: PREVIEW A4, KANAN: CHECKLIST SELECTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <A4SheetPreview
            currentPageItems={currentPageItems}
            currentPage={currentPage}
            totalPages={totalPages}
            totalSelected={selectedItems.length}
            onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            onPrint={() => handlePrint(true)}
            qrCache={qrCache}
            generating={generating}
          />
        </div>

        <div className="lg:col-span-5">
          <QrSelectorPanel
            filteredItems={filteredSelectorItems}
            selectedIds={selectedIds}
            onToggleItem={toggleItemSelection}
            onSelectAll={() => {
              const filteredIds = filteredSelectorItems.map((it) => it.id);
              setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
            }}
            onDeselectAll={() => {
              const filteredIds = new Set(filteredSelectorItems.map((it) => it.id));
              setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
            }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterZona={filterZona}
            onZonaChange={handleZonaChange}
            filterGedung={filterGedung}
            setFilterGedung={setFilterGedung}
            filterJenis={filterJenis}
            setFilterJenis={setFilterJenis}
            availableGedungList={availableGedungList}
          />
        </div>
      </div>

      {/* BAGIAN BAWAH: TABEL DATA KESELURUHAN EQUIPMENT */}
      <MasterEquipmentTable
        items={items}
        selectedIds={selectedIds}
        onToggleItem={toggleItemSelection}
        onSelectAll={() => setSelectedIds(items.map((it) => it.id))}
        onDeselectAll={() => setSelectedIds([])}
        bottomPage={bottomPage}
        setBottomPage={setBottomPage}
        bottomPageSize={bottomPageSize}
      />

      {/* TARGET DOM KHUSUS PRINT A4 */}
      <PrintableA4Document
        paginatedPages={paginatedPages}
        currentPageItems={currentPageItems}
        printAllPages={printAllPages}
        qrCache={qrCache}
      />
    </div>
  );
}
