import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NoticeAlert({ notice }) {
  if (!notice) return null;

  const isSuccess = notice.type === 'success';

  return (
    <div
      className={`flex items-start gap-2 rounded border p-2.5 text-xs ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
      ) : (
        <AlertCircle className="shrink-0 mt-0.5" size={14} />
      )}
      <span>{notice.message}</span>
    </div>
  );
}
