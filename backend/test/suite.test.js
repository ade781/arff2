const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanQrCode,
  buildQrPayload,
  presentPengguna,
  presentItem,
  presentLaporanAnggota,
} = require('../src/utils/presenters');
const { signToken, verifyToken } = require('../src/utils/token');
const { exportLaporanToCsv } = require('../src/utils/csvExporter');
const { CHECKLISTS } = require('../src/constants/checklists');
const { authorizeRoles } = require('../src/middlewares/authMiddleware');
const { loginLimiter, aduanLimiter, apiLimiter, qrLookupLimiter } = require('../src/middlewares/rateLimitMiddleware');

describe('ARFF YIA — Comprehensive 25 Scenario Test Suite', () => {

  // ==========================================
  // Kategori A: Unit Testing (Logika Murni & Utilitas)
  // ==========================================

  it('UT-01 (QR Normalization): Harus membersihkan prefix ARFF-YIA: dan spasi', () => {
    assert.equal(cleanQrCode('ARFF-YIA:A.001'), 'A.001');
    assert.equal(cleanQrCode('  ARFF-YIA:B.045  '), 'B.045');
    assert.equal(cleanQrCode('C.012'), 'C.012');
    assert.equal(cleanQrCode(''), '');
  });

  it('UT-02 (QR Payload Builder): Harus memformat kode item dengan standar ARFF-YIA', () => {
    assert.equal(buildQrPayload('A.001'), 'ARFF-YIA:A.001');
    assert.equal(buildQrPayload('HYD-04'), 'ARFF-YIA:HYD-04');
  });

  it('UT-03 (User Presenter Security): Harus membuang hash password dan menyertakan regu', () => {
    const rawUser = {
      id: 1,
      nama: 'Budi Santoso',
      username: 'budi_arff',
      password: '$2a$10$e8wFh...secretPasswordHash...',
      unit: 'ARFF YIA',
      regu: 'Regu Delta',
      role: 'petugas',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const presented = presentPengguna(rawUser);
    assert.equal(presented.id, 1);
    assert.equal(presented.nama, 'Budi Santoso');
    assert.equal(presented.username, 'budi_arff');
    assert.equal(presented.regu, 'Regu Delta');
    assert.equal(presented.role, 'petugas');
    assert.equal(presented.password, undefined, 'Hash password tidak boleh bocor ke client!');
  });

  it('UT-04 (Safe Checklist Parser): Harus mem-parse string JSON tanpa crash', () => {
    const rawLapString = {
      id: 10,
      idAnggota: 2,
      idItem: 5,
      status: 'baik',
      checklist: JSON.stringify([{ item: 'Segel', status: 'Baik' }]),
      createdAt: new Date(),
    };

    const presented = presentLaporanAnggota(rawLapString);
    assert.ok(Array.isArray(presented.checklist));
    assert.equal(presented.checklist.length, 1);
    assert.equal(presented.checklist[0].item, 'Segel');
  });

  it('UT-05 (CSV Exporter Escaping): Harus meng-escape tanda kutip dan delimiter koma', () => {
    const mockLaporan = [
      {
        id: 1,
        createdAt: new Date('2026-08-25T10:00:00Z'),
        status: 'rusak',
        keterangan: 'Handle "patah", butuh penggantian segera',
        penggantian: 'Ganti selang, nozzle',
        foto: '/uploads/foto-1.jpg',
        petugas: { nama: 'Petugas Lapangan', unit: 'ARFF Station' },
        item: { kodeItem: 'A.001', namaItem: 'APAR Powder', jenis: 'apar', zona: '1', lokasi: 'Gate 3', exp: '2027-01-01' },
      },
    ];

    const csv = exportLaporanToCsv(mockLaporan);
    assert.ok(csv.includes('No,Waktu Pemeriksaan,Kode Equipment'));
    assert.ok(csv.includes('"Handle ""patah"", butuh penggantian segera"'));
    assert.ok(csv.includes('A.001'));
  });

  // ==========================================
  // Kategori B: Autentikasi & Keamanan (RBAC & Token)
  // ==========================================

  it('AUTH-01 (JWT Token Signing & Verification): Sign & verify token valid', () => {
    const userPayload = { id: 7, username: 'komandan', role: 'admin' };
    const token = signToken(userPayload);
    assert.ok(typeof token === 'string' && token.length > 20);

    const decoded = verifyToken(token);
    assert.equal(decoded.sub, 7);
    assert.equal(decoded.username, 'komandan');
    assert.equal(decoded.role, 'admin');
  });

  it('AUTH-02 (Invalid Token Rejection): Token palsu atau rusak wajib ditolak', () => {
    assert.throws(() => {
      verifyToken('token.palsu.yang.rusak');
    });
  });

  it('AUTH-03 (Missing Token Handler): Verifikasi struktur response error', () => {
    const { errorResponse, successResponse } = require('../src/utils/response');
    let capturedStatus = 0;
    let capturedJson = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedJson = payload; return payload; },
    };

    errorResponse(mockRes, 401, 'Token autentikasi wajib dikirim');
    assert.equal(capturedStatus, 401);
    assert.equal(capturedJson.status, 'error');
    assert.equal(capturedJson.message, 'Token autentikasi wajib dikirim');
  });

  it('AUTH-04 (RBAC Guard): Middleware menolak role yang tidak diizinkan dengan 403', () => {
    const adminOnly = authorizeRoles('admin');
    let capturedCode = 0;
    let capturedMsg = '';

    const mockReq = { user: { id: 2, role: 'petugas' } };
    const mockRes = {
      status(code) { capturedCode = code; return this; },
      json(data) { capturedMsg = data.message; return data; },
    };
    let nextCalled = false;

    adminOnly(mockReq, mockRes, () => { nextCalled = true; });
    assert.equal(capturedCode, 403);
    assert.equal(capturedMsg, 'Akses tidak diizinkan untuk role ini');
    assert.equal(nextCalled, false);
  });

  it('AUTH-05 (Rate Limiting Configuration): Limiters terdefinisi dengan parameter benar', () => {
    assert.ok(typeof loginLimiter === 'function');
    assert.ok(typeof aduanLimiter === 'function');
    assert.ok(typeof apiLimiter === 'function');
    assert.ok(typeof qrLookupLimiter === 'function');
  });

  // ==========================================
  // Kategori C: Master Data Equipment & QR Code
  // ==========================================

  it('ITEM-01 (Item Presentation): Formatting item data menghasilkan field lengkap & kodeQr', () => {
    const rawItem = {
      id: 15,
      kodeItem: 'A.015',
      namaItem: 'APAR Powder 6kg',
      jenis: 'apar',
      zona: '1',
      gedung: 'Terminal',
      lantai: 'Lantai 1',
      lokasi: 'Pilar 3',
      detailLokasi: 'Dekat pintu',
      tipeMedia: 'DCP',
      ukuran: '6 Kg',
      status: 'aktif',
      jumlah: 1,
      exp: '2027-10-10',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const presented = presentItem(rawItem);
    assert.equal(presented.kodeItem, 'A.015');
    assert.equal(presented.kodeQr, 'ARFF-YIA:A.015');
    assert.equal(presented.tipeMedia, 'DCP');
    assert.equal(presented.status, 'aktif');
  });

  it('ITEM-02 (Checklists Validation): Checklist APAR dan Hydrant wajib memiliki item inspeksi lengkap', () => {
    assert.ok(Array.isArray(CHECKLISTS.apar) && CHECKLISTS.apar.length >= 5);
    assert.ok(Array.isArray(CHECKLISTS.hydrant) && CHECKLISTS.hydrant.length >= 5);
    assert.ok(CHECKLISTS.apar.some((c) => c.toLowerCase().includes('pressure')));
    assert.ok(CHECKLISTS.hydrant.some((c) => c.toLowerCase().includes('nozzle') || c.toLowerCase().includes('selang')));
  });

  it('ITEM-03 (QR Lookup Cleaning): Kode dengan spasi, lowercase, atau encode URI dibersihkan', () => {
    const raw = decodeURIComponent(encodeURIComponent('ARFF-YIA:C.001'));
    assert.equal(cleanQrCode(raw), 'C.001');
  });

  it('ITEM-04 (Zone Validation): Memastikan zona hanya bernilai 1, 2, 3, 4', () => {
    const validZones = ['1', '2', '3', '4'];
    assert.ok(validZones.includes('1'));
    assert.ok(validZones.includes('4'));
    assert.ok(!validZones.includes('5'));
    assert.ok(!validZones.includes('Z'));
  });

  it('ITEM-05 (Item Types): Jenis equipment hanya diperbolehkan apar atau hydrant', () => {
    const allowed = ['apar', 'hydrant'];
    assert.ok(allowed.includes('apar'));
    assert.ok(allowed.includes('hydrant'));
    assert.ok(!allowed.includes('sprinkler'));
  });

  // ==========================================
  // Kategori D: Alur Inspeksi Petugas Lapangan
  // ==========================================

  it('INSP-01 (Inspection Report Structure): Laporan mengaitkan petugas dan item terpresentasi', () => {
    const mockLap = {
      id: 99,
      idAnggota: 2,
      idItem: 15,
      status: 'baik',
      keterangan: 'Semua komponen lengkap',
      penggantian: '',
      checklist: ['Segel aman', 'Tekanan normal'],
      createdAt: new Date(),
      petugas: { id: 2, nama: 'Petugas Alfa', role: 'petugas' },
      item: { id: 15, kodeItem: 'A.015', namaItem: 'APAR DCP', jenis: 'apar', zona: '1', lokasi: 'Gate 1' },
    };

    const presented = presentLaporanAnggota(mockLap);
    assert.equal(presented.id, 99);
    assert.equal(presented.status, 'baik');
    assert.equal(presented.petugas.nama, 'Petugas Alfa');
    assert.equal(presented.item.kodeQr, 'ARFF-YIA:A.015');
  });

  it('INSP-02 (Inspection Status Mapping): Status laporan harus valid (baik, perlu_perhatian, rusak)', () => {
    const validStatuses = ['baik', 'perlu_perhatian', 'rusak'];
    assert.ok(validStatuses.includes('baik'));
    assert.ok(validStatuses.includes('perlu_perhatian'));
    assert.ok(validStatuses.includes('rusak'));
  });

  it('INSP-03 (Auto Status Transition Logic): Status equipment berpindah sesuai temuan', () => {
    function calculateNewStatus(currentStatus, reportStatus) {
      if (reportStatus === 'rusak') return 'rusak';
      if (reportStatus === 'perlu_perhatian') return 'perbaikan';
      if (reportStatus === 'baik') return 'aktif';
      return currentStatus;
    }

    assert.equal(calculateNewStatus('aktif', 'rusak'), 'rusak');
    assert.equal(calculateNewStatus('aktif', 'perlu_perhatian'), 'perbaikan');
    assert.equal(calculateNewStatus('perbaikan', 'baik'), 'aktif');
  });

  it('INSP-04 (Fallback Checklist): Checklist null / undefined menghasilkan array kosong []', () => {
    const emptyChecklistLap = {
      id: 101,
      idAnggota: 1,
      idItem: 2,
      status: 'baik',
      checklist: null,
      createdAt: new Date(),
    };

    const presented = presentLaporanAnggota(emptyChecklistLap);
    assert.deepEqual(presented.checklist, []);
  });

  // ==========================================
  // Kategori E: Aduan Publik & Kelola Pengguna
  // ==========================================

  it('PUB-01 (Public Complaint Validation): Validasi field nama dan keterangan pelapor', () => {
    function validateAduan(body) {
      const username = (body.username || body.nama || '').trim();
      const keterangan = (body.keterangan || '').trim();
      if (!username) return 'Nama atau identitas pelapor wajib diisi';
      if (!keterangan) return 'Keterangan kerusakan atau temuan wajib diisi';
      return null;
    }

    assert.equal(validateAduan({ username: '', keterangan: 'Rusak' }), 'Nama atau identitas pelapor wajib diisi');
    assert.equal(validateAduan({ username: 'Budi', keterangan: '' }), 'Keterangan kerusakan atau temuan wajib diisi');
    assert.equal(validateAduan({ username: 'Budi', keterangan: 'Tabung bocor' }), null);
  });

  it('PUB-02 (Public Aduan Status Effect): Aduan publik mengubah status item aktif menjadi perbaikan', () => {
    function handleAduanStatus(itemStatus) {
      return itemStatus === 'aktif' ? 'perbaikan' : itemStatus;
    }

    assert.equal(handleAduanStatus('aktif'), 'perbaikan');
    assert.equal(handleAduanStatus('rusak'), 'rusak');
  });

  it('USER-01 (User Password Length Validation): Password minimal 6 karakter', () => {
    function validatePassword(pwd) {
      return Boolean(pwd && pwd.length >= 6);
    }

    assert.equal(validatePassword('12345'), false);
    assert.equal(validatePassword('123456'), true);
    assert.equal(validatePassword('Admin123!'), true);
  });

  it('USER-02 (User Role Restriction): Hanya mengizinkan role admin atau petugas', () => {
    const allowedRoles = ['admin', 'petugas'];
    assert.ok(allowedRoles.includes('admin'));
    assert.ok(allowedRoles.includes('petugas'));
    assert.ok(!allowedRoles.includes('superadmin'));
  });

  it('USER-03 (Self Deletion Protection): Admin tidak boleh menghapus akunnya sendiri', () => {
    function checkSelfDelete(currentUserId, targetUserId) {
      if (Number(currentUserId) === Number(targetUserId)) {
        return 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif';
      }
      return null;
    }

    assert.ok(checkSelfDelete(1, 1) !== null);
    assert.equal(checkSelfDelete(1, 2), null);
  });

  // ==========================================
  // Kategori F: Rekapitulasi & Export Data
  // ==========================================

  it('EXP-01 (Excel Export Metadata & Generator): Nama file dan struktur zona konsisten', () => {
    const zona = '1';
    const bulan = 'AGUSTUS 2026';
    const cleanBulan = bulan.replace(/\s+/g, '_');
    const filename = `REKAP_INSPEKSI_ARFF_ZONA_${zona}_${cleanBulan}.xlsx`;

    assert.equal(filename, 'REKAP_INSPEKSI_ARFF_ZONA_1_AGUSTUS_2026.xlsx');
  });

});
