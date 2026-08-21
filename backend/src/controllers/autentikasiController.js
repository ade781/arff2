const bcrypt = require('bcryptjs');
const { AnggotaArff } = require('../models');
const { signToken } = require('../utils/token');
const { successResponse, errorResponse } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 400, 'Username dan password wajib diisi');
    }

    const user = await AnggotaArff.findOne({
      where: { username: username.trim() },
    });

    if (!user) {
      return errorResponse(res, 401, 'Username atau password salah');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, 401, 'Username atau password salah');
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return successResponse(res, 200, 'Login berhasil', {
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        unit: user.unit,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function getProfile(req, res) {
  return successResponse(res, 200, 'Profil anggota berhasil dimuat', {
    user: {
      id: req.user.id,
      nama: req.user.nama,
      username: req.user.username,
      unit: req.user.unit,
      role: req.user.role,
    },
  });
}

module.exports = {
  login,
  getProfile,
};
