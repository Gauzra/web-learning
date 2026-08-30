import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './StudentExercise.css';

const api = 'http://localhost:5000';

export default function StudentExercise() {
    const { exerciseId } = useParams();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Phase: 'quiz' | 'result'
    const [phase, setPhase] = useState('quiz');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionKey }

    // Hasil tersimpan dari attempt sebelumnya (jika latihan sudah dikerjakan)
    const [serverResult, setServerResult] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login', { replace: true }); return; }

        fetch(`${api}/api/exercises/${exerciseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (!data.success) throw new Error(data.message);
                setExercise(data.data);
                setQuestions(data.data.questions || []);
                if (data.data.my_attempt) {
                    setServerResult(data.data.my_attempt);
                    setPhase('result');
                }
            })
            .catch(e => setError(e.message || 'Gagal memuat latihan.'))
            .finally(() => setLoading(false));
    }, [exerciseId, navigate]);

    const handleAnswer = (questionId, optionKey) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        try {
            const r = await fetch(`${api}/api/exercises/${exerciseId}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers })
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            // Optionally store the attempt result from backend if needed
            setPhase('result');
        } catch (e) {
            setError(e.message || 'Gagal mengumpulkan jawaban');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="lex-state">Memuat latihan...</div>;
    if (error) return <div className="lex-state lex-error">{error}</div>;
    if (!exercise) return null;

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;

    /* ── RESULT PHASE ── */
    if (phase === 'result') {
        const serverAnswers = serverResult?.answers || {};
        let correct = 0;
        for (const q of questions) {
            const userAnswer = serverResult ? serverAnswers[q.id] : answers[q.id];
            if (userAnswer && q.correct_option && userAnswer === q.correct_option) {
                correct++;
            }
        }
        const wrong = totalQuestions - correct;
        const score = serverResult
            ? Math.round(serverResult.score)
            : totalQuestions > 0
                ? Math.round((correct / totalQuestions) * 100)
                : 0;

        const scoreColor = score >= 80 ? '#12b76a' : score >= 60 ? '#f79009' : '#f04438';

        return (
            <div className="lex-page">
                <div className="lex-result-card">
                    <div className="lex-result-badge" style={{ background: scoreColor }}>
                        {score}
                    </div>
                    <h1>Latihan Selesai!</h1>
                    <p className="lex-result-title">{exercise.title}</p>
                    {serverResult && (
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#667085' }}>
                            Anda sudah menyelesaikan latihan ini dan tidak dapat mengerjakannya kembali.
                        </p>
                    )}
                    <div className="lex-result-stats">
                        <div className="lex-stat">
                            <span className="lex-stat-value">{correct}</span>
                            <span className="lex-stat-label">Benar</span>
                        </div>
                        <div className="lex-stat">
                            <span className="lex-stat-value" style={{ color: '#f04438' }}>{wrong}</span>
                            <span className="lex-stat-label">Salah</span>
                        </div>
                        <div className="lex-stat">
                            <span className="lex-stat-value">{totalQuestions}</span>
                            <span className="lex-stat-label">Total Soal</span>
                        </div>
                    </div>

                    {/* Review per soal */}
                    <div className="lex-review">
                        <h2>Pembahasan Jawaban</h2>
                        {questions.map((q, idx) => {
                            const userAnswer = serverResult ? serverAnswers[q.id] : answers[q.id];
                            const isCorrect = userAnswer && userAnswer === q.correct_option;
                            return (
                                <div key={q.id} className={`lex-review-item ${isCorrect ? 'lex-correct' : 'lex-wrong'}`}>
                                    <p className="lex-review-q">
                                        <span className="lex-q-num">{idx + 1}</span>
                                        {q.question_text}
                                    </p>
                                    <div className="lex-review-opts">
                                        {q.options.map(opt => {
                                            let cls = 'lex-opt-review';
                                            if (opt.option_key === q.correct_option) cls += ' lex-opt-correct';
                                            if (opt.option_key === userAnswer && !isCorrect) cls += ' lex-opt-wrong';
                                            return (
                                                <div key={opt.id} className={cls}>
                                                    <span className="lex-opt-key">{opt.option_key}</span>
                                                    <span>{opt.option_text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {!userAnswer && (
                                        <p className="lex-not-answered">Tidak dijawab — jawaban benar: {q.correct_option || '—'}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <Link to={`/materi/${exercise.material_id}`} className="lex-btn-primary">
                        ← Kembali ke Materi
                    </Link>
                </div>
            </div>
        );
    }

    /* ── QUIZ PHASE ── */
    const currentQuestion = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const progress = totalQuestions > 0
        ? ((currentIndex + 1) / totalQuestions) * 100
        : 0;

    return (
        <div className="lex-page">
            {/* Header */}
            <div className="lex-header">
                <Link to={`/materi/${exercise.material_id}`} className="lex-back">← Kembali</Link>
                <div className="lex-header-info">
                    <h1 className="lex-title">{exercise.title}</h1>
                    <span className="lex-progress-text">
                        Soal {currentIndex + 1} dari {totalQuestions} · {answeredCount} dijawab
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="lex-progress-bar">
                <div className="lex-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Question card */}
            {currentQuestion && (
                <div className="lex-question-card">
                    <div className="lex-question-number">Soal {currentIndex + 1}</div>
                    <p className="lex-question-text">{currentQuestion.question_text}</p>

                    <div className="lex-options">
                        {currentQuestion.options.map(opt => {
                            const selected = answers[currentQuestion.id] === opt.option_key;
                            return (
                                <button
                                    key={opt.id}
                                    className={`lex-option${selected ? ' lex-option-selected' : ''}`}
                                    onClick={() => handleAnswer(currentQuestion.id, opt.option_key)}
                                >
                                    <span className="lex-opt-badge">{opt.option_key}</span>
                                    <span className="lex-opt-text">{opt.option_text}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="lex-nav">
                        <button
                            className="lex-btn-secondary"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                        >
                            ← Sebelumnya
                        </button>

                        {isLast ? (
                            <button
                                className="lex-btn-submit"
                                onClick={handleSubmit}
                            >
                                Submit Latihan ✓
                            </button>
                        ) : (
                            <button
                                className="lex-btn-primary"
                                onClick={handleNext}
                            >
                                Selanjutnya →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Question navigator dots */}
            <div className="lex-dot-nav">
                {questions.map((q, idx) => (
                    <button
                        key={q.id}
                        className={`lex-dot${idx === currentIndex ? ' lex-dot-active' : ''}${answers[q.id] ? ' lex-dot-answered' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                        title={`Soal ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
