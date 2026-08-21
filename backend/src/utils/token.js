const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'ganti_dengan_secret_yang_panjang')) {
    throw new Error('JWT_SECRET belum dikonfigurasi dengan aman');
  }

  return secret || 'arff_yia_local_development_secret';
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id || user.sub,
      role: user.role,
      username: user.username,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signToken,
  verifyToken,
};
