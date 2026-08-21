import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { API_BASE_URL } from '../../api/axiosInstance';

export default function ImagePreviewModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null;

  const serverOrigin = API_BASE_URL.replace('/api', '');
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${serverOrigin}${imageUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-lg p-3 bg-white flex flex-col gap-2 max-h-[90vh]">
        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-800 truncate">{title || 'Bukti Foto'}</h3>
          <div className="flex items-center gap-1">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-gray-500 hover:text-gray-800"
              title="Buka gambar"
            >
              <ExternalLink size={13} />
            </a>
            <button className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer" type="button" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-50 rounded p-1">
          <img
            src={fullUrl}
            alt="Bukti Temuan"
            className="max-h-[65vh] w-auto max-w-full object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
}
