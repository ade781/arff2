import React from 'react';

export default function RekapSymbolLegend() {
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
