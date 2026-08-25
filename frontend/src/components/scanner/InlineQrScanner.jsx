import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Image as ImageIcon, Loader2, RefreshCw, Search } from 'lucide-react';

export default function InlineQrScanner({ onDetected, disabled }) {
  const [scannerActive, setScannerActive] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loadingFileScan, setLoadingFileScan] = useState(false);
  const fileInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'inline-qr-reader';

  useEffect(() => {
    let mounted = true;
    let scannerInstance = null;

    async function startCamera() {
      if (!scannerActive || disabled) return;
      setErrorMsg('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mounted) {
          setErrorMsg(
            'Browser memblokir kamera karena koneksi HTTP (bukan HTTPS). Gunakan URL https:// atau tombol Ambil Foto QR di bawah.'
          );
          setIsScanning(false);
        }
        return;
      }

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
          console.warn('Camera start error:', err);
          setErrorMsg(
            'Kamera tidak dapat diakses atau izin belum diberikan. Pastikan izin kamera aktif.'
          );
          setIsScanning(false);
        }
      }
    }

    const timer = setTimeout(() => {
      startCamera();
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timer);
      const instance = scannerInstance || html5QrCodeRef.current;
      if (instance && instance.isScanning) {
        instance
          .stop()
          .catch(() => {})
          .then(() => {
            try {
              instance.clear();
            } catch (e) {}
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

  async function handleFileScan(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingFileScan(true);
    setErrorMsg('');

    try {
      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(scannerContainerId);
      }
      const decodedText = await scanner.scanFile(file, true);
      onDetected(decodedText);
    } catch (err) {
      setErrorMsg('QR code tidak terbaca dari foto. Coba foto lebih dekat atau ketik manual.');
    } finally {
      setLoadingFileScan(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="card p-3 space-y-3 bg-white border border-gray-200 shadow-xs">

      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-800">Pemindai QR Equipment</h2>
          <p className="text-[11px] text-gray-500">Arahkan kamera ke stiker QR code</p>
        </div>

        <button
          type="button"
          onClick={() => setScannerActive((prev) => !prev)}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer border border-gray-300 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition"
        >
          {scannerActive ? <Camera size={13} /> : <CameraOff size={13} />}
          <span>{scannerActive ? 'Matikan' : 'Nyalakan'}</span>
        </button>
      </div>

      <div className="relative bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center min-h-[250px] max-h-[300px] overflow-hidden">
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {(!scannerActive || errorMsg) && (
          <div className="absolute inset-0 bg-gray-50/95 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
            <CameraOff size={28} className="text-gray-400" />
            <p className="text-xs text-gray-700 max-w-[260px] leading-relaxed">
              {errorMsg || 'Kamera sedang dinonaktifkan.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setScannerActive(true);
                }}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium cursor-pointer shadow-xs"
              >
                <RefreshCw size={12} /> Coba Buka Kamera
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingFileScan}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
              >
                {loadingFileScan ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <ImageIcon size={12} />
                )}
                <span>Ambil Foto QR</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileScan}
        className="hidden"
      />

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
