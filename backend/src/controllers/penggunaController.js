const bcrypt = require('bcryptjs');
const { AnggotaArff } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { presentPengguna } = require('../utils/penggunaPresenter');

async function getAllPengguna(req, res, next) {
  try {
    const users = await AnggotaArff.findAll({
      attributes: ['id', 'nama', 'username', 'unit', 'regu', 'role', 'createdAt', 'updatedAt'],
      order: [
        ['role', 'ASC'], 
        ['nama', 'ASC'],
      ],
    });

    return successResponse(res, 200, 'Daftar pengguna berhasil dimuat', {
      pengguna: users.map(presentPengguna),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPenggunaById(req, res, next) {
  try {
    const user = await AnggotaArff.findByPk(req.params.id, {
      attributes: ['id', 'nama', 'username', 'unit', 'regu', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    }

    return successResponse(res, 200, 'Detail pengguna berhasil dimuat', {
      pengguna: presentPengguna(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function createPengguna(req, res, next) {
  try {
    const { nama, username, password, role = 'petugas', regu, unit = 'ARFF YIA' } = req.body;

    if (!nama || !username || !password) {
      return errorResponse(res, 400, 'Nama lengkap, username, dan password wajib diisi');
    }

    if (!['admin', 'petugas'].includes(role)) {
      return errorResponse(res, 400, "Role hanya boleh 'admin' atau 'petugas'");
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password minimal 6 karakter');
    }

    const cleanUsername = username.trim().toLowerCase();

    const existingUser = await AnggotaArff.findOne({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return errorResponse(res, 409, `Username '${cleanUsername}' sudah digunakan oleh akun lain`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AnggotaArff.create({
      nama: nama.trim(),
      username: cleanUsername,
      password: hashedPassword,
      role,
      regu: regu || null,
      unit: unit.trim() || 'ARFF YIA',
    });

    return successResponse(res, 201, 'Pengguna baru berhasil didaftarkan', {
      pengguna: presentPengguna(newUser),
    });
  } catch (error) {
    return next(error);
  }
}

async function updatePengguna(req, res, next) {
  try {
    const user = await AnggotaArff.findByPk(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    }

    const { nama, username, role, regu, unit } = req.body;

    if (role && !['admin', 'petugas'].includes(role)) {
      return errorResponse(res, 400, "Role hanya boleh 'admin' atau 'petugas'");
    }

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await AnggotaArff.findOne({ where: { username: cleanUsername } });
      if (existing) {
        return errorResponse(res, 409, `Username '${cleanUsername}' sudah digunakan`);
      }
      user.username = cleanUsername;
    }

    if (nama) user.nama = nama.trim();
    if (role) user.role = role;
    if (regu !== undefined) user.regu = regu || null;
    if (unit) user.unit = unit.trim();

    await user.save();

    return successResponse(res, 200, 'Data pengguna berhasil diperbarui', {
      pengguna: presentPengguna(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const user = await AnggotaArff.findByPk(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, 400, 'Password baru minimal 6 karakter');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return successResponse(res, 200, `Password untuk akun '${user.username}' berhasil direset`);
  } catch (error) {
    return next(error);
  }
}

async function deletePengguna(req, res, next) {
  try {
    const targetId = Number(req.params.id);

    if (req.user.id === targetId) {
      return errorResponse(res, 400, 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif');
    }

    const user = await AnggotaArff.findByPk(targetId);

    if (!user) {
      return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    }

    await user.destroy();

    return successResponse(res, 200, `Akun '${user.username}' berhasil dihapus`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  resetPassword,
  deletePengguna,
};
