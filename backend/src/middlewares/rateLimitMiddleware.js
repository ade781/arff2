const rateLimit = require('express-rate-limit');

// Rate limiter untuk proteksi brute force login
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 10, // Maksimal 10 percobaan per IP per menit
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk form aduan publik non-anggota
const aduanLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 20, // Maksimal 20 aduan per IP per 5 menit
  message: {
    status: 'error',
    message: 'Terlalu banyak pengiriman aduan. Silakan tunggu beberapa menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Maksimal 1000 request per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk QR lookup publik (mencegah brute-force enumeration)
const qrLookupLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 60, // Maksimal 60 lookup per IP per menit
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
