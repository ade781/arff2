require('dotenv').config();
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { Item, sequelize } = require('../models');

const DOCS_DIR = path.join(__dirname, '../../../docs');

const ZONA_FILES = [
  { file: 'ZONA 1.xlsx', zona: '1', defaultRegu: 'Regu Delta' },
  { file: 'ZONA 2.xlsx', zona: '2', defaultRegu: 'Regu Charlie' },
  { file: 'ZONA 3.xlsx', zona: '3', defaultRegu: 'Regu Bravo' },
  { file: 'ZONA 4.xlsx', zona: '4', defaultRegu: 'Regu Alfa' },
];

function cleanString(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function parseSheetData(sheet, zona, sheetName) {
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length < 5) return [];

  const items = [];
  let currentLantai = '';
  let currentSubArea = sheetName;

  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const col0 = cleanString(row[0]);
    const col1 = cleanString(row[1]);
    const col2 = cleanString(row[2]);
    const col3 = cleanString(row[3]);
    const col4 = cleanString(row[4]);
    const col5 = cleanString(row[5]);
    const col6 = cleanString(row[6]); // IHB
    const col7 = cleanString(row[7]); // OHB
    const col13 = cleanString(row[13]); // Keterangan

    // Cek apakah baris ini adalah header seksi lokasi/lantai (misal: "MAIN POWER HOUSE / MPH ( LANTAI 1 )")
    const combinedRowText = row.slice(0, 5).map(cleanString).join(' ').trim();
    if (
      !col0.match(/^\d+(\.\d+)?$/) &&
      !col1.match(/^[A-Z]\.\d+/i) &&
      combinedRowText.length > 3 &&
      !combinedRowText.includes('DAFTAR INSPEKSI') &&
      !combinedRowText.includes('YOGYAKARTA') &&
      !combinedRowText.includes('NOMOR ZONA')
    ) {
      // Ini sub-area / lantai header
      currentSubArea = combinedRowText.replace(/\s+/g, ' ');
      if (combinedRowText.match(/LANTAI\s*(\d+|BASEMENT|MEZZANINE|DASAR|KEBERANGKATAN)/i)) {
        const match = combinedRowText.match(/LANTAI\s*(\d+|BASEMENT|MEZZANINE|DASAR|KEBERANGKATAN)/i);
        currentLantai = `Lantai ${match[1].toUpperCase()}`;
      } else if (sheetName.toLowerCase().includes('basement')) {
        currentLantai = 'Basement';
      } else if (sheetName.toLowerCase().includes('mezzanine')) {
        currentLantai = 'Mezzanine';
      } else if (sheetName.toLowerCase().includes('dasar')) {
        currentLantai = 'Lantai Dasar';
      } else if (sheetName.toLowerCase().includes('keberangkatan')) {
        currentLantai = 'Lt. Keberangkatan';
      }
      continue;
    }

    // Identifikasi kode item (misal: A.001, B.045, C.012, D.015, E.001)
    let kodeItem = col1;
    if (!kodeItem && col0.match(/^[A-Z]\.\d+/i)) {
      kodeItem = col0;
    }

    // Jika tidak ada kode item valid, lewati baris
    if (!kodeItem || kodeItem === 'NOMOR ZONA' || kodeItem === 'NOMOR BODY LAMBUNG KENDARAAN') {
      continue;
    }

    const lokasi = col2 || currentSubArea || `Area ${sheetName}`;
    const mediaRaw = col3.toUpperCase();
    const ukuranNum = parseFloat(col4) || null;
    const jumlahNum = parseInt(col5, 10) || 1;

    const isIhb = col6.toLowerCase() === 'v' || col6.includes('1') || col6.includes('✓');
    const isOhb = col7.toLowerCase() === 'v' || col7.includes('v') || col7.includes('✓');

    let jenis = 'apar';
    let tipeMedia = null;
    let ukuran = null;
    let tipeHydrant = null;
    let merk = null;

    if (mediaRaw.includes('DCP') || mediaRaw.includes('POWDER')) {
      jenis = 'apar';
      tipeMedia = 'DCP';
      ukuran = ukuranNum ? `${ukuranNum} Kg` : '6 Kg';
    } else if (mediaRaw.includes('CO2')) {
      jenis = 'apar';
      tipeMedia = 'CO2';
      ukuran = ukuranNum ? `${ukuranNum} Kg` : '5 Kg';
    } else if (mediaRaw.includes('FOAM')) {
      jenis = 'apar';
      tipeMedia = 'FOAM';
      ukuran = ukuranNum ? `${ukuranNum} Kg` : '9 L';
    } else if (mediaRaw.includes('CLEAN')) {
      jenis = 'apar';
      tipeMedia = 'CLEAN AGENT';
      ukuran = ukuranNum ? `${ukuranNum} Kg` : '6 Kg';
    } else if (isIhb) {
      jenis = 'hydrant';
      tipeHydrant = 'IHB';
    } else if (isOhb) {
      jenis = 'hydrant';
      tipeHydrant = 'OHB';
    } else if (lokasi.toLowerCase().includes('siamese')) {
      jenis = 'hydrant';
      tipeHydrant = 'SIAMESE';
    } else if (lokasi.toLowerCase().includes('hydrant') || lokasi.toLowerCase().includes('ihb')) {
      jenis = 'hydrant';
      tipeHydrant = 'IHB';
    } else if (lokasi.toLowerCase().includes('ohb')) {
      jenis = 'hydrant';
      tipeHydrant = 'OHB';
    } else {
      jenis = 'apar';
      tipeMedia = 'DCP';
      ukuran = ukuranNum ? `${ukuranNum} Kg` : '6 Kg';
    }

    // Nama item yang representatif
    let namaItem = '';
    if (jenis === 'apar') {
      namaItem = `APAR ${tipeMedia || 'DCP'} ${ukuran || ''} - ${lokasi}`.replace(/\s+/g, ' ').trim();
    } else {
      namaItem = `Hydrant ${tipeHydrant || 'Box'} - ${lokasi}`.replace(/\s+/g, ' ').trim();
    }

    if (namaItem.length > 150) {
      namaItem = namaItem.substring(0, 147) + '...';
    }

    items.push({
      kodeItem,
      namaItem,
      jenis,
      zona,
      gedung: sheetName,
      lantai: currentLantai || 'Lantai 1',
      lokasi: currentSubArea ? `${currentSubArea} - ${lokasi}` : lokasi,
      detailLokasi: col13 || null,
      tipeMedia,
      ukuran,
      tipeHydrant,
      merk,
      jumlah: jumlahNum,
      status: 'aktif',
    });
  }

  return items;
}

