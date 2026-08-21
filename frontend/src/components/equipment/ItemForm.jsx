import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  ZONES,
  ITEM_TYPES,
  STATUS_ITEM,
  MEDIA_TYPES,
  HYDRANT_TYPES,
} from '../../constants/itemConstants';

export default function ItemForm({ form, onChange, onSubmit, onCancel, loading, editing }) {
  function updateField(field, value) {
    onChange({ ...form, [field]: value });
  }

  const isApar = form.jenis === 'apar';

  return (
    <form onSubmit={onSubmit} className="card p-4 space-y-3 bg-white border border-gray-200">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h2 className="text-xs font-semibold uppercase text-gray-800">
          {editing ? 'Edit Equipment' : 'Tambah Equipment Baru'}
        </h2>
        {editing ? (
          <button
            className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
            type="button"
            onClick={onCancel}
          >
            Batal
          </button>
        ) : null}
      </div>

      <div className="space-y-2.5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nomor Zona / Kode Item <span className="text-red-600">*</span>
            </label>
            <input
              className="field text-xs font-mono"
              value={form.kodeItem}
              placeholder="Contoh: A.001 atau B.045"
              onChange={(e) => updateField('kodeItem', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Equipment <span className="text-red-600">*</span>
            </label>
            <input
              className="field text-xs"
              value={form.namaItem}
              placeholder="Contoh: APAR DCP 6kg - R. Panel"
              onChange={(e) => updateField('namaItem', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Item</label>
            <select
              className="field text-xs cursor-pointer font-medium"
              value={form.jenis}
              onChange={(e) => updateField('jenis', e.target.value)}
            >
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Zona</label>
            <select
              className="field text-xs cursor-pointer font-medium"
              value={form.zona}
              onChange={(e) => updateField('zona', e.target.value)}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  Zona {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gedung / Area</label>
            <input
              className="field text-xs"
              value={form.gedung || ''}
              placeholder="Contoh: Main Fire Station / Cargo"
              onChange={(e) => updateField('gedung', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Lantai</label>
            <input
              className="field text-xs"
              value={form.lantai || ''}
              placeholder="Contoh: Lantai 1 / Basement"
              onChange={(e) => updateField('lantai', e.target.value)}
            />
          </div>
        </div>

        {isApar ? (
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 rounded border border-gray-100">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Media APAR</label>
              <select
                className="field text-xs cursor-pointer"
                value={form.tipeMedia || 'DCP'}
                onChange={(e) => updateField('tipeMedia', e.target.value)}
              >
                {MEDIA_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Ukuran (Kg/L)</label>
              <input
                className="field text-xs"
                value={form.ukuran || ''}
                placeholder="Contoh: 6.0 Kg"
                onChange={(e) => updateField('ukuran', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Merk (Opsional)</label>
              <input
                className="field text-xs"
                value={form.merk || ''}
                placeholder="Contoh: Zhield"
                onChange={(e) => updateField('merk', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded border border-gray-100">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Tipe Hydrant</label>
              <select
                className="field text-xs cursor-pointer"
                value={form.tipeHydrant || 'IHB'}
                onChange={(e) => updateField('tipeHydrant', e.target.value)}
              >
                {HYDRANT_TYPES.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Jumlah Box</label>
              <input
                className="field text-xs"
                type="number"
                min="1"
                value={form.jumlah || 1}
                onChange={(e) => updateField('jumlah', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Titik Lokasi <span className="text-red-600">*</span>
            </label>
            <input
              className="field text-xs"
              value={form.lokasi}
              placeholder="Contoh: Di pilar depan pintu keluar"
              onChange={(e) => updateField('lokasi', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status Master</label>
            <select
              className="field text-xs cursor-pointer font-medium"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            >
              {STATUS_ITEM.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Detail / Catatan Khusus (Opsional)
          </label>
          <textarea
            className="field-textarea min-h-14 text-xs"
            value={form.detailLokasi || ''}
            placeholder="Misal: Kunci pinjam di Security Cargo..."
            onChange={(e) => updateField('detailLokasi', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          className="h-8 rounded bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin inline mr-1" size={13} /> : null}
          {editing ? 'Simpan Perubahan' : 'Tambah Equipment'}
        </button>

        {editing ? (
          <button
            className="h-8 rounded border border-gray-300 bg-white px-3 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            type="button"
            onClick={onCancel}
          >
            Batal
          </button>
        ) : null}
      </div>
    </form>
  );
}
