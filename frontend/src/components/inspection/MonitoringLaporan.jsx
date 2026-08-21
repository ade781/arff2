import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import ZoneBadge from '../common/ZoneBadge';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';

export default function MonitoringLaporan({ laporanAnggota, laporanNonAnggota, filters, onFiltersChange, onRefresh, loading }) {
  const [subTab, setSubTab] = useState('anggota');
  const [expandedId, setExpandedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  function updateFilter(field, value) {
    onFiltersChange({ ...filters, [field]: value });
  }

  function resetFilters() {
    onFiltersChange({ status: '', tanggalMulai: '', tanggalSelesai: '' });
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      const blob = await laporanAnggotaService.exportCsv(filters);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rekap_Inspeksi_ARFF_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Gagal mengunduh file export.');
    } finally {
      setExporting(false);
    }
  }

  const isFiltered = filters.status || filters.tanggalMulai || filters.tanggalSelesai;

  return (
    <section className="card p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <h2 className="text-xs font-semibold uppercase text-gray-800">
          Histori Pemeriksaan & Aduan
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
            <button
              className={`px-2.5 py-1 font-medium cursor-pointer ${
                subTab === 'anggota' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setSubTab('anggota')}
            >
              Laporan Anggota ({laporanAnggota.length})
            </button>
            <button
              className={`px-2.5 py-1 font-medium cursor-pointer border-l border-gray-300 ${
                subTab === 'non_anggota' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setSubTab('non_anggota')}
            >
              Aduan Non-Anggota ({laporanNonAnggota.length})
            </button>
          </div>

          {subTab === 'anggota' ? (
            <button
              className="h-7.5 inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
              type="button"
              onClick={handleExportCsv}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="animate-spin" size={12} /> : <Download size={12} />}
              <span>Export CSV</span>
            </button>
          ) : null}

          <button className="icon-button" type="button" onClick={onRefresh} title="Refresh">
            {loading ? <Loader2 className="animate-spin" size={13} /> : <RefreshCcw size={13} />}
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-12 items-end">
        {subTab === 'anggota' ? (
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              className="field text-xs cursor-pointer"
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="baik">Baik</option>
              <option value="perlu_perhatian">Perlu Perhatian</option>
              <option value="rusak">Rusak</option>
            </select>
          </div>
        ) : (
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
            <div className="field text-xs text-gray-500 bg-gray-50 flex items-center">Aduan Publik</div>
          </div>
        )}

        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
          <input
            className="field text-xs"
            type="date"
            value={filters.tanggalMulai}
            onChange={(e) => updateFilter('tanggalMulai', e.target.value)}
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
          <input
            className="field text-xs"
            type="date"
            value={filters.tanggalSelesai}
            onChange={(e) => updateFilter('tanggalSelesai', e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          {isFiltered ? (
            <button
              className="h-8.5 w-full rounded border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
              type="button"
              onClick={resetFilters}
            >
              Reset Filter
            </button>
          ) : null}
        </div>
      </div>

      {subTab === 'anggota' ? (
        <div className="space-y-2">
          {laporanAnggota.length ? laporanAnggota.map((lap) => {
            const tone = lap.status === 'baik' ? 'good' : lap.status === 'rusak' ? 'bad' : 'warn';
            const isExpanded = expandedId === lap.id;

            return (
              <div key={lap.id} className="rounded border border-gray-200 p-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-gray-900">
                      <span>{lap.item?.namaItem || `Equipment #${lap.idItem}`}</span>
                      <span className="font-mono text-gray-500">[{lap.item?.kodeItem || '-'}]</span>
                      {lap.item?.zona ? <ZoneBadge zone={lap.item.zona} /> : null}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Petugas: {lap.petugas?.nama || 'Petugas'} | {new Date(lap.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <StatusBadge tone={tone}>{lap.status}</StatusBadge>

                    {lap.checklist && lap.checklist.length > 0 ? (
                      <button
                        className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : lap.id)}
                        title="Detail Checklist"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    ) : null}
                  </div>
                </div>

                {lap.keterangan ? (
                  <p className="mt-1.5 text-gray-700 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Catatan:</span> {lap.keterangan}
                  </p>
                ) : null}

                {lap.penggantian ? (
                  <p className="mt-1 text-amber-800 bg-amber-50 p-2 rounded">
                    <span className="font-medium">Penggantian:</span> {lap.penggantian}
                  </p>
                ) : null}

                {(() => {
                  const checklistArr = Array.isArray(lap.checklist)
                    ? lap.checklist
                    : typeof lap.checklist === 'string'
                    ? (() => { try { return JSON.parse(lap.checklist); } catch (e) { return []; } })()
                    : [];

                  if (isExpanded && checklistArr.length > 0) {
                    return (
                      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                        <p className="text-[11px] font-medium text-gray-600">Rincian Checklist:</p>
                        <div className="grid gap-1 sm:grid-cols-2">
                          {checklistArr.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-1.5 rounded text-[11px]">
                              <span>{item.namaItem || item.nama}</span>
                              <span className="font-medium">{item.status || 'Baik'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          }) : (
            <p className="text-center text-xs text-gray-400 py-6">Belum ada laporan pemeriksaan.</p>
          )}
        </div>
      ) : null}

      {subTab === 'non_anggota' ? (
        <div className="space-y-2">
          {laporanNonAnggota.length ? laporanNonAnggota.map((aduan) => {
            return (
              <div key={aduan.id} className="rounded border border-gray-200 p-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-gray-900">
                      <span>{aduan.item?.namaItem || `Equipment #${aduan.idItem}`}</span>
                      <span className="font-mono text-gray-500">[{aduan.item?.kodeItem || '-'}]</span>
                      {aduan.item?.zona ? <ZoneBadge zone={aduan.item.zona} /> : null}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Pelapor: {aduan.pelapor?.username || 'Non-Anggota'} {aduan.pelapor?.kontak ? `(${aduan.pelapor.kontak})` : ''} | {new Date(aduan.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <p className="mt-1.5 text-gray-700 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Kendala:</span> {aduan.keterangan}
                </p>
              </div>
            );
          }) : (
            <p className="text-center text-xs text-gray-400 py-6">Belum ada aduan non-anggota.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
