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
  setFilterZona,
  filterGedung,
  setFilterGedung,
  filterJenis,
  setFilterJenis,
  uniqueGedungList,
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
            Filter: <strong>{filteredItems.length}</strong> item
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Pilih Semua
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      </div>

      {/* List Equipment dengan Checklist */}
      <div className="flex-1 overflow-y-auto max-h-[480px] divide-y divide-gray-100 border border-gray-200 rounded bg-white">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
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
                    onChange={() => onToggleItem(item.id)}
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
  );
}
