const { AnggotaArff } = require('../models');
const { verifyToken } = require('../utils/token');

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
      return res.status(401).json({
        status: 'error',
        message: 'Token autentikasi wajib dikirim',
      });
    }

    const payload = verifyToken(token);
    const user = await AnggotaArff.findByPk(payload.sub);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Akun anggota ARFF tidak ditemukan',
      });
    }

    req.user = user;
    req.auth = payload;

    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token autentikasi tidak valid atau telah kadaluarsa',
    });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Autentikasi diperlukan',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Akses tidak diizinkan untuk role ini',
      });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
