import React from 'react';

export default function RekapStatsCards({ stats, activeZona, selectedBulan }) {
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
