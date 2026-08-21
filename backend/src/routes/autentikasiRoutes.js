const express = require('express');
const { login, getProfile } = require('../controllers/autentikasiController');
const { authenticate } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

router.post('/login', loginLimiter, login);
router.get('/profil', authenticate, getProfile);

module.exports = router;
