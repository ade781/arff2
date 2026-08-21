import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

export default function ImageUploader({ file, onFileChange, label = 'Foto Bukti (Opsional)' }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  function handleFileSelect(event) {
    const selected = event.target.files?.[0];
    if (selected) {
      onFileChange(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  }

  function handleRemove() {
    onFileChange(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="rounded border border-gray-200 bg-gray-50 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={preview} alt="Preview" className="h-12 w-12 object-cover rounded border border-gray-200" />
            <div className="text-xs">
              <p className="font-medium text-gray-800 truncate max-w-[180px]">{file?.name || 'Foto'}</p>
              <p className="text-[10px] text-gray-500">
                {file?.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-gray-300 rounded p-3 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <Camera size={14} />
          <span>Ambil Foto / Pilih Gambar</span>
        </button>
      )}
    </div>
  );
}
