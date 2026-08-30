const path = require('path');
const fs = require('fs');

const { pool } = require('../config/database');

const {
    extractDocumentText
} = require('../services/documentExtractor');

const {
    parseQuestions
} = require('../services/questionParser');

async function replaceExerciseQuestions(connection, exerciseId, parsedQuestions) {
    await connection.execute(
        'DELETE FROM questions WHERE exercise_id = ?',
        [exerciseId]
    );

    for (const question of parsedQuestions) {
        const [questionResult] = await connection.execute(
            `
            INSERT INTO questions
            (
                exercise_id,
                question_number,
                question_text,
                explanation,
                correct_option
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                exerciseId,
                question.question_number,
                question.question_text,
                null,
                null
            ]
        );

        for (const option of question.options) {
            await connection.execute(
                `
                INSERT INTO question_options
                (
                    question_id,
                    option_key,
                    option_text
                )
                VALUES (?, ?, ?)
                `,
                [
                    questionResult.insertId,
                    option.option_key,
                    option.option_text
                ]
            );
        }
    }

    await connection.execute(
        'UPDATE exercises SET question_count = ? WHERE id = ?',
        [parsedQuestions.length, exerciseId]
    );
}

async function createExercise(req, res) {
    try {
        const {
            material_id,
            title,
            description
        } = req.body;

        const materialId = Number(material_id);

        if (!req.user) {
            if (req.file) { try { fs.unlinkSync(req.file.path); } catch { } }
            return res.status(401).json({ success: false, message: 'Anda belum terautentikasi' });
        }

        if (req.user.role !== 'lecturer') {
            if (req.file) { try { fs.unlinkSync(req.file.path); } catch { } }
            return res.status(403).json({ success: false, message: 'Hanya dosen yang dapat membuat latihan' });
        }

        if (!materialId || materialId < 1) {
            if (req.file) { try { fs.unlinkSync(req.file.path); } catch { } }
            return res.status(400).json({ success: false, message: 'Material ID wajib diberikan' });
        }

        if (!title || !title.trim()) {
            if (req.file) { try { fs.unlinkSync(req.file.path); } catch { } }
            return res.status(400).json({ success: false, message: 'Judul latihan wajib diisi' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Dokumen soal wajib diupload' });
        }

        const extension = path.extname(req.file.originalname).toLowerCase();
        let fileType;

        if (extension === '.pdf') {
            fileType = 'pdf';
        } else if (extension === '.docx') {
            fileType = 'docx';
        } else {
            try { fs.unlinkSync(req.file.path); } catch { }
            return res.status(400).json({ success: false, message: 'File harus berformat PDF atau DOCX' });
        }

        const [materials] = await pool.execute(
            `SELECT id, created_by, is_published FROM materials WHERE id = ? AND created_by = ? LIMIT 1`,
            [materialId, req.user.id]
        );

        if (materials.length === 0) {
            try { fs.unlinkSync(req.file.path); } catch { }
            return res.status(404).json({ success: false, message: 'Materi tidak ditemukan' });
        }

        let extractedText = '';
        try {
            extractedText = await extractDocumentText(req.file.path, fileType);
        } catch (extractError) {
            console.error('Exercise document extraction error:', extractError);
            try { fs.unlinkSync(req.file.path); } catch { }
            return res.status(400).json({ success: false, message: 'Gagal membaca isi dokumen soal' });
        }

        if (!extractedText || !extractedText.trim()) {
            try { fs.unlinkSync(req.file.path); } catch { }
            return res.status(400).json({ success: false, message: 'Dokumen soal tidak memiliki teks yang dapat dibaca' });
        }

        let parsedQuestions = [];
        try {
            parsedQuestions = parseQuestions(extractedText);
            console.log('Parsed questions:', parsedQuestions.length);
        } catch (parserError) {
            console.error('Question parser error:', parserError);
            try { fs.unlinkSync(req.file.path); } catch { }
            return res.status(400).json({ success: false, message: 'Format soal dalam dokumen tidak dapat dikenali' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [exerciseResult] = await connection.execute(
                `INSERT INTO exercises (material_id, title, description, question_count, is_published) VALUES (?, ?, ?, ?, ?)`,
                [materialId, title.trim(), description?.trim() || null, parsedQuestions.length, 0]
            );

            const exerciseId = exerciseResult.insertId;
            const filePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');

            await connection.execute(
                `INSERT INTO exercise_documents (exercise_id, original_name, file_type, file_path, file_size, extracted_text) VALUES (?, ?, ?, ?, ?, ?)`,
                [exerciseId, req.file.originalname, fileType, filePath, req.file.size, extractedText.trim()]
            );

            await replaceExerciseQuestions(connection, exerciseId, parsedQuestions);
            await connection.commit();

            return res.status(201).json({
                success: true,
                message: 'Latihan berhasil dibuat dan dokumen berhasil diekstraksi',
                data: {
                    id: exerciseId,
                    material_id: materialId,
                    title: title.trim(),
                    description: description?.trim() || null,
                    question_count: parsedQuestions.length,
                    is_published: 0,
                    file: {
                        original_name: req.file.originalname,
                        file_type: fileType,
                        file_path: filePath,
                        file_size: req.file.size,
                        extracted_text_length: extractedText.length
                    }
                }
            });

        } catch (databaseError) {
            await connection.rollback();
            throw databaseError;
        } finally {
            connection.release();
        }

    } catch (error) {
        if (req.file) { try { fs.unlinkSync(req.file.path); } catch { } }
        console.error('Create exercise error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

async function reparseExercise(req, res) {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;

        const [documents] = await connection.execute(
            `
            SELECT ed.extracted_text, ed.file_type, ed.file_path
            FROM exercise_documents ed
            INNER JOIN exercises e ON e.id = ed.exercise_id
            INNER JOIN materials m ON m.id = e.material_id
            WHERE ed.exercise_id = ? AND m.created_by = ?
            ORDER BY ed.id DESC
            LIMIT 1
            `,
            [id, req.user.id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ success: false, message: 'Dokumen latihan tidak ditemukan' });
        }

        const document = documents[0];
        let extractedText = document.extracted_text;
        const absolutePath = path.resolve(document.file_path);

        if (fs.existsSync(absolutePath)) {
            extractedText = await extractDocumentText(absolutePath, document.file_type);
            await connection.execute(
                `UPDATE exercise_documents SET extracted_text = ? WHERE exercise_id = ?`,
                [extractedText, id]
            );
        }

        const parsedQuestions = parseQuestions(extractedText);

        if (parsedQuestions.length === 0) {
            return res.status(400).json({ success: false, message: 'Tidak ada soal pilihan ganda yang dapat dikenali dari dokumen' });
        }

        await connection.beginTransaction();
        await replaceExerciseQuestions(connection, id, parsedQuestions);
        await connection.commit();

        return res.json({
            success: true,
            message: 'Soal berhasil diproses ulang',
            data: { question_count: parsedQuestions.length }
        });
    } catch (error) {
        try { await connection.rollback(); } catch { }
        console.error('Reparse exercise error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses ulang soal' });
    } finally {
        connection.release();
    }
}

async function getExercisesByMaterial(req, res) {
    try {
        const { materialId } = req.params;

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Anda belum terautentikasi' });
        }

        const [materials] = await pool.execute(
            `SELECT id, created_by, is_published FROM materials WHERE id = ? LIMIT 1`,
            [materialId]
        );

        if (materials.length === 0) {
            return res.status(404).json({ success: false, message: 'Materi tidak ditemukan' });
        }

        if (req.user.role === 'lecturer' && materials[0].created_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke materi ini' });
        }

        if (req.user.role === 'student' && !materials[0].is_published) {
            return res.status(404).json({ success: false, message: 'Materi tidak ditemukan' });
        }

        const exerciseVisibilityClause = req.user.role === 'student' ? 'AND is_published = 1' : '';

        const attemptJoinClause = req.user.role === 'student'
            ? `LEFT JOIN exercise_attempts ea ON ea.id = (
                SELECT ea2.id FROM exercise_attempts ea2
                WHERE ea2.exercise_id = e.id AND ea2.student_id = ${Number(req.user.id)}
                ORDER BY ea2.id DESC LIMIT 1
            )`
            : '';

        const attemptSelectClause = req.user.role === 'student'
            ? ', ea.id AS my_attempt_id, ea.score AS my_score, ea.completed_at AS my_completed_at'
            : '';

        const [exercises] = await pool.execute(
            `
            SELECT e.id, e.material_id, e.title, e.description, e.question_count,
                   e.is_published, e.created_at, e.updated_at${attemptSelectClause}
            FROM exercises e
            ${attemptJoinClause}
            WHERE e.material_id = ? ${exerciseVisibilityClause}
            ORDER BY e.created_at DESC
            `,
            [materialId]
        );

        const data = exercises.map((row) => {
            if (req.user.role !== 'student') {
                return row;
            }

            const { my_attempt_id, my_score, my_completed_at, ...exercise } = row;

            return {
                ...exercise,
                my_attempt: my_attempt_id
                    ? {
                        score: Number(my_score),
                        completed_at: my_completed_at
                    }
                    : null
            };
        });

        return res.json({ success: true, data });

    } catch (error) {
        console.error('Get exercises error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

async function getExerciseById(req, res) {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Anda belum terautentikasi' });
        }

        const [exercises] = await pool.execute(
            `
            SELECT e.id, e.material_id, e.title, e.description, e.question_count,
                   e.is_published, e.created_at, e.updated_at, m.created_by
            FROM exercises e
            INNER JOIN materials m ON m.id = e.material_id
            WHERE e.id = ?
            LIMIT 1
            `,
            [id]
        );

        if (exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        const exercise = exercises[0];

        if (req.user.role === 'lecturer' && exercise.created_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke latihan ini' });
        }

        if (req.user.role === 'student' && !exercise.is_published) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        const [documents] = await pool.execute(
            `
            SELECT id, exercise_id, original_name, file_type, file_path, file_size, extracted_text, created_at, updated_at
            FROM exercise_documents
            WHERE exercise_id = ?
            ORDER BY id DESC
            LIMIT 1
            `,
            [id]
        );

        const [questionRows] = await pool.execute(
            `
            SELECT
                q.id AS question_id,
                q.question_number,
                q.question_text,
                q.explanation,
                q.correct_option,
                qo.id AS option_id,
                qo.option_key,
                qo.option_text
            FROM questions q
            LEFT JOIN question_options qo ON qo.question_id = q.id
            WHERE q.exercise_id = ?
            ORDER BY q.question_number ASC, qo.option_key ASC
            `,
            [id]
        );

        const questions = [];
        const questionsById = new Map();

        for (const row of questionRows) {
            let question = questionsById.get(row.question_id);
            if (!question) {
                question = {
                    id: row.question_id,
                    question_number: row.question_number,
                    question_text: row.question_text,
                    explanation: row.explanation,
                    correct_option: row.correct_option,
                    options: []
                };
                questionsById.set(row.question_id, question);
                questions.push(question);
            }
            if (row.option_id) {
                question.options.push({
                    id: row.option_id,
                    option_key: row.option_key,
                    option_text: row.option_text
                });
            }
        }

        let myAttempt = null;

        if (req.user.role === 'student') {
            const [attempts] = await pool.execute(
                `
                SELECT id, total_questions, correct_answers, wrong_answers, score, completed_at
                FROM exercise_attempts
                WHERE exercise_id = ? AND student_id = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [id, req.user.id]
            );

            if (attempts.length > 0) {
                const attempt = attempts[0];

                const [answerRows] = await pool.execute(
                    'SELECT question_id, selected_option FROM exercise_answers WHERE attempt_id = ?',
                    [attempt.id]
                );

                const selectedAnswers = {};
                for (const row of answerRows) {
                    selectedAnswers[row.question_id] = row.selected_option;
                }

                myAttempt = {
                    id: attempt.id,
                    total_questions: attempt.total_questions,
                    correct_answers: attempt.correct_answers,
                    wrong_answers: attempt.wrong_answers,
                    score: Number(attempt.score),
                    completed_at: attempt.completed_at,
                    answers: selectedAnswers
                };
            }
        }

        return res.json({
            success: true,
            data: {
                ...exercise,
                document: documents.length > 0 ? documents[0] : null,
                questions,
                my_attempt: myAttempt
            }
        });

    } catch (error) {
        console.error('Get exercise error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

async function getLecturerExerciseSummary(req, res) {
    try {
        const [rows] = await pool.execute(
            `
            SELECT
                COUNT(*) AS total_exercises,
                SUM(CASE WHEN e.is_published = 1 THEN 1 ELSE 0 END) AS published_exercises,
                SUM(CASE WHEN e.is_published = 0 THEN 1 ELSE 0 END) AS draft_exercises
            FROM exercises e
            INNER JOIN materials m ON m.id = e.material_id
            WHERE m.created_by = ?
            `,
            [req.user.id]
        );

        const summary = rows[0];
        return res.json({
            success: true,
            data: {
                total_exercises: Number(summary.total_exercises || 0),
                published_exercises: Number(summary.published_exercises || 0),
                draft_exercises: Number(summary.draft_exercises || 0)
            }
        });
    } catch (error) {
        console.error('Get lecturer exercise summary error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil ringkasan latihan' });
    }
}

async function updateCorrectAnswer(req, res) {
    try {
        const { id: exerciseId, questionId } = req.params;
        const correctOption = String(req.body?.correct_option || '').trim().toUpperCase();

        if (!['A', 'B', 'C', 'D'].includes(correctOption)) {
            return res.status(400).json({ success: false, message: 'Jawaban benar harus berupa pilihan A, B, C, atau D' });
        }

        const [questions] = await pool.execute(
            `
            SELECT q.id
            FROM questions q
            INNER JOIN exercises e ON e.id = q.exercise_id
            INNER JOIN materials m ON m.id = e.material_id
            INNER JOIN question_options qo ON qo.question_id = q.id AND qo.option_key = ?
            WHERE q.id = ? AND q.exercise_id = ? AND m.created_by = ?
            LIMIT 1
            `,
            [correctOption, questionId, exerciseId, req.user.id]
        );

        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: 'Soal atau pilihan jawaban tidak ditemukan' });
        }

        await pool.execute(
            `UPDATE questions SET correct_option = ? WHERE id = ? AND exercise_id = ?`,
            [correctOption, questionId, exerciseId]
        );

        return res.json({
            success: true,
            message: 'Jawaban benar berhasil disimpan',
            data: { question_id: Number(questionId), correct_option: correctOption }
        });

    } catch (error) {
        console.error('Update correct answer error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan jawaban benar' });
    }
}

