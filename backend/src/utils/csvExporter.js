
function exportLaporanToCsv(rows = []) {

  let csv = '\uFEFFNo,Waktu Pemeriksaan,Kode Equipment,Nama Equipment,Jenis,Zona,Lokasi,Expired,Status,Petugas,Catatan Temuan,Tindakan Penggantian,Foto\n';

  const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

  rows.forEach((r, idx) => {
    const waktu = new Date(r.createdAt).toLocaleString('id-ID');
    const item = r.item || {};
    const petugas = r.petugas || {};

    csv += [
      idx + 1,
      escape(waktu),
      escape(item.kodeItem || '-'),
      escape(item.namaItem || '-'),
      escape(item.jenis?.toUpperCase() || '-'),
      escape(item.zona || '-'),
      escape(item.lokasi || '-'),
      escape(item.exp || '-'),
      escape(r.status?.toUpperCase()),
      escape(`${petugas.nama || 'Petugas'} (${petugas.unit || 'ARFF'})`),
      escape(r.keterangan || '-'),
      escape(r.penggantian || '-'),
      escape(r.foto || '-'),
    ].join(',') + '\n';
  });

  return csv;
}

module.exports = {
  exportLaporanToCsv,
};
