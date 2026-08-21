
function buildQrPayload(kodeItem) {
  return `ARFF-YIA:${kodeItem}`;
}

function presentItem(item) {
  if (!item) return null;

  const plain = typeof item.get === 'function' ? item.get({ plain: true }) : item;

  return {
    id: plain.id,
    kodeItem: plain.kodeItem,
    kodeEquipment: plain.kodeItem,
    kodeQr: buildQrPayload(plain.kodeItem),
    nama: plain.namaItem,
    namaItem: plain.namaItem,
    jenis: plain.jenis,
    tipe: plain.jenis,
    zona: plain.zona,
    lokasi: plain.lokasi,
    detailLokasi: plain.detailLokasi,
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
