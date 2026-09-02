import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X, Loader2, Send, Check } from 'lucide-react';
import { TypeBadge, ZoneBadge } from '../common/Badges';
import ImageUploader from '../common/ImageUploader';

const CHECKLIST_APAR = [
  'Tabung fisik bersih & tidak berkarat',
  'Segel dan pin pengaman terpasang utuh',
  'Jarum tekanan di zona hijau aman',
  'Selang & nozzle tidak rusak/retak',
  'Akses APAR bebas hambatan',
];

const CHECKLIST_HYDRANT = [
  'Box Hydrant bersih & pintu mudah dibuka',
  'Selang (Hose) terlipat rapi & kering',
  'Nozzle & Landing Valve siap digunakan',
  'Kopling rapat & tidak bocor',
  'Kunci pembuka box tersedia',
];

export default function QuickInspectionModal({ item, onSubmit, onClose, loading }) {
  const [kondisi, setKondisi] = useState('baik');
  const [keterangan, setKeterangan] = useState('');
  const [fotoFile, setFotoFile] = useState(null);

  if (!item) return null;

  const target = item.item || item;
  const isApar = target.jenis === 'apar';
  const checklistSource = isApar ? CHECKLIST_APAR : CHECKLIST_HYDRANT;

  const [checklistState, setChecklistState] = useState(
    checklistSource.reduce((acc, curr) => ({ ...acc, [curr]: true }), {})
  );

  function toggleItem(text) {
    setChecklistState((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  }

  function setAllOk() {
    setChecklistState(checklistSource.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}));
    setKondisi('baik');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const activeChecklist = Object.keys(checklistState).filter((k) => checklistState[k]);

    await onSubmit(
      {
        status: kondisi,
        keterangan: keterangan.trim(),
        checklist: activeChecklist,
      },
      fotoFile
    );
  }

  const kondisiOptions = [
    {
      value: 'baik',
      label: 'Baik / Normal',
      desc: 'Siap digunakan',
      icon: CheckCircle2,
      activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-900',
    },
    {
      value: 'perlu_perhatian',
      label: 'Perlu Perhatian',
      desc: 'Ada catatan ringan',
      icon: AlertTriangle,
      activeClass: 'border-amber-600 bg-amber-50 text-amber-900',
    },
    {
      value: 'rusak',
      label: 'Rusak / Kritis',
      desc: 'Tidak berfungsi',
      icon: XCircle,
      activeClass: 'border-red-600 bg-red-50 text-red-900',
    },
  ];

  const [showLocationDetail, setShowLocationDetail] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="card w-full max-w-lg bg-white rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500">Hasil Scan QR Fisik</span>
            <h2 className="text-sm font-bold text-gray-900 font-mono leading-none mt-0.5">
              {target.kodeItem}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">

          {/* Target Equipment Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <p className="font-bold text-gray-900 text-xs">{target.namaItem}</p>
              <div className="flex items-center gap-1 shrink-0">
                <ZoneBadge zone={target.zona} size="xs" />
                <TypeBadge type={target.jenis} size="xs" />
              </div>
            </div>

            {/* Collapsible Location Dropdown */}
            {(target.gedung || target.lokasi || target.detailLokasi) && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowLocationDetail((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  <span>{showLocationDetail ? 'Tutup Detail Lokasi' : 'Lihat Detail Lokasi'}</span>
                  <span className="text-[11px]">{showLocationDetail ? '▴' : '▾'}</span>
                </button>

                {showLocationDetail && (
                  <div className="mt-1 p-2 rounded bg-white border border-gray-200 text-[10px] text-gray-700 space-y-0.5 animate-in fade-in duration-100">
                    {target.gedung && (
                      <p>
                        <span className="font-semibold text-gray-900">Gedung:</span> {target.gedung} {target.lantai ? `(${target.lantai})` : ''}
                      </p>
                    )}
                    {target.lokasi && (
                      <p>
                        <span className="font-semibold text-gray-900">Lokasi:</span> {target.lokasi}
                      </p>
                    )}
                    {target.detailLokasi && (
                      <p>
                        <span className="font-semibold text-gray-900">Patokan:</span> {target.detailLokasi}
                      </p>
                    )}
                    {(target.tipeMedia || target.ukuran || target.tipeHydrant) && (
                      <p className="text-gray-500">
                        <span className="font-semibold text-gray-700">Spesifikasi:</span>{' '}
                        {target.tipeMedia || ''} {target.ukuran || ''} {target.tipeHydrant ? `[${target.tipeHydrant}]` : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Condition Selector */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800">
              Kondisi Kelayakan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {kondisiOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = kondisi === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKondisi(opt.value)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                      isSelected
                        ? `${opt.activeClass} border-2 font-semibold shadow-xs`
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon size={15} />
                    <div>
                      <p className="text-xs leading-tight font-bold">{opt.label}</p>
                      <p className="text-[10px] text-gray-500">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Daftar Pemeriksaan</span>
              <button
                type="button"
                onClick={setAllOk}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Pilih Semua OK
              </button>
            </div>

            <div className="space-y-1.5">
              {checklistSource.map((text, idx) => {
                const isChecked = Boolean(checklistState[text]);
                return (
                  <label
                    key={idx}
                    onClick={() => toggleItem(text)}
                    className="flex items-center gap-2 p-1.5 rounded bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <span className="text-[11px] leading-tight">{text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">
              Catatan Temuan Lapangan <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              className="field-textarea min-h-16 text-xs"
              placeholder="Tulis catatan jika ada kendala..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* Photo Uploader */}
          <ImageUploader
            file={fotoFile}
            onFileChange={setFotoFile}
            label="Foto Bukti (Opsional)"
          />

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-9 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Batal / Scan Ulang
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
              <span>Simpan Pemeriksaan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
