import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowRight, History, Loader2, QrCode } from 'lucide-react';
import { itemService } from '../../api/itemService';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import InlineQrScanner from '../../components/scanner/InlineQrScanner';
import QuickInspectionModal from '../../components/inspection/QuickInspectionModal';
import InspectionCard from '../../components/inspection/InspectionCard';

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
        message: `Equipment '${cleanKode}' tidak ditemukan di database. Pastikan QR valid.`,
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
        message: `Laporan pemeriksaan ${target.kodeItem} berhasil disimpan.`,
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
    <div className="space-y-3.5">

      {/* Inspection Modal */}
      <QuickInspectionModal
        item={scannedItem}
        onSubmit={handleInspectionSubmit}
        onClose={() => setScannedItem(null)}
        loading={loadingSubmit}
      />

      {/* QR Camera Scanner */}
      <section className="space-y-2">
        <InlineQrScanner
          onDetected={handleDetectedQr}
          disabled={Boolean(scannedItem) || loadingLookup}
        />

        {loadingLookup && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="animate-spin" size={14} />
            <span>Mencari data equipment...</span>
          </div>
        )}
      </section>

      {/* Recent Inspections (Last 3) */}
      <section className="card p-3 space-y-2 bg-white border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <History size={13} className="text-gray-600" />
            <h2 className="text-[11px] font-bold text-gray-800">
              Pemeriksaan Terkini
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/petugas/riwayat')}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight size={11} />
          </button>
        </div>

        <div className="space-y-1.5">
          {history.length > 0 ? (
            history.slice(0, 3).map((lap) => (
              <InspectionCard key={lap.id} lap={lap} />
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs space-y-1">
              <QrCode size={18} className="mx-auto text-gray-300 mb-0.5" />
              <p className="font-medium text-[11px] text-gray-600">Belum ada pemeriksaan hari ini.</p>
              <p className="text-[10px]">Arahkan kamera ke stiker QR untuk mulai inspeksi.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
