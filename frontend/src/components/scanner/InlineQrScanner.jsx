import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, Search } from 'lucide-react';

export default function InlineQrScanner({ onDetected, disabled }) {
  const [scannerActive, setScannerActive] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'inline-qr-reader';

  useEffect(() => {
    let mounted = true;
    let scannerInstance = null;

    async function startCamera() {
      if (!scannerActive || disabled) return;
      setErrorMsg('');

      try {
        const element = document.getElementById(scannerContainerId);
        if (!element) return;

        scannerInstance = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = scannerInstance;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.75);
            return {
              width: Math.max(180, Math.min(240, qrboxSize)),
              height: Math.max(180, Math.min(240, qrboxSize)),
            };
          },
          aspectRatio: 1.0,
        };

        await scannerInstance.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (mounted) {
              onDetected(decodedText);
            }
          },
          () => {}
        );

        if (mounted) setIsScanning(true);
      } catch (err) {
        if (mounted) {
          setErrorMsg('Kamera tidak aktif atau izin ditolak.');
          setIsScanning(false);
        }
      }
    }

    const timer = setTimeout(() => {
      startCamera();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance
          .stop()
          .catch(() => {})
          .then(() => {
            scannerInstance.clear();
            setIsScanning(false);
          });
      }
    };
  }, [scannerActive, disabled, onDetected]);

  function handleManualSubmit(e) {
    e.preventDefault();
    const clean = manualCode.trim();
    if (clean) {
      onDetected(clean);
      setManualCode('');
    }
  }

  return (
    <div className="card p-3 space-y-3 bg-white border border-gray-200">
      {/* Header Pemindai */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-800">Pemindai QR Equipment</h2>
          <p className="text-[11px] text-gray-500">Arahkan kamera ke stiker QR code</p>
        </div>

        <button
          type="button"
          onClick={() => setScannerActive((prev) => !prev)}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer border border-gray-300 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100"
        >
          {scannerActive ? <Camera size={13} /> : <CameraOff size={13} />}
          <span>{scannerActive ? 'Matikan' : 'Nyalakan'}</span>
        </button>
      </div>

      {/* Area Kamera Viewfinder */}
      <div className="relative bg-gray-100 rounded border border-gray-300 flex items-center justify-center min-h-[240px] max-h-[300px] overflow-hidden">
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {/* Bingkai Viewfinder Sederhana */}
        {scannerActive && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="w-48 h-48 border-2 border-dashed border-white/80 rounded-lg shadow-sm" />
          </div>
        )}

        {/* Fallback Jika Kamera Mati / Error */}
        {(!scannerActive || errorMsg) && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <CameraOff size={28} className="text-gray-400" />
            <p className="text-xs text-gray-600">{errorMsg || 'Kamera sedang dinonaktifkan.'}</p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setScannerActive(true);
              }}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
            >
              <RefreshCw size={12} /> Buka Kamera
            </button>
          </div>
        )}
      </div>

      {/* Input Manual Sederhana */}
      <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
          <input
            className="field field-with-icon text-xs h-8"
            placeholder="Atau ketik kode (misal: APAR-A-001)..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={!manualCode.trim()}
          className="h-8 px-3 rounded bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium cursor-pointer disabled:opacity-40 shrink-0 transition"
        >
          Cek
        </button>
      </form>
    </div>
  );
}
