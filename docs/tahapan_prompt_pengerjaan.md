# Tahapan Prompt Pengerjaan Proyek ARFF YIA

Dokumen ini dibuat agar pengerjaan proyek dapat dilanjutkan oleh agent lain tanpa kehilangan konteks utama. Proyek ini adalah aplikasi pemeriksaan fasilitas ARFF di Yogyakarta International Airport, dengan fokus awal pada hydrant dan APAR. Sprinkler tidak termasuk cakupan versi ini.

## Prinsip Umum

- Bangun aplikasi secara bertahap, sederhana, dan realistis untuk proyek magang.
- Prioritaskan alur petugas di lapangan agar cepat, jelas, dan mobile-friendly.
- Jangan menambahkan fitur di luar kebutuhan utama jika belum diperlukan.
- Gunakan bahasa Indonesia untuk nama file/fitur jika tetap jelas, tetapi boleh memakai bahasa Inggris jika lebih sesuai standar teknis.
- Agent boleh mengoreksi atau mengusulkan pendekatan yang lebih baik jika instruksi user berpotensi membuat sistem rumit, tidak aman, atau sulit dipelihara.
- Setiap tahap sebaiknya diawali dengan audit singkat kondisi proyek saat ini sebelum melakukan perubahan.
- Setiap perubahan penting sebaiknya diverifikasi dengan menjalankan command/test yang tersedia.

## Baseline Teknologi

- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- ORM: Sequelize
- Database: MySQL
- Nama database: `arff2`
- Authentication: JWT
- QR Code: library yang sesuai untuk generate dan scan QR
- Komunikasi: REST API antara frontend dan backend

Teknologi di atas adalah baseline, bukan aturan mutlak. Jika ada alternatif yang lebih tepat, jelaskan alasannya sebelum mengubah arah implementasi.

## Tahap 1 - Audit Proyek dan Penentuan Scope Awal

Tujuan:
- Membaca struktur folder dan file yang sudah ada.
- Menentukan apakah proyek sudah memiliki frontend, backend, database config, atau masih kosong.
- Menyusun scope MVP yang realistis.

Prompt lanjutan yang bisa digunakan:

```text
Baca struktur proyek ini secara menyeluruh. Jangan langsung mengubah file. Laporkan kondisi proyek saat ini, teknologi yang sudah ada, file penting, masalah awal, dan rekomendasi scope MVP untuk aplikasi pemeriksaan ARFF YIA.
```

Output yang diharapkan:
- Laporan struktur proyek.
- Rekomendasi arsitektur sederhana.
- Daftar fitur MVP.
- Risiko awal yang perlu diperhatikan.

## Tahap 2 - Desain Database dan Alur Sistem

Tujuan:
- Mendesain tabel utama dan relasi data.
- Menentukan alur data dari QR scan sampai hasil pemeriksaan tersimpan.
- Memastikan struktur data tidak berlebihan.

Entitas awal yang kemungkinan dibutuhkan:
- User
- Role admin/petugas
- Equipment
- Tipe equipment: hydrant/APAR
- Zona: A/B/C/D
- QR identity/code
- Inspection record
- Inspection checklist/item detail

Prompt lanjutan yang bisa digunakan:

```text
Berdasarkan rencana proyek ARFF YIA, rancang desain database dan alur sistem yang sederhana. Gunakan nama database `arff2`. Fokus pada hydrant dan APAR, zona A-D, petugas, admin, QR Code, dan hasil pemeriksaan. Setelah itu implementasikan model/migration/seed sesuai struktur proyek yang ada.
```

Output yang diharapkan:
- Desain tabel.
- Relasi antar tabel.
- Model Sequelize.
- Migration jika proyek memakai migration.
- Seed data awal jika diperlukan.

## Tahap 3 - Setup Backend Dasar

Tujuan:
- Menyiapkan backend Express yang stabil.
- Menyambungkan backend ke MySQL.
- Menyiapkan struktur route/controller/service jika diperlukan.

Prompt lanjutan yang bisa digunakan:

```text
Implementasikan fondasi backend untuk proyek ARFF YIA. Buat server Express, konfigurasi environment, koneksi Sequelize ke MySQL dengan nama database `arff2`, struktur folder backend yang sederhana, endpoint health check, dan dokumentasikan cara menjalankannya.
```

Output yang diharapkan:
- Backend bisa dijalankan.
- Database connection tervalidasi.
- Endpoint health check tersedia.
- `.env.example` tersedia jika diperlukan.

## Tahap 4 - Autentikasi dan Role

Tujuan:
- Membuat login berbasis JWT.
- Membedakan akses admin dan petugas.
- Menyiapkan middleware proteksi route.

