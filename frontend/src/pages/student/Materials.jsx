import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Materials.css';

export default function Materials() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login', { replace: true }); return; }

        fetch('http://localhost:5000/api/materials/student', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Gagal mengambil materi.');
                setMaterials(Array.isArray(data.data) ? data.data : []);
            })
            .catch((requestError) => setError(requestError.message || 'Gagal mengambil materi.'))
            .finally(() => setLoading(false));
    }, [navigate]);

    return (
        <div className="student-materials-page">
            <header className="student-page-header">
                <h1>Materi</h1>
                <span>Pilih materi yang telah diterbitkan oleh dosen.</span>
            </header>
            {error && <div className="student-page-error">{error}</div>}
            {loading ? <div className="student-page-empty">Memuat materi...</div>
                : materials.length === 0 ? <div className="student-page-empty">Belum ada materi yang diterbitkan oleh dosen.</div>
                    : <div className="student-material-grid">{materials.map((material) => (
                        <Link key={material.id} to={`/materi/${material.id}`} className="student-material-card">
                            {material.theme_image_url && (
                                <div className="student-material-image">
                                    <img src={material.theme_image_url} alt={material.title} loading="lazy" />
                                </div>
                            )}
                            <span>Bab {material.chapter_order}</span>
                            <h2>{material.title}</h2>
                            <p>{material.description || 'Belum ada deskripsi materi.'}</p>
                            <small>{material.file_count} dokumen · {material.video_count} video · {material.exercise_count} latihan</small>
                            <strong>Buka materi</strong>
                        </Link>
                    ))}</div>}
        </div>
    );
}
