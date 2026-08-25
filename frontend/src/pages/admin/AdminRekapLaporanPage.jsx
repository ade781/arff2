import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Layers, Loader2, Printer } from 'lucide-react';
import {
  ZONA_CONFIG,
  RekapZonaTabs,
  RekapStatsCards,
  RekapFilterToolbar,
  RekapSymbolLegend,
  RekapSignatureBlock,
} from './rekap-laporan/rekapComponents';
import { useRekapZonaData } from './rekap-laporan/useRekapZonaData';
import RekapInspectionTable from './rekap-laporan/RekapInspectionTable';
import { exportZonaInspectionToExcel } from '../../utils/excelExporter';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';

const BULAN_NAMES = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

function getCurrentBulanTahun() {
  const now = new Date();
  return `${BULAN_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function getPreviousBulanTahun() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${BULAN_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;
}

export default function AdminRekapLaporanPage() {
  const { items = [], loadingItems } = useOutletContext();

  const [activeZona, setActiveZona] = useState('1');
  const [selectedBulan, setSelectedBulan] = useState(getCurrentBulanTahun);
  const [selectedRegu, setSelectedRegu] = useState('Regu Delta');
  const [filterGedung, setFilterGedung] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const cfg = ZONA_CONFIG.find((z) => z.id === activeZona);
    if (cfg) setSelectedRegu(cfg.regu);
    setFilterGedung('');
  }, [activeZona]);

  const {
    loadingLaporan,
    laporanMap,
    zonaItems,
    gedungList,
    groupedData,
    stats,
  } = useRekapZonaData({
    items,
    activeZona,
    filterGedung,
    filterKondisi,
    searchTerm,
  });

  async function handleExportExcel() {
    setExporting(true);
    try {
      const blob = await laporanAnggotaService.exportExcelZona({
        zona: activeZona,
        bulanTahun: selectedBulan,
        bulanLalu: getPreviousBulanTahun(),
        regu: selectedRegu,
      });

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const cleanBulan = selectedBulan.replace(/\s+/g, '_');
      link.setAttribute('download', `REKAP_INSPEKSI_ARFF_ZONA_${activeZona}_${cleanBulan}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.warn('Backend exporter error, fallback to client-side generator:', err);
      exportZonaInspectionToExcel({
        zona: activeZona,
        bulanTahun: selectedBulan,
        regu: selectedRegu,
        items: zonaItems,
        laporanMap,
      });
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const tglFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 no-print">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <Layers className="text-blue-600" size={18} />
            Rekap Laporan Inspeksi Zona (Format Standar ARFF)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar laporan resmi pemeriksaan APAR & Fire Hydrant Bandara Internasional Yogyakarta
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loadingLaporan || loadingItems || exporting ? (
            <Loader2 className="animate-spin text-gray-400" size={16} />
          ) : null}

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="h-8.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>{exporting ? 'Menyiapkan...' : 'Unduh Excel (.xlsx)'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-8.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3.5 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      <RekapZonaTabs
        items={items}
        activeZona={activeZona}
        onSelectZona={(z) => {
          setActiveZona(z);
          setFilterGedung('');
        }}
      />

      <RekapStatsCards
        stats={stats}
        activeZona={activeZona}
        selectedBulan={selectedBulan}
      />

      <RekapFilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedBulan={selectedBulan}
        setSelectedBulan={setSelectedBulan}
        selectedRegu={selectedRegu}
        setSelectedRegu={setSelectedRegu}
        filterGedung={filterGedung}
        setFilterGedung={setFilterGedung}
        filterKondisi={filterKondisi}
        setFilterKondisi={setFilterKondisi}
        gedungList={gedungList}
      />

      <section className="card p-5 bg-white border border-gray-200 shadow-sm space-y-4">
        <RekapInspectionTable
          groupedData={groupedData}
          laporanMap={laporanMap}
          activeZona={activeZona}
          selectedBulan={selectedBulan}
          selectedRegu={selectedRegu}
        />

        <RekapSymbolLegend />

        <RekapSignatureBlock
          selectedRegu={selectedRegu}
          tglFormatted={tglFormatted}
        />

        <div className="border-t border-gray-300 pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400">
          <span>Airport Rescue and Fire Fighting (ARFF) - Yogyakarta International Airport</span>
          <span>Dokumen Resmi Rekapitulasi Laporan Inspeksi Zona {activeZona}</span>
        </div>
      </section>
    </div>
  );
}
