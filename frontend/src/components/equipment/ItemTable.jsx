import React, { useMemo, useState } from 'react';
import { Edit3, Loader2, Plus, QrCode, Search, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TypeBadge from '../common/TypeBadge';
import ZoneBadge from '../common/ZoneBadge';
import ExpBadge from '../common/ExpBadge';
import { ZONES, ITEM_TYPES } from '../../constants/itemConstants';

export default function ItemTable({ items, onEdit, onDelete, onQr, loading, onAddNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZona, setFilterZona] = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchZona = !filterZona || item.zona === filterZona;
      const matchJenis = !filterJenis || item.jenis === filterJenis;
      return matchSearch && matchZona && matchJenis;
    });
  }, [items, searchTerm, filterZona, filterJenis]);

  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h2 className="text-xs font-semibold uppercase text-gray-800">
          Daftar Equipment ({filteredItems.length})
        </h2>

        <div className="flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin text-gray-500" size={14} /> : null}
          {onAddNew ? (
            <button
              className="h-7.5 inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
              type="button"
              onClick={onAddNew}
            >
              <Plus size={13} /> Tambah
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-12">
        <div className="relative sm:col-span-6 flex items-center">
          <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={14} />
          <input
            className="field field-with-icon text-xs h-8"
            placeholder="Cari kode, nama, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:col-span-3">
          <select className="field text-xs cursor-pointer" value={filterZona} onChange={(e) => setFilterZona(e.target.value)}>
            <option value="">Semua Zona</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>Zona {z}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <select className="field text-xs cursor-pointer" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
            <option value="">Semua Jenis</option>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="px-3 py-2">Kode</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Jenis / Zona</th>
              <th className="px-3 py-2">Lokasi</th>
              <th className="px-3 py-2">Expired</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredItems.length ? filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono font-medium">{item.kodeItem}</td>
                <td className="px-3 py-2">{item.namaItem}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <TypeBadge type={item.jenis} />
                    <ZoneBadge zone={item.zona} />
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600 max-w-[180px] truncate" title={item.lokasi}>
                  {item.lokasi}
                </td>
                <td className="px-3 py-2">
                  <ExpBadge expDate={item.exp} />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge tone={item.status === 'aktif' ? 'good' : item.status === 'perbaikan' ? 'warn' : 'bad'}>
                    {item.status}
                  </StatusBadge>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button className="icon-button" type="button" onClick={() => onQr(item)} title="QR Code">
                      <QrCode size={13} />
                    </button>
                    <button className="icon-button" type="button" onClick={() => onEdit(item)} title="Edit">
                      <Edit3 size={13} />
                    </button>
                    <button className="icon-button-danger" type="button" onClick={() => onDelete(item)} title="Hapus">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                  Tidak ada data equipment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