async function runImport() {
  try {
    await sequelize.authenticate();
    console.log('--- Memulai Impor Data Excel Zona 1-4 ke Database ---');

    let totalImported = 0;
    let totalUpdated = 0;

    for (const z of ZONA_FILES) {
      const filePath = path.join(DOCS_DIR, z.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File tidak ditemukan: ${filePath}`);
        continue;
      }

      console.log(`\n📂 Membaca ${z.file} (Zona ${z.zona})...`);
      const workbook = xlsx.readFile(filePath);

      for (const sheetName of workbook.SheetNames) {
        if (
          sheetName.toUpperCase().includes('COVER') ||
          sheetName.toUpperCase().includes('DENAH')
        ) {
          continue;
        }

        const sheet = workbook.Sheets[sheetName];
        const extracted = parseSheetData(sheet, z.zona, sheetName);
        console.log(`   ├─ Sheet "${sheetName}": ${extracted.length} equipment ditemukan`);

        for (const itemData of extracted) {
          const existing = await Item.findOne({
            where: { kodeItem: itemData.kodeItem },
            paranoid: false,
          });

          if (existing) {
            await existing.update(itemData);
            if (existing.deletedAt) {
              await existing.restore();
            }
            totalUpdated++;
          } else {
            await Item.create(itemData);
            totalImported++;
          }
        }
      }
    }

    console.log('\n========================================');
    console.log(`✅ Impor Selesai!`);
    console.log(`• Equipment Baru Ditambahkan : ${totalImported}`);
    console.log(`• Equipment Diperbarui      : ${totalUpdated}`);
    console.log(`• Total Equipment di DB     : ${await Item.count()}`);
    console.log('========================================\n');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Gagal impor data Excel:', error);
    process.exitCode = 1;
  }
}

runImport();
