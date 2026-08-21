const express = require('express');
const autentikasiRoutes = require('./autentikasiRoutes');
const itemRoutes = require('./itemRoutes');
const laporanAnggotaRoutes = require('./laporanAnggotaRoutes');
const laporanNonAnggotaRoutes = require('./laporanNonAnggotaRoutes');
const penggunaRoutes = require('./penggunaRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/health', healthRoutes);

router.use('/autentikasi', autentikasiRoutes);
router.use('/item', itemRoutes);
router.use('/laporan-anggota', laporanAnggotaRoutes);
router.use('/laporan-non-anggota', laporanNonAnggotaRoutes);
router.use('/pengguna', penggunaRoutes);

module.exports = router;
