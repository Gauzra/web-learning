import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('user');

    let user = null;

    try {
        user = userData ? JSON.parse(userData) : null;
    } catch {
        user = null;
    }

    const userName = user?.name || 'Mahasiswa';
    const totalExercises = materials.reduce(
        (total, material) => total + Number(material.exercise_count || 0),
        0
    );
    const completedExercises = materials.reduce(
        (total, material) => total + Number(material.my_completed_exercises || 0),
        0
    );
    const progressPercent = totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;
    const progressText = totalExercises === 0
        ? 'Belum ada latihan'
        : completedExercises === 0
            ? 'Mulai kerjakan latihan'
            : completedExercises >= totalExercises
                ? 'Semua latihan selesai'
                : `${completedExercises} dari ${totalExercises} latihan selesai`;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login', { replace: true }); return; }
        fetch('http://localhost:5000/api/materials/student', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                setMaterials(Array.isArray(data.data) ? data.data : []);
            })
            .catch(() => setMaterials([]))
            .finally(() => setLoading(false));
    }, [navigate]);

    return (
        <div className="dashboard-page">

            <section className="dashboard-welcome">
                <div>
                    <h1>
                        Selamat datang, {userName}
                    </h1>

                    <p className="dashboard-description">
                        Akses materi pembelajaran, video,
                        dan latihan yang tersedia di sistem.
                    </p>
                </div>
            </section>

            <section className="dashboard-summary">

                <div className="summary-card">
                    <span className="summary-label">
                        Materi
                    </span>

                    <strong>{loading ? '...' : materials.length}</strong>

                    <p>
                        Materi tersedia
                    </p>
                </div>

                <div className="summary-card">
                    <span className="summary-label">
                        Latihan
                    </span>

                    <strong>{loading ? '...' : totalExercises}</strong>

                    <p>
                        Latihan tersedia
                    </p>
                </div>

                <div className="summary-card">
                    <span className="summary-label">
                        Progres
                    </span>

                    <strong>{loading ? '...' : `${progressPercent}%`}</strong>

                    <p>
                        {loading ? '...' : progressText}
                    </p>
                </div>

            </section>

            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <h2>
                            Materi Pembelajaran
                        </h2>

                        <p>
                            Pelajari materi sesuai dengan
                            urutan pembelajaran.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="dashboard-empty"><h3>Memuat materi...</h3></div>
                ) : materials.length === 0 ? (
                    <div className="dashboard-empty"><h3>Belum ada materi pembelajaran</h3><p>Materi akan muncul setelah diterbitkan oleh dosen.</p></div>
                ) : (
                    <div className="student-dashboard-materials">
                        {materials.slice(0, 3).map((material) => (
                            <Link key={material.id} to={`/materi/${material.id}`} className="student-dashboard-material">
                                <span>Bab {material.chapter_order}</span>
                                <strong>{material.title}</strong>
                                <small>{material.video_count} video · {material.exercise_count} latihan</small>
                            </Link>
                        ))}
                    </div>
                )}

            </section>

        </div>
    );
}
