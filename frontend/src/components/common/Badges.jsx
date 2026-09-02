import React from 'react';
import { AlertCircle, AlertTriangle, Calendar } from 'lucide-react';

export function StatusBadge({ children, tone = 'neutral', size = 'sm' }) {
  const toneClass = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warn: 'border-amber-200 bg-amber-50 text-amber-700',
    bad: 'border-red-200 bg-red-50 text-red-700',
  }[tone] || 'border-slate-200 bg-slate-50 text-slate-700';

  const sizeClass = size === 'xs' || size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 rounded font-bold'
    : 'text-xs px-2 py-0.5 rounded-md font-semibold';

  return (
    <span className={`inline-flex items-center border uppercase tracking-wider ${sizeClass} ${toneClass}`}>
      {children}
    </span>
  );
}

export function TypeBadge({ type, size = 'sm' }) {
  const isApar = type?.toLowerCase() === 'apar';
  const sizeClass = size === 'xs' || size === 'sm'
    ? 'text-[10px] px-1.5 py-0.2 rounded font-bold'
    : 'text-xs px-2 py-0.5 rounded font-bold';

  return (
    <span className={`inline-flex items-center ${sizeClass} ${
      isApar ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
    }`}>
      {type?.toUpperCase()}
    </span>
  );
}

export function ZoneBadge({ zone, size = 'sm' }) {
  const sizeClass = size === 'xs' || size === 'sm'
    ? 'text-[10px] px-1.5 py-0.2 rounded font-semibold'
    : 'text-xs px-2 py-0.5 rounded font-semibold';

  return (
    <span className={`inline-flex items-center bg-slate-50 border border-slate-200 text-slate-700 ${sizeClass}`}>
      Zona {zone}
    </span>
  );
}

export function ExpBadge({ expDate }) {
  if (!expDate) {
    return <span className="text-[10px] text-slate-400 italic">Tidak ada</span>;
  }

  const today = new Date();
  const exp = new Date(expDate);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-1.5 py-0.2 text-[10px] font-bold text-red-700" title="Kadaluarsa">
        <AlertTriangle size={10} /> {expDate}
      </span>
    );
  }

  if (diffDays <= 60) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-700" title={`Sisa ${diffDays} hari`}>
        <AlertCircle size={10} /> {expDate}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-600">
      <Calendar size={10} /> {expDate}
    </span>
  );
}

export default {
  StatusBadge,
  TypeBadge,
  ZoneBadge,
  ExpBadge,
};
