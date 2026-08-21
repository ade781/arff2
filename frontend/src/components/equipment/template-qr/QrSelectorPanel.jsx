import React from 'react';
import { Search } from 'lucide-react';
import { ZONES, ITEM_TYPES } from '../../../constants/itemConstants';

export default function QrSelectorPanel({
  filteredItems,
  selectedIds,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  searchTerm,
  setSearchTerm,
  filterZona,
  onZonaChange,
  filterGedung,
  setFilterGedung,
  filterJenis,
  setFilterJenis,
  availableGedungList = [],
}) {
  return (
    <section className="card p-4 space-y-3 bg-white border border-gray-200 shadow-xs flex flex-col max-h-[750px]">
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

      {/* Filter Bar Hierarkis (1. Zona -> 2. Gedung -> 3. Jenis -> 4. Search) */}
      <div className="space-y-2 text-xs">
        {/* Row 1: Cascading Dropdowns */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* 1. Zona (Wajib pertama seperti provinsi) */}
          <div>
            <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
              1. Zona <span className="text-blue-600">*</span>
            </label>
            <select
              className="field text-xs h-8 cursor-pointer font-semibold border-blue-300"
              value={filterZona}
              onChange={(e) => onZonaChange(e.target.value)}
            >
              <option value="">Semua Zona</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  Zona {z}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Gedung (Tersaring berdasarkan Zona) */}
          <div>
            <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
              2. Gedung
            </label>
            <select
              className={`field text-xs h-8 ${
                !filterZona
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'cursor-pointer bg-white'
              }`}
              value={filterGedung}
              disabled={!filterZona}
              onChange={(e) => setFilterGedung(e.target.value)}
            >
              <option value="">
                {!filterZona ? '-- Pilih Zona --' : 'Semua Gedung'}
              </option>
              {availableGedungList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Jenis */}
          <div>
            <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
              3. Jenis
            </label>
            <select
              className="field text-xs h-8 cursor-pointer"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="">Semua</option>
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
          <input
            className="field field-with-icon text-xs h-8"
            placeholder="Cari kode, nama, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="text-gray-500">
            Hasil: <strong>{filteredItems.length}</strong> item
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Pilih Semua ({filteredItems.length})
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* Item List Checklist */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded divide-y divide-gray-100 min-h-[350px] max-h-[480px]">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center justify-between p-2 text-xs hover:bg-gray-50 cursor-pointer transition select-none ${
                  isChecked ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleItem(item.id)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-mono font-bold text-gray-900 truncate">
                      {item.kodeItem}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {item.gedung ? `${item.gedung} - ` : ''}
                      {item.namaItem}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    item.jenis === 'apar'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  Z{item.zona}
                </span>
              </label>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs">
            Tidak ada equipment yang sesuai filter.
          </div>
        )}
      </div>
    </section>
  );
}