async function updateExercisePublication(req, res) {
    try {
        const { id } = req.params;
        const isPublished = req.body?.is_published === true;

        const [exercises] = await pool.execute(
            `SELECT e.id FROM exercises e INNER JOIN materials m ON m.id = e.material_id WHERE e.id = ? AND m.created_by = ? LIMIT 1`,
            [id, req.user.id]
        );

        if (exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        if (isPublished) {
            const [counts] = await pool.execute(
                `
                SELECT
                    COUNT(*) AS total_questions,
                    SUM(CASE WHEN correct_option IN ('A','B','C','D') THEN 1 ELSE 0 END) AS answered_questions
                FROM questions
                WHERE exercise_id = ?
                `,
                [id]
            );

            const totalQuestions = Number(counts[0].total_questions);
            const answeredQuestions = Number(counts[0].answered_questions || 0);

            if (totalQuestions === 0 || totalQuestions !== answeredQuestions) {
                return res.status(400).json({
                    success: false,
                    message: `Jawaban benar belum lengkap (${answeredQuestions}/${totalQuestions} soal).`
                });
            }
        }

        await pool.execute('UPDATE exercises SET is_published = ? WHERE id = ?', [isPublished ? 1 : 0, id]);

        return res.json({
            success: true,
            message: isPublished ? 'Latihan berhasil diterbitkan' : 'Latihan dikembalikan menjadi draft',
            data: { is_published: isPublished }
        });

    } catch (error) {
        console.error('Update exercise publication error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui status latihan' });
    }
}

