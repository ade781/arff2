import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, Printer, X } from 'lucide-react';
import { ZONES } from '../../constants/itemConstants';

export default function BatchQrModal({ items, onClose }) {
  const [selectedZona, setSelectedZona] = useState('');
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredItems = selectedZona
    ? items.filter((it) => it.zona === selectedZona)
    : items;

  useEffect(() => {
    let mounted = true;
    async function generateAllQr() {
      setLoading(true);
      const generated = [];

      for (const item of filteredItems) {
        const payload = `ARFF-YIA:${item.kodeItem}`;
        try {
          const dataUrl = await QRCode.toDataURL(payload, { width: 160, margin: 1 });
          generated.push({ item, dataUrl, payload });
        } catch (e) {
          console.error(`Gagal memuat QR untuk ${item.kodeItem}:`, e);
        }
      }

      if (mounted) {
        setQrList(generated);
        setLoading(false);
      }
    }

    generateAllQr();

    return () => {
      mounted = false;
    };
  }, [selectedZona, items]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section id="printable-batch-modal" className="card w-full max-w-3xl p-4 space-y-3 bg-white max-h-[90vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Cetak Lembar Stiker QR ({qrList.length})
            </h2>
            <p className="text-xs text-gray-500">Format stiker cetak ARFF YIA</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="field text-xs h-8 w-32 cursor-pointer"
              value={selectedZona}
              onChange={(e) => setSelectedZona(e.target.value)}
            >
              <option value="">Semua Zona</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>Zona {z}</option>
              ))}
            </select>

            <button
              className="h-8 inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              type="button"
              onClick={handlePrint}
              disabled={loading || !qrList.length}
            >
              <Printer size={13} /> Cetak (A4)
            </button>

            <button className="text-gray-500 hover:text-gray-800 cursor-pointer" type="button" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Grid Stiker QR */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded border border-gray-200">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
              <Loader2 className="animate-spin" size={20} />
              <p>Memproses stiker QR...</p>
            </div>
          ) : qrList.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {qrList.map(({ item, dataUrl }) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-300 rounded p-2 flex flex-col items-center text-center page-break-inside-avoid"
                >
                  <div className="w-full flex items-center justify-between border-b border-gray-100 pb-1 mb-1 text-[10px]">
                    <span className="font-bold text-gray-800">ARFF YIA</span>
                    <span className="text-gray-500">Zona {item.zona}</span>
                  </div>
                  <img src={dataUrl} alt={`QR ${item.kodeItem}`} className="h-24 w-24 object-contain" />
                  <p className="mt-1 font-mono text-[11px] font-bold text-gray-900">{item.kodeItem}</p>
                  <p className="text-[10px] text-gray-600 truncate max-w-[130px]">{item.namaItem}</p>
                  <p className="text-[9px] text-gray-400 truncate max-w-[130px]">{item.lokasi}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-gray-400">Tidak ada equipment di zona ini.</p>
          )}
        </div>
      </section>
    </div>
  );
}
