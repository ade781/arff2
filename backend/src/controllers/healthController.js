const sequelize = require('../config/database');
const { successResponse } = require('../utils/response');

async function getHealth(req, res, next) {
  try {
    await sequelize.authenticate();

    return successResponse(res, 200, 'Sistem berjalan normal', {
      app: 'ARFF YIA API',
      database: process.env.DB_NAME || 'arff2',
      databaseConnected: true,
    });
  } catch (error) {
    const databaseError = new Error(
      error.original?.message || error.parent?.message || error.message || 'Koneksi database gagal',
    );

    databaseError.statusCode = 503;
    databaseError.publicMessage = 'Database belum terhubung';
    return next(databaseError);
  }
}

module.exports = {
  getHealth,
};
