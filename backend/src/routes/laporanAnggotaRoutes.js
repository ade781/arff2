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

router.get('/export-excel-zona', authenticate, exportExcelZona);

router.get('/export/csv', authenticate, exportCsv);

router.post('/', authenticate, uploadFoto.single('foto'), submitLaporan);

router.get('/', authenticate, getAllLaporan);
router.get('/:id', authenticate, getLaporanById);

module.exports = router;
