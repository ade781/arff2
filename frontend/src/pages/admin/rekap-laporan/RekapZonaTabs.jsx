import React from 'react';
import { ZONA_CONFIG } from './rekapConstants';

export default function RekapZonaTabs({ items = [], activeZona, onSelectZona }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 no-print">
      {ZONA_CONFIG.map((z) => {
        const isActive = activeZona === z.id;
        const count = items.filter((it) => String(it.zona) === String(z.id)).length;

        return (
          <button
            key={z.id}
            type="button"
            onClick={() => onSelectZona(z.id)}
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
  );
}
