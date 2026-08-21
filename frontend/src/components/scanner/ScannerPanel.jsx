import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

export default function ScannerPanel({ active, onDetected, onClose }) {
  const scannerRef = useRef(null);
  const scannerId = 'qr-reader';
  const [scannerError, setScannerError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      if (!active) {
        return;
      }

      setScannerError('');
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (mounted) {
              onDetected(decodedText);
            }
          },
        );
      } catch (error) {
        setScannerError('Kamera tidak dapat diakses. Gunakan input kode QR manual.');
      }
    }

    startScanner();

    return () => {
      mounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [active, onDetected]);

  if (!active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 bg-gray-50">
          <h2 className="text-xs font-semibold text-gray-800">Scan QR Code</h2>
          <button className="text-gray-500 hover:text-gray-800 cursor-pointer" type="button" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <div id={scannerId} className="overflow-hidden rounded border border-gray-200 bg-gray-100" />
          {scannerError ? (
            <p className="text-xs text-red-600">{scannerError}</p>
          ) : null}
        </div>

        <div className="p-3 border-t border-gray-100 flex justify-end">
          <button
            className="h-8 rounded border border-gray-300 bg-white px-3 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            type="button"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
