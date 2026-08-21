import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  Layers,
  Loader2,
  Printer,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { exportZonaInspectionToExcel } from '../../utils/excelExporter';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';

const ZONA_CONFIG = [
  { id: '1', label: 'Zona 1', regu: 'Regu Delta', subtitle: 'Fire Station, Crisis Center, MPH, GWT, Cargo' },
  { id: '2', label: 'Zona 2', regu: 'Regu Charlie', subtitle: 'Terminal Keberangkatan, Lantai Dasar, Mezzanine' },
  { id: '3', label: 'Zona 3', regu: 'Regu Alpha', subtitle: 'Terminal, Gedung Parkir, Mezzanine, Basement' },
  { id: '4', label: 'Zona 4', regu: 'Regu Bravo', subtitle: 'Admin, BMKG, Toll Gate, Kendaraan, Sub FS' },
];

const MONTH_OPTIONS = [
  { value: 'AGUSTUS 2026', label: 'Agustus 2026 (Bulan Berjalan)' },
  { value: 'JULI 2026', label: 'Juli 2026' },
  { value: 'JUNI 2026', label: 'Juni 2026' },
  { value: 'MEI 2026', label: 'Mei 2026' },
];

export default function AdminRekapLaporanPage() {
  const { items = [], loadingItems } = useOutletContext();

  const [activeZona, setActiveZona] = useState('1');
  const [selectedBulan, setSelectedBulan] = useState('AGUSTUS 2026');
  const [selectedRegu, setSelectedRegu] = useState('Regu Delta');
  const [filterGedung, setFilterGedung] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  // Laporan inspeksi riil dari database
  const [laporanList, setLaporanList] = useState([]);
  const [loadingLaporan, setLoadingLaporan] = useState(false);

  // Sync regu default saat zona berganti
  useEffect(() => {
    const cfg = ZONA_CONFIG.find((z) => z.id === activeZona);
    if (cfg) setSelectedRegu(cfg.regu);
  }, [activeZona]);

  // Load all laporan from database
  useEffect(() => {
    async function fetchLaporan() {
      setLoadingLaporan(true);
      try {
        const data = await laporanAnggotaService.getAllLaporan({ limit: 'all' });
        setLaporanList(data || []);
      } catch (err) {
        console.error('Gagal memuat data laporan:', err);
      } finally {
        setLoadingLaporan(false);
      }
    }
    fetchLaporan();
  }, []);

  // Map laporan by kodeItem for rapid lookup
  const laporanMap = useMemo(() => {
    const map = {};
    laporanList.forEach((lap) => {
      const code = lap.item?.kodeItem || lap.equipment?.kodeItem || lap.equipment?.kodeEquipment;
      if (code && !map[code]) {
        map[code] = lap;
      }
    });
    return map;
  }, [laporanList]);

  // Items untuk Zona aktif
  const zonaItems = useMemo(() => {
    return items.filter((it) => String(it.zona) === String(activeZona));
  }, [items, activeZona]);

  // List gedung unik di Zona aktif
  const gedungList = useMemo(() => {
    const set = new Set();
    zonaItems.forEach((it) => {
      if (it.gedung) set.add(it.gedung);
    });
    return Array.from(set).sort();
  }, [zonaItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return zonaItems.filter((item) => {
      const matchGedung = !filterGedung || item.gedung === filterGedung;
      const matchSearch =
        !searchTerm ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gedung?.toLowerCase().includes(searchTerm.toLowerCase());

      const lap = laporanMap[item.kodeItem];
      let matchKondisi = true;
      if (filterKondisi === 'inspected') {
        matchKondisi = Boolean(lap);
      } else if (filterKondisi === 'uninspected') {
        matchKondisi = !lap;
      } else if (filterKondisi === 'problem') {
        matchKondisi = lap && (lap.status === 'perlu_perhatian' || lap.status === 'rusak');
      }

      return matchGedung && matchSearch && matchKondisi;
    });
  }, [zonaItems, filterGedung, searchTerm, filterKondisi, laporanMap]);

  // Kelompokkan equipment per Gedung -> Lantai
  const groupedData = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const g = item.gedung || 'Lainnya';
      const l = item.lantai || 'Lantai 1';

      if (!groups[g]) groups[g] = {};
      if (!groups[g][l]) groups[g][l] = [];
      groups[g][l].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Statistik Zona Aktif
  const stats = useMemo(() => {
    let inspectedCount = 0;
    let problemCount = 0;
    let readyCount = 0;

    zonaItems.forEach((item) => {
      const lap = laporanMap[item.kodeItem];
      if (lap) {
        inspectedCount++;
        if (lap.status === 'rusak' || lap.status === 'perlu_perhatian') {
          problemCount++;
        } else {
          readyCount++;
        }
      }
    });

    return {
      total: zonaItems.length,
      inspected: inspectedCount,
      ready: readyCount,
      problem: problemCount,
      percentage: zonaItems.length ? Math.round((inspectedCount / zonaItems.length) * 100) : 0,
    };
  }, [zonaItems, laporanMap]);

  // Ekspor ke Excel (.xlsx) presisi dengan engine High-Fidelity
  async function handleExportExcel() {
    setExporting(true);
    try {
      const blob = await laporanAnggotaService.exportExcelZona({
        zona: activeZona,
        bulanTahun: selectedBulan,
        bulanLalu: selectedBulan.startsWith('AGUSTUS') ? 'JULI 2026' : 'BULAN LALU',
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

  // Cetak Lembar Rekap
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
      {/* ========================================================================= */}
      {/* HEADER UTAMA HALAMAN REKAP LAPORAN                                        */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* TAB PEMILIH ZONA 1 - 4                                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 no-print">
        {ZONA_CONFIG.map((z) => {
          const isActive = activeZona === z.id;
          const count = items.filter((it) => String(it.zona) === String(z.id)).length;

          return (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                setActiveZona(z.id);
                setFilterGedung('');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                isActive
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                  {z.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {count} Unit
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 truncate" title={z.subtitle}>
                {z.subtitle}
              </p>
              <p className="text-[10px] font-semibold text-gray-600 mt-0.5">{z.regu}</p>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* METRIC CARDS RINGKASAN ZONA                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="card p-3 bg-white border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Titik Equipment</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
          <p className="text-[10px] text-gray-400">Terdaftar di Zona {activeZona}</p>
        </div>

        <div className="card p-3 bg-white border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase">Sudah Diinspeksi</p>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">
            {stats.inspected}{' '}
            <span className="text-xs font-normal text-gray-500">({stats.percentage}%)</span>
          </p>
          <p className="text-[10px] text-gray-400">Periode {selectedBulan}</p>
        </div>

        <div className="card p-3 bg-white border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-600 uppercase">Kondisi Siap Operasi</p>
          <p className="text-xl font-bold text-blue-700 mt-0.5">{stats.ready}</p>
          <p className="text-[10px] text-gray-400">Lengkap & berfungsi normal</p>
        </div>

        <div className="card p-3 bg-white border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase">Temuan / Rusak</p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">{stats.problem}</p>
          <p className="text-[10px] text-gray-400">Perlu tindak lanjut / penggantian</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOOLBAR FILTER & PENCARIAN                                                */}
      {/* ========================================================================= */}
      <div className="card p-3.5 bg-white border border-gray-200 shadow-xs space-y-2.5 no-print">
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-12 text-xs">
          {/* Search */}
          <div className="relative sm:col-span-4 flex items-center">
            <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={13} />
            <input
              className="field field-with-icon text-xs h-8.5 w-full"
              placeholder="Cari kode nomor zona, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Bulan */}
          <div className="sm:col-span-3">
            <select
              className="field text-xs h-8.5 cursor-pointer font-medium"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Gedung */}
          <div className="sm:col-span-3">
            <select
              className="field text-xs h-8.5 cursor-pointer"
              value={filterGedung}
              onChange={(e) => setFilterGedung(e.target.value)}
            >
              <option value="">Semua Gedung / Sheet</option>
              {gedungList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="sm:col-span-2">
            <select
              className="field text-xs h-8.5 cursor-pointer"
              value={filterKondisi}
              onChange={(e) => setFilterKondisi(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="inspected">Sudah Diperiksa</option>
              <option value="uninspected">Belum Diperiksa</option>
              <option value="problem">Ada Temuan / Rusak</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEMBAR REKAP TABEL (FORMAT PERSIS STANDAR EXCEL ASLI ARFF)                */}
      {/* ========================================================================= */}
      <section className="card p-5 bg-white border border-gray-200 shadow-sm space-y-4">
        {/* Header Lembar Format Resmi */}
        <div className="border-b-2 border-gray-900 pb-3 text-center space-y-0.5">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            YOGYAKARTA INTERNATIONAL AIRPORT
          </p>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-gray-900">
            DAFTAR INSPEKSI APAR & FIRE HYDRANT ZONA {activeZona}
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-700 pt-1">
            <span>PERIODE: {selectedBulan}</span>
            <span>•</span>
            <span className="text-blue-700">{selectedRegu.toUpperCase()}</span>
          </div>
        </div>

        {/* Tabel Data Berkelompok per Gedung & Lantai */}
        <div className="overflow-x-auto rounded border border-gray-300">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-gray-100 border-b-2 border-gray-300 text-gray-800 font-bold uppercase text-[10.5px]">
              <tr>
                <th className="px-2.5 py-2 text-center border-r border-gray-300 w-10">NO</th>
                <th className="px-2.5 py-2 border-r border-gray-300 whitespace-nowrap">NOMOR ZONA</th>
                <th className="px-3 py-2 border-r border-gray-300">LOKASI</th>
                <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap">JENIS APAR</th>
                <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap">UKURAN (Kg)</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center w-12">JUMLAH</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center whitespace-nowrap">IHB</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center whitespace-nowrap">OHB</th>
                <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap bg-gray-50">
                  KONDISI LALU
                </th>
                <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap bg-blue-50 text-blue-900">
                  KONDISI BERJALAN
                </th>
                <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap">
                  TGL INSPEKSI
                </th>
                <th className="px-2.5 py-2 border-r border-gray-300 whitespace-nowrap">NAMA PEMERIKSA</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center whitespace-nowrap">PARAF</th>
                <th className="px-3 py-2">KETERANGAN</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white text-[11px]">
              {Object.keys(groupedData).length > 0 ? (
                Object.keys(groupedData).map((gedungName) => {
                  const lantaiObj = groupedData[gedungName];
                  let rowCounter = 1;

                  return (
                    <React.Fragment key={gedungName}>
                      {Object.keys(lantaiObj).map((lantaiName) => {
                        const itemsInLantai = lantaiObj[lantaiName];

                        return (
                          <React.Fragment key={`${gedungName}-${lantaiName}`}>
                            {/* Baris Sub-Header Gedung & Lantai */}
                            <tr className="bg-slate-100 font-bold text-gray-900 border-y border-gray-300">
                              <td colSpan={14} className="px-3 py-1.5 tracking-wide text-xs">
                                🏢 {gedungName.toUpperCase()} — ( {lantaiName.toUpperCase()} )
                              </td>
                            </tr>

                            {/* Baris Equipment */}
                            {itemsInLantai.map((item) => {
                              const lap = laporanMap[item.kodeItem] || null;
                              const isApar = item.jenis === 'apar';
                              const isIhb =
                                !isApar &&
                                (item.tipeHydrant === 'IHB' || item.namaItem?.includes('IHB'));
                              const isOhb =
                                !isApar &&
                                (item.tipeHydrant === 'OHB' || item.namaItem?.includes('OHB'));

                              // Kondisi Bulan Berjalan
                              let badgeClass = 'text-gray-600 bg-gray-100';
                              let kondisiText = 'Siap Operasi';

                              if (lap) {
                                if (lap.status === 'rusak') {
                                  badgeClass = 'bg-red-100 text-red-800 font-bold border border-red-200';
                                  kondisiText = 'Rusak';
                                } else if (lap.status === 'perlu_perhatian') {
                                  badgeClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-200';
                                  kondisiText = 'Baik dengan catatan';
                                } else {
                                  badgeClass = 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200';
                                  kondisiText = isApar ? 'Siap Operasi' : 'Lengkap 1';
                                }
                              } else {
                                badgeClass = 'bg-gray-100 text-gray-500';
                                kondisiText = isApar ? 'Siap Operasi' : 'Lengkap 1';
                              }

                              return (
                                <tr key={item.id} className="hover:bg-blue-50/40 transition">
                                  <td className="px-2.5 py-1.5 text-center font-mono text-gray-500 border-r border-gray-200">
                                    {rowCounter++}
                                  </td>
                                  <td className="px-2.5 py-1.5 font-mono font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                    {item.kodeItem}
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800 border-r border-gray-200 max-w-[220px] truncate" title={item.lokasi}>
                                    {item.lokasi}
                                  </td>
                                  <td className="px-2.5 py-1.5 text-center font-semibold text-gray-700 border-r border-gray-200">
                                    {isApar ? item.tipeMedia || 'DCP' : '-'}
                                  </td>
                                  <td className="px-2.5 py-1.5 text-center text-gray-700 border-r border-gray-200">
                                    {isApar ? item.ukuran || '-' : '-'}
                                  </td>
                                  <td className="px-2 py-1.5 text-center font-mono border-r border-gray-200">
                                    {item.jumlah || 1}
                                  </td>
                                  <td className="px-2 py-1.5 text-center font-bold border-r border-gray-200">
                                    {isIhb ? <span className="text-blue-700">v</span> : '-'}
                                  </td>
                                  <td className="px-2 py-1.5 text-center font-bold border-r border-gray-200">
                                    {isOhb ? <span className="text-blue-700">v</span> : '-'}
                                  </td>
                                  <td className="px-2.5 py-1.5 text-center text-gray-600 border-r border-gray-200 bg-gray-50/50">
                                    {isApar ? 'Siap Operasi' : 'Lengkap 1'}
                                  </td>
                                  <td className="px-2.5 py-1.5 text-center border-r border-gray-200">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badgeClass}`}>
                                      {kondisiText}
                                    </span>
                                  </td>
                                  <td className="px-2.5 py-1.5 text-center text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                    {lap?.createdAt
                                      ? new Date(lap.createdAt).toLocaleDateString('id-ID')
                                      : '-'}
                                  </td>
                                  <td className="px-2.5 py-1.5 text-gray-800 font-medium border-r border-gray-200 whitespace-nowrap">
                                    {lap?.petugas?.nama || '-'}
                                  </td>
                                  <td className="px-2 py-1.5 text-center border-r border-gray-200">
                                    {lap ? (
                                      <span className="text-emerald-700 font-bold text-[10px]">✓</span>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-600 max-w-[200px] truncate" title={lap?.keterangan || item.detailLokasi || ''}>
                                    {lap?.keterangan || item.detailLokasi || '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data equipment di Zona {activeZona} yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* LEGENDA SIMBOL KONDISI (STANDAR ARFF YIA)                                  */}
        {/* ========================================================================= */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] space-y-1 text-gray-700">
          <p className="font-bold text-gray-900 mb-1">KETERANGAN SIMBOL KONDISI :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
            <p><strong className="font-mono text-emerald-700">v</strong> : Siap Operasi ( semuanya lengkap )</p>
            <p><strong className="font-mono text-amber-700">B</strong> : Baik dengan catatan ( bagian peralatan kurang / tidak lengkap & kolom keterangan wajib diisi )</p>
            <p><strong className="font-mono text-blue-700">L</strong> : Low Pressure ( kondisi tekanan kurang dari standar & kolom keterangan wajib diisi )</p>
            <p><strong className="font-mono text-red-700">X</strong> : Rusak ( kolom keterangan wajib diisi )</p>
            <p><strong className="font-mono text-indigo-700">P</strong> : Lengkap 1 ( ada selang & nozzle )</p>
            <p><strong className="font-mono text-purple-700">O</strong> : Lengkap 2 ( ada selang, nozzle & kunci hydrant )</p>
            <p><strong className="font-mono text-gray-500">–</strong> : Kosong / tidak ada / tidak diketahui ( kolom keterangan wajib diisi )</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOK TANDA TANGAN RESMI PENGESAHAN                                        */}
        {/* ========================================================================= */}
        <div className="pt-4 pb-2 text-xs text-gray-900 border-t border-gray-200">
          <div className="flex justify-end mb-2">
            <p className="font-medium text-gray-700">Kulon Progo, {tglFormatted}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center pt-2">
            <div className="space-y-1">
              <p className="font-semibold text-gray-600">Mengetahui,</p>
              <p className="font-bold text-gray-900">TEAM LEADER ARFF YIA</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-gray-300 italic">[ Tanda Tangan & Cap ]</span>
              </div>
              <p className="font-bold text-gray-900">( .................................................... )</p>
              <p className="text-[11px] text-gray-500">NIP. .................................................</p>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-gray-600">Petugas Pemeriksa Lapangan,</p>
              <p className="font-bold text-gray-900">{selectedRegu.toUpperCase()}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-gray-300 italic">[ Tanda Tangan ]</span>
              </div>
              <p className="font-bold text-gray-900">( .................................................... )</p>
              <p className="text-[11px] text-gray-500">NIP. .................................................</p>
            </div>
          </div>
        </div>

        {/* Footer Dokumen */}
        <div className="border-t border-gray-300 pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400">
          <span>Airport Rescue and Fire Fighting (ARFF) - Yogyakarta International Airport</span>
          <span>Dokumen Resmi Rekapitulasi Laporan Inspeksi Zona {activeZona}</span>
        </div>
      </section>
    </div>
  );
}
