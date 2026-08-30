import React from 'react';
import './Panduan.css';

export default function Panduan() {
    return (
        <div className="pgd-page">
            <header className="pgd-hero">

                <h1>Panduan</h1>
                <span>
                    Panduan singkat untuk mahasiswa dalam mempelajari materi,
                    menonton video, dan mengerjakan latihan pada sistem.
                </span>
            </header>

            {/* 1. Materi */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">1</span>
                    <h2>Mempelajari Materi</h2>
                </div>
                <ol>
                    <li>Buka menu <strong>Materi</strong> di sidebar untuk melihat daftar seluruh materi pembelajaran, tersusun sesuai nomor bab.</li>
                    <li>Klik materi yang ingin dipelajari untuk membuka halaman detail materi.</li>
                    <li>Di bagian <strong>File Materi</strong>, buka dokumen materi (<span className="pgd-code">.pdf</span> / <span className="pgd-code">.docx</span>) dan pelajari isinya.</li>
                </ol>
            </section>

            {/* 2. Video */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">2</span>
                    <h2>Menonton Video Pembelajaran</h2>
                </div>
                <ol>
                    <li>Masih di halaman detail materi, gulir ke bagian <strong>Video Pembelajaran</strong>.</li>
                    <li>Klik video yang ingin ditonton — video bisa berupa tautan YouTube maupun file yang diunggah dosen.</li>
                    <li>Tonton video untuk memperdalam pemahaman materi sebelum mengerjakan latihan.</li>
                </ol>
                <div className="pgd-note">
                    <strong>Catatan:</strong> Jika belum ada video atau latihan pada suatu materi, bagian tersebut akan tampil kosong. Dosen akan menambahkannya secara berkala.
                </div>
            </section>

            {/* 3. Latihan */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">3</span>
                    <h2>Mengerjakan Latihan</h2>
                </div>
                <ol>
                    <li>Di bagian bawah halaman detail materi, cari <strong>Latihan Pembelajaran</strong> lalu klik <strong>Mulai Latihan</strong>.</li>
                    <li>Jawab soal satu per satu — pilih salah satu opsi jawaban, gunakan tombol navigasi untuk berpindah soal.</li>
                    <li>Perhatikan indikator progres di bagian atas yang menunjukkan posisi soal dan jumlah yang sudah dijawab.</li>
                    <li>Setelah semua soal terjawab, klik <strong>Submit Latihan</strong> untuk mengumpulkan jawaban.</li>
                </ol>
            </section>

            {/* 4. Hasil */}
            <section className="pgd-section">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">4</span>
                    <h2>Melihat Hasil &amp; Pembahasan</h2>
                </div>
                <ol>
                    <li>Setelah latihan dikumpulkan, skor (0–100) dihitung otomatis beserta jumlah jawaban benar dan salah.</li>
                    <li>Gulir ke bagian <strong>Pembahasan Jawaban</strong> untuk melihat kunci jawaban dari setiap soal, termasuk soal yang terlewat.</li>
                    <li>Gunakan pembahasan ini sebagai bahan evaluasi, lalu klik <strong>Kembali ke Materi</strong> untuk mempelajari ulang bagian yang belum dikuasai.</li>
                </ol>
            </section>

            {/* Tips */}
            <section className="pgd-section pgd-tips">
                <div className="pgd-section-header">
                    <span className="pgd-step-number">?</span>
                    <h2>Tips Singkat</h2>
                </div>
                <ul>
                    <li>Lengkapi <strong>Nama</strong> dan <strong>NIM</strong> di menu <strong>Profil</strong> agar hasil latihan Anda tercatat dengan benar pada penilaian dosen.</li>
                    <li>Gunakan menu <strong>Dashboard</strong> untuk melihat ringkasan materi dan latihan yang tersedia.</li>
                    <li>Amankan akun Anda dengan mengganti password secara berkala melalui menu <strong>Profil</strong>.</li>
                </ul>
            </section>
        </div>
    );
}
