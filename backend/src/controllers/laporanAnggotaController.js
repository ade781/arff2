const { Op } = require('sequelize');
const { LaporanAnggota, Item, AnggotaArff } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

async function submitLaporan(req, res, next) {
  try {
    const {
      kodeQr,
      idItem,
      hasilUmum,
      status,
      keterangan,
      catatan,
      penggantian,
      items,
      checklist,
    } = req.body;

    let targetItem = null;

    if (idItem) {
      targetItem = await Item.findByPk(idItem);
    } else if (kodeQr) {
      const cleanKode = kodeQr.startsWith('ARFF-YIA:') ? kodeQr.replace('ARFF-YIA:', '').trim() : kodeQr.trim();
      targetItem = await Item.findOne({ where: { kodeItem: cleanKode } });
    }

    if (!targetItem) {
      return errorResponse(res, 404, 'Equipment item yang diperiksa tidak ditemukan');
    }

    const finalStatus = (status || hasilUmum || 'baik').toLowerCase().trim();
    const finalKeterangan = (keterangan || catatan || '').trim();
    const finalPenggantian = (penggantian || '').trim();

    let parsedChecklist = Array.isArray(checklist) ? checklist : Array.isArray(items) ? items : [];
    if (typeof checklist === 'string') {
      try { parsedChecklist = JSON.parse(checklist); } catch (e) {}
    }

    // Jika ada upload file fisik
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

    // Update status item di master equipment
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
      hasilUmum,
      tanggalMulai,
      tanggalSelesai,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {};
    const filterStatus = status || hasilUmum;

    if (filterStatus) {
      where.status = String(filterStatus).toLowerCase();
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

    const { count, rows } = await LaporanAnggota.findAndCountAll({
      where,
      include: [
        {
          model: AnggotaArff,
          as: 'petugas',
          attributes: ['id', 'nama', 'username', 'unit', 'role'],
        },
        {
          model: Item,
          as: 'item',
          paranoid: false, // Sertakan equipment meskipun sudah di-soft-delete
          attributes: ['id', 'kodeItem', 'namaItem', 'jenis', 'zona', 'lokasi', 'detailLokasi', 'exp', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(limit) || 50, 100),
      offset: Math.max(Number(offset) || 0, 0),
    });

    const mapped = rows.map((r) => ({
      id: r.id,
      idAnggota: r.idAnggota,
      idItem: r.idItem,
      status: r.status,
      hasilUmum: r.status,
      keterangan: r.keterangan,
      catatan: r.keterangan,
      penggantian: r.penggantian,
      foto: r.foto,
      items: r.checklist || [],
      checklist: r.checklist || [],
      waktuPemeriksaan: r.createdAt,
      createdAt: r.createdAt,
      petugas: r.petugas,
      equipment: r.item ? {
        id: r.item.id,
        kodeEquipment: r.item.kodeItem,
        nama: r.item.namaItem,
        tipe: r.item.jenis,
        zona: r.item.zona,
        lokasi: r.item.lokasi,
        exp: r.item.exp,
        status: r.item.status,
      } : null,
      item: r.item,
    }));

    return successResponse(res, 200, 'Data laporan anggota berhasil dimuat', {
      total: count,
      laporan: mapped,
      inspections: mapped,
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
    }

    const rows = await LaporanAnggota.findAll({
      where,
      include: [
        { model: AnggotaArff, as: 'petugas', attributes: ['nama', 'username', 'unit'] },
        { model: Item, as: 'item', paranoid: false, attributes: ['kodeItem', 'namaItem', 'jenis', 'zona', 'lokasi', 'exp'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Buat header CSV dengan BOM agar dibaca rapi oleh Microsoft Excel
    let csv = '\uFEFFNo,Waktu Pemeriksaan,Kode Equipment,Nama Equipment,Jenis,Zona,Lokasi,Expired,Status,Petugas,Catatan Temuan,Tindakan Penggantian,Foto\n';

    rows.forEach((r, idx) => {
      const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;
      const waktu = new Date(r.createdAt).toLocaleString('id-ID');
      const item = r.item || {};
      const petugas = r.petugas || {};

      csv += [
        idx + 1,
        escape(waktu),
        escape(item.kodeItem || '-'),
        escape(item.namaItem || '-'),
        escape(item.jenis?.toUpperCase() || '-'),
        escape(item.zona || '-'),
        escape(item.lokasi || '-'),
        escape(item.exp || '-'),
        escape(r.status?.toUpperCase()),
        escape(`${petugas.nama || 'Petugas'} (${petugas.unit || 'ARFF'})`),
        escape(r.keterangan || '-'),
        escape(r.penggantian || '-'),
        escape(r.foto || '-'),
      ].join(',') + '\n';
    });

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

    return successResponse(res, 200, 'Detail laporan pemeriksaan anggota', { laporan });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitLaporan,
  getAllLaporan,
  exportCsv,
  getLaporanById,
};
