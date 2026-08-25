import React from 'react';
import { Search } from 'lucide-react';

export const ZONA_CONFIG = [
  { id: '1', label: 'Zona 1 (Terminal)', subtitle: 'Keberangkatan, Kedatangan, Mezzanine', regu: 'Regu Delta' },
  { id: '2', label: 'Zona 2 (Operasional)', subtitle: 'Gedung Operasional & Administrasi', regu: 'Regu Charlie' },
  { id: '3', label: 'Zona 3 (Main Station)', subtitle: 'Main Fire Station, Apron, Hanggar', regu: 'Regu Bravo' },
  { id: '4', label: 'Zona 4 (Kargo & Utility)', subtitle: 'Kargo, Domestik/Intl, Power House', regu: 'Regu Alfa' },
];

export const MONTH_OPTIONS = [
  { value: 'JANUARI 2026', label: 'Januari 2026' },
  { value: 'FEBRUARI 2026', label: 'Februari 2026' },
  { value: 'MARET 2026', label: 'Maret 2026' },
  { value: 'APRIL 2026', label: 'April 2026' },
  { value: 'MEI 2026', label: 'Mei 2026' },
  { value: 'JUNI 2026', label: 'Juni 2026' },
  { value: 'JULI 2026', label: 'Juli 2026' },
  { value: 'AGUSTUS 2026', label: 'Agustus 2026' },
  { value: 'SEPTEMBER 2026', label: 'September 2026' },
  { value: 'OKTOBER 2026', label: 'Oktober 2026' },
  { value: 'NOVEMBER 2026', label: 'November 2026' },
  { value: 'DESEMBER 2026', label: 'Desember 2026' },
];

export const REGU_OPTIONS = [
  'Regu Alfa',
  'Regu Bravo',
  'Regu Charlie',
  'Regu Delta',
];

export function RekapZonaTabs({ items = [], activeZona, onSelectZona }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 no-print">
      {ZONA_CONFIG.map((z) => {
        const isActive = activeZona === z.id;
        const count = items.filter((it) => String(it.zona) === String(z.id)).length;

        return (
          <button
            key={z.id}
            type="button"
            onClick={() => onSelectZona(z.id)}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              isActive
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                {z.label}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {count} Unit
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 truncate" title={z.subtitle}>
              {z.subtitle}
            </p>
            <p className="text-[10px] font-semibold text-gray-600 mt-0.5">{z.regu}</p>
          </button>
        );
      })}
    </div>
  );
}

export function RekapStatsCards({ stats, activeZona, selectedBulan }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
      <div className="card p-3 bg-white border border-gray-200 shadow-xs">
        <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Titik Equipment</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
        <p className="text-[10px] text-gray-400">Terdaftar di Zona {activeZona}</p>
      </div>

      <div className="card p-3 bg-white border border-gray-200 shadow-xs">
        <p className="text-[11px] font-semibold text-emerald-600 uppercase">Sudah Diinspeksi</p>
        <p className="text-xl font-bold text-emerald-700 mt-0.5">
          {stats.inspected}{' '}
          <span className="text-xs font-normal text-gray-500">({stats.percentage}%)</span>
        </p>
        <p className="text-[10px] text-gray-400">Periode {selectedBulan}</p>
      </div>

      <div className="card p-3 bg-white border border-gray-200 shadow-xs">
        <p className="text-[11px] font-semibold text-blue-600 uppercase">Kondisi Siap Operasi</p>
        <p className="text-xl font-bold text-blue-700 mt-0.5">{stats.ready}</p>
        <p className="text-[10px] text-gray-400">Lengkap & berfungsi normal</p>
      </div>

      <div className="card p-3 bg-white border border-gray-200 shadow-xs">
        <p className="text-[11px] font-semibold text-amber-600 uppercase">Temuan / Rusak</p>
        <p className="text-xl font-bold text-amber-700 mt-0.5">{stats.problem}</p>
        <p className="text-[10px] text-gray-400">Perlu tindak lanjut / penggantian</p>
      </div>
    </div>
  );
}

