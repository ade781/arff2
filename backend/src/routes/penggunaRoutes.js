const express = require('express');
const {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  resetPassword,
  deletePengguna,
} = require('../controllers/penggunaController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Seluruh endpoint pengguna dilindungi khusus Role Admin
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/', getAllPengguna);
router.get('/:id', getPenggunaById);
router.post('/', createPengguna);
router.put('/:id', updatePengguna);
router.put('/:id/reset-password', resetPassword);
router.delete('/:id', deletePengguna);

module.exports = router;
