require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');

const port = Number(process.env.APP_PORT || 5000);

async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Database ${process.env.DB_NAME || 'arff2'} terhubung.`);
  } catch (error) {
    const message = error.original?.message || error.parent?.message || error.message || 'Koneksi database gagal';
    console.warn(`Database belum terhubung: ${message}`);
    console.warn('Server tetap berjalan. Periksa konfigurasi .env atau status MySQL sebelum memakai endpoint database.');
  }
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`ARFF YIA API berjalan di http://localhost:${port}`);
  checkDatabaseConnection();
});

async function shutdown(signal) {
  console.log(`${signal} diterima, menutup server...`);
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
