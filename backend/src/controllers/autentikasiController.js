const bcrypt = require('bcryptjs');
const { AnggotaArff } = require('../models');
const { signToken } = require('../utils/token');
const { successResponse, errorResponse } = require('../utils/response');
const { presentPengguna } = require('../utils/presenters');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 400, 'Username dan password wajib diisi');
    }

    const cleanUsername = username.trim().toLowerCase();

    const user = await AnggotaArff.findOne({
      where: { username: cleanUsername },
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
      user: presentPengguna(user),
    });
  } catch (error) {
    return next(error);
  }
}

function getProfile(req, res) {
  return successResponse(res, 200, 'Profil anggota berhasil dimuat', {
    user: presentPengguna(req.user),
  });
}

module.exports = {
  login,
  getProfile,
};
