import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Penilaian.css';

const api = 'http://localhost:5000';

export default function Penilaian() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(true);
    const [error, setError] = useState('');

    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [exerciseData, setExerciseData] = useState(null);
    const [loadingExercise, setLoadingExercise] = useState(false);

    // UI state for expanding/collapsing materials
    const [expandedMaterials, setExpandedMaterials] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const fetchMaterials = async () => {
            try {
                const response = await fetch(`${api}/api/penilaian/materials`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Gagal memuat daftar materi');
                setMaterials(data.data || []);

                // Auto-expand all materials initially
                const expandState = {};
                (data.data || []).forEach(m => expandState[m.id] = true);
                setExpandedMaterials(expandState);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingMaterials(false);
            }
        };

        fetchMaterials();
    }, [token, navigate]);

    useEffect(() => {
        if (!selectedExerciseId || !token) return;

        const fetchExerciseGrading = async () => {
            setLoadingExercise(true);
            try {
                const response = await fetch(`${api}/api/penilaian/exercise/${selectedExerciseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Gagal memuat detail penilaian');
                setExerciseData(data.data);
            } catch (err) {
                // handle error silently or show a toast
                console.error(err);
            } finally {
                setLoadingExercise(false);
            }
        };

        fetchExerciseGrading();
    }, [selectedExerciseId, token]);

    const toggleMaterial = (id) => {
        setExpandedMaterials(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSelectExercise = (id) => {
        setSelectedExerciseId(id);
        setSidebarOpen(false);
    };

    if (loadingMaterials) return <div className="penilaian-state">Memuat data...</div>;
    if (error) return <div className="penilaian-state error">{error}</div>;

    return (
        <div className="penilaian-page">
            <header className="penilaian-header">
                <div>
                    <h1>Penilaian Latihan</h1>
                    <p className="penilaian-description">Pantau hasil pengerjaan mahasiswa untuk setiap materi</p>
                </div>
                <button
                    className="penilaian-sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? '✕ Tutup' : '☰ Daftar Materi'}
                </button>
            </header>

            {sidebarOpen && (
                <div
                    className="penilaian-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="penilaian-layout">
                <aside className={`penilaian-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <h3 className="penilaian-sidebar-title">Daftar Materi</h3>
                    {materials.length === 0 ? (
                        <p className="penilaian-empty">Belum ada materi dan latihan.</p>
                    ) : (
                        <div className="penilaian-material-list">
                            {materials.map(mat => (
                                <div key={mat.id} className="penilaian-material-item">
                                    <button
                                        className="penilaian-material-toggle"
                                        onClick={() => toggleMaterial(mat.id)}
                                    >
                                        <span className="material-label">Bab {mat.chapter_order}: {mat.title}</span>
                                        <span className="material-icon">{expandedMaterials[mat.id] ? '▼' : '▶'}</span>
                                    </button>

                                    {expandedMaterials[mat.id] && (
                                        <div className="penilaian-exercise-list">
                                            {mat.exercises.length === 0 ? (
                                                <p className="penilaian-empty-exercises">Tidak ada latihan di materi ini.</p>
                                            ) : (
                                                mat.exercises.map(ex => (
                                                    <button
                                                        key={ex.id}
                                                        className={`penilaian-exercise-btn ${selectedExerciseId === ex.id ? 'active' : ''}`}
                                                        onClick={() => handleSelectExercise(ex.id)}
                                                    >
                                                        <div className="exercise-title">{ex.title}</div>
                                                        <div className="exercise-stats">
                                                            {ex.question_count} Soal • {ex.attempt_count} Pengerjaan
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                <main className="penilaian-content">
                    {!selectedExerciseId ? (
                        <div className="penilaian-placeholder">
                            Pilih latihan di sidebar untuk melihat hasil pengerjaan mahasiswa.
                        </div>
                    ) : loadingExercise ? (
                        <div className="penilaian-state">Memuat data penilaian...</div>
                    ) : exerciseData ? (
                        <div className="penilaian-detail-card">
                            <div className="detail-header">
                                <h2>{exerciseData.exercise.title}</h2>
                                <p>Materi: {exerciseData.exercise.material_title}</p>
                            </div>

                            <div className="table-responsive">
                                <table className="penilaian-table">
                                    <thead>
                                        <tr>
                                            <th>Mahasiswa</th>
                                            <th>NIM</th>
                                            <th>Status</th>
                                            <th>Skor</th>
                                            <th>Benar / Salah</th>
                                            <th>Waktu Selesai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exerciseData.students.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">Belum ada mahasiswa yang terdaftar.</td>
                                            </tr>
                                        ) : (
                                            exerciseData.students.map(student => (
                                                <tr key={student.student_id}>
                                                    <td data-label="Mahasiswa">
                                                        <div className="student-info">
                                                            <span className="student-name">{student.student_name}</span>
                                                            <span className="student-email">{student.student_email}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="NIM">{student.student_nim || '-'}</td>
                                                    <td data-label="Status">
                                                        {student.attempt_id ? (
                                                            <span className="badge-status completed">Selesai</span>
                                                        ) : (
                                                            <span className="badge-status pending">Belum</span>
                                                        )}
                                                    </td>
                                                    <td data-label="Skor">
                                                        {student.attempt_id ? (
                                                            <span className={`score-badge ${student.score >= 80 ? 'high' : student.score >= 60 ? 'medium' : 'low'}`}>
                                                                {student.score}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td data-label="Benar / Salah">
                                                        {student.attempt_id ? (
                                                            <span className="stats-text">
                                                                <span className="text-success">{student.correct_answers}</span> / <span className="text-danger">{student.wrong_answers}</span>
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td data-label="Waktu Selesai">
                                                        {student.attempt_id ? (
                                                            <span className="date-text">
                                                                {new Date(student.completed_at).toLocaleString('id-ID', {
                                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="penilaian-state">Gagal memuat data.</div>
                    )}
                </main>
            </div>
        </div>
    );
}
