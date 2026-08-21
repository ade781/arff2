const { AnggotaArff } = require('../models');
const { verifyToken } = require('../utils/token');
const { errorResponse } = require('../utils/response');

function getBearerToken(req) {
  const authorization = req.headers.authorization || '';
  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function authenticate(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return errorResponse(res, 401, 'Token autentikasi wajib dikirim');
    }

    const payload = verifyToken(token);
    const user = await AnggotaArff.findByPk(payload.sub);

    if (!user) {
      return errorResponse(res, 401, 'Akun anggota ARFF tidak ditemukan');
    }

    req.user = user;
    req.auth = payload;

    return next();
  } catch (error) {
    return errorResponse(res, 401, 'Token autentikasi tidak valid atau telah kadaluarsa');
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {

    if (!req.user) {
      return errorResponse(res, 401, 'Autentikasi diperlukan');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Akses tidak diizinkan untuk role ini');
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
