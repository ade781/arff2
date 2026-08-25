function cleanQrCode(rawQr) {
  const trimmed = (rawQr || '').trim();
  return trimmed.startsWith('ARFF-YIA:')
    ? trimmed.replace('ARFF-YIA:', '').trim()
    : trimmed;
}

function buildQrPayload(kodeItem) {
  return `ARFF-YIA:${kodeItem}`;
}

function presentPengguna(user) {
  if (!user) return null;
  const raw = typeof user.get === 'function' ? user.get({ plain: true }) : user;
  return {
    id: raw.id,
    nama: raw.nama,
    username: raw.username,
    unit: raw.unit || 'ARFF YIA',
    regu: raw.regu || null,
    role: raw.role,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function presentItem(item) {
  if (!item) return null;
  const plain = typeof item.get === 'function' ? item.get({ plain: true }) : item;

  return {
    id: plain.id,
    kodeItem: plain.kodeItem,
    kodeQr: buildQrPayload(plain.kodeItem),
    namaItem: plain.namaItem,
    jenis: plain.jenis,
    zona: plain.zona,
    gedung: plain.gedung || null,
    lantai: plain.lantai || null,
    lokasi: plain.lokasi,
    detailLokasi: plain.detailLokasi || null,
    tipeMedia: plain.tipeMedia || null,
    ukuran: plain.ukuran || null,
    tipeHydrant: plain.tipeHydrant || null,
    merk: plain.merk || null,
    jumlah: plain.jumlah || 1,
    exp: plain.exp,
    status: plain.status,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function presentLaporanAnggota(laporan) {
  if (!laporan) return null;
  const raw = typeof laporan.toJSON === 'function' ? laporan.toJSON() : laporan;

  let checklist = raw.checklist;
  if (typeof checklist === 'string') {
    try {
      checklist = JSON.parse(checklist);
    } catch (e) {
      checklist = [];
    }
  }
  if (!Array.isArray(checklist)) checklist = [];

  return {
    id: raw.id,
    idAnggota: raw.idAnggota || raw.id_anggota,
    idItem: raw.idItem || raw.id_item,
    status: raw.status,
    keterangan: raw.keterangan || '',
    penggantian: raw.penggantian || '',
    foto: raw.foto || null,
    checklist,
    createdAt: raw.createdAt,
    petugas: raw.petugas || null,
    item: raw.item ? presentItem(raw.item) : null,
  };
}

module.exports = {
  cleanQrCode,
  buildQrPayload,
  presentPengguna,
  presentItem,
  presentLaporanAnggota,
};
