const express = require('express');
const {
  submitLaporan,
  getAllLaporan,
  exportCsv,
  exportExcelZona,
  getLaporanById,
} = require('../controllers/laporanAnggotaController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadFoto } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Export file Excel High Fidelity resmi ARFF per Zona
router.get('/export-excel-zona', authenticate, exportExcelZona);

// Export data rekapitulasi ke CSV (Excel compatible)
router.get('/export/csv', authenticate, exportCsv);

// Petugas & Admin submit laporan pemeriksaan (mendukung upload file fisik 'foto')
router.post('/', authenticate, uploadFoto.single('foto'), submitLaporan);

// Lihat semua laporan pemeriksaan
router.get('/', authenticate, getAllLaporan);
router.get('/:id', authenticate, getLaporanById);

module.exports = router;
