# Backend ARFF YIA

Backend API untuk aplikasi pemeriksaan equipment ARFF (Airport Rescue & Fire Fighting) di Yogyakarta International Airport.

## Teknologi

- Node.js + Express 5
- Sequelize ORM
- MySQL
- JWT Authentication
- Helmet + CORS + Rate Limiting
- Multer (upload foto bukti)
- QRCode (generate QR Data URL)
- ExcelJS & JSZip (Export/Import Rekap Zona)

## Persiapan

1. Pastikan MySQL berjalan.
2. Buat database:

```sql
CREATE DATABASE arff2;
```

3. Salin `.env.example` menjadi `.env`, lalu sesuaikan konfigurasi database.

```powershell
Copy-Item .env.example .env
```

## Menjalankan Backend

Install dependency:

```bash
npm install
```

Sinkronkan tabel Sequelize ke database:

```bash
npm run db:sync
```

Impor data equipment dari master file Excel docs (Zona 1 - 4):

```bash
npm run db:import-excel
```

Jalankan mode development:

```bash
npm run dev
```

Atau mode produksi:

```bash
npm start
```

Secara default API berjalan di:

```text
http://localhost:5000
```

## Endpoint API

### Health Check

```text
GET /api/health
```

### Autentikasi

```text
POST /api/autentikasi/login
GET  /api/autentikasi/profil        (memerlukan token)
```

Body login:

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

Default user dari seed:

```text
admin    / Admin123!
petugas  / Petugas123!
```

Endpoint yang diproteksi membutuhkan header:

```text
Authorization: Bearer <token>
```

### Equipment (Item)

```text
GET    /api/item                         (anggota, daftar equipment dengan filter & search)
POST   /api/item                         (admin, tambah equipment)
GET    /api/item/:id                     (anggota, detail + QR + checklist)
PUT    /api/item/:id                     (admin, update equipment)
DELETE /api/item/:id                     (admin, soft-delete equipment)
GET    /api/item/:id/qr-code             (anggota, generate QR data URL)
GET    /api/item/qr/:kodeQr              (publik & petugas, lookup equipment by QR scan)
```

Contoh body buat equipment:

```json
{
  "kodeItem": "APAR-Z1-001",
  "namaItem": "APAR Powder 6kg Terminal",
  "jenis": "apar",
  "zona": "1",
  "gedung": "Terminal Keberangkatan",
  "lantai": "Lantai 2",
  "lokasi": "Gate 3 Depan Ruang Tunggu",
  "detailLokasi": "Sebelah pilar A12",
  "tipeMedia": "Powder",
  "ukuran": "6 KG",
  "exp": "2026-12-31",
  "status": "aktif"
}
```

Format QR Code resmi:

```text
ARFF-YIA:APAR-Z1-001
```

### Laporan Pemeriksaan Anggota (Inspeksi)

```text
POST /api/laporan-anggota                (anggota, submit pemeriksaan + upload foto)
GET  /api/laporan-anggota                (anggota, daftar laporan dengan filter tanggal/status)
GET  /api/laporan-anggota/:id            (anggota, detail laporan)
GET  /api/laporan-anggota/export/csv     (anggota, export CSV)
GET  /api/laporan-anggota/export-excel-zona (anggota, export Excel Rekap format Zona)
```

Contoh body submit pemeriksaan:

```json
{
  "idItem": 1,
  "status": "baik",
  "keterangan": "Semua komponen utama aman dan tekanan hijau.",
  "penggantian": "",
  "checklist": [
    { "id": "tabung", "item": "Tabung dalam kondisi baik", "status": "baik" },
    { "id": "segel", "item": "Segel dan pin pengaman tersedia", "status": "baik" }
  ]
}
```

Status pemeriksaan: `baik`, `perlu_perhatian`, `rusak`.

### Laporan Aduan Non-Anggota (Publik)

```text
POST /api/laporan-non-anggota            (publik, submit aduan + upload foto, rate limited)
GET  /api/laporan-non-anggota            (admin, daftar aduan non-anggota)
```

### Manajemen Pengguna (Admin Only)

```text
GET    /api/pengguna                     (admin, memuat semua data pengguna)
GET    /api/pengguna/:id                 (admin, detail profil pengguna)
POST   /api/pengguna                     (admin, mendaftarkan pengguna baru)
PUT    /api/pengguna/:id                 (admin, memperbarui data pengguna)
PUT    /api/pengguna/:id/reset-password  (admin, reset password akun)
DELETE /api/pengguna/:id                 (admin, hapus akun pengguna)
```

## Struktur Folder

```
backend/
├── src/
│   ├── app.js                          # Express app setup & middleware
│   ├── server.js                       # Server startup & DB check
│   ├── config/
│   │   └── database.js                 # Sequelize connection
│   ├── constants/
│   │   └── checklists.js               # Checklist APAR & Hydrant
│   ├── controllers/
│   │   ├── autentikasiController.js
│   │   ├── healthController.js
│   │   ├── itemController.js
│   │   ├── laporanAnggotaController.js
│   │   ├── laporanNonAnggotaController.js
│   │   └── penggunaController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── index.js
│   │   ├── AnggotaArff.js
│   │   ├── Item.js
│   │   ├── LaporanAnggota.js
│   │   ├── LaporanNonAnggota.js
│   │   └── NonAnggota.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── autentikasiRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── laporanAnggotaRoutes.js
│   │   ├── laporanNonAnggotaRoutes.js
│   │   └── penggunaRoutes.js
│   ├── scripts/
│   │   ├── imporExcelZona.js          # Impor data master equipment Excel
│   │   └── sinkronDatabase.js          # Sinkronisasi tabel DB
│   └── utils/
│       ├── csvExporter.js              # Generator ekspor CSV
│       ├── excelExporter.js            # Generator ekspor Excel per Zona
│       ├── presenters.js               # DTO Format output API
│       ├── response.js                 # successResponse & errorResponse
│       └── token.js                    # JWT sign & verify
├── uploads/                            # Uploaded photos (.gitkeep)
├── .env
├── package.json
└── README.md
```

## Verifikasi & Testing

Cek sintaks seluruh file JavaScript backend:

```bash
npm run test:syntax
```

Menjalankan automated test suite lengkap:

```bash
node ../teesting/run-all-tests.js
```
