import React, { useState } from 'react';
import './AddVideo.css';

export default function AddVideo({
    materialId,
    onClose,
    onSuccess
}) {
    const [form, setForm] = useState({
        title: '',
        video_type: 'youtube',
        video_url: ''
    });

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setError('');

        if (
            name === 'video_type' &&
            value !== 'upload'
        ) {
            setFile(null);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedExtensions = [
            '.mp4',
            '.webm',
            '.ogg',
            '.mov'
        ];

        const fileName =
            selectedFile.name.toLowerCase();

        const isValidExtension =
            allowedExtensions.some(
                (extension) =>
                    fileName.endsWith(extension)
            );

        if (!isValidExtension) {
            setError(
                'Format video yang diperbolehkan: MP4, WebM, OGG, atau MOV.'
            );

            event.target.value = '';
            setFile(null);
            return;
        }

        const maxSize =
            200 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            setError(
                'Ukuran video maksimal 200 MB.'
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

        if (!materialId) {
            setError(
                'Material ID tidak ditemukan.'
            );
            return;
        }

        if (!form.title.trim()) {
            setError(
                'Judul video wajib diisi.'
            );
            return;
        }

        if (form.video_type === 'upload') {
            if (!file) {
                setError(
                    'File video wajib dipilih.'
                );
                return;
            }
        } else {
            if (!form.video_url.trim()) {
                setError(
                    'URL video wajib diisi.'
                );
                return;
            }
        }

        const token =
            localStorage.getItem('token');

        if (!token) {
            setError(
                'Sesi login tidak ditemukan. Silakan login kembali.'
            );
            return;
        }

        setLoading(true);

        try {
            let response;

            if (form.video_type === 'upload') {
                const formData =
                    new FormData();

                formData.append(
                    'title',
                    form.title.trim()
                );

                formData.append(
                    'video_type',
                    'upload'
                );

                formData.append(
                    'video',
                    file
                );

                response = await fetch(
                    `http://localhost:5000/api/material-videos/${materialId}`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },
                        body: formData
                    }
                );

            } else {
                response = await fetch(
                    `http://localhost:5000/api/material-videos/${materialId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                            Authorization:
                                `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title:
                                form.title.trim(),
                            video_type:
                                form.video_type,
                            video_url:
                                form.video_url.trim()
                        })
                    }
                );
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal menambahkan video.'
                );
            }

            if (onSuccess) {
                onSuccess(data.data);
            }

        } catch (error) {
            console.error(
                'Add video error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat menambahkan video.'
            );

        } finally {
            setLoading(false);
        }
    };

    const getUrlPlaceholder = () => {
        if (
            form.video_type === 'youtube'
        ) {
            return 'https://www.youtube.com/watch?v=...';
        }

        return 'https://drive.google.com/file/d/...';
    };

    return (
        <form
            className="add-video-form"
            onSubmit={handleSubmit}
        >

            <div className="add-video-header">

                <p>
                    VIDEO PEMBELAJARAN
                </p>

                <h1>
                    Tambah Video
                </h1>

                <span>
                    Tambahkan video pembelajaran
                    ke materi ini.
                </span>

            </div>

            {error && (
                <div className="add-video-error">
                    {error}
                </div>
            )}

            <div className="add-video-field">

                <label htmlFor="title">
                    Judul Video
                </label>

                <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Pengantar Sistem Informasi"
                    disabled={loading}
                />

            </div>

            <div className="add-video-field">

                <label htmlFor="video_type">
                    Sumber Video
                </label>

                <select
                    id="video_type"
                    name="video_type"
                    value={form.video_type}
                    onChange={handleChange}
                    disabled={loading}
                >

                    <option value="youtube">
                        YouTube
                    </option>

                    <option value="url">
                        URL / Google Drive
                    </option>

                    <option value="upload">
                        Upload Video
                    </option>

                </select>

            </div>

            {form.video_type !== 'upload' && (

                <div className="add-video-field">

                    <label htmlFor="video_url">
                        URL Video
                    </label>

                    <input
                        id="video_url"
                        name="video_url"
                        type="url"
                        value={form.video_url}
                        onChange={handleChange}
                        placeholder={getUrlPlaceholder()}
                        disabled={loading}
                    />

                    {form.video_type === 'url' && (
                        <small>
                            Untuk Google Drive, pastikan
                            file dapat diakses oleh mahasiswa
                            yang memiliki link.
                        </small>
                    )}

                </div>

            )}

            {form.video_type === 'upload' && (

                <div className="add-video-field">

                    <label htmlFor="video">
                        File Video
                    </label>

                    <input
                        id="video"
                        name="video"
                        type="file"
                        accept=".mp4,.webm,.ogg,.mov"
                        onChange={handleFileChange}
                        disabled={loading}
                    />

                    <small>
                        Format MP4, WebM, OGG, atau MOV.
                        Maksimal 200 MB.
                    </small>

                    {file && (
                        <div className="selected-video-file">
                            {file.name}
                        </div>
                    )}

                </div>

            )}

            <div className="add-video-actions">

                <button
                    type="button"
                    className="cancel-button"
                    onClick={onClose}
                    disabled={loading}
                >
                    Batal
                </button>

                <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                >
                    {loading
                        ? 'Menyimpan...'
                        : 'Simpan Video'}
                </button>

            </div>

        </form>
    );
}