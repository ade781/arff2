/**
 * Format laporan anggota ke DTO yang konsisten dan rapi
 */
function presentLaporanAnggota(laporan) {
  if (!laporan) return null;
  const raw = laporan.toJSON ? laporan.toJSON() : laporan;
  const it = raw.item || raw.equipment || null;

  return {
    id: raw.id,
    idAnggota: raw.idAnggota || raw.id_anggota,
    idItem: raw.idItem || raw.id_item,
    status: raw.status,
    hasilUmum: raw.status,
    keterangan: raw.keterangan || '',
    catatan: raw.keterangan || '',
    penggantian: raw.penggantian || '',
    foto: raw.foto || null,
    items: raw.checklist || [],
    checklist: raw.checklist || [],
    waktuPemeriksaan: raw.createdAt,
    createdAt: raw.createdAt,
    petugas: raw.petugas || null,
    item: it,
    equipment: it
      ? {
          id: it.id,
          kodeEquipment: it.kodeItem,
          kodeItem: it.kodeItem,
          nama: it.namaItem,
          namaItem: it.namaItem,
          tipe: it.jenis,
          jenis: it.jenis,
          zona: it.zona,
          gedung: it.gedung,
          lantai: it.lantai,
          lokasi: it.lokasi,
          detailLokasi: it.detailLokasi,
          tipeMedia: it.tipeMedia,
          ukuran: it.ukuran,
          tipeHydrant: it.tipeHydrant,
          merk: it.merk,
          jumlah: it.jumlah,
          exp: it.exp,
          status: it.status,
        }
      : null,
  };
}

module.exports = {
  presentLaporanAnggota,
};
