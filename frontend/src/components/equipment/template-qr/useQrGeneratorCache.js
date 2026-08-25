import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function useQrGeneratorCache(items = []) {
  const [qrCache, setQrCache] = useState({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function generateQrs() {
      const missingItems = items.filter((it) => it?.kodeItem && !qrCache[it.kodeItem]);
      if (missingItems.length === 0) return;

      setGenerating(true);
      const generated = {};

      for (const item of missingItems) {
        if (!mounted) break;
        try {
          const payload = `ARFF-YIA:${item.kodeItem}`;
          generated[item.kodeItem] = await QRCode.toDataURL(payload, {
            width: 360,
            margin: 1,
            errorCorrectionLevel: 'M',
          });
        } catch (err) {
          console.error(`Gagal membuat QR untuk ${item.kodeItem}:`, err);
        }
      }

      if (mounted) {
        setQrCache((prev) => ({ ...prev, ...generated }));
        setGenerating(false);
      }
    }

    if (items.length > 0) {
      generateQrs();
    }

    return () => {
      mounted = false;
    };
  }, [items]);

  return { qrCache, generating };
}