Prompt lanjutan yang bisa digunakan:

```text
Tambahkan autentikasi JWT untuk aplikasi ARFF YIA. Buat login, middleware auth, role admin dan petugas, validasi input, hashing password, seed user awal, dan proteksi route sesuai kebutuhan.
```

Output yang diharapkan:
- Endpoint login.
- JWT token.
- Middleware auth.
- Middleware role.
- Seed user admin dan petugas.
- Validasi dasar.

## Tahap 5 - API Equipment dan QR Code

Tujuan:
- Membuat manajemen data equipment.
- Membuat identitas QR Code untuk setiap equipment.
- Memungkinkan sistem mengambil data equipment berdasarkan hasil scan QR.

Prompt lanjutan yang bisa digunakan:

```text
Buat API equipment untuk proyek ARFF YIA. Admin harus bisa CRUD equipment hydrant dan APAR, menentukan zona A-D, lokasi, kode unik QR, dan status equipment. Tambahkan endpoint untuk mengambil detail equipment berdasarkan kode QR.
```

Output yang diharapkan:
- CRUD equipment.
- Generate/simpan kode QR unik.
- Endpoint detail equipment by QR code.
- Validasi duplikasi kode.
- Struktur response API yang konsisten.

## Tahap 6 - API Pemeriksaan Lapangan

Tujuan:
- Membuat proses input pemeriksaan oleh petugas.
- Menyimpan hasil pemeriksaan secara terstruktur.
- Membuat histori pemeriksaan yang dapat ditelusuri.

Prompt lanjutan yang bisa digunakan:

```text
Buat API pemeriksaan lapangan untuk ARFF YIA. Petugas harus bisa submit hasil pemeriksaan setelah scan QR equipment. Data harus mencatat equipment, petugas, waktu pemeriksaan, kondisi, checklist sesuai tipe equipment, catatan, dan status hasil pemeriksaan.
```

Output yang diharapkan:
- Endpoint submit inspection.
- Endpoint histori inspection.
- Validasi equipment dan petugas.
- Struktur checklist hydrant/APAR.
- Data audit: siapa, kapan, equipment apa.

## Tahap 7 - Frontend Petugas

Tujuan:
- Membuat alur petugas yang cepat dan mudah digunakan di lapangan.
- Tampilan harus mobile-friendly.
- Fokus pada login, scan QR, detail equipment, dan form pemeriksaan.

Prompt lanjutan yang bisa digunakan:

```text
Buat frontend sisi petugas untuk aplikasi ARFF YIA. Implementasikan login, dashboard petugas, scan QR, tampilan detail equipment, form pemeriksaan hydrant/APAR yang mobile-friendly, submit data ke API, dan riwayat pemeriksaan singkat.
```

Output yang diharapkan:
- Halaman login.
- Dashboard petugas.
- Fitur scan QR atau input kode manual sebagai fallback.
- Detail equipment.
- Form pemeriksaan.
- Submit ke backend.
- Feedback sukses/gagal.

## Tahap 8 - Frontend Admin, Monitoring, Rekap, dan Finalisasi

Tujuan:
- Membuat sisi admin untuk pengelolaan dan monitoring.
- Menyediakan rekap sederhana.
- Melakukan pengujian alur utama.

Prompt lanjutan yang bisa digunakan:

```text
Buat frontend sisi admin untuk aplikasi ARFF YIA. Admin harus bisa mengelola equipment, melihat hasil pemeriksaan, memfilter berdasarkan zona/status/tanggal/tipe equipment, melihat status monitoring, dan menyiapkan rekap sederhana. Setelah itu lakukan testing alur utama dan rapikan dokumentasi.
```

Output yang diharapkan:
- Dashboard admin.
- CRUD equipment dari frontend.
- Daftar hasil pemeriksaan.
- Filter data.
- Rekap sederhana.
- Dokumentasi cara menjalankan proyek.
- Testing alur login, equipment, QR, pemeriksaan, dan monitoring.

## Catatan Untuk Agent Berikutnya

Sebelum memulai tahap apa pun:

1. Baca `rencana_pengerjaan.txt`.
2. Baca file ini.
3. Audit struktur proyek terbaru.
4. Jangan menghapus perubahan user yang sudah ada.
5. Jalankan verifikasi yang relevan setelah implementasi.
6. Laporkan file yang diubah dan hasil verifikasi.

Jika proyek belum memiliki fondasi kode, mulai dari Tahap 1 lalu lanjut Tahap 2 dan 3. Jika fondasi sudah ada, lanjutkan dari tahap terakhir yang belum selesai berdasarkan kondisi file nyata di proyek.
