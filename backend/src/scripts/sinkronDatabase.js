require('dotenv').config();
const { sequelize } = require('../models');

async function sinkronDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database MySQL berhasil.');

    // Force sync akan men-drop tabel lama dan membuat 5 tabel baru secara otomatis
    const isForce = process.env.DB_SYNC_FORCE === 'true' || process.argv.includes('--force');
    await sequelize.sync({ force: isForce, alter: !isForce });

    console.log(`Database ${process.env.DB_NAME || 'arff2'} berhasil disinkronkan (5 Tabel Baru). Mode force: ${isForce}`);
    await sequelize.close();
  } catch (error) {
    const message = error.original?.message || error.parent?.message || error.message || 'Koneksi database gagal';
    console.error('Gagal sinkronisasi database:', message);
    process.exitCode = 1;
  }
}

sinkronDatabase();
