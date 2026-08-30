import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

import backgroundImage from '../../assets/images/auth/bg1.png';

function EyeIcon({ visible }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {visible ? (
                <>
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                </>
            ) : (
                <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16.7 16.7 0 0 1-3.2 3.9" />
                    <path d="M6.7 6.7C4 8.4 2.5 12 2.5 12s3.5 7 9.5 7a9.8 9.8 0 0 0 3.3-.6" />
                </>
            )}
        </svg>
    );
}

export default function Register() {
    const navigate = useNavigate();

    const [role, setRole] = useState('student');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const roleLabel =
        role === 'student'
            ? 'Mahasiswa'
            : 'Dosen';

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setError('');
        setSuccess('');
    };

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError('Semua field wajib diisi.');
            return;
        }

        if (form.password.length < 6) {
            setError(
                'Password minimal terdiri dari 6 karakter.'
            );
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError(
                'Konfirmasi password tidak sesuai.'
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        email: form.email.trim(),
                        password: form.password,
                        role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Registrasi gagal.'
                );
            }

            setSuccess(
                'Akun berhasil dibuat. Mengarahkan ke halaman login...'
            );

            setTimeout(() => {
                navigate('/login');
            }, 1200);

        } catch (error) {
            setError(
                error.message ||
                'Terjadi kesalahan saat registrasi.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="register-page"
            style={{
                backgroundImage: `url(${backgroundImage})`
            }}
        >

            <div className="register-container">
                <div className="register-left">
                    <div className="register-brand">SMARTFIN</div>
                    <h1>Bergabunglah dengan Kami</h1>
                    <p className="register-left-desc">
                        Daftarkan akun untuk mengakses platform pembelajaran SMARTFIN.
                        Tingkatkan keterampilan Anda dengan fitur interaktif dan materi terstruktur kami.
                    </p>
                </div>

                <div className="register-right">
                    <div className="register-header">
                        <p className="register-role">
                            {roleLabel}
                        </p>
                        <h2>
                            Buat Akun Baru
                        </h2>
                    </div>

                <div className="register-role-switch">

                    <button
                        type="button"
                        className={
                            role === 'student'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            handleRoleChange('student')
                        }
                    >
                        Mahasiswa
                    </button>

                    <button
                        type="button"
                        className={
                            role === 'lecturer'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            handleRoleChange('lecturer')
                        }
                    >
                        Dosen
                    </button>

                </div>

                {error && (
                    <div className="register-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="register-success">
                        {success}
                    </div>
                )}

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >

                    <div className="register-field">

                        <label htmlFor="name">
                            Nama Lengkap
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            autoComplete="name"
                            required
                        />

                    </div>

                    <div className="register-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Masukkan email"
                            autoComplete="email"
                            required
                        />

                    </div>

                    <div className="register-password-row">

                        <div className="register-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) => !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    <EyeIcon
                                        visible={showPassword}
                                    />
                                </button>

                            </div>

                        </div>

                        <div className="register-field">

                            <label htmlFor="confirmPassword">
                                Konfirmasi Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Ulangi password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) => !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    <EyeIcon
                                        visible={
                                            showConfirmPassword
                                        }
                                    />
                                </button>

                            </div>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Memproses...'
                            : 'Buat Akun'}
                    </button>

                </form>

                <div className="register-login">

                    <span>
                        Sudah memiliki akun?
                    </span>

                    <Link to="/login">
                        Masuk sekarang
                    </Link>

                </div>

                </div>
            </div>

        </main>
    );
}