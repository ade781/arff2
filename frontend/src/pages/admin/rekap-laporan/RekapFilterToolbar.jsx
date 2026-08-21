import React from 'react';
import { Search } from 'lucide-react';
import { MONTH_OPTIONS } from './rekapConstants';

export default function RekapFilterToolbar({
  searchTerm,
  setSearchTerm,
  selectedBulan,
  setSelectedBulan,
  filterGedung,
  setFilterGedung,
  filterKondisi,
  setFilterKondisi,
  gedungList = [],
}) {
  return (
    <div className="card p-3.5 bg-white border border-gray-200 shadow-xs space-y-2.5 no-print">
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-12 text-xs">
        {/* Search */}
        <div className="relative sm:col-span-4 flex items-center">
          <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
          <input
            className="field field-with-icon text-xs h-8.5 w-full"
            placeholder="Cari kode nomor zona, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Bulan */}
        <div className="sm:col-span-3">
          <select
            className="field text-xs h-8.5 cursor-pointer font-medium"
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Gedung */}
        <div className="sm:col-span-3">
          <select
            className="field text-xs h-8.5 cursor-pointer"
            value={filterGedung}
            onChange={(e) => setFilterGedung(e.target.value)}
          >
            <option value="">Semua Gedung / Sheet</option>
            {gedungList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="sm:col-span-2">
          <select
            className="field text-xs h-8.5 cursor-pointer"
            value={filterKondisi}
            onChange={(e) => setFilterKondisi(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="inspected">Sudah Diperiksa</option>
            <option value="uninspected">Belum Diperiksa</option>
            <option value="problem">Ada Temuan / Rusak</option>
          </select>
        </div>
      </div>
    </div>
  );
}
