import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './MaterialDetail.css';
const api = 'http://localhost:5000';
const fileUrl = (path) => `${api}/${path.replace(/\\/g, '/').replace(/^.*?(uploads\/)/i, '$1')}`;
const youtubeUrl = (url) => { try { const parsed = new URL(url); const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v'); return id ? `https://www.youtube.com/embed/${id}` : url; } catch { return url; } };

export default function MaterialDetail() {
    const { id } = useParams(); const navigate = useNavigate();
    const [data, setData] = useState({ material: null, videos: [], exercises: [] });
    const [loading, setLoading] = useState(true); const [error, setError] = useState('');
    useEffect(() => { const token = localStorage.getItem('token'); if (!token) { navigate('/login', { replace: true }); return; }
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([fetch(`${api}/api/materials/${id}`, { headers }), fetch(`${api}/api/material-videos/${id}`, { headers }), fetch(`${api}/api/exercises/material/${id}`, { headers })])
            .then(async ([materialResponse, videoResponse, exerciseResponse]) => { const [materialData, videoData, exerciseData] = await Promise.all([materialResponse.json(), videoResponse.json(), exerciseResponse.json()]); if (!materialResponse.ok) throw new Error(materialData.message); if (!videoResponse.ok) throw new Error(videoData.message); if (!exerciseResponse.ok) throw new Error(exerciseData.message); setData({ material: materialData.data, videos: videoData.data || [], exercises: exerciseData.data || [] }); })
            .catch((requestError) => setError(requestError.message || 'Gagal mengambil materi.')).finally(() => setLoading(false));
    }, [id, navigate]);
    if (loading) return <div className="student-detail-state">Memuat materi...</div>;
    if (error) return <div className="student-detail-state student-detail-error">{error}</div>;
    const { material, videos, exercises } = data;
    return <div className="student-detail-page"><Link to="/materi" className="student-detail-back">Kembali ke materi</Link><header className="student-detail-header"><span>Bab {material.chapter_order}</span><h1>{material.title}</h1><p>{material.description || 'Belum ada deskripsi materi.'}</p></header>
        <section className="student-detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Materi Bacaan</h2>
            </div>
            {material.files?.length ? material.files.map((file) => (
                <div key={file.id} className="student-reading-container">
                    <div className="student-reading-header">
                        <strong>{file.original_name}</strong>
                        <a href={fileUrl(file.file_path)} target="_blank" rel="noreferrer" className="student-download-btn">Unduh File Asli ({file.file_type.toUpperCase()})</a>
                    </div>
                    {file.extracted_text ? (
                        <div className="student-reading-content">
                            {file.extracted_text.split('\n').map((paragraph, idx) => (
                                paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                            ))}
                        </div>
                    ) : (
                        <p className="student-detail-empty" style={{marginTop: '15px'}}>Tidak ada teks yang diekstrak. Silakan unduh dokumen aslinya.</p>
                    )}
                </div>
            )) : <p className="student-detail-empty">Belum ada dokumen materi.</p>}
        </section>
        <section className="student-detail-section"><h2>Video Pembelajaran</h2>{videos.length ? <div className="student-video-list">{videos.map((video) => <article key={video.id} className="student-video-card"><h3>{video.title || 'Video pembelajaran'}</h3>{video.video_type === 'youtube' ? <iframe src={youtubeUrl(video.video_url)} title={video.title} allowFullScreen /> : video.video_type === 'upload' ? <video controls src={fileUrl(video.file_path)} /> : <div style={{ padding: '0 14px 14px', display: 'flex', justifyContent: 'flex-end' }}><a href={video.video_url} target="_blank" rel="noreferrer" className="student-exercise-btn">Buka video</a></div>}</article>)}</div> : <p className="student-detail-empty">Belum ada video.</p>}</section>
        <section className="student-detail-section"><h2>Latihan Pembelajaran</h2>{exercises.length ? exercises.map((exercise) => <article key={exercise.id} className="student-exercise-card"><div className="student-exercise-info"><strong>{exercise.title}</strong><span>{exercise.question_count} soal</span>{exercise.my_attempt && <span className="student-exercise-done">Selesai · Skor {Math.round(exercise.my_attempt.score)}</span>}</div><Link to={`/latihan/${exercise.id}`} className="student-exercise-btn">{exercise.my_attempt ? 'Lihat Hasil' : 'Mulai Latihan →'}</Link></article>) : <p className="student-detail-empty">Belum ada latihan yang diterbitkan.</p>}</section></div>;
}
