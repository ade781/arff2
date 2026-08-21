const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aduanLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 20, 
  message: {
    status: 'error',
    message: 'Terlalu banyak pengiriman aduan. Silakan tunggu beberapa menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
});

const qrLookupLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 60, 
  message: {
    status: 'error',
    message: 'Terlalu banyak permintaan lookup QR. Silakan coba lagi dalam 1 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  aduanLimiter,
  apiLimiter,
  qrLookupLimiter,
};