export function RekapFilterToolbar({
  searchTerm,
  setSearchTerm,
  selectedBulan,
  setSelectedBulan,
  selectedRegu,
  setSelectedRegu,
  filterGedung,
  setFilterGedung,
  filterKondisi,
  setFilterKondisi,
  gedungList = [],
}) {
  return (
    <div className="card p-3.5 bg-white border border-gray-200 shadow-xs space-y-2.5 no-print">
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-12 text-xs">
        <div className="relative sm:col-span-3 flex items-center">
          <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
          <input
            className="field field-with-icon text-xs h-8.5 w-full"
            placeholder="Cari nomor zona, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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

        <div className="sm:col-span-2">
          <select
            className="field text-xs h-8.5 cursor-pointer font-semibold text-blue-700 bg-blue-50/50 border-blue-200"
            value={selectedRegu}
            onChange={(e) => setSelectedRegu(e.target.value)}
            title="Pilih Regu Penanggung Jawab Zona untuk Bulan Ini"
          >
            {REGU_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            className="field text-xs h-8.5 cursor-pointer"
            value={filterGedung}
            onChange={(e) => setFilterGedung(e.target.value)}
          >
            <option value="">Semua Gedung</option>
            {gedungList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

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

export function RekapSymbolLegend() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] space-y-1 text-gray-700">
      <p className="font-bold text-gray-900 mb-1">KETERANGAN SIMBOL KONDISI :</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
        <p><strong className="font-mono text-emerald-700">v</strong> : Siap Operasi ( semuanya lengkap )</p>
        <p><strong className="font-mono text-amber-700">B</strong> : Baik dengan catatan ( bagian peralatan kurang / tidak lengkap & kolom keterangan wajib diisi )</p>
        <p><strong className="font-mono text-blue-700">L</strong> : Low Pressure ( kondisi tekanan kurang dari standar & kolom keterangan wajib diisi )</p>
        <p><strong className="font-mono text-red-700">X</strong> : Rusak ( kolom keterangan wajib diisi )</p>
        <p><strong className="font-mono text-indigo-700">P</strong> : Lengkap 1 ( ada selang & nozzle )</p>
        <p><strong className="font-mono text-purple-700">O</strong> : Lengkap 2 ( ada selang, nozzle & kunci hydrant )</p>
        <p><strong className="font-mono text-gray-500">–</strong> : Kosong / tidak ada / tidak diketahui ( kolom keterangan wajib diisi )</p>
      </div>
    </div>
  );
}

export function RekapSignatureBlock({ selectedRegu, tglFormatted }) {
  return (
    <div className="pt-4 pb-2 text-xs text-gray-900 border-t border-gray-200">
      <div className="flex justify-end mb-2">
        <p className="font-medium text-gray-700">Kulon Progo, {tglFormatted}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center pt-2">
        <div className="space-y-1">
          <p className="font-semibold text-gray-600">Mengetahui,</p>
          <p className="font-bold text-gray-900">TEAM LEADER ARFF YIA</p>
          <div className="h-16 flex items-center justify-center">
            <span className="text-[10px] text-gray-300 italic">[ Tanda Tangan & Cap ]</span>
          </div>
          <p className="font-bold text-gray-900">( .................................................... )</p>
          <p className="text-[11px] text-gray-500">NIP. .................................................</p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-gray-600">Petugas Pemeriksa Lapangan,</p>
          <p className="font-bold text-gray-900">{selectedRegu.toUpperCase()}</p>
          <div className="h-16 flex items-center justify-center">
            <span className="text-[10px] text-gray-300 italic">[ Tanda Tangan ]</span>
          </div>
          <p className="font-bold text-gray-900">( .................................................... )</p>
          <p className="text-[11px] text-gray-500">NIP. .................................................</p>
        </div>
      </div>
    </div>
  );
}
