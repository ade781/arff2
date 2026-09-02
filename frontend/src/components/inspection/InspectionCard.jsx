import React, { useState } from 'react';
import { Clock, Image as ImageIcon, MapPin } from 'lucide-react';
import { StatusBadge, TypeBadge, ZoneBadge } from '../common/Badges';

export default function InspectionCard({ lap, onPreviewImage }) {
  const [expanded, setExpanded] = useState(false);
  const item = lap.item || lap.equipment || {};
  const tone = lap.status === 'baik' ? 'good' : lap.status === 'rusak' ? 'bad' : 'warn';
  const hasLocation = Boolean(item.gedung || item.lokasi || item.detailLokasi);

  return (
    <div className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs bg-white hover:bg-gray-50/50 transition space-y-1">
      {/* Top row: Code & Badges */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[11px] font-bold text-gray-900">
            {item.kodeItem || item.kodeEquipment || `Item #${lap.idItem}`}
          </span>
          {item.zona ? <ZoneBadge zone={item.zona} size="xs" /> : null}
          {item.jenis ? <TypeBadge type={item.jenis} size="xs" /> : null}
        </div>
        <StatusBadge tone={tone} size="xs">{lap.status}</StatusBadge>
      </div>

      {/* Item name */}
      <p className="text-[10px] text-gray-700 font-medium truncate">
        {item.namaItem || item.nama || 'Equipment ARFF'}
      </p>

      {/* Expandable Location Details */}
      {expanded && hasLocation && (
        <div className="p-1.5 rounded bg-gray-50 border border-gray-200 text-[9px] text-gray-700 space-y-0.5 animate-in fade-in duration-100">
          {item.gedung && (
            <p>
              <span className="font-semibold text-gray-900">Gedung / Area:</span> {item.gedung} {item.lantai ? `(${item.lantai})` : ''}
            </p>
          )}
          {item.lokasi && (
            <p>
              <span className="font-semibold text-gray-900">Lokasi:</span> {item.lokasi}
            </p>
          )}
          {item.detailLokasi && (
            <p>
              <span className="font-semibold text-gray-900">Patokan:</span> {item.detailLokasi}
            </p>
          )}
        </div>
      )}

      {/* Inspection notes if any */}
      {lap.keterangan && (
        <p className="text-[9px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded truncate" title={lap.keterangan}>
          <span className="font-semibold text-gray-700">Catatan:</span> {lap.keterangan}
        </p>
      )}

      {/* Footer row: Date, Inline Location Button, and optional Photo trigger */}
      <div className="flex items-center justify-between text-[9px] text-gray-400 pt-0.5 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <Clock size={9} />
            {new Date(lap.createdAt || lap.waktuPemeriksaan).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {hasLocation && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              <MapPin size={8} />
              <span>{expanded ? 'Tutup Lokasi ▴' : 'Detail Lokasi ▾'}</span>
            </button>
          )}
        </div>

        {lap.foto && onPreviewImage ? (
          <button
            type="button"
            onClick={() => onPreviewImage({ url: lap.foto, title: `Foto Bukti ${item.kodeItem || ''}` })}
            className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
          >
            <ImageIcon size={10} /> Lihat Foto
          </button>
        ) : null}
      </div>
    </div>
  );
}
