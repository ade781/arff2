import * as XLSX from 'xlsx';

export function exportZonaInspectionToExcel({
  zona,
  bulanTahun = 'AGUSTUS 2026',
  regu = 'REGU DELTA',
  items = [],
  laporanMap = {},
}) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // 1. SHEET COVER
  // ==========================================
  const coverData = [
    ['INSPEKSI APAR & HYDRANT'],
    [`ZONA ${zona}`],
    [regu.toUpperCase()],
    ['YOGYAKARTA INTERNATIONAL AIRPORT'],
    [''],
    [''],
    [`PERIODE: ${bulanTahun.toUpperCase()}`],
    [`TOTAL EQUIPMENT: ${items.length} TITIK`],
    [`GENERATED AT: ${new Date().toLocaleString('id-ID')}`],
  ];
  const wsCover = XLSX.utils.aoa_to_sheet(coverData);
  wsCover['!cols'] = [{ wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsCover, 'COVER');

  // Kelompokkan equipment per Gedung / Sheet
  const gedungMap = {};
  items.forEach((item) => {
    const g = item.gedung || 'Lainnya';
    if (!gedungMap[g]) gedungMap[g] = [];
    gedungMap[g].push(item);
  });

  // ==========================================
  // 2. SHEET PER GEDUNG
  // ==========================================
  Object.keys(gedungMap).forEach((gedungName) => {
    const gedungItems = gedungMap[gedungName];
    const sheetData = [];

    // Header Instansi
    sheetData.push([`DAFTAR INSPEKSI APAR & FIRE HYDRANT ZONA ${zona}`]);
    sheetData.push(['YOGYAKARTA INTERNATIONAL AIRPORT']);
    sheetData.push([`${bulanTahun.toUpperCase()} - ${regu.toUpperCase()}`]);
    sheetData.push([
      'NO',
      'NOMOR ZONA',
      'LOKASI',
      'JENIS APAR',
      'UKURAN (Kg)',
      'JUMLAH',
      'INDOOR HYDRANT BOX (IHB)',
      'OUTDOOR HYDRANT BOX (OHB)',
      'KONDISI BULAN LALU',
      'KONDISI BULAN INI',
      'TANGGAL INSPEKSI',
      'NAMA PEMERIKSA',
      'PARAF',
      'KETERANGAN',
    ]);

    // Kelompokkan lagi per Lantai/Sub-Area di dalam gedung
    const lantaiMap = {};
    gedungItems.forEach((it) => {
      const l = it.lantai || 'Lantai 1';
      if (!lantaiMap[l]) lantaiMap[l] = [];
      lantaiMap[l].push(it);
    });

    let rowNum = 1;
    Object.keys(lantaiMap).forEach((lantaiName) => {
      // Sub-Header Lantai
      sheetData.push(['', '', `${gedungName.toUpperCase()} ( ${lantaiName.toUpperCase()} )`]);

      lantaiMap[lantaiName].forEach((item) => {
        const lap = laporanMap[item.kodeItem] || null;

        // Jenis & Ukuran
        const isApar = item.jenis === 'apar';
        const jenisApar = isApar ? item.tipeMedia || 'DCP' : '';
        const ukuran = isApar ? parseFloat(item.ukuran) || item.ukuran || '' : '';
        const jumlah = item.jumlah || 1;
        const ihb = !isApar && (item.tipeHydrant === 'IHB' || item.namaItem?.includes('IHB')) ? 'v' : '-';
        const ohb = !isApar && (item.tipeHydrant === 'OHB' || item.namaItem?.includes('OHB')) ? 'v' : '-';

        // Kondisi
        let kondisiBulanIni = 'Siap Operasi';
        if (lap) {
          if (lap.status === 'rusak') {
            kondisiBulanIni = 'Rusak';
          } else if (lap.status === 'perlu_perhatian') {
            kondisiBulanIni = 'Perlu Perhatian';
          } else {
            kondisiBulanIni = isApar ? 'Siap Operasi' : 'Lengkap 1';
          }
        } else {
          kondisiBulanIni = isApar ? 'Siap Operasi' : 'Lengkap 1';
        }

        const tglInspeksi = lap?.createdAt
          ? new Date(lap.createdAt).toLocaleDateString('id-ID')
          : '';
        const namaPemeriksa = lap?.petugas?.nama || '';
        const paraf = lap ? 'TERVERIFIKASI' : '';
        const keterangan = lap?.keterangan || item.detailLokasi || '';

        sheetData.push([
          rowNum++,
          item.kodeItem,
          item.lokasi,
          jenisApar,
          ukuran,
          jumlah,
          ihb,
          ohb,
          isApar ? 'Siap Operasi' : 'Lengkap 1',
          kondisiBulanIni,
          tglInspeksi,
          namaPemeriksa,
          paraf,
          keterangan,
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set lebar kolom yang proporsional
    ws['!cols'] = [
      { wch: 6 },  // NO
      { wch: 14 }, // NOMOR ZONA
      { wch: 38 }, // LOKASI
      { wch: 12 }, // JENIS APAR
      { wch: 12 }, // UKURAN (Kg)
      { wch: 8 },  // JUMLAH
      { wch: 14 }, // IHB
      { wch: 14 }, // OHB
      { wch: 18 }, // KONDISI LALU
      { wch: 18 }, // KONDISI INI
      { wch: 16 }, // TGL INSPEKSI
      { wch: 20 }, // NAMA PEMERIKSA
      { wch: 14 }, // PARAF
      { wch: 30 }, // KETERANGAN
    ];

    // Truncate sheet name max 31 chars (Excel limitation)
    let cleanSheetTitle = gedungName.replace(/[\/\\\?\*\[\]]/g, '-').substring(0, 30);
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetTitle);
  });

  // Simpan file
  const fileName = `REKAP_INSPEKSI_ARFF_ZONA_${zona}_${bulanTahun.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
