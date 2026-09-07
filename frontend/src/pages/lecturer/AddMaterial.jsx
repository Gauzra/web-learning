import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AddMaterial.css';

export default function AddMaterial() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        chapter_order: '',
        description: ''
    });

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        const fileName = selectedFile.name.toLowerCase();

        const isValidExtension =
            fileName.endsWith('.pdf') ||
            fileName.endsWith('.doc') ||
            fileName.endsWith('.docx');

        if (
            !allowedTypes.includes(selectedFile.type) &&
            !isValidExtension
        ) {
            setError(
                'File harus berformat PDF, DOC, atau DOCX.'
            );

            event.target.value = '';
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');

        if (!form.title.trim()) {
            setError('Nama materi wajib diisi.');
            return;
        }

        if (!form.chapter_order) {
            setError('Nomor bab wajib diisi.');
            return;
        }

        if (Number(form.chapter_order) < 1) {
            setError('Nomor bab harus dimulai dari 1.');
            return;
        }

        if (!file) {
            setError('File materi wajib dipilih.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setError(
                'Sesi login tidak ditemukan. Silakan login kembali.'
            );
            return;
        }

        const formData = new FormData();

        formData.append(
            'title',
            form.title.trim()
        );

        formData.append(
            'chapter_order',
            form.chapter_order
        );

        formData.append(
            'description',
            form.description.trim()
        );

        formData.append(
            'file',
            file
        );

        setLoading(true);

        try {
            const response = await fetch(
                'http://localhost:5000/api/materials',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal menyimpan materi.'
                );
            }

            const materialId =
                data.data?.id ||
                data.data?.material?.id;

            if (!materialId) {
                throw new Error(
                    'Materi berhasil disimpan, tetapi ID materi tidak ditemukan.'
                );
            }

            navigate(
                `/dosen/materi/${materialId}`
            );

        } catch (error) {
            console.error(
                'Create material error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat menyimpan materi.'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-material-page">

            <div className="add-material-header">

                <div>
                    {/* <span>
                        SMARTFIN DOSEN
                    </span> */}

                    <h1>
                        Tambah Materi
                    </h1>

                    <p>
                        Tambahkan materi pembelajaran baru
                        untuk mahasiswa.
                    </p>
                </div>

                <Link
                    to="/dosen/materi"
                    className="add-material-back"
                >
                    Kembali
                </Link>

            </div>

            <form
                className="add-material-form"
                onSubmit={handleSubmit}
            >

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <div className="form-section">

                    <h2>
                        Informasi Materi
                    </h2>

                    <div className="form-field">

                        <label htmlFor="title">
                            Nama Materi
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Contoh: Konsep Dasar Investasi"
                            required
                        />

                    </div>

                    <div className="form-field">

                        <label htmlFor="chapter_order">
                            Bab
                        </label>

                        <input
                            id="chapter_order"
                            name="chapter_order"
                            type="number"
                            min="1"
                            value={form.chapter_order}
                            onChange={handleChange}
                            placeholder="Contoh: 1"
                            required
                        />

                    </div>

                    <div className="form-field">

                        <label htmlFor="description">
                            Deskripsi
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Tuliskan deskripsi singkat materi..."
                            rows="4"
                        />

                    </div>

                </div>

                <div className="form-section">

                    <h2>
                        File Materi
                    </h2>

                    <p className="section-description">
                        Upload dokumen materi dalam format
                        PDF atau DOCX.
                    </p>

                    <label className="file-upload">

                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                        />

                        <span className="file-upload-title">
                            Pilih file materi
                        </span>

                        <span className="file-upload-description">
                            PDF atau DOCX
                        </span>

                        {file && (
                            <span className="selected-file">
                                {file.name}
                            </span>
                        )}

                    </label>

                </div>

                <div className="add-material-actions">

                    <Link
                        to="/dosen/materi"
                        className="cancel-button"
                    >
                        Batal
                    </Link>

                    <button
                        type="submit"
                        className="save-button"
                        disabled={loading}
                    >
                        {loading
                            ? 'Menyimpan...'
                            : 'Simpan Materi'}
                    </button>

                </div>

            </form>

        </div>
    );
}