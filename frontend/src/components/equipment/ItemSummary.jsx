import React from 'react';
import StatusBadge from '../common/StatusBadge';
import TypeBadge from '../common/TypeBadge';
import ZoneBadge from '../common/ZoneBadge';
import ExpBadge from '../common/ExpBadge';

export default function ItemSummary({ item }) {
  if (!item) {
    return null;
  }

  const isApar = item.jenis === 'apar';

  return (
    <section className="card p-3.5 space-y-2 bg-white border border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-mono font-bold text-gray-900 text-xs">
              {item.kodeItem || item.kodeEquipment}
            </span>
            <ZoneBadge zone={item.zona} />
            <TypeBadge type={item.jenis || item.tipe} />
          </div>
          <h2 className="text-sm font-bold text-gray-900">{item.namaItem || item.nama}</h2>
        </div>
        <StatusBadge
          tone={
            item.status === 'aktif' ? 'good' : item.status === 'perbaikan' ? 'warn' : 'bad'
          }
        >
          {item.status}
        </StatusBadge>
      </div>

      <div className="text-xs text-gray-600 border-t border-gray-100 pt-2 space-y-1">
        {item.gedung && (
          <p>
            <span className="font-medium text-gray-800">Gedung / Lantai:</span> {item.gedung}{' '}
            {item.lantai ? `(${item.lantai})` : ''}
          </p>
        )}
        <p>
          <span className="font-medium text-gray-800">Lokasi:</span> {item.lokasi}{' '}
          {item.detailLokasi ? `(${item.detailLokasi})` : ''}
        </p>
        {isApar && (item.tipeMedia || item.ukuran) && (
          <p>
            <span className="font-medium text-gray-800">Spesifikasi:</span> {item.tipeMedia}{' '}
            {item.ukuran ? `- ${item.ukuran}` : ''}
          </p>
        )}
        {!isApar && item.tipeHydrant && (
          <p>
            <span className="font-medium text-gray-800">Tipe Hydrant:</span> {item.tipeHydrant}
          </p>
        )}
        {item.exp ? (
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-800">Expired:</span>
            <ExpBadge expDate={item.exp} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
