import React from 'react';
import { Loader2 } from 'lucide-react';

export default function QrStickerCard({ item, qrUrl, loading }) {
  if (!item) {
    return (
      <div
        className="border border-dashed border-gray-200 rounded p-2 flex items-center justify-center text-[10px] text-gray-300 select-none"
        style={{ minHeight: '52mm' }}
      >
        Slot Kosong
      </div>
    );
  }

  return (
    <div
      className="border border-dashed border-gray-300 rounded p-1.5 flex flex-col items-center justify-between text-center bg-white hover:border-blue-400 transition"
      style={{ minHeight: '52mm' }}
    >
      <div className="w-full flex items-center justify-between border-b border-gray-100 pb-0.5 text-[9px]">
        <span className="font-extrabold text-red-600">ARFF YIA</span>
        <span className="font-semibold text-gray-600 text-[8px]">
          Zona {item.zona}
        </span>
      </div>

      <div className="my-auto py-0.5 flex items-center justify-center">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`QR ${item.kodeItem}`}
            className="h-20 w-20 object-contain"
          />
        ) : (
          <div className="h-20 w-20 border border-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
            {loading ? <Loader2 className="animate-spin" size={14} /> : 'QR'}
          </div>
        )}
      </div>

      <div className="w-full border-t border-gray-100 pt-0.5 leading-tight">
        <p className="font-mono text-[10px] font-bold text-gray-900">
          {item.kodeItem}
        </p>
        <p className="text-[8px] text-gray-600 truncate max-w-[120px] mx-auto">
          {item.gedung ? `${item.gedung}` : item.namaItem}
        </p>
      </div>
    </div>
  );
}
