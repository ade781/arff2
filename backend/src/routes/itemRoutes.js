const express = require('express');
const {
  createItem,
  getAllItems,
  getItemById,
  getItemByQr,
  getItemQrCode,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { qrLookupLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

router.get('/qr/:kodeQr', qrLookupLimiter, getItemByQr);

router.get('/', authenticate, getAllItems);
router.get('/:id', authenticate, getItemById);
router.get('/:id/qr-code', authenticate, getItemQrCode);

router.post('/', authenticate, authorizeRoles('admin'), createItem);
router.put('/:id', authenticate, authorizeRoles('admin'), updateItem);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteItem);

module.exports = router;
