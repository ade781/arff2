import React from 'react';
import { Loader2 } from 'lucide-react';
import { ZONES, ITEM_TYPES, STATUS_ITEM } from '../../constants/itemConstants';

export default function ItemForm({ form, onChange, onSubmit, onCancel, loading, editing }) {
  function updateField(field, value) {
    onChange({ ...form, [field]: value });
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h2 className="text-xs font-semibold uppercase text-gray-800">
          {editing ? 'Edit Equipment' : 'Tambah Equipment'}
        </h2>
        {editing ? (
          <button className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer" type="button" onClick={onCancel}>
            Batal
          </button>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Kode Equipment <span className="text-red-600">*</span>
          </label>
          <input
            className="field text-xs"
            value={form.kodeItem}
            placeholder="Contoh: APAR-A-001"
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
            placeholder="Contoh: APAR Powder 6kg"
            onChange={(e) => updateField('namaItem', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis</label>
            <select className="field text-xs cursor-pointer" value={form.jenis} onChange={(e) => updateField('jenis', e.target.value)}>
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Zona</label>
            <select className="field text-xs cursor-pointer" value={form.zona} onChange={(e) => updateField('zona', e.target.value)}>
              {ZONES.map((z) => (
                <option key={z} value={z}>Zona {z}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Expired (Opsional)</label>
            <input
              className="field text-xs"
              type="date"
              value={form.exp || ''}
              onChange={(e) => updateField('exp', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select className="field text-xs cursor-pointer" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
              {STATUS_ITEM.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Lokasi <span className="text-red-600">*</span>
          </label>
          <input
            className="field text-xs"
            value={form.lokasi}
            placeholder="Contoh: Terminal Keberangkatan Lt. 2"
            onChange={(e) => updateField('lokasi', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Detail Lokasi (Opsional)</label>
          <textarea
            className="field-textarea min-h-14 text-xs"
            value={form.detailLokasi || ''}
            placeholder="Keterangan spesifik lokasi..."
            onChange={(e) => updateField('detailLokasi', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          className="h-8 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin inline mr-1" size={13} /> : null}
          {editing ? 'Simpan' : 'Tambah'}
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
