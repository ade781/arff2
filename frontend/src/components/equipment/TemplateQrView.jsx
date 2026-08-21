import React, { useEffect, useMemo, useState } from 'react';
import { useQrGeneratorCache } from './template-qr/useQrGeneratorCache';
import A4SheetPreview from './template-qr/A4SheetPreview';
import QrSelectorPanel from './template-qr/QrSelectorPanel';
import MasterEquipmentTable from './template-qr/MasterEquipmentTable';
import PrintableA4Document from './template-qr/PrintableA4Document';

const ITEMS_PER_PAGE = 12;

export default function TemplateQrView({ items = [] }) {
  const [selectedIds, setSelectedIds] = useState(() => items.slice(0, 48).map((it) => it.id));

  const [filterZona, setFilterZona] = useState('');
  const [filterGedung, setFilterGedung] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [printAllPages, setPrintAllPages] = useState(true);

  const [bottomPage, setBottomPage] = useState(1);
  const [bottomPageSize, setBottomPageSize] = useState(25);

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
  }

  useEffect(() => {
    if (items.length > 0 && selectedIds.length === 0) {
      setSelectedIds(items.slice(0, 48).map((it) => it.id));
    }
  }, [items]);

  function toggleItemSelection(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

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

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  const { qrCache, generating } = useQrGeneratorCache(selectedItems);

  const totalPages = Math.max(1, Math.ceil(selectedItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < selectedItems.length; i += ITEMS_PER_PAGE) {
      pages.push(selectedItems.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [selectedItems]);

  const currentPageItems = paginatedPages[currentPage - 1] || [];

  function handlePrint(all = true) {
    setPrintAllPages(all);
    setTimeout(() => {
      window.print();
    }, 150);
  }

  return (
    <div className="space-y-6">
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

      <PrintableA4Document
        paginatedPages={paginatedPages}
        currentPageItems={currentPageItems}
        printAllPages={printAllPages}
        qrCache={qrCache}
      />
    </div>
  );
}
