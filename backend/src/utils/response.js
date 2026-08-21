
function successResponse(res, statusCode = 200, message = 'Berhasil', data = null) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
}

function errorResponse(res, statusCode = 400, message = 'Terjadi kesalahan') {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
