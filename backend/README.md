# Backend ARFF YIA

Backend API untuk aplikasi pemeriksaan equipment ARFF (Airport Rescue & Fire Fighting) di Yogyakarta International Airport.

## Teknologi

- Node.js + Express 5
- Sequelize ORM
- MySQL
- JWT Authentication
- Helmet + CORS + Rate Limiting
- Multer (upload foto)
- QRCode (generate QR)

## Persiapan

1. Pastikan MySQL berjalan.
2. Buat database:

```sql
CREATE DATABASE arff2;
```

3. Salin `.env.example` menjadi `.env`, lalu sesuaikan user/password database.

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

Seed user awal untuk login:

```bash
npm run db:seed
```

Jalankan mode development:

```bash
npm run dev
```

Atau mode biasa:

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

Endpoint selain login membutuhkan header:

```text
Authorization: Bearer <token>
```

### Equipment (Item)

```text
GET    /api/item                    (anggota, daftar equipment)
POST   /api/item                    (admin, tambah equipment)
GET    /api/item/:id                (anggota, detail + QR + checklist)
PUT    /api/item/:id                (admin, update equipment)
DELETE /api/item/:id                (admin, soft-delete equipment)
GET    /api/item/:id/qr-code        (anggota, generate QR data URL)
GET    /api/item/qr/:kodeQr         (publik, lookup equipment by QR scan)
```

Contoh body buat equipment:

```json
{
  "kodeItem": "APAR-A-001",
  "namaItem": "APAR Powder 6kg Terminal",
  "jenis": "apar",
  "zona": "A",
  "lokasi": "Terminal keberangkatan Lt. 2",
  "detailLokasi": "Dekat Gate 3",
  "exp": "2027-05-15",
  "status": "aktif"
}
```

Format QR Code yang dihasilkan:

```text
ARFF-YIA:APAR-A-001
```

### Laporan Pemeriksaan Anggota

```text
POST /api/laporan-anggota                (anggota, submit pemeriksaan + upload foto)
GET  /api/laporan-anggota                (anggota, daftar laporan)
GET  /api/laporan-anggota/:id            (anggota, detail laporan)
GET  /api/laporan-anggota/export/csv     (anggota, export CSV)
```

Contoh body submit pemeriksaan:

```json
{
  "kodeQr": "ARFF-YIA:APAR-A-001",
  "status": "baik",
  "keterangan": "Semua komponen utama aman.",
  "penggantian": "",
  "checklist": [
    { "namaItem": "Tabung dalam kondisi baik", "status": "baik" },
    { "namaItem": "Segel dan pin pengaman tersedia", "status": "baik" }
  ]
}
```

Status pemeriksaan: `baik`, `perlu_perhatian`, `rusak`.

### Laporan Aduan Non-Anggota

```text
POST /api/laporan-non-anggota            (publik, submit aduan + upload foto, rate limited)
GET  /api/laporan-non-anggota            (admin, daftar aduan)
```

## Struktur Folder

```
backend/
├── src/
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server startup & DB check
│   ├── config/
│   │   └── database.js         # Sequelize connection
│   ├── constants/
│   │   └── checklists.js       # Checklist APAR & Hydrant
│   ├── controllers/
│   │   ├── autentikasiController.js
│   │   ├── healthController.js
│   │   ├── itemController.js
│   │   ├── laporanAnggotaController.js
│   │   └── laporanNonAnggotaController.js
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
│   │   └── laporanNonAnggotaRoutes.js
│   ├── scripts/
│   │   ├── isiDataAwal.js      # Seed data
│   │   └── sinkronDatabase.js  # DB sync
│   └── utils/
│       ├── itemPresenter.js    # Format output Item → API response
│       ├── response.js         # successResponse & errorResponse
│       └── token.js            # JWT sign & verify
├── uploads/                    # Uploaded photos
├── .env.example
├── package.json
└── README.md
```

## Verifikasi

Cek sintaks file JavaScript:

```bash
npm test
```

## Catatan

Untuk production, ganti `JWT_SECRET` di `.env` dengan nilai panjang dan rahasia. Nilai contoh hanya untuk pengembangan lokal.
