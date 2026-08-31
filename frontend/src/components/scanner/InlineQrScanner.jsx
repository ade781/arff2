import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

export default function InlineQrScanner({ onDetected, disabled }) {
  const [scannerActive, setScannerActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'inline-qr-reader';
  const disabledRef = useRef(disabled);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    let mounted = true;
    let scannerInstance = null;

    async function startCamera() {
      if (!scannerActive || disabled) return;
      setErrorMsg('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mounted) {
          setErrorMsg(
            'Browser memblokir kamera karena koneksi HTTP (bukan HTTPS). Gunakan URL https:// untuk mengizinkan akses kamera langsung.'
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
            if (mounted && !disabledRef.current) {
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
            'Kamera tidak dapat diakses atau izin belum diberikan. Pastikan izin kamera telah diizinkan pada browser.'
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

  return (
    <div className="card p-3 space-y-3 bg-white border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-800">Pemindai QR Equipment Langsung</h2>
          <p className="text-[11px] text-gray-500">Arahkan kamera langsung ke stiker QR fisik di lokasi</p>
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

      <div className="relative bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center min-h-[260px] max-h-[320px] overflow-hidden">
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {(!scannerActive || errorMsg) && (
          <div className="absolute inset-0 bg-gray-50/95 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
            <CameraOff size={28} className="text-gray-400" />
            <p className="text-xs text-gray-700 max-w-[280px] leading-relaxed">
              {errorMsg || 'Kamera sedang dinonaktifkan.'}
            </p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setScannerActive(true);
                }}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium cursor-pointer shadow-xs"
              >
                <RefreshCw size={12} /> Coba Buka Kamera Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
