require('dotenv').config();
const bcrypt = require('bcryptjs');
const { AnggotaArff, Item, NonAnggota, LaporanAnggota, LaporanNonAnggota, sequelize } = require('../models');

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

    // Sample Items
    const sampleItems = [
      {
        kodeItem: 'APAR-A-001',
        namaItem: 'APAR Powder 6kg Terminal',
        jenis: 'apar',
        zona: 'A',
        lokasi: 'Terminal Keberangkatan Lt. 2',
        detailLokasi: 'Dekat Gate 3 samping eskalator barat',
        exp: '2027-05-15',
        status: 'aktif',
      },
      {
        kodeItem: 'APAR-B-002',
        namaItem: 'APAR CO2 5kg Ruang Server',
        jenis: 'apar',
        zona: 'B',
        lokasi: 'Gedung Operasional Lt. 1',
        detailLokasi: 'Depan Ruang Server Utama',
        exp: '2026-12-30',
        status: 'aktif',
      },
      {
        kodeItem: 'HYD-A-001',
        namaItem: 'Hydrant Pillar No. 1 Apron',
        jenis: 'hydrant',
        zona: 'A',
        lokasi: 'Apron Timur Stand 04',
        detailLokasi: 'Tiang Apron Timur dekat Garbarata 2',
        exp: null,
        status: 'aktif',
      },
      {
        kodeItem: 'HYD-C-002',
        namaItem: 'Hydrant Box Terminal Kedatangan',
        jenis: 'hydrant',
        zona: 'C',
        lokasi: 'Baggage Claim Hall',
        detailLokasi: 'Samping Conveyor Belt 3',
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
