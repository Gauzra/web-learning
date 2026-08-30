import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './ExerciseDetail.css';

export default function ExerciseDetail() {
    const { id, exerciseId } = useParams();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isReparsing, setIsReparsing] = useState(false);
    const [savingQuestionId, setSavingQuestionId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingExercise, setIsSavingExercise] = useState(false);
    const [isUpdatingPublication, setIsUpdatingPublication] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '' });

    useEffect(() => {
        const fetchExercise = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login', { replace: true });
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/exercises/${exerciseId}`,
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
                        'Gagal mengambil data latihan.'
                    );
                }

                setExercise(data.data);
                setEditForm({
                    title: data.data.title || '',
                    description: data.data.description || ''
                });

            } catch (error) {
                console.error('Get exercise detail error:', error);
                setError(error.message || 'Terjadi kesalahan saat mengambil latihan.');
            } finally {
                setLoading(false);
            }
        };

        fetchExercise();
    }, [exerciseId, navigate]);

    const handleReparse = async () => {
        const token = localStorage.getItem('token');

        setIsReparsing(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/exercises/${exerciseId}/reparse`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memproses ulang soal.');
            }

            const refreshedResponse = await fetch(
                `http://localhost:5000/api/exercises/${exerciseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const refreshedData = await refreshedResponse.json();

            if (!refreshedResponse.ok) {
                throw new Error(refreshedData.message || 'Gagal memuat ulang soal.');
            }

            setExercise(refreshedData.data);
        } catch (requestError) {
            setError(requestError.message || 'Gagal memproses ulang soal.');
        } finally {
            setIsReparsing(false);
        }
    };

    const handleSetCorrectAnswer = async (questionId, optionKey) => {
        const token = localStorage.getItem('token');

        setSavingQuestionId(questionId);
        setActionError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/exercises/${exerciseId}/questions/${questionId}/correct-answer`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ correct_option: optionKey })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Gagal menyimpan jawaban benar.'
                );
            }

            setExercise((previousExercise) => ({
                ...previousExercise,
                questions: previousExercise.questions.map((question) =>
                    question.id === questionId
                        ? { ...question, correct_option: optionKey }
                        : question
                )
            }));
        } catch (requestError) {
            setActionError(
                requestError.message ||
                'Gagal menyimpan jawaban benar.'
            );
        } finally {
            setSavingQuestionId(null);
        }
    };

    const handleSaveExercise = async () => {
        const token = localStorage.getItem('token');
        const title = editForm.title.trim();

        if (!title) {
            setActionError('Judul latihan wajib diisi.');
            return;
        }

        setIsSavingExercise(true);
        setActionError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/exercises/${exerciseId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        description: editForm.description.trim()
                    })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memperbarui latihan.');
            }

            setExercise((previousExercise) => ({
                ...previousExercise,
                title,
                description: editForm.description.trim() || null
            }));
            setIsEditing(false);
        } catch (requestError) {
            setActionError(requestError.message || 'Gagal memperbarui latihan.');
        } finally {
            setIsSavingExercise(false);
        }
    };

    const handlePublication = async () => {
        const token = localStorage.getItem('token');
        const publish = !exercise.is_published;

        setIsUpdatingPublication(true);
        setActionError('');

        try {
            const response = await fetch(
                `http://localhost:5000/api/exercises/${exerciseId}/publication`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ is_published: publish })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memperbarui status latihan.');
            }

            setExercise((previousExercise) => ({
                ...previousExercise,
                is_published: data.data.is_published
            }));
        } catch (requestError) {
            setActionError(
                requestError.message ||
                'Gagal memperbarui status latihan.'
            );
        } finally {
            setIsUpdatingPublication(false);
        }
    };

    const answeredQuestionCount = exercise?.questions?.filter(
        (question) => question.correct_option
    ).length || 0;

    if (loading) {
        return (
            <div className="material-detail-page">
                <div className="material-detail-state">
                    Memuat latihan...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="material-detail-page">

                <div className="material-detail-error">
                    {error}
                </div>

                <Link
                    to={`/dosen/materi/${id}`}
                    className="material-detail-back"
                >
                    Kembali ke Materi
                </Link>

            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="material-detail-page">

                <div className="material-detail-state">
                    Latihan tidak ditemukan.
                </div>

                <Link
                    to={`/dosen/materi/${id}`}
                    className="material-detail-back"
                >
                    Kembali ke Materi
                </Link>

            </div>
        );
    }

    return (
        <div className="material-detail-page">

            <div className="material-detail-header">

                <div>

                    <h1>
                        {exercise.title}
                    </h1>

                    <p>
                        Latihan Pembelajaran
                    </p>

                </div>

                <Link
                    to={`/dosen/materi/${id}`}
                    className="material-detail-back"
                >
                    Kembali
                </Link>

            </div>

            <div className="material-detail-content">

                <section className="material-info-card">

                    <div className="material-info-header">

                        <div>

                            <span>
                                LATIHAN PEMBELAJARAN
                            </span>

                            <h2>
                                {exercise.title}
                            </h2>

                        </div>

                        <span className="material-chapter">
                            {exercise.question_count || 0} Soal
                        </span>

                    </div>

                    <div className="exercise-management-actions">
                        <span className={
                            `exercise-publication-status ${
                                exercise.is_published ? 'published' : 'draft'
                            }`
                        }>
                            {exercise.is_published ? 'Diterbitkan' : 'Draft'}
                        </span>

                        <button
                            type="button"
                            className="exercise-secondary-button"
                            onClick={() => {
                                setEditForm({
                                    title: exercise.title || '',
                                    description: exercise.description || ''
                                });
                                setIsEditing((previous) => !previous);
                                setActionError('');
                            }}
                        >
                            {isEditing ? 'Batal Edit' : 'Edit Latihan'}
                        </button>

                        <button
                            type="button"
                            className="exercise-publication-button"
                            onClick={handlePublication}
                            disabled={isUpdatingPublication}
                        >
                            {isUpdatingPublication
                                ? 'Menyimpan...'
                                : exercise.is_published
                                    ? 'Jadikan Draft'
                                    : 'Terbitkan Latihan'}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="exercise-edit-form">
                            <label htmlFor="exercise-edit-title">Judul latihan</label>
                            <input
                                id="exercise-edit-title"
                                value={editForm.title}
                                onChange={(event) => setEditForm((previous) => ({
                                    ...previous,
                                    title: event.target.value
                                }))}
                            />
                            <label htmlFor="exercise-edit-description">Deskripsi</label>
                            <textarea
                                id="exercise-edit-description"
                                value={editForm.description}
                                onChange={(event) => setEditForm((previous) => ({
                                    ...previous,
                                    description: event.target.value
                                }))}
                                rows="4"
                            />
                            <button
                                type="button"
                                className="exercise-publication-button"
                                onClick={handleSaveExercise}
                                disabled={isSavingExercise}
                            >
                                {isSavingExercise ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    ) : (
                        <p className="material-description">
                            {exercise.description ||
                                'Belum ada deskripsi latihan.'}
                        </p>
                    )}

                </section>

                <section className="material-section">

                    <div className="material-section-header">

                        <div>

                            <span>
                                DOKUMEN SOAL
                            </span>

                            <h2>
                                Hasil Ekstraksi
                            </h2>

                        </div>

                    </div>

                    {exercise.document ? (

                        <div className="exercise-extraction">

                            <div className="material-file-card">

                                <div className="material-file-info">

                                    <strong>
                                        {exercise.document.original_name}
                                    </strong>

                                    <span>
                                        {exercise.document.file_type.toUpperCase()}
                                        {' · '}
                                        {(exercise.document.file_size / 1024).toFixed(2)}
                                        {' KB'}
                                    </span>

                                </div>

                            </div>

                            <div
                                className="exercise-extracted-text"
                                style={{
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {exercise.document.extracted_text}
                            </div>

                        </div>

                    ) : (

                        <div className="material-empty">
                            Dokumen soal belum tersedia.
                        </div>

                    )}

                </section>

                <section className="material-section">

                    <div className="material-section-header">

                        <div>

                            <span>
                                SOAL
                            </span>

                            <h2>
                                Daftar Soal
                            </h2>

                        </div>

                    </div>

                    {actionError && (
                        <div className="exercise-action-error">
                            {actionError}
                        </div>
                    )}

                    <p className="exercise-answer-progress">
                        Kunci jawaban diatur: {answeredQuestionCount}/
                        {exercise.questions?.length || 0} soal
                    </p>

                    {exercise.questions?.length > 0 ? (
                        <div className="exercise-question-list">
                            {exercise.questions.map((question) => (
                                <article
                                    key={question.id}
                                    className="exercise-question-card"
                                >
                                    <span className="exercise-question-number">
                                        Soal {question.question_number}
                                    </span>

                                    <p className="exercise-question-text">
                                        {question.question_text}
                                    </p>

                                    <div className="exercise-question-options">
                                        {question.options.map((option) => (
                                            <button
                                                type="button"
                                                key={option.id}
                                                className={`exercise-question-option ${
                                                    question.correct_option ===
                                                    option.option_key
                                                        ? 'correct'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleSetCorrectAnswer(
                                                        question.id,
                                                        option.option_key
                                                    )
                                                }
                                                disabled={
                                                    savingQuestionId === question.id
                                                }
                                                aria-pressed={
                                                    question.correct_option ===
                                                    option.option_key
                                                }
                                            >
                                                <strong>{option.option_key}.</strong>{' '}
                                                {option.option_text}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="exercise-correct-answer-status">
                                        {question.correct_option
                                            ? `Jawaban benar: ${question.correct_option}`
                                            : 'Klik salah satu pilihan untuk menetapkan jawaban benar.'}
                                    </p>

                                    {question.explanation && (
                                        <p className="exercise-question-explanation">
                                            <strong>Penjelasan:</strong>{' '}
                                            {question.explanation}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="material-empty">
                            Soal belum berhasil dikenali dari dokumen. Gunakan format
                            <strong> 1. Pertanyaan</strong> dengan opsi
                            <strong> A. sampai D.</strong>
                            <br />
                            <button
                                type="button"
                                className="exercise-reparse-button"
                                onClick={handleReparse}
                                disabled={isReparsing}
                            >
                                {isReparsing ? 'Memproses ulang...' : 'Proses ulang soal'}
                            </button>
                        </div>
                    )}

                </section>

            </div>

        </div>
    );
}
