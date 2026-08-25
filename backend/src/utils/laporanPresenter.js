
const { presentItem } = require('./itemPresenter');

function presentLaporanAnggota(laporan) {
  if (!laporan) return null;
  const raw = laporan.toJSON ? laporan.toJSON() : laporan;

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
  presentLaporanAnggota,
};
