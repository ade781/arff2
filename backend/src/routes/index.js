const express = require('express');
const autentikasiRoutes = require('./autentikasiRoutes');
const itemRoutes = require('./itemRoutes');
const laporanAnggotaRoutes = require('./laporanAnggotaRoutes');
const laporanNonAnggotaRoutes = require('./laporanNonAnggotaRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

// Health Check
router.use('/health', healthRoutes);

// API Routes
router.use('/autentikasi', autentikasiRoutes);
router.use('/item', itemRoutes);
router.use('/laporan-anggota', laporanAnggotaRoutes);
router.use('/laporan-non-anggota', laporanNonAnggotaRoutes);

module.exports = router;

