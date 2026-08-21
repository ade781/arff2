
function presentLaporanAnggota(laporan) {
  if (!laporan) return null;
  const raw = laporan.toJSON ? laporan.toJSON() : laporan;
  const it = raw.item || null;

  return {
    id: raw.id,
    idAnggota: raw.idAnggota || raw.id_anggota,
    idItem: raw.idItem || raw.id_item,
    status: raw.status,
    keterangan: raw.keterangan || '',
    penggantian: raw.penggantian || '',
    foto: raw.foto || null,
    checklist: raw.checklist || [],
    createdAt: raw.createdAt,
    petugas: raw.petugas || null,
    item: it
      ? {
          id: it.id,
          kodeItem: it.kodeItem,
          namaItem: it.namaItem,
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