async function updateExercise(req, res) {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Anda belum terautentikasi' });
        }

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({ success: false, message: 'Hanya dosen yang dapat mengubah latihan' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Judul latihan wajib diisi' });
        }

        const [result] = await pool.execute(
            `
            UPDATE exercises e
            INNER JOIN materials m ON m.id = e.material_id
            SET e.title = ?, e.description = ?
            WHERE e.id = ? AND m.created_by = ?
            `,
            [title.trim(), description?.trim() || null, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        return res.json({ success: true, message: 'Latihan berhasil diperbarui' });

    } catch (error) {
        console.error('Update exercise error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui latihan' });
    }
}

async function deleteExercise(req, res) {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Anda belum terautentikasi' });
        }

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({ success: false, message: 'Hanya dosen yang dapat menghapus latihan' });
        }

        const [exercises] = await pool.execute(
            `
            SELECT e.id, m.created_by
            FROM exercises e
            INNER JOIN materials m ON m.id = e.material_id
            WHERE e.id = ? AND m.created_by = ?
            LIMIT 1
            `,
            [id, req.user.id]
        );

        if (exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        await pool.execute('DELETE FROM exercises WHERE id = ?', [id]);

        return res.json({ success: true, message: 'Latihan berhasil dihapus' });

    } catch (error) {
        console.error('Delete exercise error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus latihan' });
    }
}

