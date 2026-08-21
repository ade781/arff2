import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * Hook untuk men-generate dan meng-cache QR Code Data URL beresolusi tinggi secara asinkron
 */
export function useQrGeneratorCache(items = []) {
  const [qrCache, setQrCache] = useState({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function generateQrs() {
      setGenerating(true);
      const newCache = { ...qrCache };
      let updated = false;

      for (const item of items) {
        if (!newCache[item.kodeItem]) {
          try {
            const payload = `ARFF-YIA:${item.kodeItem}`;
            const dataUrl = await QRCode.toDataURL(payload, {
              width: 360,
              margin: 1,
              errorCorrectionLevel: 'M',
            });
            newCache[item.kodeItem] = dataUrl;
            updated = true;
          } catch (err) {
            console.error(`Gagal membuat QR untuk ${item.kodeItem}:`, err);
          }
        }
      }

      if (mounted) {
        if (updated) setQrCache(newCache);
        setGenerating(false);
      }
    }

    if (items.length > 0) {
      generateQrs();
    }
  }, [items]);

  return { qrCache, generating };
}
