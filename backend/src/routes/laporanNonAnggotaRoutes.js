const express = require('express');
const {
  submitLaporan,
  getAllLaporan,
} = require('../controllers/laporanNonAnggotaController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadFoto } = require('../middlewares/uploadMiddleware');
const { aduanLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

router.post('/', aduanLimiter, uploadFoto.single('foto'), submitLaporan);

router.get('/', authenticate, authorizeRoles('admin'), getAllLaporan);

module.exports = router;
