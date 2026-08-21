function notFoundHandler(req, res) {
  return res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
  });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    status: 'error',
    message: error.publicMessage || 'Terjadi kesalahan pada server',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
