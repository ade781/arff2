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
      gedung,
      lantai,
      lokasi,
      detailLokasi,
      tipeMedia,
      ukuran,
      tipeHydrant,
      merk,
      jumlah,
      exp,
      status,
    } = req.body;

    const finalKodeItem = (kodeItem || '').trim();
    const finalNamaItem = (namaItem || nama || '').trim();
    const finalJenis = (jenis || tipe || 'apar').toLowerCase().trim();
    const finalZona = (zona || '1').toUpperCase().trim();
    const finalLokasi = (lokasi || '').trim();
    const finalStatus = (status || 'aktif').toLowerCase().trim();

    if (!finalKodeItem || !finalNamaItem || !finalLokasi) {
      return errorResponse(res, 400, 'Kode item, nama item, dan lokasi wajib diisi');
    }

    if (!['apar', 'hydrant'].includes(finalJenis)) {
      return errorResponse(res, 400, 'Jenis item hanya boleh apar atau hydrant');
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
      gedung: (gedung || '').trim() || null,
      lantai: (lantai || '').trim() || null,
      lokasi: finalLokasi,
      detailLokasi: detailLokasi || null,
      tipeMedia: (tipeMedia || '').trim() || null,
      ukuran: (ukuran || '').trim() || null,
      tipeHydrant: (tipeHydrant || '').trim() || null,
      merk: (merk || '').trim() || null,
      jumlah: Number(jumlah) || 1,
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
    const { zona, jenis, tipe, gedung, lantai, status, search } = req.query;
    const where = {};

    if (zona) where.zona = String(zona).toUpperCase();
    if (jenis || tipe) where.jenis = String(jenis || tipe).toLowerCase();
    if (gedung) where.gedung = String(gedung);
    if (lantai) where.lantai = String(lantai);
    if (status) where.status = String(status).toLowerCase();

    if (search) {
      where[Op.or] = [
        { kodeItem: { [Op.like]: `%${search}%` } },
        { namaItem: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } },
        { gedung: { [Op.like]: `%${search}%` } },
      ];
    }

    const items = await Item.findAll({
      where,
      order: [
        ['zona', 'ASC'],
        ['gedung', 'ASC'],
        ['kodeItem', 'ASC'],
      ],
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
      gedung,
      lantai,
      lokasi,
      detailLokasi,
      tipeMedia,
      ukuran,
      tipeHydrant,
      merk,
      jumlah,
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
      gedung: gedung !== undefined ? gedung : item.gedung,
      lantai: lantai !== undefined ? lantai : item.lantai,
      lokasi: finalLokasi,
      detailLokasi: detailLokasi !== undefined ? detailLokasi : item.detailLokasi,
      tipeMedia: tipeMedia !== undefined ? tipeMedia : item.tipeMedia,
      ukuran: ukuran !== undefined ? ukuran : item.ukuran,
      tipeHydrant: tipeHydrant !== undefined ? tipeHydrant : item.tipeHydrant,
      merk: merk !== undefined ? merk : item.merk,
      jumlah: jumlah !== undefined ? Number(jumlah) : item.jumlah,
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
