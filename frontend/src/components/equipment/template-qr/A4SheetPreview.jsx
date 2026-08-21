import React from 'react';
import { ChevronLeft, ChevronRight, Printer, QrCode as QrIcon, Square } from 'lucide-react';
import QrStickerCard from './QrStickerCard';

const ITEMS_PER_PAGE = 12;

export default function A4SheetPreview({
  currentPageItems,
  currentPage,
  totalPages,
  totalSelected,
  onPrevPage,
  onNextPage,
  onPrint,
  qrCache,
  generating,
}) {
  const emptySlotsCount = Math.max(0, ITEMS_PER_PAGE - currentPageItems.length);

  return (
    <section className="card p-4 space-y-3 bg-white border border-gray-200 shadow-xs">
      {/* Header Kontrol Preview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-900 flex items-center gap-1.5">
            <QrIcon size={14} className="text-blue-600" />
            Preview Kertas A4 (Grid 3x4)
          </h2>
          <p className="text-[11px] text-gray-500">
            Menampilkan <strong>{totalSelected}</strong> stiker terpilih
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            disabled={totalSelected === 0}
            className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-40"
          >
            <Printer size={13} />
            <span>Cetak / PDF ({totalSelected})</span>
          </button>
        </div>
      </div>

      {/* Baris Navigasi Halaman A4 */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded border border-gray-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Lembar A4:</span>
          <span className="font-bold text-gray-900">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="h-6 w-6 inline-flex items-center justify-center rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="font-medium text-gray-800 text-[11px]">
            {currentPage} / {totalPages}
          </span>
          <button
            className="h-6 w-6 inline-flex items-center justify-center rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            title="Halaman Selanjutnya"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Kertas Preview A4 */}
      <div className="overflow-x-auto p-1 bg-gray-100 rounded border border-gray-200 flex justify-center">
        <div
          className="bg-white border border-gray-300 shadow rounded-sm p-3 w-full max-w-[195mm] min-h-[250mm] flex flex-col justify-between"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header Kertas */}
          <div className="border-b border-gray-200 pb-1 mb-1.5 flex items-center justify-between text-[9px] text-gray-500 font-mono">
            <span className="font-bold">ARFF YIA - LEMBAR STIKER QR</span>
            <span>
              HALAMAN {currentPage} / {totalPages}
            </span>
          </div>

          {/* Grid 3x4 Kotak Stiker */}
          {currentPageItems.length > 0 ? (
            <div className="grid grid-cols-3 grid-rows-4 gap-1.5 flex-1">
              {currentPageItems.map((item) => (
                <QrStickerCard
                  key={item.id}
                  item={item}
                  qrUrl={qrCache[item.kodeItem]}
                  loading={generating}
                />
              ))}

              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <QrStickerCard key={`empty-${idx}`} item={null} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16 text-xs space-y-2">
              <Square size={28} className="text-gray-300" />
              <p>Belum ada equipment yang dicentang.</p>
              <p className="text-[11px]">Centang equipment pada panel di sebelah kanan.</p>
            </div>
          )}

          {/* Footer Kertas */}
          <div className="border-t border-gray-200 pt-1 mt-1.5 flex items-center justify-between text-[8px] text-gray-400">
            <span>Airport Rescue and Fire Fighting - YIA</span>
            <span>Ukuran Kertas: A4 (3x4 Grid)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
