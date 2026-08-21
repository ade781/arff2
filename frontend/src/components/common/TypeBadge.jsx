import React from 'react';

export default function TypeBadge({ type }) {
  const isApar = type?.toLowerCase() === 'apar';
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
      isApar ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
    }`}>
      {type?.toUpperCase()}
    </span>
  );
}
