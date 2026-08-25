require('dotenv').config();
const bcrypt = require('bcryptjs');
const { AnggotaArff, Item, sequelize } = require('../models');

async function isiDataAwal() {
  try {
    await sequelize.authenticate();

    const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123!', 10);
    const petugasPassword = await bcrypt.hash(process.env.SEED_PETUGAS_PASSWORD || 'Petugas123!', 10);

    const [adminUser] = await AnggotaArff.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        nama: 'Administrator ARFF',
        username: 'admin',
        password: adminPassword,
        unit: 'ARFF Station YIA',
        role: 'admin',
      },
    });

    const [petugasUser] = await AnggotaArff.findOrCreate({
      where: { username: 'petugas' },
      defaults: {
        nama: 'Petugas Lapangan ARFF',
        username: 'petugas',
        password: petugasPassword,
        unit: 'ARFF Station YIA',
        role: 'petugas',
      },
    });

    const sampleItems = [
      {
        kodeItem: 'A.001',
        namaItem: 'APAR Powder 6kg Terminal',
        jenis: 'apar',
        zona: '1',
        gedung: 'Terminal Keberangkatan',
        lantai: 'Lantai 2',
        lokasi: 'Terminal Keberangkatan Lt. 2',
        detailLokasi: 'Dekat Gate 3 samping eskalator barat',
        tipeMedia: 'DCP',
        ukuran: '6 Kg',
        exp: '2027-05-15',
        status: 'aktif',
      },
      {
        kodeItem: 'B.002',
        namaItem: 'APAR CO2 5kg Ruang Server',
        jenis: 'apar',
        zona: '2',
        gedung: 'Gedung Operasional',
        lantai: 'Lantai 1',
        lokasi: 'Gedung Operasional Lt. 1',
        detailLokasi: 'Depan Ruang Server Utama',
        tipeMedia: 'CO2',
        ukuran: '5 Kg',
        exp: '2026-12-30',
        status: 'aktif',
      },
      {
        kodeItem: 'C.001',
        namaItem: 'Hydrant Box Apron Stand 04',
        jenis: 'hydrant',
        zona: '3',
        gedung: 'Apron Terminal',
        lantai: 'Lantai 1',
        lokasi: 'Apron Timur Stand 04',
        detailLokasi: 'Tiang Apron Timur dekat Garbarata 2',
        tipeHydrant: 'OHB',
        exp: null,
        status: 'aktif',
      },
      {
        kodeItem: 'D.002',
        namaItem: 'Hydrant Box Baggage Claim',
        jenis: 'hydrant',
        zona: '4',
        gedung: 'Terminal Kedatangan',
        lantai: 'Lantai 1',
        lokasi: 'Baggage Claim Hall',
        detailLokasi: 'Samping Conveyor Belt 3',
        tipeHydrant: 'IHB',
        exp: null,
        status: 'aktif',
      },
    ];

    for (const itemData of sampleItems) {
      await Item.findOrCreate({
        where: { kodeItem: itemData.kodeItem },
        defaults: itemData,
      });
    }

    console.log('Seeding data awal berhasil:');
    console.log(`- Admin: ${adminUser.username}`);
    console.log(`- Petugas: ${petugasUser.username}`);
    console.log(`- Sample Items: ${sampleItems.length} equipment`);

    await sequelize.close();
  } catch (error) {
    console.error('Gagal mengisi data awal:', error.message);
    process.exitCode = 1;
  }
}

isiDataAwal();
