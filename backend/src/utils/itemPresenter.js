function buildQrPayload(kodeItem) {
  return `ARFF-YIA:${kodeItem}`;
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
    detailLokasi: plain.detailLokasi,
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

module.exports = {
  buildQrPayload,
  presentItem,
};
