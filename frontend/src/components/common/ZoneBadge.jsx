import React from 'react';

export default function ZoneBadge({ zone }) {
  return (
    <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
      Zona {zone}
    </span>
  );
}
