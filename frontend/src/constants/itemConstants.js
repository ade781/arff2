/**
 * Status dan Konstanta yang digunakan bersama frontend & backend.
 *
 * STATUS_LAPORAN: Status hasil pemeriksaan lapangan
 * STATUS_ITEM: Status master equipment
 */

export const STATUS_LAPORAN = [
  { value: 'baik', label: 'Baik' },
  { value: 'perlu_perhatian', label: 'Perlu Perhatian' },
  { value: 'rusak', label: 'Rusak' },
];

export const STATUS_ITEM = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'perbaikan', label: 'Perbaikan' },
  { value: 'rusak', label: 'Rusak' },
  { value: 'nonaktif', label: 'Nonaktif' },
];

export const EMPTY_ITEM_FORM = {
  kodeItem: '',
  namaItem: '',
  jenis: 'apar',
  zona: 'A',
  lokasi: '',
  detailLokasi: '',
  exp: '',
  status: 'aktif',
};

export const ZONES = ['A', 'B', 'C', 'D'];
export const ITEM_TYPES = [
  { value: 'apar', label: 'APAR' },
  { value: 'hydrant', label: 'Hydrant' },
];
