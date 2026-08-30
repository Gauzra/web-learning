import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AddVideo from './AddVideo';
import './MaterialDetail.css';


export default function MaterialDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [material, setMaterial] = useState(null);
    const [videos, setVideos] = useState([]);

    const [videoToDelete, setVideoToDelete] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [showAddFile, setShowAddFile] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [deletingVideoId, setDeletingVideoId] = useState(null);
    const [deletingFileId, setDeletingFileId] = useState(null);
    const [deletingExerciseId, setDeletingExerciseId] = useState(null);
    const [addingFile, setAddingFile] = useState(false);

    const [showAddExercise, setShowAddExercise] = useState(false);

    const [exerciseForm, setExerciseForm] = useState({
        title: '',
        description: '',
        file: null
    });

    const [exercises, setExercises] = useState([]);
    const [addingExercise, setAddingExercise] = useState(false);


    useEffect(() => {
        const fetchMaterialData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login', { replace: true });
                return;
            }

            try {
                const materialResponse = await fetch(
                    `http://localhost:5000/api/materials/${id}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const materialData =
                    await materialResponse.json();

                if (!materialResponse.ok) {
                    throw new Error(
                        materialData.message ||
                        'Gagal mengambil data materi.'
                    );
                }

                const videoResponse = await fetch(
                    `http://localhost:5000/api/material-videos/${id}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const videoData =
                    await videoResponse.json();

                if (!videoResponse.ok) {
                    throw new Error(
                        videoData.message ||
                        'Gagal mengambil data video.'
                    );
                }

                const exerciseResponse = await fetch(
                    `http://localhost:5000/api/exercises/material/${id}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const exerciseData = await exerciseResponse.json();

                if (!exerciseResponse.ok) {
                    throw new Error(
                        exerciseData.message ||
                        'Gagal mengambil data latihan.'
                    );
                }

                setMaterial(materialData.data);

                setVideos(
                    Array.isArray(videoData.data)
                        ? videoData.data
                        : []
                );

                setExercises(
                    Array.isArray(exerciseData.data)
                        ? exerciseData.data
                        : []
                );

            } catch (error) {
                console.error(
                    'Get material detail error:',
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

        fetchMaterialData();
    }, [id, navigate]);



    const getYouTubeEmbedUrl = (url) => {
        try {
            const parsedUrl = new URL(url);

            if (
                parsedUrl.hostname.includes(
                    'youtube.com'
                )
            ) {
                const videoId =
                    parsedUrl.searchParams.get('v');

                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }

            if (
                parsedUrl.hostname ===
                'youtu.be'
            ) {
                const videoId =
                    parsedUrl.pathname.substring(1);

                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }

            return url;

        } catch {
            return url;
        }
    };

    const getVideoSource = (video) => {
        if (
            video.video_type === 'upload' &&
            video.file_path
        ) {
            const normalizedPath =
                video.file_path
                    .replace(/\\/g, '/')
                    .replace(/^\/+/, '');

            return `http://localhost:5000/${normalizedPath}`;
        }

        return video.video_url;
    };

    const handleDeleteVideo = async (video) => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        setDeletingVideoId(video.id);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/material-videos/${id}/${video.id}`,
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
                    'Gagal menghapus video.'
                );
            }

            setVideos((previousVideos) =>
                previousVideos.filter(
                    (item) => item.id !== video.id
                )
            );

            setVideoToDelete(null);

        } catch (error) {
            console.error(
                'Delete video error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat menghapus video.'
            );

        } finally {
            setDeletingVideoId(null);
        }
    };

    const handleDeleteFile = async (file) => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        setDeletingFileId(file.id);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/materials/${id}/files/${file.id}`,
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
                    'Gagal menghapus dokumen.'
                );
            }

            setMaterial((previousMaterial) => ({
                ...previousMaterial,
                files: previousMaterial.files.filter(
                    (item) => item.id !== file.id
                )
            }));

            setFileToDelete(null);

        } catch (error) {
            console.error(
                'Delete material file error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat menghapus dokumen.'
            );

        } finally {
            setDeletingFileId(null);
        }
    };

    const handleDeleteExercise = async (exercise) => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        setDeletingExerciseId(exercise.id);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/exercises/${exercise.id}`,
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
                    data.message || 'Gagal menghapus latihan.'
                );
            }

            setExercises((previousExercises) =>
                previousExercises.filter(
                    (item) => item.id !== exercise.id
                )
            );

            setExerciseToDelete(null);

        } catch (error) {
            console.error('Delete exercise error:', error);

            setError(
                error.message ||
                'Terjadi kesalahan saat menghapus latihan.'
            );

        } finally {
            setDeletingExerciseId(null);
        }
    };

    const handleAddFile = async () => {
        if (!selectedFile) {
            setError('Silakan pilih dokumen terlebih dahulu.');
            return;
        }

        const extension = selectedFile.name
            .split('.')
            .pop()
            .toLowerCase();

        if (!['pdf', 'docx'].includes(extension)) {
            setError('File harus berformat PDF atau DOCX.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const formData = new FormData();

        formData.append('file', selectedFile);

        setAddingFile(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/materials/${id}/files`,
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
                    'Gagal menambahkan dokumen.'
                );
            }

            setMaterial((previousMaterial) => ({
                ...previousMaterial,
                files: [
                    ...(previousMaterial.files || []),
                    data.data
                ]
            }));

            setSelectedFile(null);
            setShowAddFile(false);

        } catch (error) {
            console.error(
                'Add material file error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat menambahkan dokumen.'
            );

        } finally {
            setAddingFile(false);
        }
    };

    const handleAddExercise = async () => {
        if (!exerciseForm.title.trim()) {
            setError('Judul latihan wajib diisi.');
            return;
        }

        if (!exerciseForm.file) {
            setError('Dokumen soal wajib dipilih.');
            return;
        }

        const extension = exerciseForm.file.name
            .split('.')
            .pop()
            .toLowerCase();

        if (!['pdf', 'docx'].includes(extension)) {
            setError('File harus berformat PDF atau DOCX.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const formData = new FormData();

        formData.append(
            'material_id',
            String(id)
        );

        formData.append(
            'title',
            exerciseForm.title.trim()
        );

        formData.append(
            'description',
            exerciseForm.description.trim()
        );

        formData.append(
            'file',
            exerciseForm.file
        );

        setAddingExercise(true);
        setError('');

        try {
            const response = await fetch(
                'http://localhost:5000/api/exercises',
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
                    'Gagal membuat latihan.'
                );
            }

            setShowAddExercise(false);

            setExerciseForm({
                title: '',
                description: '',
                file: null
            });

            console.log('TOKEN:', localStorage.getItem('token'));
            console.log('RESPONSE EXERCISE:', data);
            console.log('EXERCISE ID:', data.data.id);

            navigate(
                `/dosen/materi/${id}/latihan/${data.data.id}`
            );

        } catch (error) {
            console.error(
                'Add exercise error:',
                error
            );

            setError(
                error.message ||
                'Terjadi kesalahan saat membuat latihan.'
            );

        } finally {
            setAddingExercise(false);
        }
    };

    if (loading) {
        return (
            <div className="material-detail-page">
                <div className="material-detail-state">
                    Memuat materi...
                </div>
            </div>
        );
    }

    if (error && !material) {
        return (
            <div className="material-detail-page">

                <div className="material-detail-error">
                    {error}
                </div>

                <Link
                    to="/dosen/materi"
                    className="material-detail-back"
                >
                    Kembali ke Materi
                </Link>

            </div>
        );
    }

    if (!material) {
        return (
            <div className="material-detail-page">

                <div className="material-detail-state">
                    Materi tidak ditemukan.
                </div>

                <Link
                    to="/dosen/materi"
                    className="material-detail-back"
                >
                    Kembali ke Materi
                </Link>

            </div>
        );
    }

    return (
        <div className="material-detail-page">

            {error && (
                <div className="material-detail-error">
                    {error}
                </div>
            )}

            <div className="material-detail-content">

                {/* INFORMASI MATERI */}

                <section className="material-info-card">

                    <div className="material-info-header">

                        <div>

                            <span>
                                INFORMASI MATERI
                            </span>

                            <h2>
                                {material.title}
                            </h2>

                        </div>

                        <span className="material-chapter">
                            Bab {material.chapter_order}
                        </span>

                    </div>

                    <p className="material-description">
                        {material.description ||
                            'Belum ada deskripsi materi.'}
                    </p>

                </section>


                {/* DOKUMEN MATERI */}

                <section className="material-section">

                    <div className="material-section-header">

                        <div>

                            <span>
                                DOKUMEN
                            </span>

                            <h2>
                                Materi Pembelajaran
                            </h2>

                        </div>

                        <button
                            type="button"
                            className="material-action-button"
                            onClick={() => {
                                setShowAddFile(true);
                                setSelectedFile(null);
                                setError('');
                            }}
                        >
                            Tambah Dokumen
                        </button>

                    </div>

                    {material.files &&
                        material.files.length > 0 ? (

                        <div className="material-files">

                            {material.files.map((file) => {

                                const isDeleting =
                                    deletingFileId === file.id;

                                return (
                                    <div
                                        className="material-file-card"
                                        key={file.id}
                                    >

                                        <div className="material-file-info">

                                            <strong>
                                                {file.original_name}
                                            </strong>

                                            <span>
                                                {file.file_type.toUpperCase()}
                                            </span>

                                        </div>

                                        <div className="material-file-actions">

                                            <button
                                                type="button"
                                                className="material-delete-button"
                                                onClick={() =>
                                                    setFileToDelete(file)
                                                }
                                                disabled={isDeleting}
                                            >
                                                {isDeleting
                                                    ? 'Menghapus...'
                                                    : 'Hapus Dokumen'}
                                            </button>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    ) : (

                        <div className="material-empty">
                            Belum ada dokumen materi.
                        </div>

                    )}

                </section>


                {/* VIDEO PEMBELAJARAN */}

                <section className="material-section">

                    <div className="material-section-header">

                        <div>

                            <span>
                                VIDEO
                            </span>

                            <h2>
                                Video Pembelajaran
                            </h2>

                        </div>

                        <button
                            type="button"
                            className="material-action-button"
                            onClick={() => {
                                setShowAddVideo(true);
                                setError('');
                            }}
                        >
                            Tambah Video
                        </button>

                    </div>

                    {videos.length === 0 ? (

                        <div className="material-empty">
                            Belum ada video pembelajaran.
                        </div>

                    ) : (

                        <div className="material-videos">

                            {videos.map((video) => {

                                const source =
                                    getVideoSource(video);

                                const isDeleting =
                                    deletingVideoId === video.id;

                                return (
                                    <div
                                        className="material-video-card"
                                        key={video.id}
                                    >

                                        <div className="material-video-header">

                                            <div>

                                                <span>
                                                    {video.video_type === 'youtube'
                                                        ? 'YOUTUBE'
                                                        : video.video_type === 'upload'
                                                            ? 'VIDEO UPLOAD'
                                                            : 'URL VIDEO'}
                                                </span>

                                                <h3>
                                                    {video.title}
                                                </h3>

                                            </div>

                                        </div>

                                        <div className="material-video-player">

                                            {video.video_type === 'youtube' ? (

                                                <iframe
                                                    src={getYouTubeEmbedUrl(
                                                        source
                                                    )}
                                                    title={video.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />

                                            ) : video.video_type === 'upload' ? (

                                                <video
                                                    controls
                                                    preload="metadata"
                                                    src={source}
                                                >
                                                    Browser Anda tidak mendukung
                                                    pemutaran video.
                                                </video>

                                            ) : (

                                                <div className="material-video-url">

                                                    <a
                                                        href={source}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Buka Video
                                                    </a>

                                                </div>

                                            )}

                                        </div>

                                        {video.video_type === 'upload' &&
                                            video.original_name && (

                                                <p className="material-video-file">
                                                    File: {video.original_name}
                                                </p>

                                            )}

                                        <div className="material-video-actions">

                                            <button
                                                type="button"
                                                className="material-delete-button"
                                                onClick={() =>
                                                    setVideoToDelete(video)
                                                }
                                                disabled={isDeleting}
                                            >
                                                Hapus Video
                                            </button>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    )}

                </section>


                {/* LATIHAN PEMBELAJARAN */}

                <section className="material-section">

                    <div className="material-section-header">

                        <div>

                            <span>
                                LATIHAN
                            </span>

                            <h2>
                                Latihan Pembelajaran
                            </h2>

                        </div>

                        <button
                            type="button"
                            className="material-action-button"
                            onClick={() => {
                                setShowAddExercise(true);
                                setError('');
                            }}
                        >
                            Tambah Latihan
                        </button>

                    </div>

                    {exercises.length === 0 ? (

                        <div className="material-empty">
                            Belum ada latihan.
                        </div>

                    ) : (

                        <div className="material-files">

                            {exercises.map((exercise) => (

                                <div
                                    className="material-file-card"
                                    key={exercise.id}
                                >

                                    <div className="material-file-info">

                                        <strong>
                                            {exercise.title}
                                        </strong>

                                        <span>
                                            {exercise.question_count || 0} Soal
                                        </span>

                                    </div>

                                    <div className="material-file-actions">

                                        <Link
                                            to={`/dosen/materi/${id}/latihan/${exercise.id}`}
                                            className="material-action-button"
                                        >
                                            Buka Latihan
                                        </Link>

                                        <button
                                            type="button"
                                            className="material-delete-button"
                                            onClick={() =>
                                                setExerciseToDelete(exercise)
                                            }
                                            disabled={
                                                deletingExerciseId !== null
                                            }
                                        >
                                            Hapus Latihan
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </div>


            {/* MODAL KONFIRMASI HAPUS VIDEO */}

            {videoToDelete && (

                <div className="confirm-modal-overlay">

                    <div className="confirm-modal">

                        <div className="confirm-modal-content">

                            <span className="confirm-modal-label">
                                KONFIRMASI
                            </span>

                            <h2>
                                Hapus Video
                            </h2>

                            <p>
                                Apakah Anda yakin ingin
                                menghapus video
                                "{videoToDelete.title}"?
                            </p>

                            <p className="confirm-modal-warning">
                                Video yang dihapus tidak dapat
                                dikembalikan.
                            </p>

                        </div>

                        <div className="confirm-modal-actions">

                            <button
                                type="button"
                                className="confirm-modal-cancel"
                                onClick={() =>
                                    setVideoToDelete(null)
                                }
                                disabled={
                                    deletingVideoId !== null
                                }
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="confirm-modal-delete"
                                onClick={() =>
                                    handleDeleteVideo(
                                        videoToDelete
                                    )
                                }
                                disabled={
                                    deletingVideoId !== null
                                }
                            >
                                {deletingVideoId !== null
                                    ? 'Menghapus...'
                                    : 'Hapus Video'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {fileToDelete && (

                <div className="confirm-modal-overlay">

                    <div className="confirm-modal">

                        <div className="confirm-modal-content">

                            <span className="confirm-modal-label">
                                KONFIRMASI
                            </span>

                            <h2>
                                Hapus Dokumen
                            </h2>

                            <p>
                                Apakah Anda yakin ingin
                                menghapus dokumen
                                "{fileToDelete.original_name}"?
                            </p>

                            <p className="confirm-modal-warning">
                                Dokumen yang dihapus tidak dapat
                                dikembalikan.
                            </p>

                        </div>

                        <div className="confirm-modal-actions">

                            <button
                                type="button"
                                className="confirm-modal-cancel"
                                onClick={() =>
                                    setFileToDelete(null)
                                }
                                disabled={
                                    deletingFileId !== null
                                }
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="confirm-modal-delete"
                                onClick={() =>
                                    handleDeleteFile(
                                        fileToDelete
                                    )
                                }
                                disabled={
                                    deletingFileId !== null
                                }
                            >
                                {deletingFileId !== null
                                    ? 'Menghapus...'
                                    : 'Hapus Dokumen'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {exerciseToDelete && (

                <div className="confirm-modal-overlay">

                    <div className="confirm-modal">

                        <div className="confirm-modal-content">

                            <span className="confirm-modal-label">
                                KONFIRMASI
                            </span>

                            <h2>
                                Hapus Latihan
                            </h2>

                            <p>
                                Apakah Anda yakin ingin menghapus latihan
                                "{exerciseToDelete.title}"?
                            </p>

                            <p className="confirm-modal-warning">
                                Latihan, soal, dan dokumen terkait akan dihapus
                                dan tidak dapat dikembalikan.
                            </p>

                        </div>

                        <div className="confirm-modal-actions">

                            <button
                                type="button"
                                className="confirm-modal-cancel"
                                onClick={() => setExerciseToDelete(null)}
                                disabled={deletingExerciseId !== null}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="confirm-modal-delete"
                                onClick={() =>
                                    handleDeleteExercise(exerciseToDelete)
                                }
                                disabled={deletingExerciseId !== null}
                            >
                                {deletingExerciseId !== null
                                    ? 'Menghapus...'
                                    : 'Hapus Latihan'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {showAddFile && (
                <div className="confirm-modal-overlay">

                    <div className="confirm-modal">

                        <div className="confirm-modal-content">

                            <span className="confirm-modal-label">
                                DOKUMEN MATERI
                            </span>

                            <h2>
                                Tambah Dokumen
                            </h2>

                            <p>
                                Pilih dokumen PDF atau DOCX
                                untuk ditambahkan ke materi ini.
                            </p>

                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={(event) => {
                                    setSelectedFile(
                                        event.target.files[0] || null
                                    );

                                    setError('');
                                }}
                            />

                            {selectedFile && (
                                <p>
                                    File terpilih: {selectedFile.name}
                                </p>
                            )}

                        </div>

                        <div className="confirm-modal-actions">

                            <button
                                type="button"
                                className="confirm-modal-cancel"
                                onClick={() => {
                                    setShowAddFile(false);
                                    setSelectedFile(null);
                                }}
                                disabled={addingFile}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="confirm-modal-submit"
                                onClick={handleAddFile}
                                disabled={
                                    addingFile ||
                                    !selectedFile
                                }
                            >
                                {addingFile
                                    ? 'Mengupload...'
                                    : 'Tambah Dokumen'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {showAddExercise && (
                <div className="confirm-modal-overlay">

                    <div className="confirm-modal exercise-modal">

                        <div className="confirm-modal-content">

                            <span className="confirm-modal-label">
                                LATIHAN PEMBELAJARAN
                            </span>

                            <h2>
                                Tambah Latihan
                            </h2>

                            <p>
                                Buat latihan baru dengan mengunggah
                                dokumen soal. Sistem akan membaca
                                isi dokumen untuk diproses menjadi soal.
                            </p>

                            <div className="exercise-form">

                                <div className="exercise-form-field">

                                    <label htmlFor="exercise-title">
                                        Judul Latihan
                                    </label>

                                    <input
                                        id="exercise-title"
                                        type="text"
                                        value={exerciseForm.title}
                                        onChange={(event) => {
                                            setExerciseForm((previous) => ({
                                                ...previous,
                                                title: event.target.value
                                            }));

                                            setError('');
                                        }}
                                        placeholder="Contoh: Latihan Bab 1"
                                    />

                                </div>

                                <div className="exercise-form-field">

                                    <label htmlFor="exercise-description">
                                        Deskripsi
                                    </label>

                                    <textarea
                                        id="exercise-description"
                                        value={exerciseForm.description}
                                        onChange={(event) => {
                                            setExerciseForm((previous) => ({
                                                ...previous,
                                                description: event.target.value
                                            }));

                                            setError('');
                                        }}
                                        placeholder="Tuliskan petunjuk atau deskripsi latihan..."
                                        rows="4"
                                    />

                                </div>

                                <div className="exercise-form-field">

                                    <label htmlFor="exercise-file">
                                        Dokumen Soal
                                    </label>

                                    <div className="exercise-file-upload">

                                        <input
                                            id="exercise-file"
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={(event) => {
                                                const file =
                                                    event.target.files[0] || null;

                                                setExerciseForm((previous) => ({
                                                    ...previous,
                                                    file
                                                }));

                                                setError('');
                                            }}
                                        />

                                        <div className="exercise-file-info">

                                            <strong>
                                                {exerciseForm.file
                                                    ? exerciseForm.file.name
                                                    : 'Pilih dokumen soal'}
                                            </strong>

                                            <span>
                                                Format yang didukung: PDF atau DOCX
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {error && (
                                <div className="exercise-form-error">
                                    {error}
                                </div>
                            )}

                        </div>

                        <div className="confirm-modal-actions">

                            <button
                                type="button"
                                className="confirm-modal-cancel"
                                onClick={() => {
                                    setShowAddExercise(false);

                                    setExerciseForm({
                                        title: '',
                                        description: '',
                                        file: null
                                    });

                                    setError('');
                                }}
                                disabled={addingExercise}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="confirm-modal-submit"
                                onClick={handleAddExercise}
                                disabled={
                                    addingExercise ||
                                    !exerciseForm.title.trim() ||
                                    !exerciseForm.file
                                }
                            >
                                {addingExercise
                                    ? 'Memproses...'
                                    : 'Buat & Ekstraksi Soal'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {showAddVideo && (
                <div className="confirm-modal-overlay">

                    <div className="confirm-modal add-video-modal">

                        <AddVideo
                            materialId={id}
                            onClose={() => {
                                setShowAddVideo(false);
                            }}
                            onSuccess={(newVideo) => {
                                setVideos((previousVideos) => [
                                    newVideo,
                                    ...previousVideos
                                ]);

                                setShowAddVideo(false);
                            }}
                        />

                    </div>

                </div>

            )}

        </div>
    );
}
