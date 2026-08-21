import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X, Loader2, Send } from 'lucide-react';
import TypeBadge from '../common/TypeBadge';
import ZoneBadge from '../common/ZoneBadge';
import ImageUploader from '../common/ImageUploader';

export default function QuickInspectionModal({ item, onSubmit, onClose, loading }) {
  const [kondisi, setKondisi] = useState('baik'); // 'baik' | 'perlu_perhatian' | 'rusak'
  const [keterangan, setKeterangan] = useState('');
  const [fotoFile, setFotoFile] = useState(null);

  if (!item) return null;

  const target = item.item || item.equipment || item;

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(
      {
        status: kondisi,
        keterangan: keterangan.trim(),
      },
      fotoFile
    );
  }

  const kondisiOptions = [
    {
      value: 'baik',
      label: 'Baik / Normal',
      desc: 'Siap digunakan tanpa kendala',
      icon: CheckCircle2,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-emerald-500',
      activeBg: 'bg-emerald-600 text-white',
    },
    {
      value: 'perlu_perhatian',
      label: 'Perlu Perhatian',
      desc: 'Ada catatan / perlu perbaikan ringan',
      icon: AlertTriangle,
      color: 'border-amber-500 bg-amber-50 text-amber-800 ring-amber-500',
      activeBg: 'bg-amber-600 text-white',
    },
    {
      value: 'rusak',
      label: 'Rusak / Kritis',
      desc: 'Tidak berfungsi, butuh perbaikan segera',
      icon: XCircle,
      color: 'border-red-500 bg-red-50 text-red-800 ring-red-500',
      activeBg: 'bg-red-600 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="card w-full max-w-lg bg-white rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              Input Hasil Pemeriksaan
            </span>
            <h2 className="text-sm font-bold text-gray-900 leading-none mt-0.5">
              {target.kodeItem || target.kodeEquipment}
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Card Info Equipment yang di-scan */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900">{target.namaItem || target.nama}</span>
              <div className="flex items-center gap-1">
                <ZoneBadge zone={target.zona} />
                <TypeBadge type={target.jenis || target.tipe} />
              </div>
            </div>
            {target.gedung && (
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Gedung / Lantai:</span> {target.gedung}{' '}
                {target.lantai ? `(${target.lantai})` : ''}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-medium text-gray-700">Lokasi:</span> {target.lokasi}{' '}
              {target.detailLokasi ? `(${target.detailLokasi})` : ''}
            </p>
            {target.tipeMedia || target.ukuran || target.tipeHydrant ? (
              <p className="text-gray-600">
                <span className="font-medium text-gray-700">Spesifikasi:</span>{' '}
                {target.tipeMedia ? `${target.tipeMedia} ` : ''}
                {target.ukuran ? `${target.ukuran} ` : ''}
                {target.tipeHydrant ? `[${target.tipeHydrant}]` : ''}
              </p>
            ) : null}
          </div>

          {/* Pemilih Kondisi Equipment (3 Tombol Pilihan Utama) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800">
              Kondisi Equipment <span className="text-red-500">*</span>
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              {kondisiOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = kondisi === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKondisi(opt.value)}
                    className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition cursor-pointer ${
                      isSelected
                        ? `${opt.color} ring-2 shadow-xs`
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={16} className={isSelected ? '' : 'text-gray-400'} />
                      <span className="font-bold text-xs">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keterangan / Catatan Temuan (Opsional) */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Keterangan / Catatan Temuan <span className="text-gray-400">(Opsional)</span>
            </label>
            <textarea
              className="field-textarea min-h-18 text-xs"
              value={keterangan}
              placeholder="Tambahkan catatan jika ada temuan (misal: segel kendor, selang aus, dsb)..."
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* Upload Foto Bukti (Opsional) */}
          <ImageUploader
            file={fotoFile}
            onFileChange={setFotoFile}
            label="Foto Bukti Temuan (Opsional)"
          />

          {/* Tombol Aksi */}
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
              className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
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
