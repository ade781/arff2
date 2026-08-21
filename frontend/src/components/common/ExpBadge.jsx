import React from 'react';
import { AlertCircle, AlertTriangle, Calendar } from 'lucide-react';

export default function ExpBadge({ expDate }) {
  if (!expDate) {
    return <span className="text-[11px] text-slate-400 italic">Tidak ada</span>;
  }

  const today = new Date();
  const exp = new Date(expDate);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-1.5 py-0.5 text-[11px] font-bold text-red-700" title="Kadaluarsa">
        <AlertTriangle size={11} /> {expDate}
      </span>
    );
  }

  if (diffDays <= 60) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-700" title={`Sisa ${diffDays} hari`}>
        <AlertCircle size={11} /> {expDate}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600">
      <Calendar size={11} /> {expDate}
    </span>
  );
}
