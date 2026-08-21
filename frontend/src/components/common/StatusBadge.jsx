import React from 'react';

export default function StatusBadge({ children, tone = 'neutral' }) {
  const toneClass = {
    neutral: 'border-slate-200 bg-slate-100 text-slate-700',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warn: 'border-amber-200 bg-amber-50 text-amber-700',
    bad: 'border-red-200 bg-red-50 text-red-700',
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${toneClass}`}>
      {children}
    </span>
  );
}
