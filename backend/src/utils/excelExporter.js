const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const DOCS_DIR = path.join(__dirname, '../../../docs');

/**
 * Generate Excel Rekap Inspeksi High-Fidelity resmi ARFF per Zona
 */
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
    // 1. BACA TEMPLATE ASLI
    wb = xlsx.readFile(templatePath);
  } else {
    wb = xlsx.utils.book_new();
  }

  const tglNow = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Iterasi seluruh sheet di workbook
  wb.SheetNames.forEach((sheetName) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const isCover = sheetName.toUpperCase().includes('COVER');
    const isDenah = sheetName.toUpperCase().includes('DENAH');

    if (isDenah) return;

    if (isCover) {
      // Update bulan & regu pada Cover Sheet
      const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
      if (data[2]) data[2][0] = regu.toUpperCase();
      if (data[24]) data[24][0] = bulanTahun.toUpperCase();
      const updatedWs = xlsx.utils.aoa_to_sheet(data);
      updatedWs['!merges'] = ws['!merges'] || [];
      wb.Sheets[sheetName] = updatedWs;
      return;
    }

    // Update Content Sheet
    const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (data.length < 5) return;

    // Update Header Periode di Baris 3
    if (data[2]) {
      data[2][0] = bulanTahun.toUpperCase();
    }

    // Update Kolom Header Baris 4
    if (data[3]) {
      data[3][8] = `KONDISI\n${bulanLalu.split(' ')[0].toUpperCase()}`;
      data[3][9] = `KONDISI\n${bulanTahun.split(' ')[0].toUpperCase()}`;
    }

    // Loop data equipment
    let lastDataRowIdx = 4;
    for (let r = 4; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;

      const col0 = String(row[0] || '').trim();
      const col1 = String(row[1] || '').trim();

      // Cek apakah ini baris equipment (punya nomor zona seperti A.001, B.015, dll.)
      if (col1.match(/^[A-Z]\.\d+/i) || (col0.match(/^[A-Z]\.\d+/i) && !col1)) {
        const kode = col1.match(/^[A-Z]\.\d+/i) ? col1 : col0;
        const lap = laporanMap[kode];
        lastDataRowIdx = r;

        if (lap) {
          // Status Bulan Berjalan
          if (lap.status === 'rusak') {
            row[9] = 'Rusak';
          } else if (lap.status === 'perlu_perhatian') {
            row[9] = 'Baik dengan catatan';
          } else {
            row[9] = row[3] ? 'Siap Operasi' : (row[6] === 'V' || row[6] === 'v' ? 'Lengkap 1' : 'Lengkap 2');
          }

          // Tanggal Inspeksi
          row[10] = new Date(lap.createdAt).toLocaleDateString('id-ID');
          // Nama Pemeriksa
          row[11] = lap.petugas?.nama || petugasName || 'Petugas ARFF';
          // Paraf
          row[12] = '✓';
          // Keterangan
          if (lap.keterangan) {
            row[13] = lap.keterangan;
          }
        }
      }
    }

    // Bersihkan baris setelah lastDataRowIdx jika ada footer lama
    const cleanData = data.slice(0, lastDataRowIdx + 1);

    // Tambahkan 2 Baris Kosong
    cleanData.push([]);
    cleanData.push([]);

    // Tambahkan Legenda Simbol Kondisi (Standar ARFF YIA)
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

    // Tambahkan Blok Tanda Tangan Resmi Pengesahan
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
      { wch: 6 },  // NO
      { wch: 14 }, // NOMOR ZONA
      { wch: 42 }, // LOKASI
      { wch: 13 }, // JENIS APAR
      { wch: 13 }, // UKURAN (Kg)
      { wch: 9 },  // JUMLAH
      { wch: 14 }, // IHB
      { wch: 14 }, // OHB
      { wch: 16 }, // KONDISI BULAN LALU
      { wch: 16 }, // KONDISI BULAN BERJALAN
      { wch: 18 }, // TANGGAL INSPEKSI
      { wch: 22 }, // NAMA PEMERIKSA
      { wch: 10 }, // PARAF
      { wch: 35 }, // KETERANGAN
    ];

    wb.Sheets[sheetName] = newWs;
  });

  return wb;
}

module.exports = {
  exportHighFidelityZonaExcel,
};
