import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

import backgroundImage from '../../assets/images/auth/bg1.png';
import logoImage from '../../assets/images/DigiLitera.png';

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

export default function Login() {
    const navigate = useNavigate();

    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
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

        if (error) {
            setError('');
        }
    };

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');

        if (!form.email.trim() || !form.password) {
            setError('Email dan password wajib diisi.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: form.email.trim(),
                        password: form.password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Email atau password tidak valid.'
                );
            }

            const loggedInUser = data.data?.user;
            const token = data.data?.token;

            if (!loggedInUser || !token) {
                throw new Error(
                    data.message || 'Login gagal. Data akun tidak lengkap.'
                );
            }

            if (loggedInUser.role !== role) {
                const selectedRole =
                    role === 'student'
                        ? 'mahasiswa'
                        : 'dosen';

                const actualRole =
                    loggedInUser.role === 'student'
                        ? 'mahasiswa'
                        : 'dosen';

                throw new Error(
                    `Akun ini terdaftar sebagai ${actualRole}, bukan ${selectedRole}.`
                );
            }

            localStorage.setItem('token', token);

            localStorage.setItem(
                'user',
                JSON.stringify(loggedInUser)
            );

            if (loggedInUser.role === 'lecturer') {
                navigate('/dosen/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (error) {
            setError(
                error.message ||
                'Terjadi kesalahan saat login.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="auth-page"
            style={{
                backgroundImage: `url(${backgroundImage})`
            }}
        >

            <div className="auth-container">
                <div className="auth-left">
                    <img src={logoImage} alt="DigiLitera" className="auth-brand" />
                   <h1 className="auth-brand-sub">Belajar Jadi Lebih Mudah</h1>
                   <p className="register-left-desc"> 
                    Jelajahi berbagai materi pembelajaran, 
                    kembangkan pengetahuan dan keterampilan, 
                    serta capai tujuan belajarmu bersama WebLearning </p>
                </div>

                <div className="auth-right">
                    <div className="auth-header">
                        <p className="auth-role">
                            {roleLabel}
                        </p>
                        <h2>
                            Masuk ke Akun Anda
                        </h2>
                    </div>

                <div className="role-switch">

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
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="auth-field">

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

                    <div className="auth-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-wrapper">

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
                                placeholder="Masukkan password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
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

                    <div className="auth-forgot">

                        <button
                            type="button"
                            onClick={() => { }}
                        >
                            Lupa password?
                        </button>

                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Memproses...'
                            : 'Masuk'}
                    </button>

                </form>

                <div className="auth-register">

                    <span>
                        Belum memiliki akun?
                    </span>

                    <Link to="/register">
                        Daftar sekarang
                    </Link>

                </div>

                </div>
            </div>

        </main>
    );
}