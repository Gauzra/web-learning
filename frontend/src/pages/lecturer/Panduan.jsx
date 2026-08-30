import React from 'react';
import './Panduan.css';

export default function Panduan() {
    return (
        <div className="pgd-page">
            <header className="pgd-hero">
                <h1>Panduan Penggunaan</h1>
                <p className="pgd-description">
                    Panduan singkat untuk dosen dalam mengelola materi, video,
                    dan latihan.
                </p>
            </header>

            {/* 1. Tambah Materi */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">1</span>
                    <h2>Menambahkan Materi Baru</h2>
                </div>
                <ol>
                    <li>Buka menu <strong>Materi</strong> di sidebar, lalu klik tombol <strong>+ Tambah Materi</strong>.</li>
                    <li>Isi <strong>Nama Materi</strong>, <strong>Nomor Bab</strong> (menentukan urutan tampil materi), dan <strong>Deskripsi</strong>.</li>
                    <li>Pilih file materi dengan format <span className="pgd-code">.pdf</span>, <span className="pgd-code">.doc</span>, atau <span className="pgd-code">.docx</span>.</li>
                    <li>Klik <strong>Simpan</strong>. Materi akan muncul di daftar materi dengan status <strong>Draft</strong>.</li>
                </ol>
            </section>

            {/* 2. Detail Materi */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">2</span>
                    <h2>Melengkapi Detail Materi</h2>
                </div>
                <ol>
                    <li>Klik salah satu materi di daftar untuk membuka halaman detail.</li>
                    <li>Di bagian <strong>File Materi</strong>, Anda dapat menambahkan file pelengkap (<span className="pgd-code">.pdf</span> / <span className="pgd-code">.docx</span>) atau menghapus file yang tidak diperlukan.</li>
                    <li>Di halaman inilah Anda juga dapat menambahkan video dan latihan (panduan di bawah).</li>
                </ol>
            </section>

            {/* 3. Video */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">3</span>
                    <h2>Menambahkan Video Pembelajaran</h2>
                </div>
                <ol>
                    <li>Di halaman detail materi, klik tombol <strong>Tambah Video</strong>.</li>
                    <li>Isi <strong>Judul Video</strong>, lalu pilih sumber video:
                        <br /><strong>YouTube</strong> — tempel tautan video YouTube.
                        <br /><strong>Tautan (URL)</strong> — tempel tautan video langsung dari web lain.
                        <br /><strong>Upload</strong> — unggah file video dengan format <span className="pgd-code">.mp4</span>, <span className="pgd-code">.webm</span>, <span className="pgd-code">.ogg</span>, atau <span className="pgd-code">.mov</span>.
                    </li>
                    <li>Klik <strong>Simpan</strong>. Video akan tampil di detail materi dan bisa diputar mahasiswa.</li>
                </ol>
            </section>

            {/* 4. Upload Latihan */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">4</span>
                    <h2>Membuat &amp; Mengupload Latihan</h2>
                </div>
                <ol>
                    <li>Siapkan dokumen soal berformat <span className="pgd-code">.docx</span> atau <span className="pgd-code">.pdf</span> yang berisi pertanyaan pilihan ganda beserta kunci jawabannya.</li>
                    <li>Di halaman detail materi, klik tombol <strong>Tambah Latihan</strong>.</li>
                    <li>Isi <strong>Judul Latihan</strong> dan <strong>Deskripsi</strong>.</li>
                    <li>Unggah dokumen soal, lalu klik <strong>Simpan</strong>. Sistem akan otomatis memisahkan dokumen menjadi soal, pilihan jawaban, dan kunci jawaban.</li>
                    <li>Latihan baru tersimpan dengan status <strong>Draft</strong> — belum terlihat oleh mahasiswa.</li>
                </ol>
                <div className="pgd-note">
                    <strong>Catatan:</strong> Pastikan format dokumen soal sudah rapi agar hasil pemisahan soal otomatis akurat. Periksa kembali setelah upload.
                </div>
            </section>

            {/* 5. Publish */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">5</span>
                    <h2>Menerbitkan Latihan</h2>
                </div>
                <ol>
                    <li>Buka latihan dari halaman detail materi untuk masuk ke halaman kelola latihan.</li>
                    <li>Periksa setiap soal: pastikan pertanyaan, pilihan jawaban, dan kunci jawaban sudah benar. Gunakan <strong>Edit Latihan</strong> jika perlu mengubah judul/deskripsi, atau perbaiki dokumen soal bila ada kesalahan.</li>
                    <li>Jika sudah sesuai, klik tombol <strong>Terbitkan Latihan</strong>.</li>
                    <li>Status latihan berubah dari <strong>Draft</strong> menjadi <strong>Diterbitkan</strong>, dan latihan dapat dikerjakan oleh mahasiswa.</li>
                    <li>Hasil pengerjaan dihitung otomatis dan dapat dipantau melalui menu <strong>Penilaian</strong>. Latihan juga bisa dikembalikan menjadi draft kapan saja melalui tombol <strong>Jadikan Draft</strong>.</li>
                </ol>
            </section>

            {/* Tips */}
            <section className="pgd-section pgd-tips">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">?</span>
                    <h2>Tips Singkat</h2>
                </div>
                <ul>
                    <li><strong>Nomor bab</strong> menentukan urutan materi saat ditampilkan ke mahasiswa — gunakan angka berurutan.</li>
                    <li>Hanya materi berstatus <strong>Terbit</strong> yang terlihat oleh mahasiswa.</li>
                    <li>Gunakan menu <strong>Dashboard</strong> untuk memantau ringkasan materi, video, dan status latihan.</li>
                </ul>
            </section>
        </div>
    );
}
