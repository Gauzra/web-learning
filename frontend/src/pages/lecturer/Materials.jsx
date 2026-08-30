import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Materials.css';

export default function Materials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [materialToDelete, setMaterialToDelete] = useState(null);
    const [deletingMaterialId, setDeletingMaterialId] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError(
                    'Sesi login tidak ditemukan. Silakan login kembali.'
                );
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    'http://localhost:5000/api/materials',
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        'Gagal mengambil data materi.'
                    );
                }

                setMaterials(
                    Array.isArray(data.data)
                        ? data.data
                        : []
                );

            } catch (error) {
                console.error(
                    'Get lecturer materials error:',
                    error
                );

                setError(
                    error.message ||
                    'Terjadi kesalahan saat mengambil materi.'
                );

            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    const handleDeleteMaterial = async (material) => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError(
                'Sesi login tidak ditemukan. Silakan login kembali.'
            );
            return;
        }

        setDeletingMaterialId(material.id);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/materials/${material.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal menghapus materi.'
                );
            }

            setMaterials((previousMaterials) =>
                previousMaterials.filter(
                    (item) => item.id !== material.id
                )
            );

            setMaterialToDelete(null);

        } catch (error) {
            console.error(
                'Delete material error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat menghapus materi.'
            );

        } finally {
            setDeletingMaterialId(null);
        }
    };

    return (
        <div className="lecturer-materials">

            <header className="materials-header">

                <div>

                    <h1>
                        Materi Pembelajaran
                    </h1>

                    <p className="materials-description">
                        Kelola materi pembelajaran yang
                        tersedia untuk mahasiswa.
                    </p>
                </div>

                <Link
                    to="/dosen/materi/tambah"
                    className="materials-add-button"
                >
                    + Tambah Materi
                </Link>

            </header>

            <div className="materials-content">

                {loading && (
                    <div className="materials-empty">

                        <h2>
                            Memuat materi...
                        </h2>

                        <p>
                            Mengambil data materi dari server.
                        </p>

                    </div>
                )}

                {!loading && error && (
                    <div className="materials-empty">

                        <h2>
                            Gagal memuat materi
                        </h2>

                        <p>
                            {error}
                        </p>

                    </div>
                )}

                {!loading &&
                    !error &&
                    materials.length === 0 && (

                        <div className="materials-empty">

                            <div className="materials-empty-icon">
                                +
                            </div>

                            <h2>
                                Belum ada materi
                            </h2>

                            <p>
                                Belum ada materi pembelajaran
                                yang ditambahkan. Tambahkan
                                materi pertama untuk memulai.
                            </p>

                            <Link
                                to="/dosen/materi/tambah"
                                className="materials-empty-button"
                            >
                                Tambah Materi
                            </Link>

                        </div>
                    )}

                {!loading &&
                    !error &&
                    materials.length > 0 && (

                        <div className="materials-list">

                            {materials.map((material) => (

                                <div
                                    key={material.id}
                                    className="material-item-wrapper"
                                >

                                    <Link
                                        to={`/dosen/materi/${material.id}`}
                                        className="material-item"
                                    >

                                        {material.theme_image_url && (
                                            <div className="material-item-image">
                                                <img
                                                    src={material.theme_image_url}
                                                    alt={material.title}
                                                />
                                            </div>
                                        )}

                                        <div className="material-item-top">

                                            <span className="material-chapter">
                                                Bab {material.chapter_order}
                                            </span>

                                            <span className="material-status">
                                                {material.is_published
                                                    ? 'Dipublikasikan'
                                                    : 'Draft'}
                                            </span>

                                        </div>

                                        <h3>
                                            {material.title}
                                        </h3>

                                        <p>
                                            {material.description ||
                                                'Belum ada deskripsi materi.'}
                                        </p>

                                        <div className="material-item-footer">

                                            <span>
                                                {material.original_name ||
                                                    'Dokumen tersedia'}
                                            </span>

                                            <span>
                                                Buka Materi
                                            </span>

                                        </div>

                                    </Link>

                                    <button
                                        type="button"
                                        className="material-delete-icon"
                                        title="Hapus Materi"
                                        onClick={() =>
                                            setMaterialToDelete(material)
                                        }
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"
                                            />
                                        </svg>
                                    </button>

                                </div>

                            ))}

                        </div>
                    )}

            </div>

            {materialToDelete && (
                <div className="confirm-modal-overlay">

                    <div className="confirm-modal">

                        <div className="confirm-modal-content">

                            <span className="confirm-modal-label">
                                KONFIRMASI
                            </span>

                            <h2>
                                Hapus Materi
                            </h2>

                            <p>
                                Apakah Anda yakin ingin menghapus materi
                                "{materialToDelete.title}"?
                            </p>

                            <p className="confirm-modal-warning">
                                Materi, dokumen, dan video yang terkait
                                akan ikut dihapus dan tidak dapat
                                dikembalikan.
                            </p>

                        </div>

                        <div className="confirm-modal-actions">

                            <button
                                type="button"
                                className="confirm-modal-cancel"
                                onClick={() =>
                                    setMaterialToDelete(null)
                                }
                                disabled={
                                    deletingMaterialId !== null
                                }
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="confirm-modal-delete"
                                onClick={() =>
                                    handleDeleteMaterial(
                                        materialToDelete
                                    )
                                }
                                disabled={
                                    deletingMaterialId !== null
                                }
                            >
                                {deletingMaterialId !== null
                                    ? 'Menghapus...'
                                    : 'Hapus Materi'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}