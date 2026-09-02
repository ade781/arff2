import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, Zap, ZapOff, QrCode } from 'lucide-react';

export default function InlineQrScanner({ onDetected, disabled }) {
  const [scannerActive, setScannerActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

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
            'Browser memerlukan akses HTTPS untuk membuka kamera. Akses via https://'
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
              if (navigator.vibrate) {
                try {
                  navigator.vibrate(60);
                } catch (e) {}
              }
              onDetected(decodedText);
            }
          },
          () => {}
        );

        if (mounted) {
          setIsScanning(true);
          try {
            const capabilities = scannerInstance.getRunningTrackCapabilities();
            if (capabilities && 'torch' in capabilities) {
              setTorchSupported(true);
            }
          } catch (e) {
            setTorchSupported(false);
          }
        }
      } catch (err) {
        if (mounted) {
          console.warn('Camera start error:', err);
          setErrorMsg(
            'Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan di browser.'
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

  async function toggleTorch() {
    if (!html5QrCodeRef.current || !torchSupported) return;
    try {
      const nextTorch = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  }

  return (
    <div className="card p-3 space-y-2.5 bg-white border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <QrCode size={15} className="text-gray-700" />
          <div>
            <h2 className="text-xs font-semibold text-gray-900">Pemindai QR Fisik</h2>
            <p className="text-[11px] text-gray-500">Wajib scan stiker di lokasi fisik</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {torchSupported && isScanning && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-1.5 rounded text-xs border transition cursor-pointer ${
                torchOn
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
              title="Senter"
            >
              {torchOn ? <Zap size={13} className="fill-current text-amber-600" /> : <ZapOff size={13} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setScannerActive((prev) => !prev)}
            className="p-1.5 rounded text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            title={scannerActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          >
            {scannerActive ? <Camera size={13} /> : <CameraOff size={13} />}
          </button>
        </div>
      </div>

      <div className="relative bg-gray-950 rounded-lg border border-gray-300 flex items-center justify-center min-h-[250px] max-h-[300px] overflow-hidden">
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {/* Simple Corner Guide */}
        {scannerActive && !errorMsg && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br" />
            </div>
            <p className="mt-2 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded font-medium">
              Arahkan ke stiker QR fisik di APAR / Hydrant
            </p>
          </div>
        )}

        {(!scannerActive || errorMsg) && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
            <CameraOff size={24} className="text-gray-400" />
            <p className="text-xs text-gray-700 max-w-[260px] leading-relaxed">
              {errorMsg || 'Kamera sedang dinonaktifkan.'}
            </p>
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
    </div>
  );
}