async function submitAttempt(req, res) {
    const connection = await pool.getConnection();

    try {
        const { id: exerciseId } = req.params;
        const { answers } = req.body;
        // answers: { [questionId]: selectedOption }

        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Hanya mahasiswa yang dapat mengumpulkan latihan' });
        }

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ success: false, message: 'Jawaban tidak valid' });
        }

        const [exercises] = await connection.execute(
            'SELECT id, question_count FROM exercises WHERE id = ? AND is_published = 1 LIMIT 1',
            [exerciseId]
        );

        if (exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        const [existingAttempts] = await connection.execute(
            'SELECT id FROM exercise_attempts WHERE exercise_id = ? AND student_id = ? LIMIT 1',
            [exerciseId, req.user.id]
        );

        if (existingAttempts.length > 0) {
            return res.status(409).json({ success: false, message: 'Anda sudah menyelesaikan latihan ini dan tidak dapat mengerjakannya kembali' });
        }

        const [questions] = await connection.execute(
            'SELECT id, correct_option FROM questions WHERE exercise_id = ?',
            [exerciseId]
        );

        let correctCount = 0;
        const answerRows = [];

        for (const question of questions) {
            const selected = answers[question.id] || null;
            const isCorrect = selected !== null && selected === question.correct_option;
            if (isCorrect) correctCount++;
            answerRows.push({
                question_id: question.id,
                selected_option: selected,
                is_correct: isCorrect
            });
        }

        const totalQuestions = questions.length;
        const wrongCount = totalQuestions - correctCount;
        const score = totalQuestions > 0
            ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(2))
            : 0;

        await connection.beginTransaction();

        const [attemptResult] = await connection.execute(
            `INSERT INTO exercise_attempts
            (exercise_id, student_id, total_questions, correct_answers, wrong_answers, score, started_at, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [exerciseId, req.user.id, totalQuestions, correctCount, wrongCount, score]
        );

        const attemptId = attemptResult.insertId;

        for (const row of answerRows) {
            await connection.execute(
                `INSERT INTO exercise_answers (attempt_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)`,
                [attemptId, row.question_id, row.selected_option, row.is_correct ? 1 : 0]
            );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Jawaban berhasil dikumpulkan',
            data: {
                attempt_id: attemptId,
                total_questions: totalQuestions,
                correct_answers: correctCount,
                wrong_answers: wrongCount,
                score
            }
        });

    } catch (error) {
        try { await connection.rollback(); } catch { }
        console.error('Submit attempt error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengumpulkan jawaban' });
    } finally {
        connection.release();
    }
}

async function getExerciseAttempts(req, res) {
    try {
        const { id: exerciseId } = req.params;

        if (!req.user || req.user.role !== 'lecturer') {
            return res.status(403).json({ success: false, message: 'Hanya dosen yang dapat melihat hasil latihan' });
        }

        const [exercises] = await pool.execute(
            `SELECT e.id, e.title, e.question_count, m.title AS material_title, m.created_by
             FROM exercises e
             INNER JOIN materials m ON m.id = e.material_id
             WHERE e.id = ? AND m.created_by = ?
             LIMIT 1`,
            [exerciseId, req.user.id]
        );

        if (exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        const exercise = exercises[0];

        const [attempts] = await pool.execute(
            `SELECT
                ea.id AS attempt_id,
                ea.total_questions,
                ea.correct_answers,
                ea.wrong_answers,
                ea.score,
                ea.completed_at,
                u.id AS student_id,
                u.name AS student_name,
                u.email AS student_email
             FROM exercise_attempts ea
             INNER JOIN users u ON u.id = ea.student_id
             WHERE ea.exercise_id = ?
             ORDER BY ea.completed_at DESC`,
            [exerciseId]
        );

        return res.json({
            success: true,
            data: {
                exercise: {
                    id: exercise.id,
                    title: exercise.title,
                    question_count: exercise.question_count,
                    material_title: exercise.material_title
                },
                attempts
            }
        });

    } catch (error) {
        console.error('Get exercise attempts error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data penilaian' });
    }
}


module.exports = {
    createExercise,
    getExercisesByMaterial,
    getLecturerExerciseSummary,
    getExerciseById,
    reparseExercise,
    updateCorrectAnswer,
    updateExercisePublication,
    updateExercise,
    deleteExercise,
    submitAttempt,
    getExerciseAttempts
};
