const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const DOCS_DIR = path.join(__dirname, '../../../docs');

function exportHighFidelityZonaExcel({
  zona = '1',
  bulanTahun = 'AGUSTUS 2026',
  bulanLalu = 'JULI 2026',
  regu = 'REGU DELTA',
  laporanMap = {},
  petugasName = '',
}) {
  const templateFileName = `ZONA ${zona}.xlsx`;
  const templatePath = path.join(DOCS_DIR, templateFileName);

  let wb;
  if (fs.existsSync(templatePath)) {

    wb = xlsx.readFile(templatePath);
  } else {
    wb = xlsx.utils.book_new();
  }

  const tglNow = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  wb.SheetNames.forEach((sheetName) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const isCover = sheetName.toUpperCase().includes('COVER');
    const isDenah = sheetName.toUpperCase().includes('DENAH');

    if (isDenah) return;

    if (isCover) {

      const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
      if (data[2]) data[2][0] = regu.toUpperCase();
      if (data[24]) data[24][0] = bulanTahun.toUpperCase();
      const updatedWs = xlsx.utils.aoa_to_sheet(data);
      updatedWs['!merges'] = ws['!merges'] || [];
      wb.Sheets[sheetName] = updatedWs;
      return;
    }

    const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (data.length < 5) return;

    if (data[2]) {
      data[2][0] = bulanTahun.toUpperCase();
    }

    if (data[3]) {
      data[3][8] = `KONDISI\n${bulanLalu.split(' ')[0].toUpperCase()}`;
      data[3][9] = `KONDISI\n${bulanTahun.split(' ')[0].toUpperCase()}`;
    }

    let lastDataRowIdx = 4;
    for (let r = 4; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;

      const col0 = String(row[0] || '').trim();
      const col1 = String(row[1] || '').trim();

      if (col1.match(/^[A-Z]\.\d+/i) || (col0.match(/^[A-Z]\.\d+/i) && !col1)) {
        const kode = col1.match(/^[A-Z]\.\d+/i) ? col1 : col0;
        const lap = laporanMap[kode];
        lastDataRowIdx = r;

        if (lap) {

          if (lap.status === 'rusak') {
            row[9] = 'Rusak';
          } else if (lap.status === 'perlu_perhatian') {
            row[9] = 'Baik dengan catatan';
          } else {
            row[9] = row[3] ? 'Siap Operasi' : (row[6] === 'V' || row[6] === 'v' ? 'Lengkap 1' : 'Lengkap 2');
          }

          row[10] = new Date(lap.createdAt).toLocaleDateString('id-ID');

          row[11] = lap.petugas?.nama || petugasName || 'Petugas ARFF';

          row[12] = '✓';

          if (lap.keterangan) {
            row[13] = lap.keterangan;
          }
        }
      }
    }

    const cleanData = data.slice(0, lastDataRowIdx + 1);

    cleanData.push([]);
    cleanData.push([]);

    cleanData.push(['', 'KETERANGAN :']);
    cleanData.push(['', 'v', 'Siap Operasi ( semuanya lengkap )']);
    cleanData.push(['', 'B', 'Baik dengan catatan ( salah satu bagian dari peralatan itu sendiri tidak lengkap / kurang & kolom keterangan wajib di isi )']);
    cleanData.push(['', 'L', 'Low Pressure ( jika kondisi tekanan kurang yang di standart kan & kolom keterangan wajib di isi )']);
    cleanData.push(['', 'X ', 'Rusak ( di kolom keterangan wajib di isi )']);
    cleanData.push(['', 'P', 'Lengkap 1 ( jika ada selang & Nozzle )']);
    cleanData.push(['', 'O', 'Lengkap 2 ( jika ada selang, Nozzle & Kunci Hydrant )']);
    cleanData.push(['', '–', 'Kosong / tidak ada / Tidak diketahui ( kolom keterangan wajib di isi )']);

    cleanData.push([]);
    cleanData.push([]);

    cleanData.push(['', '', '', '', '', '', '', '', '', '', `Kulon Progo, ${tglNow}`]);
    cleanData.push(['', 'Mengetahui,', '', '', '', '', '', '', '', '', 'Petugas Pemeriksa Lapangan,']);
    cleanData.push(['', 'TEAM LEADER ARFF YIA', '', '', '', '', '', '', '', '', regu.toUpperCase()]);
    cleanData.push([]);
    cleanData.push([]);
    cleanData.push([]);
    cleanData.push(['', '( .................................................... )', '', '', '', '', '', '', '', '', `( ${petugasName || '....................................................'} )`]);
    cleanData.push(['', 'NIP. .................................................', '', '', '', '', '', '', '', '', 'NIP. .................................................']);

    const newWs = xlsx.utils.aoa_to_sheet(cleanData);
    newWs['!merges'] = ws['!merges'] || [
      { s: { c: 0, r: 0 }, e: { c: 13, r: 0 } },
      { s: { c: 0, r: 1 }, e: { c: 13, r: 1 } },
      { s: { c: 0, r: 2 }, e: { c: 13, r: 2 } },
    ];
    newWs['!cols'] = [
      { wch: 6 },  
      { wch: 14 }, 
      { wch: 42 }, 
      { wch: 13 }, 
      { wch: 13 }, 
      { wch: 9 },  
      { wch: 14 }, 
      { wch: 14 }, 
      { wch: 16 }, 
      { wch: 16 }, 
      { wch: 18 }, 
      { wch: 22 }, 
      { wch: 10 }, 
      { wch: 35 }, 
    ];

    wb.Sheets[sheetName] = newWs;
  });

  return wb;
}

module.exports = {
  exportHighFidelityZonaExcel,
};
