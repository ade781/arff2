const { Op } = require('sequelize');
const { LaporanNonAnggota, NonAnggota, Item } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { cleanQrCode } = require('../utils/presenters');

async function submitLaporan(req, res, next) {
  try {
    const {
      username,
      nama,
      kontak,
      kodeQr,
      idItem,
      keterangan,
    } = req.body;

    const finalUsername = (username || nama || '').trim();
    const finalKeterangan = (keterangan || '').trim();

    if (!finalUsername) {
      return errorResponse(res, 400, 'Nama atau identitas pelapor wajib diisi');
    }

    if (!finalKeterangan) {
      return errorResponse(res, 400, 'Keterangan kerusakan atau temuan wajib diisi');
    }

    let targetItem = null;

    if (idItem) {
      targetItem = await Item.findByPk(idItem);
    } else if (kodeQr) {
      targetItem = await Item.findOne({ where: { kodeItem: cleanQrCode(kodeQr) } });
    }

    if (!targetItem) {
      return errorResponse(res, 404, 'Equipment item yang dilaporkan tidak ditemukan');
    }

    let pelapor = await NonAnggota.findOne({
      where: { username: finalUsername },
    });

    if (!pelapor) {
      pelapor = await NonAnggota.create({
        username: finalUsername,
        kontak: (kontak || '').trim() || null,
      });
    }

    let fotoUrl = req.body.foto || null;
    if (req.file) {
      fotoUrl = `/uploads/${req.file.filename}`;
    }

    const laporan = await LaporanNonAnggota.create({
      idNonAnggota: pelapor.id,
      idItem: targetItem.id,
      keterangan: finalKeterangan,
      foto: fotoUrl,
    });

    if (targetItem.status === 'aktif') {
      await targetItem.update({ status: 'perbaikan' });
    }

    return successResponse(res, 201, 'Laporan aduan berhasil dikirim ke tim ARFF YIA', {
      laporan,
      pelapor,
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllLaporan(req, res, next) {
  try {
    const { tanggalMulai, tanggalSelesai, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (tanggalMulai && tanggalSelesai) {
      where.createdAt = {
        [Op.between]: [
          new Date(`${tanggalMulai}T00:00:00.000Z`),
          new Date(`${tanggalSelesai}T23:59:59.999Z`),
        ],
      };
    } else if (tanggalMulai) {
      where.createdAt = { [Op.gte]: new Date(`${tanggalMulai}T00:00:00.000Z`) };
    } else if (tanggalSelesai) {
      where.createdAt = { [Op.lte]: new Date(`${tanggalSelesai}T23:59:59.999Z`) };
    }

    const isUnlimited = limit === 'all' || Number(limit) === 0;
    const queryLimit = isUnlimited ? 2000 : Math.min(Number(limit) || 50, 1000);
    const queryOffset = isUnlimited ? 0 : Math.max(Number(offset) || 0, 0);

    const { count, rows } = await LaporanNonAnggota.findAndCountAll({
      where,
      include: [
        {
          model: NonAnggota,
          as: 'pelapor',
          attributes: ['id', 'username', 'kontak', 'createdAt'],
        },
        {
          model: Item,
          as: 'item',
          paranoid: false,
          attributes: ['id', 'kodeItem', 'namaItem', 'jenis', 'zona', 'lokasi', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset: queryOffset,
    });

    return successResponse(res, 200, 'Data laporan aduan non-anggota berhasil dimuat', {
      total: count,
      laporan: rows,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitLaporan,
  getAllLaporan,
};
