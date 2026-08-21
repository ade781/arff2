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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section id="printable-qr-modal" className="card w-full max-w-sm p-4 space-y-3 bg-white">
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono font-semibold text-gray-500">{kode}</span>
            <h2 className="text-sm font-bold text-gray-900">{nama}</h2>
          </div>
          <button className="text-gray-500 hover:text-gray-800 cursor-pointer" type="button" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded p-4">
          <img className="h-48 w-48 rounded" src={qrData.qrCodeDataUrl} alt="QR Code" />
          <p className="mt-2 text-xs font-mono font-medium text-gray-800">{qrData.qrPayload || `ARFF-YIA:${kode}`}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {jenis?.toUpperCase()} | Zona {zona} - {lokasi}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            className="h-8 inline-flex items-center justify-center gap-1.5 rounded border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            type="button"
            onClick={handlePrint}
          >
            <Printer size={13} /> Cetak
          </button>
          <a
            className="h-8 inline-flex items-center justify-center gap-1.5 rounded bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
            href={qrData.qrCodeDataUrl}
            download={`${kode || 'QR'}.png`}
          >
            <Download size={13} /> Unduh
          </a>
        </div>
      </section>
    </div>
  );
}
