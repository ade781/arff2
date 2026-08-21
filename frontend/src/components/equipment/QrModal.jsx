import React from 'react';
import { Download, Printer, X } from 'lucide-react';

export default function QrModal({ qrData, onClose }) {
  if (!qrData) return null;

  function handlePrint() {
    window.print();
  }

  const kode = qrData.item?.kodeItem || qrData.equipment?.kodeEquipment;
  const nama = qrData.item?.namaItem || qrData.equipment?.nama;
  const jenis = qrData.item?.jenis || qrData.equipment?.tipe;
  const zona = qrData.item?.zona || qrData.equipment?.zona;
  const lokasi = qrData.item?.lokasi || qrData.equipment?.lokasi;
  const gedung = qrData.item?.gedung || qrData.equipment?.gedung;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <section id="printable-qr-modal" className="card w-full max-w-sm p-4 space-y-3 bg-white rounded-xl shadow-xl">

        <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono font-bold text-gray-500">{kode}</span>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">{nama}</h2>
          </div>
          <button
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 cursor-pointer transition"
            type="button"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-3">
          <img
            className="h-60 w-60 object-contain rounded bg-white p-1 border border-gray-200 shadow-2xs"
            src={qrData.qrCodeDataUrl}
            alt={`QR ${kode}`}
          />
          <p className="mt-2 text-xs font-mono font-bold text-gray-900 tracking-wider">
            {qrData.qrPayload || `ARFF-YIA:${kode}`}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 text-center">
            {jenis?.toUpperCase()} | Zona {zona} {gedung ? `• ${gedung}` : ''} {lokasi ? `(${lokasi})` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            className="h-8.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition"
            type="button"
            onClick={handlePrint}
          >
            <Printer size={14} /> Cetak
          </button>
          <a
            className="h-8.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer transition"
            href={qrData.qrCodeDataUrl}
            download={`${kode || 'QR'}.png`}
          >
            <Download size={14} /> Unduh PNG
          </a>
        </div>
      </section>
    </div>
  );
}
