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
  zona: '1',
  gedung: '',
  lantai: 'Lantai 1',
  lokasi: '',
  detailLokasi: '',
  tipeMedia: 'DCP',
  ukuran: '6.0 Kg',
  tipeHydrant: 'IHB',
  merk: '',
  jumlah: 1,
  exp: '',
  status: 'aktif',
};

export const ZONES = ['1', '2', '3', '4'];

export const ITEM_TYPES = [
  { value: 'apar', label: 'APAR' },
  { value: 'hydrant', label: 'Hydrant' },
];

export const MEDIA_TYPES = ['DCP', 'CO2', 'FOAM', 'CLEAN AGENT'];

export const HYDRANT_TYPES = [
  { value: 'IHB', label: 'Indoor Hydrant Box (IHB)' },
  { value: 'OHB', label: 'Outdoor Hydrant Box (OHB)' },
  { value: 'SIAMESE', label: 'Siamese Connection' },
  { value: 'PILLAR', label: 'Hydrant Pillar' },
];
