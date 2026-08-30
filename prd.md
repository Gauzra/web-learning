# PRODUCT REQUIREMENTS DOCUMENT

## InvestAcademy Portal

Web Learning Akademik
Investment Experience & Financial Behavior

---

# 1. Informasi Proyek

## 1.1 Nama Produk

InvestAcademy Portal

## 1.2 Jenis Produk

Web-Based Learning Platform

## 1.3 Tujuan Penggunaan

Website digunakan sebagai media pembelajaran berbasis web untuk mendukung penyampaian modul akademik mengenai:

- Investment Experience
- Financial Behavior

Website dikembangkan sebagai media pendukung modul pembelajaran untuk kebutuhan akademik/disertasi.

## 1.4 Target Pengguna

- Mahasiswa
- Dosen

## 1.5 Platform

Web Application

## 1.6 Estimasi Pengembangan

1–2 minggu.

---

# 2. Latar Belakang

Materi pembelajaran mengenai investment experience dan financial behavior membutuhkan media penyampaian yang dapat menggabungkan materi tertulis, video pembelajaran, serta latihan dalam satu platform.

Website ini dikembangkan untuk menyediakan media pembelajaran yang terstruktur sehingga mahasiswa dapat mengakses modul, membaca materi, menonton video pembelajaran, dan mengerjakan latihan.

Dosen dapat mengelola struktur modul dan konten pembelajaran melalui dashboard sehingga materi tidak perlu ditanam langsung ke dalam source code website.

---

# 3. Permasalahan

Kebutuhan utama yang ingin diselesaikan:

1. Materi pembelajaran perlu disediakan dalam satu media berbasis web.
2. Materi terdiri dari beberapa bab/modul yang perlu disusun secara terstruktur.
3. Setiap materi dapat memiliki dokumen pembelajaran dan video.
4. Materi dan video dapat bertambah atau berubah selama proses akademik berlangsung.
5. Dosen membutuhkan cara untuk mengelola materi tanpa harus mengubah source code.
6. Mahasiswa membutuhkan akses yang sederhana untuk mempelajari materi dan mengerjakan latihan.
7. Hasil latihan perlu dihitung secara otomatis.

---

# 4. Tujuan Produk

InvestAcademy Portal bertujuan untuk:

1. Menyediakan media pembelajaran berbasis web.
2. Menyediakan materi Investment Experience dan Financial Behavior secara terstruktur.
3. Memungkinkan mahasiswa mengakses materi dan video secara mudah.
4. Memungkinkan mahasiswa mengerjakan latihan pada setiap materi.
5. Menghitung hasil latihan secara otomatis.
6. Memungkinkan dosen menambahkan dan mengelola bab/materi.
7. Mendukung beberapa sumber video.
8. Mengurangi ketergantungan terhadap developer dalam pengelolaan konten.
9. Menyediakan website yang dapat digunakan pada desktop, tablet, dan smartphone.

---

# 5. Konsep Produk

InvestAcademy Portal merupakan web learning sederhana dengan content management.

Produk bukan merupakan LMS penuh.

Fokus utama:

```text
Materi
+
Video
+
Latihan
+
Content Management

Struktur pembelajaran:

Web Learning
│
├── Investment Experience
│   ├── Bab 1
│   ├── Bab 2
│   ├── Bab 3
│   └── ...
│
└── Financial Behavior
    ├── Bab 1
    ├── Bab 2
    ├── Bab 3
    └── ...

Jumlah materi awal diperkirakan sekitar 10 materi dan 10 video, tetapi sistem harus memungkinkan penambahan materi berikutnya.

6. User Roles

Sistem memiliki dua role utama:

student
lecturer
7. Role: Mahasiswa

Mahasiswa menggunakan website sebagai peserta pembelajaran.

Mahasiswa dapat:

Registrasi.
Login.
Logout.
Melihat dashboard.
Melihat daftar modul.
Melihat daftar bab/materi.
Memilih kategori pembelajaran.
Membuka detail materi.
Melihat ruang lingkup materi.
Membuka materi PDF/Word.
Menonton video.
Mengikuti latihan.
Melihat hasil latihan.

Mahasiswa tidak dapat:

Menambahkan materi.
Mengubah materi.
Menghapus materi.
Mengubah soal.
Mengubah jawaban benar.
8. Role: Dosen

Dosen menggunakan website untuk mengakses dan mengelola materi pembelajaran.

Dosen dapat:

Login.
Logout.
Melihat dashboard.
Melihat daftar materi.
Menambahkan bab/materi.
Mengubah materi.
Menghapus materi.
Menentukan kategori.
Menentukan urutan materi.
Mengisi ruang lingkup.
Menambahkan materi PDF/Word.
Menambahkan video.
Memilih jenis sumber video.
Menambahkan latihan.
Menambahkan pertanyaan.
Menentukan jawaban benar.
Menyimpan materi sebagai draft.
Menerbitkan materi.
9. Authentication
9.1 Registration

Mahasiswa dapat melakukan registrasi dengan:

Nama lengkap
Email
Password
Konfirmasi password

Role mahasiswa ditetapkan sebagai:

student

Untuk akun dosen, sistem dapat menggunakan akun yang dibuat atau diaktifkan secara khusus.

Hal ini mencegah pengguna umum mendaftarkan dirinya sebagai dosen tanpa otorisasi.

10. Login

User login menggunakan:

Email
Password

Setelah login, sistem mengidentifikasi role pengguna.

Flow:

Login
   ↓
Validasi
   ↓
Verifikasi akun
   ↓
Identifikasi role
   ↓
Dashboard sesuai role
11. Dashboard Mahasiswa

Dashboard mahasiswa menampilkan:

Sapaan pengguna.
Nama pengguna.
Kategori Investment Experience.
Kategori Financial Behavior.
Jumlah materi.
Materi terbaru.

Navigasi:

Dashboard
Modul
Profil
Keluar
12. Dashboard Dosen

Dashboard dosen menampilkan ringkasan pengelolaan konten.

Informasi yang dapat ditampilkan:

Total materi.
Materi terbit.
Materi draft.
Total video.

Dashboard menyediakan akses:

Kelola Materi
Tambah Materi
Profil
Keluar
13. Struktur Materi

Materi dibuat dinamis dan tidak di-hard-code ke dalam frontend.

Dosen dapat menambahkan:

Bab 1
Bab 2
Bab 3
Bab 4
...

Nama bab tidak ditentukan secara permanen oleh sistem.

Contoh:

Bab 1 — Pengantar Investasi
Bab 2 — Mengenal Pasar Saham
Bab 3 — Investment Experience
Bab 4 — Financial Behavior

Setiap materi memiliki urutan.

14. Struktur Detail Materi

Setiap bab/materi dapat memiliki:

Judul
Ruang Lingkup
Kategori
Materi Pembelajaran
Video Pembelajaran
Latihan
Status
Urutan

Struktur:

Bab/Materi
│
├── Judul
├── Ruang Lingkup
├── Materi
├── Video
└── Latihan
15. Ruang Lingkup

Setiap materi memiliki bagian:

Ruang Lingkup

Bagian ini digunakan untuk menjelaskan:

Materi membahas apa.
Pokok bahasan utama.
Batas pembahasan.

Contoh:

Materi ini membahas konsep dasar investasi,
jenis instrumen investasi, hubungan risiko dan
return, serta faktor yang memengaruhi keputusan
investasi.
16. Materi Pembelajaran

Materi dapat diberikan dalam bentuk file.

Format utama:

PDF
DOC
DOCX

Sistem menyimpan lokasi file, bukan isi file sebagai binary dalam database.

Dosen dapat:

Upload materi.
Mengganti file.
Menghapus file.
Melihat nama file.

Mahasiswa dapat:

Membuka materi.
Mengunduh materi.

PDF menjadi format yang direkomendasikan untuk pengalaman membaca langsung di browser.

17. Video Pembelajaran

Website menggunakan sistem video hybrid.

Jenis video:

YouTube
External URL
Uploaded Video
No Video
17.1 YouTube

Dosen memasukkan URL video YouTube.

Contoh:

https://www.youtube.com/watch?v=xxxxx

Video ditampilkan menggunakan embedded player.

17.2 External URL

Dosen dapat memasukkan URL video dari provider eksternal.

17.3 Uploaded Video

Dosen dapat mengunggah file video.

Format video yang direkomendasikan:

MP4

Format tambahan dapat didukung sesuai kemampuan browser dan server.

File video disimpan pada storage/server.

Database hanya menyimpan lokasi file.

17.4 No Video

Materi dapat dibuat tanpa video.

18. Latihan Pembelajaran

Setiap bab/materi dapat memiliki latihan.

Contoh:

Bab 1
│
├── Materi
├── Video
└── Latihan
    ├── Soal 1
    ├── Soal 2
    ├── Soal 3
    └── ...

Latihan menggunakan model pilihan ganda.

Setiap soal memiliki:

Pertanyaan.
Pilihan A.
Pilihan B.
Pilihan C.
Pilihan D.
Jawaban benar.
19. Proses Latihan Mahasiswa

Flow:

Materi
   ↓
Mulai Latihan
   ↓
Soal
   ↓
Jawaban
   ↓
Soal berikutnya
   ↓
Submit
   ↓
Sistem menghitung hasil
   ↓
Hasil Latihan
20. Hasil Latihan

Setelah mahasiswa menyelesaikan latihan, sistem menampilkan:

Nilai.
Jumlah jawaban benar.
Jumlah jawaban salah.
Total soal.

Contoh:

Hasil Latihan


Nilai       : 80
Benar       : 8
Salah       : 2
Total Soal  : 10

Nilai dihitung berdasarkan:

Nilai =
(Jumlah Jawaban Benar / Total Soal) × 100
21. Pengelolaan Materi Dosen

Dosen memiliki halaman:

Kelola Materi

Halaman menampilkan daftar materi berdasarkan urutan.

Contoh:

01
Bab 1 — Pengantar Investasi
Investment Experience


02
Bab 2 — Mengenal Pasar Saham
Investment Experience


03
Bab 3 — Financial Behavior
Financial Behavior

Setiap materi memiliki action:

Buka
Edit
Hapus

Tersedia tombol:

+ Tambah Bab/Materi
22. Form Tambah/Edit Materi

Form digunakan untuk membuat atau mengubah materi.

Field:

Judul Materi
Kategori
Urutan
Ruang Lingkup
Materi
Video
Latihan
Status

Status:

Draft
Published

Action:

Simpan Draft
Terbitkan
Batal
23. Pengelolaan Video

Pada form materi:

Jenis Video


○ YouTube
○ Video Eksternal
○ Upload Video
○ Tanpa Video

Jika YouTube:

URL YouTube

Jika external:

URL Video

Jika upload:

Upload Video
24. Pengelolaan Latihan

Dosen dapat menambahkan soal pada materi.

Form soal:

Pertanyaan
Pilihan A
Pilihan B
Pilihan C
Pilihan D
Jawaban Benar

Dosen dapat menambahkan lebih dari satu soal.

Contoh:

+ Tambah Soal

Jawaban benar ditentukan oleh dosen ketika soal dibuat.

25. Status Materi

Materi memiliki status:

draft
published
archived
Draft

Materi belum tersedia untuk mahasiswa.

Published

Materi tersedia untuk mahasiswa.

Archived

Materi tidak lagi ditampilkan sebagai materi aktif.

26. User Flow Mahasiswa
Register
   ↓
Login
   ↓
Dashboard
   ↓
Pilih Kategori
   ↓
Daftar Materi
   ↓
Pilih Bab/Materi
   ↓
Ruang Lingkup
   ↓
Video
   ↓
Materi
   ↓
Latihan
   ↓
Submit
   ↓
Hasil
27. User Flow Dosen
Login
   ↓
Dashboard
   ↓
Kelola Materi
   ↓
Tambah Bab/Materi
   ↓
Isi Judul
   ↓
Isi Ruang Lingkup
   ↓
Upload PDF/Word
   ↓
Tambahkan Video
   ↓
Tambahkan Latihan
   ↓
Simpan Draft / Terbitkan

Untuk perubahan materi:

Kelola Materi
   ↓
Pilih Materi
   ↓
Edit
   ↓
Perbarui Konten
   ↓
Simpan
28. UI/UX Requirements

Desain menggunakan konsep:

Modern Academic Learning Platform

Karakteristik:

Clean.
Professional.
Academic.
Minimal.
Readable.
Financial-oriented.
Responsive.

Prototype UI menggunakan desain InvestAcademy Portal yang telah dibuat pada Google Stitch sebagai referensi visual utama.

Elemen visual yang dipertahankan:

Sidebar.
Card.
Typography.
Spacing.
Button style.
Color system.
Visual hierarchy.
29. Struktur Navigasi Mahasiswa
Dashboard
│
├── Modul
│   ├── Investment Experience
│   └── Financial Behavior
│
├── Profil
│
└── Keluar

Latihan tidak dibuat sebagai menu utama karena latihan merupakan bagian dari setiap materi.

30. Struktur Navigasi Dosen
Dashboard
│
├── Kelola Materi
│
├── Tambah Materi
│
├── Profil
│
└── Keluar
31. Responsive Design

Website harus mendukung:

Desktop.
Laptop.
Tablet.
Smartphone.

Desktop:

Sidebar tetap.
Content area luas.

Tablet:

Sidebar dapat diperkecil/dilipat.

Mobile:

Sidebar berubah menjadi navigation menu.
Form materi menjadi full-screen.
Video responsive.
Card menjadi satu kolom.
32. Non-Functional Requirements
32.1 Performance

Website harus memiliki waktu loading yang wajar.

Optimasi meliputi:

Optimasi gambar.
Lazy loading bila diperlukan.
Kompresi asset.
Query database yang efisien.
Video tidak dimuat sebelum diperlukan.
32.2 Security

Sistem harus:

Melakukan hashing password.
Melakukan validasi input.
Menggunakan authentication.
Menggunakan role-based authorization.
Mencegah SQL injection.
Memvalidasi file upload.
Menggunakan HTTPS pada production.
32.3 Responsive

Semua halaman utama harus dapat digunakan pada perangkat mobile.

32.4 Availability

Website harus dapat diakses menggunakan domain production dan server yang telah disiapkan.

33. File Upload Requirements

File upload harus memiliki validasi:

Extension.
MIME type.
File size.

File yang diperbolehkan:

Materi:
PDF
DOC
DOCX


Video:
MP4
WebM

Ukuran maksimal file ditentukan berdasarkan kapasitas storage server yang digunakan.

34. Video Infrastructure

Video upload harus memperhatikan:

Kapasitas storage.
Bandwidth.
Ukuran file.
Kecepatan akses.
Beban server.

Video eksternal direkomendasikan jika file video besar atau jumlah pengguna meningkat.

Sistem harus tetap mendukung:

YouTube
External URL
Uploaded Video
35. Panduan Penggunaan

Project mencakup dokumen panduan penggunaan website.

Panduan terdiri dari:

Panduan Mahasiswa
Registrasi.
Login.
Dashboard.
Mengakses modul.
Membuka materi.
Menonton video.
Membuka/download materi.
Mengerjakan latihan.
Melihat hasil latihan.
Logout.
Panduan Dosen
Login.
Dashboard.
Kelola materi.
Tambah bab.
Edit materi.
Upload PDF/Word.
Menambahkan video.
Upload video.
Membuat latihan.
Menambahkan soal.
Menentukan jawaban benar.
Menyimpan draft.
Menerbitkan materi.
Menghapus materi.
Logout.

Panduan final dibuat berdasarkan website yang sudah selesai dan menggunakan screenshot aktual.

36. Scope Included

Scope utama project:

Authentication
Login
Registration
Role Student/Lecturer


Dashboard Mahasiswa
Dashboard Dosen


Dynamic Module/Material


Material Management
Create
Read
Update
Delete


PDF/Word Upload


Hybrid Video
YouTube
External URL
Uploaded Video


Learning Exercise
Multiple Choice
Automatic Scoring
Correct Answer
Wrong Answer


Responsive UI


Deployment


Domain
Hosting


User Guide
37. Scope Excluded

Fitur berikut tidak termasuk dalam scope MVP:

Payment
Subscription
Forum Discussion
Chat
Live Streaming
Certificate
Leaderboard
Gamification
Advanced Learning Analytics
Complex Progress Tracking
Attendance
Email Campaign
Push Notification
Mobile Application
AI Tutor
Video Conferencing

Jika dibutuhkan, fitur tersebut menjadi pengembangan tambahan.

38. Content Responsibility
Client/Dosen

Bertanggung jawab menyediakan:

Materi akademik.
Struktur bab.
Teks materi.
PDF/Word.
Video.
Soal latihan.
Pilihan jawaban.
Jawaban benar.
Informasi akademik.
Developer

Bertanggung jawab:

Mengembangkan sistem.
Mengembangkan UI.
Mengembangkan database.
Mengembangkan authentication.
Mengembangkan content management.
Mengembangkan latihan.
Mengintegrasikan materi.
Mengintegrasikan video.
Melakukan deployment.
Membuat panduan penggunaan.

Developer tidak bertanggung jawab terhadap validitas atau substansi akademik materi.

39. Acceptance Criteria

Project dianggap memenuhi requirement apabila:

Authentication
Mahasiswa dapat melakukan registrasi.
Mahasiswa dapat login.
Dosen dapat login.
User dapat logout.
Role dapat dibedakan.
Materi
Dosen dapat menambahkan materi.
Dosen dapat mengubah materi.
Dosen dapat menghapus materi.
Dosen dapat menentukan urutan materi.
Mahasiswa dapat melihat materi yang published.
Materi memiliki ruang lingkup.
File
Dosen dapat menambahkan PDF.
Dosen dapat menambahkan Word.
Mahasiswa dapat membuka/download file.
Video
YouTube dapat ditampilkan.
External video dapat ditampilkan.
Uploaded video dapat ditampilkan.
Materi dapat dibuat tanpa video.
Latihan
Dosen dapat membuat soal.
Dosen dapat menentukan jawaban benar.
Mahasiswa dapat mengerjakan soal.
Sistem menghitung jawaban benar.
Sistem menghitung jawaban salah.
Sistem menghitung nilai.
Mahasiswa dapat melihat hasil.
Deployment
Website dapat diakses melalui domain.
HTTPS aktif.
Website dapat digunakan pada desktop dan mobile.
Documentation
Panduan mahasiswa tersedia.
Panduan dosen tersedia.