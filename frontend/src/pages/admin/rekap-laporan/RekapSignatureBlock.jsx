import React from 'react';

export default function RekapSignatureBlock({ selectedRegu, tglFormatted }) {
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
