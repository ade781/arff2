import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowRight, Clock, History, Loader2 } from 'lucide-react';
import { itemService } from '../../api/itemService';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import InlineQrScanner from '../../components/scanner/InlineQrScanner';
import QuickInspectionModal from '../../components/inspection/QuickInspectionModal';
import StatusBadge from '../../components/common/StatusBadge';
import TypeBadge from '../../components/common/TypeBadge';
import ZoneBadge from '../../components/common/ZoneBadge';

export default function PetugasScanPage() {
  const { history, loadHistory, setNotice } = useOutletContext();
  const navigate = useNavigate();
  const [scannedItem, setScannedItem] = useState(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  async function handleDetectedQr(rawCode) {
    if (!rawCode || loadingLookup) return;

    setLoadingLookup(true);
    setNotice(null);

    const cleanKode = rawCode.trim();

    try {
      const data = await itemService.getItemByQr(cleanKode);
      setScannedItem(data);
    } catch (err) {
      setScannedItem(null);
      setNotice({
        type: 'error',
        message: `Equipment '${cleanKode}' tidak ditemukan. Pastikan kode valid.`,
      });
    } finally {
      setLoadingLookup(false);
    }
  }

  async function handleInspectionSubmit(payload, fotoFile) {
    if (!scannedItem) return;

    setLoadingSubmit(true);
    setNotice(null);

    try {
      const target = scannedItem.item || scannedItem;
      await laporanAnggotaService.submitLaporan(
        {
          idItem: target.id,
          kodeQr: target.kodeItem,
          ...payload,
        },
        fotoFile
      );

      setNotice({
        type: 'success',
        message: `Pemeriksaan ${target.kodeItem} berhasil disimpan!`,
      });
      setScannedItem(null);
      await loadHistory();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="space-y-4">

      <QuickInspectionModal
        item={scannedItem}
        onSubmit={handleInspectionSubmit}
        onClose={() => setScannedItem(null)}
        loading={loadingSubmit}
      />

      <section className="space-y-1.5">
        <InlineQrScanner
          onDetected={handleDetectedQr}
          disabled={Boolean(scannedItem) || loadingLookup}
        />
        {loadingLookup && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-blue-600 bg-blue-50 rounded border border-blue-200">
            <Loader2 className="animate-spin" size={14} />
            <span>Mencari data equipment...</span>
          </div>
        )}
      </section>

      <section className="card p-3.5 space-y-3 bg-white border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5">
            <History size={14} className="text-gray-600" />
            <h2 className="text-xs font-bold uppercase text-gray-800">
              Pemeriksaan Terkini
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/petugas/riwayat')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {history.length > 0 ? (
            history.slice(0, 3).map((lap) => {
              const item = lap.item || {};
              const tone =
                lap.status === 'baik' ? 'good' : lap.status === 'rusak' ? 'bad' : 'warn';

              return (
                <div
                  key={lap.id}
                  className="rounded border border-gray-200 p-2.5 text-xs space-y-1 bg-white hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span className="font-mono">
                          {item.kodeItem || `Item #${lap.idItem}`}
                        </span>
                        {item.zona ? <ZoneBadge zone={item.zona} /> : null}
                        {item.jenis ? <TypeBadge type={item.jenis} /> : null}
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium truncate max-w-[200px] mt-0.5">
                        {item.namaItem || 'Equipment ARFF'}
                      </p>
                    </div>

                    <StatusBadge tone={tone}>{lap.status}</StatusBadge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(lap.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {lap.keterangan && (
                      <span className="text-gray-500 truncate max-w-[140px]" title={lap.keterangan}>
                        {lap.keterangan}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-5 text-gray-400 text-xs space-y-1">
              <Clock size={18} className="mx-auto text-gray-300" />
              <p>Belum ada riwayat pemeriksaan.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
