const { pool } = require('../config/database');

async function getMaterialsWithExercises(req, res) {
    try {
        if (!req.user || req.user.role !== 'lecturer') {
            return res.status(403).json({ success: false, message: 'Hanya dosen yang dapat mengakses halaman penilaian' });
        }

        const [materials] = await pool.execute(
            `
            SELECT 
                m.id AS material_id, 
                m.title AS material_title, 
                m.chapter_order,
                e.id AS exercise_id,
                e.title AS exercise_title,
                e.question_count,
                (SELECT COUNT(*) FROM exercise_attempts ea WHERE ea.exercise_id = e.id) AS attempt_count
            FROM materials m
            LEFT JOIN exercises e ON e.material_id = m.id
            WHERE m.created_by = ?
            ORDER BY m.chapter_order ASC, e.created_at ASC
            `,
            [req.user.id]
        );

        // Group by material
        const result = [];
        const materialMap = new Map();

        for (const row of materials) {
            let material = materialMap.get(row.material_id);
            if (!material) {
                material = {
                    id: row.material_id,
                    title: row.material_title,
                    chapter_order: row.chapter_order,
                    exercises: []
                };
                materialMap.set(row.material_id, material);
                result.push(material);
            }

            if (row.exercise_id) {
                material.exercises.push({
                    id: row.exercise_id,
                    title: row.exercise_title,
                    question_count: row.question_count,
                    attempt_count: row.attempt_count
                });
            }
        }

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error('Get materials with exercises error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

async function getExerciseGrading(req, res) {
    try {
        if (!req.user || req.user.role !== 'lecturer') {
            return res.status(403).json({ success: false, message: 'Hanya dosen yang dapat mengakses halaman penilaian' });
        }

        const { exerciseId } = req.params;

        // Verify exercise belongs to the lecturer
        const [exercises] = await pool.execute(
            `
            SELECT e.id, e.title, m.title AS material_title 
            FROM exercises e
            INNER JOIN materials m ON m.id = e.material_id
            WHERE e.id = ? AND m.created_by = ?
            LIMIT 1
            `,
            [exerciseId, req.user.id]
        );

        if (exercises.length === 0) {
            return res.status(404).json({ success: false, message: 'Latihan tidak ditemukan' });
        }

        const exercise = exercises[0];

        // Get all students and their attempts (latest attempt per student)
        const [students] = await pool.execute(
            `
            SELECT
                u.id AS student_id,
                u.name AS student_name,
                u.nim AS student_nim,
                u.email AS student_email,
                ea.id AS attempt_id,
                ea.score,
                ea.correct_answers,
                ea.wrong_answers,
                ea.completed_at
            FROM users u
            LEFT JOIN (
                SELECT ea1.*
                FROM exercise_attempts ea1
                INNER JOIN (
                    SELECT student_id, MAX(completed_at) AS max_completed_at
                    FROM exercise_attempts
                    WHERE exercise_id = ?
                    GROUP BY student_id
                ) ea2 ON ea1.student_id = ea2.student_id AND ea1.completed_at = ea2.max_completed_at
                WHERE ea1.exercise_id = ?
            ) ea ON ea.student_id = u.id
            WHERE u.role = 'student'
            ORDER BY 
                CASE WHEN ea.completed_at IS NOT NULL THEN 0 ELSE 1 END ASC,
                ea.completed_at DESC, 
                u.name ASC
            `,
            [exerciseId, exerciseId]
        );

        return res.json({ 
            success: true, 
            data: {
                exercise,
                students
            } 
        });

    } catch (error) {
        console.error('Get exercise grading error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

module.exports = {
    getMaterialsWithExercises,
    getExerciseGrading
};
