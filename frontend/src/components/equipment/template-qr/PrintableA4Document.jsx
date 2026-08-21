import React from 'react';

const ITEMS_PER_PAGE = 12;

export default function PrintableA4Document({
  paginatedPages,
  currentPageItems,
  printAllPages,
  qrCache,
}) {
  const pagesToRender = printAllPages ? paginatedPages : [currentPageItems];

  return (
    <div id="printable-a4-sheet" className="hidden print:block">
      {pagesToRender.map((pageItems, pageIndex) => (
        <div
          key={`print-page-${pageIndex}`}
          className="a4-print-page bg-white p-3 flex flex-col justify-between"
          style={{
            width: '100%',
            height: '100%',
            pageBreakAfter:
              pageIndex < (printAllPages ? paginatedPages.length - 1 : 0)
                ? 'always'
                : 'auto',
          }}
        >

          <div className="border-b border-gray-300 pb-1 mb-2 flex items-center justify-between text-[9pt] font-mono text-gray-600">
            <span className="font-bold">ARFF YIA - LEMBAR STIKER QR EQUIPMENT</span>
            <span>
              HALAMAN {pageIndex + 1} DARI {paginatedPages.length}
            </span>
          </div>

          <div className="grid grid-cols-3 grid-rows-4 gap-2 flex-1">
            {pageItems.map((item) => (
              <div
                key={item.id}
                className="border border-dashed border-gray-500 rounded p-1.5 flex flex-col items-center justify-between text-center break-inside-avoid"
                style={{ minHeight: '62mm', boxSizing: 'border-box' }}
              >
                <div className="w-full flex items-center justify-between border-b border-gray-200 pb-0.5 text-[10pt]">
                  <span className="font-extrabold text-black tracking-wider">ARFF YIA</span>
                  <span className="font-bold text-gray-800 text-[9pt]">Zona {item.zona}</span>
                </div>

                <div className="my-auto py-0.5 flex items-center justify-center w-full">
                  {qrCache[item.kodeItem] ? (
                    <img
                      src={qrCache[item.kodeItem]}
                      alt={`QR ${item.kodeItem}`}
                      className="h-36 w-36 object-contain"
                    />
                  ) : (
                    <div className="h-36 w-36 border border-gray-200 flex items-center justify-center text-[9pt]">
                      QR
                    </div>
                  )}
                </div>

                <div className="w-full border-t border-gray-200 pt-0.5 leading-tight">
                  <p className="font-mono text-[11pt] font-extrabold text-black tracking-wide">
                    {item.kodeItem}
                  </p>
                  <p className="text-[8.5pt] text-gray-700 truncate max-w-[150px] mx-auto mt-0.5">
                    {item.gedung ? `${item.gedung}` : item.namaItem}
                  </p>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - pageItems.length) }).map(
              (_, idx) => (
                <div
                  key={`print-empty-${idx}`}
                  className="border border-dashed border-gray-200 rounded p-2"
                  style={{ minHeight: '62mm' }}
                />
              )
            )}
          </div>

          <div className="border-t border-gray-300 pt-1 mt-2 flex items-center justify-between text-[8pt] text-gray-500">
            <span>Airport Rescue and Fire Fighting - Yogyakarta International Airport</span>
            <span>Format Standar 3x4 Grid A4</span>
          </div>
        </div>
      ))}
    </div>
  );
}
