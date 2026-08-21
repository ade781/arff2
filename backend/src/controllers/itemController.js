const QRCode = require('qrcode');
const { Op } = require('sequelize');
const { Item } = require('../models');
const { CHECKLISTS } = require('../constants/checklists');
const { successResponse, errorResponse } = require('../utils/response');
const { buildQrPayload, presentItem } = require('../utils/itemPresenter');

async function createItem(req, res, next) {
  try {
    const {
      kodeItem,
      namaItem,
      nama,
      jenis,
      tipe,
      zona,
      lokasi,
      detailLokasi,
      exp,
      status,
    } = req.body;

    const finalKodeItem = (kodeItem || '').trim();
    const finalNamaItem = (namaItem || nama || '').trim();
    const finalJenis = (jenis || tipe || 'apar').toLowerCase().trim();
    const finalZona = (zona || 'A').toUpperCase().trim();
    const finalLokasi = (lokasi || '').trim();
    const finalStatus = (status || 'aktif').toLowerCase().trim();

    if (!finalKodeItem || !finalNamaItem || !finalLokasi) {
      return errorResponse(res, 400, 'Kode item, nama item, dan lokasi wajib diisi');
    }

    if (!['apar', 'hydrant'].includes(finalJenis)) {
      return errorResponse(res, 400, 'Jenis item hanya boleh apar atau hydrant');
    }

    if (!['A', 'B', 'C', 'D'].includes(finalZona)) {
      return errorResponse(res, 400, 'Zona hanya boleh A, B, C, atau D');
    }

    const existing = await Item.findOne({ where: { kodeItem: finalKodeItem } });
    if (existing) {
      return errorResponse(res, 409, `Kode item ${finalKodeItem} sudah terdaftar`);
    }

    const item = await Item.create({
      kodeItem: finalKodeItem,
      namaItem: finalNamaItem,
      jenis: finalJenis,
      zona: finalZona,
      lokasi: finalLokasi,
      detailLokasi: detailLokasi || null,
      exp: exp || null,
      status: finalStatus,
    });

    return successResponse(res, 201, 'Equipment item berhasil ditambahkan', {
      item: presentItem(item),
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllItems(req, res, next) {
  try {
    const { zona, jenis, tipe, status, search } = req.query;
    const where = {};

    if (zona) where.zona = String(zona).toUpperCase();
    if (jenis || tipe) where.jenis = String(jenis || tipe).toLowerCase();
    if (status) where.status = String(status).toLowerCase();

    if (search) {
      where[Op.or] = [
        { kodeItem: { [Op.like]: `%${search}%` } },
        { namaItem: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } },
      ];
    }

    const items = await Item.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });

    const mapped = items.map(presentItem);

    return successResponse(res, 200, 'Data equipment berhasil dimuat', {
      items: mapped,
      equipment: mapped,
    });
  } catch (error) {
    return next(error);
  }
}

async function getItemById(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return errorResponse(res, 404, 'Equipment item tidak ditemukan');
    }

    const qrPayload = buildQrPayload(item.kodeItem);
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { width: 320, margin: 2 });
    const checklist = CHECKLISTS[item.jenis] || [];
    const data = presentItem(item);

    return successResponse(res, 200, 'Detail equipment berhasil dimuat', {
      item: data,
      equipment: data,
      qrPayload,
      qrCodeDataUrl,
      checklist,
    });
  } catch (error) {
    return next(error);
  }
}

async function getItemByQr(req, res, next) {
  try {
    const rawQr = decodeURIComponent(req.params.kodeQr || '').trim();

    // Mendukung scan format 'ARFF-YIA:APAR-A-001' atau langsung 'APAR-A-001'
    const kodeItem = rawQr.startsWith('ARFF-YIA:')
      ? rawQr.replace('ARFF-YIA:', '').trim()
      : rawQr;

    const item = await Item.findOne({ where: { kodeItem } });

    if (!item) {
      return errorResponse(res, 404, `Equipment dengan kode QR '${rawQr}' tidak ditemukan`);
    }

    const checklist = CHECKLISTS[item.jenis] || [];
    const data = presentItem(item);

    return successResponse(res, 200, 'Data equipment berhasil ditemukan', {
      item: data,
      equipment: data,
      checklist,
    });
  } catch (error) {
    return next(error);
  }
}

async function getItemQrCode(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return errorResponse(res, 404, 'Equipment item tidak ditemukan');
    }

    const qrPayload = buildQrPayload(item.kodeItem);
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { width: 360, margin: 2 });
    const data = presentItem(item);

    return successResponse(res, 200, 'QR Code berhasil dibuat', {
      qrPayload,
      qrCodeDataUrl,
      item: data,
      equipment: data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return errorResponse(res, 404, 'Equipment item tidak ditemukan');
    }

    const {
      kodeItem,
      namaItem,
      nama,
      jenis,
      tipe,
      zona,
      lokasi,
      detailLokasi,
      exp,
      status,
    } = req.body;

    const finalKodeItem = (kodeItem || item.kodeItem).trim();
    const finalNamaItem = (namaItem || nama || item.namaItem).trim();
    const finalJenis = (jenis || tipe || item.jenis).toLowerCase().trim();
    const finalZona = (zona || item.zona).toUpperCase().trim();
    const finalLokasi = (lokasi || item.lokasi).trim();
    const finalStatus = (status || item.status).toLowerCase().trim();

    if (finalKodeItem !== item.kodeItem) {
      const existing = await Item.findOne({ where: { kodeItem: finalKodeItem } });
      if (existing) {
        return errorResponse(res, 409, `Kode item ${finalKodeItem} sudah digunakan`);
      }
    }

    await item.update({
      kodeItem: finalKodeItem,
      namaItem: finalNamaItem,
      jenis: finalJenis,
      zona: finalZona,
      lokasi: finalLokasi,
      detailLokasi: detailLokasi !== undefined ? detailLokasi : item.detailLokasi,
      exp: exp !== undefined ? exp : item.exp,
      status: finalStatus,
    });

    return successResponse(res, 200, 'Equipment item berhasil diperbarui', {
      item: presentItem(item),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return errorResponse(res, 404, 'Equipment item tidak ditemukan');
    }

    await item.destroy();

    return successResponse(res, 200, `Equipment item ${item.kodeItem} berhasil dihapus`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  getItemByQr,
  getItemQrCode,
  updateItem,
  deleteItem,
};
