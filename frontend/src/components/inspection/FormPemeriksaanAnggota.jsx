import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { STATUS_LAPORAN } from '../../constants/itemConstants';

export default function FormPemeriksaanAnggota({ checklist, onSubmit, loading }) {
  const [status, setStatus] = useState('baik');
  const [keterangan, setKeterangan] = useState('');
  const [penggantian, setPenggantian] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems((checklist || []).map((namaItem) => ({
      namaItem,
      status: 'baik',
      catatan: '',
    })));
    setStatus('baik');
    setKeterangan('');
    setPenggantian('');
  }, [checklist]);

  function updateItem(index, patch) {
    setItems((currentItems) => currentItems.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      status,
      keterangan,
      penggantian,
      items,
      checklist: items,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase text-gray-800 pb-2 border-b border-gray-100">
          Hasil Pemeriksaan
        </h3>

        <div className="space-y-2.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status Keseluruhan</label>
            <select
              className="field text-xs cursor-pointer font-medium"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="baik">Baik</option>
              <option value="perlu_perhatian">Perlu Perhatian</option>
              <option value="rusak">Rusak</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Temuan (Opsional)</label>
            <textarea
              className="field-textarea min-h-16 text-xs"
              value={keterangan}
              placeholder="Keterangan temuan pemeriksaan..."
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tindakan / Penggantian (Opsional)</label>
            <input
              className="field text-xs"
              value={penggantian}
              placeholder="Misal: ganti segel / isi ulang"
              onChange={(e) => setPenggantian(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase text-gray-700">
          Checklist Pemeriksaan ({items.length})
        </h3>

        {items.map((item, index) => (
          <div key={item.namaItem} className="card p-3 space-y-2">
            <p className="text-xs font-medium text-gray-900">{index + 1}. {item.namaItem}</p>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_LAPORAN.map((st) => {
                const isSelected = item.status === st.value;
                return (
                  <button
                    key={st.value}
                    className={`h-7 px-2.5 rounded text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    type="button"
                    onClick={() => updateItem(index, { status: st.value })}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            <input
              className="field-sm text-xs"
              value={item.catatan}
              placeholder="Catatan item..."
              onChange={(e) => updateItem(index, { catatan: e.target.value })}
            />
          </div>
        ))}
      </section>

      <button
        className="w-full h-10 rounded bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin inline mr-1" size={14} /> : null}
        Simpan Pemeriksaan
      </button>
    </form>
  );
}
