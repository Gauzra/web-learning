# SMARTFIN — Web Learning Akademik

Platform pembelajaran berbasis web untuk mata kuliah/modul akademik mengenai **Investment Experience** dan **Financial Behavior**. SMARTFIN menggabungkan materi tertulis (PDF/DOCX), video pembelajaran, dan latihan soal pilihan ganda dengan penilaian otomatis dalam satu aplikasi.

Proyek ini terdiri dari dua bagian utama:

- **`backend/`** — REST API berbasis Node.js + Express + MySQL
- **`frontend/`** — Aplikasi web berbasis React + Vite

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Peran Pengguna](#peran-pengguna)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
  - [1. Setup Database](#1-setup-database)
  - [2. Menjalankan Backend](#2-menjalankan-backend)
  - [3. Menjalankan Frontend](#3-menjalankan-frontend)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Database](#struktur-database)
- [API Endpoints](#api-endpoints)
- [Fitur Teknis Unggulan](#fitur-teknis-unggulan)
- [Lisensi](#lisensi)

---

## Fitur Utama

### Autentikasi & Manajemen Akun
- Registrasi dan login pengguna dengan hash password (bcrypt)
- Autentikasi berbasis JWT (token kedaluwarsa 1 hari)
- Otorisasi berbasis peran (`student` / `lecturer`) melalui middleware
- Kelola profil (nama, NIM), ubah password, dan unggah foto profil

### Peran Mahasiswa
- **Dashboard** — sapaan pengguna, kategori pembelajaran, daftar materi, dan materi terbaru
- **Modul / Materi** — melihat daftar bab/materi berdasarkan urutan kategori
- **Detail Materi** — melihat ruang lingkup, membuka/mengunduh materi PDF/DOCX
- **Video Pembelajaran** — menonton video dari YouTube, URL eksternal, atau video yang diunggah
- **Latihan** — mengerjakan soal pilihan ganda pada setiap materi
- **Hasil Latihan** — melihat nilai, jumlah benar, jumlah salah, dan total soal secara otomatis
- **Panduan** — petunjuk penggunaan aplikasi

### Peran Dosen
- **Dashboard** — ringkasan total materi, materi terbit/draft, dan total video
- **Kelola Materi** — tambah, edit, dan hapus bab/materi, menentukan urutan bab dan status (published/draft)
- **Unggah Materi** — menambahkan file PDF/DOCX beserta otomatis ekstraksi teks dokumen
- **Kelola Video** — menambah/menghapus video dengan 4 mode: YouTube, URL eksternal, upload, atau tanpa video
- **Kelola Latihan** — membuat latihan dengan upload dokumen soal (PDF/DOCX), soal diekstraksi otomatis, tentukan kunci jawaban, terbitkan/draftkan latihan
- **Penilaian** — melihat hasil pengerjaan seluruh mahasiswa per latihan beserta nilai

### Penilaian Otomatis
- Skor dihitung otomatis dengan rumus:

```
Nilai = (Jumlah Jawaban Benar / Total Soal) × 100
```

---

## Teknologi

### Backend (`backend/`)
| Teknologi | Keterangan |
|-----------|------------|
| Node.js & Express 5 | Framework REST API |
| MySQL (mysql2/promise) | Database relasional |
| JWT & bcryptjs | Autentikasi & keamanan password |
| Multer | Penanganan upload file |
| mammoth + pdf-parse | Ekstraksi teks dari DOCX/PDF |
| Pexels API | Pengambilan gambar tema materi secara otomatis |
| dotenv | Manajemen environment variable |
| nodemon | Auto-restart saat development |

### Frontend (`frontend/`)
| Teknologi | Keterangan |
|-----------|------------|
| React 18 | Library UI |
| Vite 5 | Build tool & dev server |
| React Router DOM 6 | Routing & halaman terproteksi |
| lucide-react | Icon set |

---

## Struktur Proyek

```
web-learning/
├── README.md
├── prd.md                  # Product Requirements Document
├── desain.md               # Design System & UI/UX spec
├── patch.js                # Utilitas patch (dev)
│
├── backend/                # REST API (Express)
│   ├── .env                # Konfigurasi environment (tidak di-commit)
│   ├── schema.sql          # Skema lengkap database
│   ├── package.json
│   ├── migrations/
│   │   └── 001_exercise_question_extraction.sql
│   ├── uploads/            # File hasil upload (avatars, materials, exercises)
│   ├── npl-parser/         # (placeholder) modul parser Python
│   └── src/
│       ├── server.js       # Entry point server
│       ├── app.js          # Inisialisasi Express & routes
│       ├── config/database.js
│       ├── middleware/     # auth, upload avatar/material/exercise/video
│       ├── routes/         # auth, materials, videos, exercises, penilaian
│       ├── controllers/    # logika bisnis
│       └── services/       # documentExtractor, questionParser, pexels
│
└── frontend/               # Aplikasi web (React + Vite)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── assets/images/auth/
        ├── components/     # Button, FormInput, Breadcrumb, MaterialCard, ConfirmModal
        ├── layouts/MainLayout.jsx
        ├── routes/         # AppRoutes, ProtectedRoute
        └── pages/
            ├── auth/       # Login, Register
            ├── common/     # Help
            ├── student/    # Dashboard, Materials, MaterialDetail, StudentExercise, Profile, Panduan
            └── lecturer/   # Dashboard, Materials, AddMaterial, MaterialDetail, ExerciseDetail, AddVideo, Penilaian, Profile, Panduan
```

---

## Peran Pengguna

| Fitur | Mahasiswa (`student`) | Dosen (`lecturer`) |
|-------|:---------------------:|:------------------:|
| Registrasi akun | ✅ | ❌ (dibuat khusus) |
| Login / Logout | ✅ | ✅ |
| Melihat dashboard | ✅ | ✅ |
| Melihat daftar materi | ✅ (published saja) | ✅ |
| Membuka / mengunduh materi | ✅ | ✅ |
| Menonton video | ✅ | ✅ |
| Mengerjakan latihan | ✅ | — |
| Melihat hasil nilai | ✅ | — |
| Tambah / ubah / hapus materi | ❌ | ✅ |
| Unggah dokumen & video | ❌ | ✅ |
| Buat / kelola soal latihan | ❌ | ✅ |
| Tentukan kunci jawaban | ❌ | ✅ |
| Publikasikan / draft materi | ❌ | ✅ |
| Lihat penilaian mahasiswa | ❌ | ✅ |

> Registrasi publik hanya membuat akun dengan peran **student**. Akun **dosen** dibuat/diaktifkan secara khusus untuk mencegah registrasi umum sebagai dosen tanpa otorisasi.

---

## Persyaratan Sistem

- **Node.js** (v18+)
- **MySQL** (8.x direkomendasikan)
- **npm** (bundled bersama Node.js)

---

## Instalasi & Menjalankan

### 1. Setup Database

Buat database dan tabel skema dengan menjalankan skrip SQL:

```bash
mysql -u root -p < backend/schema.sql
```

Jika aplikasi sudah memiliki database lama, jalankan juga migrasi untuk fitur ekstraksi soal latihan:

```bash
mysql -u root -p smartfin < backend/migrations/001_exercise_question_extraction.sql
```

Skema database menggunakan nama database `smartfin` (dapat disesuaikan melalui `.env`).

### 2. Menjalankan Backend

```bash
cd backend
npm install
cp .env .env    # sesuaikan isi .env dengan konfigurasi MySQL Anda
npm run dev     # development (nodemon)
# atau
npm start       # production
```

Server akan berjalan di `http://localhost:5000`.

Uji koneksi API:

```bash
curl http://localhost:5000/api/health
# => {"success": true, "message": "SMARTFIN API is running"}
```

### 3. Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

Build untuk produksi:

```bash
cd frontend
npm run build   # output di folder dist/
npm run preview # pratinjau hasil build
```

---

## Konfigurasi Environment

Buat file `.env` di folder `backend/` dengan variabel berikut:

```
# Server
PORT=5000

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smartfin
DB_USER=root
DB_PASSWORD=your_password

# Keamanan
JWT_SECRET=your_secret_key

# Opsional: integrasi gambar tema materi
PEXELS_API_KEY=your_pexels_api_key
```

> **Catatan:** file `.env` berisi informasi sensitif dan **tidak boleh** di-commit ke GitHub.

---

## Struktur Database

Database `smartfin` terdiri dari tabel-tabel berikut (`schema.sql`):

| Tabel | Keterangan |
|-------|------------|
| `users` | Pengguna (student / lecturer) |
| `materials` | Bab/materi pembelajaran dengan urutan & status publikasi |
| `material_files` | File materi (PDF/DOCX) + teks hasil ekstraksi |
| `material_videos` | Video materi (youtube / url / upload) |
| `exercises` | Latihan yang dimiliki suatu materi |
| `questions` | Soal pilihan ganda hasil parsing |
| `question_options` | Pilihan jawaban A–D |
| `exercise_attempts` | Riwayat pengerjaan mahasiswa + skor |
| `exercise_answers` | Jawaban mahasiswa per soal |
| `exercise_documents` | Dokumen sumber soal + teks hasil ekstraksi (migrasi 001) |

### Relasi Utama

- `users` 1—N `materials` (created_by = dosen)
- `materials` 1—N `material_files`, `material_videos`, `exercises`
- `exercises` 1—N `questions` 1—N `question_options`
- `exercises` 1—N `exercise_attempts` (per mahasiswa) 1—N `exercise_answers`

---

## API Endpoints

Semua endpoint (kecuali `register`, `login`, dan `health`) memerlukan header `Authorization: Bearer <token>`.

### Autentikasi — `/api/auth`
| Method | Path | Deskripsi | Akses |
|--------|------|-----------|-------|
| POST | `/api/auth/register` | Registrasi akun | publik |
| POST | `/api/auth/login` | Login & dapatkan token | publik |
| GET | `/api/auth/me` | Profil pengguna saat ini | semua |
| PATCH | `/api/auth/profile` | Perbarui nama / NIM | semua |
| PATCH | `/api/auth/password` | Ubah password | semua |
| POST | `/api/auth/avatar` | Upload foto profil | semua |

### Materi — `/api/materials`
| Method | Path | Deskripsi | Akses |
|--------|------|-----------|-------|
| GET | `/api/materials` | Daftar materi dosen | lecturer |
| GET | `/api/materials/student` | Daftar materi untuk mahasiswa | student |
| GET | `/api/materials/:id` | Detail materi + files | semua (peran sesuai) |
| POST | `/api/materials` | Tambah materi + upload file | lecturer |
| POST | `/api/materials/:materialId/files` | Tambah file materi | lecturer |
| DELETE | `/api/materials/:id` | Hapus materi | lecturer |
| DELETE | `/api/materials/:materialId/files/:fileId` | Hapus file materi | lecturer |

### Video — `/api/material-videos`
| Method | Path | Deskripsi | Akses |
|--------|------|-----------|-------|
| GET | `/api/material-videos/:materialId` | Daftar video materi | semua |
| POST | `/api/material-videos/:materialId` | Tambah video (youtube/url/upload) | lecturer |
| DELETE | `/api/material-videos/:materialId/:videoId` | Hapus video | lecturer |

### Latihan — `/api/exercises`
| Method | Path | Deskripsi | Akses |
|--------|------|-----------|-------|
| POST | `/api/exercises` | Buat latihan + parsing soal dari file | lecturer |
| GET | `/api/exercises/material/:materialId` | Latihan per materi | semua |
| GET | `/api/exercises/summary` | Ringkasan latihan dosen | lecturer |
| GET | `/api/exercises/:id` | Detail latihan + soal | semua |
| POST | `/api/exercises/:id/reparse` | Parse ulang soal dari dokumen | lecturer |
| PUT | `/api/exercises/:id/questions/:questionId/correct-answer` | Set kunci jawaban | lecturer |
| PATCH | `/api/exercises/:id/publication` | Terbitkan / draftkan latihan | lecturer |
| POST | `/api/exercises/:id/submit` | Kumpulkan jawaban mahasiswa | student |
| GET | `/api/exercises/:id/attempts` | Riwayat pengerjaan | lecturer |
| PUT | `/api/exercises/:id` | Perbarui latihan | lecturer |
| DELETE | `/api/exercises/:id` | Hapus latihan | lecturer |

### Penilaian — `/api/penilaian`
| Method | Path | Deskripsi | Akses |
|--------|------|-----------|-------|
| GET | `/api/penilaian/materials` | Materi + latihan + jumlah pengerjaan | lecturer |
| GET | `/api/penilaian/exercise/:exerciseId` | Nilai seluruh mahasiswa per latihan | lecturer |

### Utility
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/health` | Status API |

---

## Fitur Teknis Unggulan

### Ekstraksi Soal Otomatis dari Dokumen
Dosen dapat mengunggah dokumen soal (PDF/DOCX) dan sistem secara otomatis:
1. Mengekstrak teks dokumen (mammoth untuk DOCX, pdf-parse untuk PDF).
2. Mem-parse soal pilihan ganda dengan `questionParser.js` — mendukung format `1. Pertanyaan`, `1) Pertanyaan`, `Soal 1:`, serta pilihan `A.`, `A)`, `(A)`, termasuk daftar bernomor datar.
3. Menyimpan soal beserta pilihan jawaban ke database.
4. Soal dapat di-parse ulang (`/reparse`) kapan saja tanpa mengunggah ulang.
5. Kunci jawaban ditentukan secara manual oleh dosen sebelum latihan diterbitkan; sistem memastikan semua soal memiliki kunci jawaban sebelum publikasi.

### Video Hybrid
Mendukung 4 mode sumber video pada satu materi:
- **YouTube** — embed player
- **External URL** — video provider eksternal
- **Upload** — file video MP4/WebM/OGG/MOV (maks 500 MB)
- **Tanpa video**

### Gambar Tema Otomatis
Saat dosen membuat materi, sistem otomatis mencari gambar tema landscape dari **Pexels API** berdasarkan judul materi (opsional; dilewati jika API key tidak dikonfigurasi).

### Keamanan
- Password di-hash dengan `bcryptjs`
- Autentikasi JWT dengan middleware `authenticate`
- Otorisasi peran dengan middleware `authorize`
- Validasi tipe & ukuran file upload (materi: PDF/DOCX max 10 MB; video: max 500 MB)
- Query aman menggunakan parameterized statements (anti SQL injection)

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik/pendukung modul pembelajaran. **Materi akademik berupa konten hanya dimiliki oleh pengelola/dosen terkait.** Silakan hubungi pemilik proyek untuk informasi lebih lanjut sebelum penggunaan komersial.
