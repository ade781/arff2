const xlsx = require('xlsx');
const { Op } = require('sequelize');
const { LaporanAnggota, Item, AnggotaArff } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { presentLaporanAnggota, cleanQrCode } = require('../utils/presenters');
const { exportLaporanToCsv } = require('../utils/csvExporter');
const { exportHighFidelityZonaExcel } = require('../utils/excelExporter');

const BULAN_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

function getDefaultBulanTahun() {
  const now = new Date();
  return `${BULAN_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function getDefaultBulanLalu() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${BULAN_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;
}

async function submitLaporan(req, res, next) {
  try {
    const {
      kodeQr,
      idItem,
      status,
      keterangan,
      penggantian,
      checklist,
    } = req.body;

    let targetItem = null;

    if (idItem) {
      targetItem = await Item.findByPk(idItem);
    } else if (kodeQr) {
      targetItem = await Item.findOne({ where: { kodeItem: cleanQrCode(kodeQr) } });
    }

    if (!targetItem) {
      return errorResponse(res, 404, 'Equipment item yang diperiksa tidak ditemukan');
    }

    const finalStatus = (status || 'baik').toLowerCase().trim();
    const finalKeterangan = (keterangan || '').trim();
    const finalPenggantian = (penggantian || '').trim();

    let parsedChecklist = Array.isArray(checklist) ? checklist : [];
    if (typeof checklist === 'string') {
      try { parsedChecklist = JSON.parse(checklist); } catch (e) {}
    }

    let fotoUrl = req.body.foto || null;
    if (req.file) {
      fotoUrl = `/uploads/${req.file.filename}`;
    }

    const laporan = await LaporanAnggota.create({
      idAnggota: req.user.id,
      idItem: targetItem.id,
      status: finalStatus,
      keterangan: finalKeterangan,
      penggantian: finalPenggantian,
      foto: fotoUrl,
      checklist: parsedChecklist,
    });

    if (finalStatus === 'rusak') {
      await targetItem.update({ status: 'rusak' });
    } else if (finalStatus === 'perlu_perhatian') {
      await targetItem.update({ status: 'perbaikan' });
    } else if (finalStatus === 'baik' && targetItem.status !== 'aktif') {
      await targetItem.update({ status: 'aktif' });
    }

    return successResponse(res, 201, 'Laporan pemeriksaan anggota ARFF berhasil disimpan', { laporan });
  } catch (error) {
    return next(error);
  }
}

async function getAllLaporan(req, res, next) {
  try {
    const {
      status,
      tanggalMulai,
      tanggalSelesai,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {};

    if (status) {
      where.status = String(status).toLowerCase();
    }

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

    const { count, rows } = await LaporanAnggota.findAndCountAll({
      where,
      include: [
        {
          model: AnggotaArff,
          as: 'petugas',
          attributes: ['id', 'nama', 'username', 'unit', 'regu', 'role'],
        },
        {
          model: Item,
          as: 'item',
          paranoid: false,
          attributes: [
            'id',
            'kodeItem',
            'namaItem',
            'jenis',
            'zona',
            'gedung',
            'lantai',
            'lokasi',
            'detailLokasi',
            'tipeMedia',
            'ukuran',
            'tipeHydrant',
            'merk',
            'jumlah',
            'exp',
            'status',
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset: queryOffset,
    });

    const mapped = rows.map(presentLaporanAnggota);

    return successResponse(res, 200, 'Data laporan anggota berhasil dimuat', {
      total: count,
      laporan: mapped,
    });
  } catch (error) {
    return next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    const { status, tanggalMulai, tanggalSelesai } = req.query;
    const where = {};

    if (status) where.status = String(status).toLowerCase();
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

    const rows = await LaporanAnggota.findAll({
      where,
      include: [
        { model: AnggotaArff, as: 'petugas', attributes: ['nama', 'username', 'unit'] },
        { model: Item, as: 'item', paranoid: false, attributes: ['kodeItem', 'namaItem', 'jenis', 'zona', 'lokasi', 'exp'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const csv = exportLaporanToCsv(rows);
    const filename = `Rekap_Inspeksi_ARFF_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
}

async function getLaporanById(req, res, next) {
  try {
    const laporan = await LaporanAnggota.findByPk(req.params.id, {
      include: [
        { model: AnggotaArff, as: 'petugas', attributes: ['id', 'nama', 'username', 'unit', 'role'] },
        { model: Item, as: 'item', paranoid: false },
      ],
    });

    if (!laporan) {
      return errorResponse(res, 404, 'Laporan pemeriksaan tidak ditemukan');
    }

    return successResponse(res, 200, 'Detail laporan pemeriksaan anggota', {
      laporan: presentLaporanAnggota(laporan),
    });
  } catch (error) {
    return next(error);
  }
}

async function exportExcelZona(req, res, next) {
  try {
    const {
      zona = '1',
      bulanTahun = getDefaultBulanTahun(),
      bulanLalu = getDefaultBulanLalu(),
      regu = 'REGU DELTA',
      petugasName,
    } = req.query;

    const laporanList = await LaporanAnggota.findAll({
      include: [
        {
          model: Item,
          as: 'item',
          where: { zona: String(zona) },
          paranoid: false,
        },
        {
          model: AnggotaArff,
          as: 'petugas',
          attributes: ['id', 'nama', 'username', 'unit', 'regu'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const laporanMap = {};
    laporanList.forEach((lap) => {
      if (lap.item?.kodeItem && !laporanMap[lap.item.kodeItem]) {
        laporanMap[lap.item.kodeItem] = lap;
      }
    });

    const wb = exportHighFidelityZonaExcel({
      zona,
      bulanTahun,
      bulanLalu,
      regu,
      laporanMap,
      petugasName: petugasName || req.user?.nama || 'Petugas ARFF',
    });

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const cleanBulan = bulanTahun.replace(/\s+/g, '_');
    const filename = `REKAP_INSPEKSI_ARFF_ZONA_${zona}_${cleanBulan}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitLaporan,
  getAllLaporan,
  exportCsv,
  exportExcelZona,
  getLaporanById,
};
