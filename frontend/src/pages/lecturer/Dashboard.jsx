import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [exerciseSummary, setExerciseSummary] = useState({
        total_exercises: 0,
        published_exercises: 0,
        draft_exercises: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!token || !userData) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            navigate('/login', { replace: true });
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const [materialResponse, exerciseResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/materials', {
                        method: 'GET',
                        headers
                    }),
                    fetch('http://localhost:5000/api/exercises/summary', {
                        method: 'GET',
                        headers
                    })
                ]);

                const [materialData, exerciseData] = await Promise.all([
                    materialResponse.json(),
                    exerciseResponse.json()
                ]);

                if (!materialResponse.ok) {
                    throw new Error(
                        materialData.message ||
                        'Gagal mengambil data dashboard.'
                    );
                }

                if (!exerciseResponse.ok) {
                    throw new Error(
                        exerciseData.message ||
                        'Gagal mengambil ringkasan latihan.'
                    );
                }

                const uniqueMaterials = Array.from(
                    new Map(
                        (Array.isArray(materialData.data)
                            ? materialData.data
                            : []
                        ).map((material) => [material.id, material])
                    ).values()
                );

                setMaterials(uniqueMaterials);
                setExerciseSummary(exerciseData.data || {
                    total_exercises: 0,
                    published_exercises: 0,
                    draft_exercises: 0
                });

            } catch (error) {
                console.error(
                    'Dashboard error:',
                    error
                );

                setError(
                    error.message ||
                    'Terjadi kesalahan saat mengambil data dashboard.'
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const userName = user?.name || 'Dosen';

    const totalMaterials = materials.length;
    const totalExercises = Number(
        exerciseSummary.total_exercises || 0
    );

    const totalVideos = materials.reduce(
        (total, material) =>
            total + Number(material.video_count || 0),
        0
    );

    return (
        <div className="lecturer-dashboard">

            <section className="lecturer-header">

                <div>


                    <h1>
                        Selamat datang, {userName}
                    </h1>

                    <p className="lecturer-description">
                        Kelola materi pembelajaran dan
                        latihan mahasiswa melalui sistem.
                    </p>

                </div>

            </section>

            {error && (
                <div className="lecturer-dashboard-error">
                    {error}
                </div>
            )}

            <section className="lecturer-stat-grid">

                <div className="lecturer-stat-card">

                    <div className="lecturer-stat-label">
                        Total Materi
                    </div>

                    <div className="lecturer-stat-value">
                        {loading ? '...' : totalMaterials}
                    </div>

                    <div className="lecturer-stat-description">
                        Materi pembelajaran
                    </div>

                </div>

                <div className="lecturer-stat-card">

                    <div className="lecturer-stat-label">
                        Total Latihan
                    </div>

                    <div className="lecturer-stat-value">
                        {loading ? '...' : totalExercises}
                    </div>

                    <div className="lecturer-stat-description">
                        {loading
                            ? 'Memuat latihan...'
                            : `${exerciseSummary.published_exercises || 0} terbit · ${exerciseSummary.draft_exercises || 0} draft`}
                    </div>

                </div>

                <div className="lecturer-stat-card">

                    <div className="lecturer-stat-label">
                        Total Video
                    </div>

                    <div className="lecturer-stat-value">
                        {loading ? '...' : totalVideos}
                    </div>

                    <div className="lecturer-stat-description">
                        Video pembelajaran
                    </div>

                </div>

            </section>

            <section className="lecturer-content-section">

                <div className="lecturer-section-header">

                    <div>

                        <h2>
                            Materi Pembelajaran
                        </h2>

                        <p>
                            Kelola materi yang akan
                            digunakan mahasiswa.
                        </p>

                    </div>

                    <Link
                        to="/dosen/materi"
                        className="lecturer-view-link"
                    >
                        Lihat semua
                    </Link>

                </div>

                {!loading &&
                    !error &&
                    materials.length === 0 && (

                        <div className="lecturer-empty">

                            <div className="lecturer-empty-icon">
                                +
                            </div>

                            <h3>
                                Belum ada materi
                            </h3>

                            <p>
                                Tambahkan materi pembelajaran
                                pertama untuk mulai menggunakan
                                SMARTFIN.
                            </p>

                            <Link
                                to="/dosen/materi/tambah"
                                className="lecturer-secondary-button"
                            >
                                Tambah Materi
                            </Link>

                        </div>
                    )}

                {loading && (
                    <div className="lecturer-empty">

                        <h3>
                            Memuat materi...
                        </h3>

                        <p>
                            Mengambil data materi dari server.
                        </p>

                    </div>
                )}

                {!loading &&
                    !error &&
                    materials.length > 0 && (

                        <div className="lecturer-material-list">

                            {materials
                                .slice(0, 5)
                                .map((material) => (

                                    <Link
                                        key={material.id}
                                        to={`/dosen/materi/${material.id}`}
                                        className="lecturer-material-item"
                                    >

                                        <div>

                                            <span>
                                                Bab {material.chapter_order}
                                            </span>

                                            <h3>
                                                {material.title}
                                            </h3>

                                            <p>
                                                {material.description ||
                                                    'Belum ada deskripsi materi.'}
                                            </p>

                                        </div>

                                        <strong>
                                            Buka
                                        </strong>

                                    </Link>

                                ))}

                        </div>
                    )}

            </section>

        </div>
    );
}
