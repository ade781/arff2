import React from 'react';
import { Loader2 } from 'lucide-react';

export default function QrStickerCard({ item, qrUrl, loading }) {
  if (!item) {
    return (
      <div
        className="border border-dashed border-gray-200 rounded-lg p-2 flex items-center justify-center text-[10px] text-gray-300 select-none"
        style={{ minHeight: '56mm' }}
      >
        Slot Kosong
      </div>
    );
  }

  return (
    <div
      className="border border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-between text-center bg-white hover:border-blue-500 hover:shadow-xs transition"
      style={{ minHeight: '56mm' }}
    >
      {/* Header Stiker */}
      <div className="w-full flex items-center justify-between border-b border-gray-100 pb-1 text-[10px]">
        <span className="font-extrabold text-red-600 tracking-wider">ARFF YIA</span>
        <span className="font-bold text-gray-700 bg-gray-100 px-1.5 py-0.2 rounded text-[9px]">
          Zona {item.zona}
        </span>
      </div>

      {/* QR Code Utama - Diperbesar Optimal Mengisi Ruang */}
      <div className="my-auto py-1 flex items-center justify-center w-full">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`QR ${item.kodeItem}`}
            className="h-28 w-28 sm:h-32 sm:w-32 object-contain aspect-square drop-shadow-2xs"
          />
        ) : (
          <div className="h-28 w-28 sm:h-32 sm:w-32 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            {loading ? <Loader2 className="animate-spin text-blue-500" size={18} /> : 'Memuat QR...'}
          </div>
        )}
      </div>

      {/* Footer Info Equipment */}
      <div className="w-full border-t border-gray-100 pt-1 leading-tight">
        <p className="font-mono text-xs font-black text-gray-900 tracking-wide">
          {item.kodeItem}
        </p>
        <p className="text-[9px] text-gray-600 font-medium truncate max-w-[140px] mx-auto mt-0.5" title={item.namaItem}>
          {item.gedung ? `${item.gedung}` : item.namaItem}
        </p>
      </div>
    </div>
  );
}
