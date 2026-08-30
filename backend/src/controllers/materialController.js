const path = require('path');
const fs = require('fs');

const { pool } = require('../config/database');

const {
    extractDocumentText
} = require('../services/documentExtractor');

const {
    searchMaterialTheme
} = require('../services/pexelsService');


async function createMaterial(req, res) {
    const connection = await pool.getConnection();

    try {
        const {
            title,
            description,
            chapter_order,
        } = req.body;

        if (!title || !title.trim()) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(400).json({
                success: false,
                message: 'Nama materi wajib diisi'
            });
        }

        if (
            !chapter_order ||
            Number(chapter_order) < 1
        ) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(400).json({
                success: false,
                message: 'Nomor bab wajib diisi dan harus lebih dari 0'
            });
        }

        if (!req.user) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        if (req.user.role !== 'lecturer') {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(403).json({
                success: false,
                message: 'Hanya dosen yang dapat menambahkan materi'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File materi wajib diupload'
            });
        }

        const extension = path
            .extname(req.file.originalname)
            .toLowerCase();

        let fileType;

        if (extension === '.pdf') {
            fileType = 'pdf';
        } else if (extension === '.docx') {
            fileType = 'docx';
        } else {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }

            return res.status(400).json({
                success: false,
                message: 'File harus berformat PDF atau DOCX'
            });
        }

        let extractedText = '';

        try {
            extractedText = await extractDocumentText(
                req.file.path,
                fileType
            );
        } catch (extractError) {
            console.error(
                'Document extraction error:',
                extractError
            );

            try {
                fs.unlinkSync(req.file.path);
            } catch { }

            return res.status(400).json({
                success: false,
                message: 'Gagal membaca isi dokumen'
            });
        }

        if (!extractedText) {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }

            return res.status(400).json({
                success: false,
                message: 'Dokumen tidak memiliki teks yang dapat dibaca'
            });
        }

        const chapterOrder = Number(chapter_order);

        let themeImageUrl = null;

        try {
            const theme = await searchMaterialTheme(
                title.trim()
            );

            if (theme) {
                themeImageUrl = theme.image_url;
            }
        } catch (themeError) {
            console.error(
                'Pexels theme search error:',
                themeError
            );
        }

        await connection.beginTransaction();

        const [materialResult] = await connection.execute(
            `
    INSERT INTO materials
    (
        title,
        scope,
        description,
        theme_image_url,
        chapter_order,
        created_by,
        is_published
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
            [
                title.trim(),
                null,
                description?.trim() || null,
                themeImageUrl,
                chapterOrder,
                req.user.id,
                1
            ]
        );

        const materialId = materialResult.insertId;

        await connection.execute(
            `
            INSERT INTO material_files
            (
                material_id,
                original_name,
                stored_name,
                file_path,
                file_type,
                file_size,
                extracted_text
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                materialId,
                req.file.originalname,
                req.file.filename,
                req.file.path,
                fileType,
                req.file.size,
                extractedText
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Materi berhasil ditambahkan',
            data: {
                id: materialId,
                title: title.trim(),
                description: description?.trim() || null,
                theme_image_url: themeImageUrl,
                chapter_order: chapterOrder,
                created_by: req.user.id,
                file: {
                    original_name: req.file.originalname,
                    file_type: fileType,
                    file_size: req.file.size,
                    extracted_text_length: extractedText.length
                }
            }
        });

    } catch (error) {
        try {
            await connection.rollback();
        } catch { }

        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }
        }

        console.error(
            'Create material error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });

    } finally {
        connection.release();
    }
}


async function getLecturerMaterials(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({
                success: false,
                message: 'Hanya dosen yang dapat mengakses materi'
            });
        }

        const [materials] = await pool.execute(
            `
    SELECT
        m.id,
        m.title,
        m.scope,
        m.description,
        m.theme_image_url,
        m.chapter_order,
        m.created_by,
        m.is_published,
        m.created_at,
        m.updated_at,

        mf.id AS file_id,
        mf.original_name,
        mf.file_type,
        mf.file_size,

        (
            SELECT COUNT(*)
            FROM material_videos mv
            WHERE mv.material_id = m.id
        ) AS video_count

    FROM materials m

    LEFT JOIN material_files mf
        ON mf.material_id = m.id

    WHERE m.created_by = ?

    ORDER BY
        m.chapter_order ASC,
        m.created_at DESC
    `,
            [req.user.id]
        );

        return res.json({
            success: true,
            data: materials
        });

    } catch (error) {
        console.error(
            'Get lecturer materials error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}

async function getStudentMaterials(req, res) {
    try {
        const [materials] = await pool.execute(
            `
            SELECT
                m.id,
                m.title,
                m.scope,
                m.description,
                m.theme_image_url,
                m.chapter_order,
                m.created_at,
                (
                    SELECT COUNT(*)
                    FROM material_files mf
                    WHERE mf.material_id = m.id
                ) AS file_count,
                (
                    SELECT COUNT(*)
                    FROM material_videos mv
                    WHERE mv.material_id = m.id
                ) AS video_count,
                (
                    SELECT COUNT(*)
                    FROM exercises e
                    WHERE e.material_id = m.id
                      AND e.is_published = 1
                ) AS exercise_count,
                (
                    SELECT COUNT(*)
                    FROM exercises e
                    INNER JOIN exercise_attempts ea
                        ON ea.exercise_id = e.id
                        AND ea.student_id = ?
                    WHERE e.material_id = m.id
                      AND e.is_published = 1
                ) AS my_completed_exercises
            FROM materials m
            WHERE m.is_published = 1
            ORDER BY m.chapter_order ASC, m.created_at DESC
            `,
            [req.user.id]
        );

        return res.json({
            success: true,
            data: materials
        });
    } catch (error) {
        console.error('Get student materials error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil materi'
        });
    }
}


async function getMaterialById(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        const { id } = req.params;

        const [materials] = await pool.execute(
            `
            SELECT
                id,
                title,
                scope,
                description,
                theme_image_url,
                chapter_order,
                created_by,
                is_published,
                created_at,
                updated_at

            FROM materials

            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (materials.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Materi tidak ditemukan'
            });
        }

        const material = materials[0];

        if (
            req.user.role === 'lecturer' &&
            material.created_by !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki akses ke materi ini'
            });
        }

        if (
            req.user.role === 'student' &&
            !material.is_published
        ) {
            return res.status(404).json({
                success: false,
                message: 'Materi tidak ditemukan'
            });
        }

        const [files] = await pool.execute(
            `
            SELECT
                id,
                original_name,
                stored_name,
                file_path,
                file_type,
                file_size,
                extracted_text,
                created_at

            FROM material_files

            WHERE material_id = ?

            ORDER BY created_at DESC
            `,
            [id]
        );

        return res.json({
            success: true,
            data: {
                ...material,
                files
            }
        });

    } catch (error) {
        console.error(
            'Get material error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}

async function deleteMaterialFile(req, res) {
    try {
        const { materialId, fileId } = req.params;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({
                success: false,
                message: 'Hanya dosen yang dapat menghapus dokumen'
            });
        }

        const [files] = await pool.execute(
            `
            SELECT
                mf.id,
                mf.material_id,
                mf.file_path
            FROM material_files mf
            INNER JOIN materials m
                ON m.id = mf.material_id
            WHERE mf.id = ?
              AND mf.material_id = ?
              AND m.created_by = ?
            LIMIT 1
            `,
            [
                fileId,
                materialId,
                req.user.id
            ]
        );

        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dokumen tidak ditemukan'
            });
        }

        const file = files[0];

        await pool.execute(
            `
            DELETE FROM material_files
            WHERE id = ?
              AND material_id = ?
            `,
            [
                fileId,
                materialId
            ]
        );

        if (file.file_path) {
            try {
                if (fs.existsSync(file.file_path)) {
                    fs.unlinkSync(file.file_path);
                }
            } catch (fileError) {
                console.error(
                    'Delete material file error:',
                    fileError
                );
            }
        }

        return res.json({
            success: true,
            message: 'Dokumen berhasil dihapus'
        });

    } catch (error) {
        console.error(
            'Delete material file error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus dokumen'
        });
    }
}

async function addMaterialFile(req, res) {
    const connection = await pool.getConnection();

    try {
        const { materialId } = req.params;

        if (!req.user) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        if (req.user.role !== 'lecturer') {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(403).json({
                success: false,
                message: 'Hanya dosen yang dapat menambahkan dokumen'
            });
        }

        if (!materialId) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(400).json({
                success: false,
                message: 'Material ID wajib diberikan'
            });
        }

        const [materials] = await pool.execute(
            `
            SELECT
                id,
                created_by
            FROM materials
            WHERE id = ?
              AND created_by = ?
            LIMIT 1
            `,
            [
                materialId,
                req.user.id
            ]
        );

        if (materials.length === 0) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(404).json({
                success: false,
                message: 'Materi tidak ditemukan'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File materi wajib diupload'
            });
        }

        const extension = path
            .extname(req.file.originalname)
            .toLowerCase();

        let fileType;

        if (extension === '.pdf') {
            fileType = 'pdf';
        } else if (extension === '.docx') {
            fileType = 'docx';
        } else {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }

            return res.status(400).json({
                success: false,
                message: 'File harus berformat PDF atau DOCX'
            });
        }

        let extractedText = '';

        try {
            extractedText = await extractDocumentText(
                req.file.path,
                fileType
            );
        } catch (extractError) {
            console.error(
                'Document extraction error:',
                extractError
            );

            try {
                fs.unlinkSync(req.file.path);
            } catch { }

            return res.status(400).json({
                success: false,
                message: 'Gagal membaca isi dokumen'
            });
        }

        if (!extractedText) {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }

            return res.status(400).json({
                success: false,
                message: 'Dokumen tidak memiliki teks yang dapat dibaca'
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.execute(
            `
            INSERT INTO material_files
            (
                material_id,
                original_name,
                stored_name,
                file_path,
                file_type,
                file_size,
                extracted_text
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                materialId,
                req.file.originalname,
                req.file.filename,
                req.file.path,
                fileType,
                req.file.size,
                extractedText
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Dokumen berhasil ditambahkan',
            data: {
                id: result.insertId,
                material_id: Number(materialId),
                original_name: req.file.originalname,
                stored_name: req.file.filename,
                file_path: req.file.path,
                file_type: fileType,
                file_size: req.file.size,
                extracted_text_length: extractedText.length
            }
        });

    } catch (error) {
        try {
            await connection.rollback();
        } catch { }

        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }
        }

        console.error(
            'Add material file error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });

    } finally {
        connection.release();
    }
}

async function deleteMaterial(req, res) {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({
                success: false,
                message: 'Hanya dosen yang dapat menghapus materi'
            });
        }

        const [materials] = await connection.execute(
            `
            SELECT
                id,
                created_by
            FROM materials
            WHERE id = ?
              AND created_by = ?
            LIMIT 1
            `,
            [
                id,
                req.user.id
            ]
        );

        if (materials.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Materi tidak ditemukan'
            });
        }

        const [files] = await connection.execute(
            `
            SELECT
                id,
                file_path
            FROM material_files
            WHERE material_id = ?
            `,
            [id]
        );

        const [videos] = await connection.execute(
            `
            SELECT
                id,
                video_type,
                file_path
            FROM material_videos
            WHERE material_id = ?
            `,
            [id]
        );

        await connection.beginTransaction();

        await connection.execute(
            `
            DELETE FROM material_files
            WHERE material_id = ?
            `,
            [id]
        );

        await connection.execute(
            `
            DELETE FROM material_videos
            WHERE material_id = ?
            `,
            [id]
        );

        await connection.execute(
            `
            DELETE FROM materials
            WHERE id = ?
              AND created_by = ?
            `,
            [
                id,
                req.user.id
            ]
        );

        await connection.commit();

        for (const file of files) {
            if (file.file_path) {
                try {
                    if (fs.existsSync(file.file_path)) {
                        fs.unlinkSync(file.file_path);
                    }
                } catch (fileError) {
                    console.error(
                        'Delete material document file error:',
                        fileError
                    );
                }
            }
        }

        for (const video of videos) {
            if (
                video.video_type === 'upload' &&
                video.file_path
            ) {
                try {
                    if (fs.existsSync(video.file_path)) {
                        fs.unlinkSync(video.file_path);
                    }
                } catch (fileError) {
                    console.error(
                        'Delete material video file error:',
                        fileError
                    );
                }
            }
        }

        return res.json({
            success: true,
            message: 'Materi berhasil dihapus'
        });

    } catch (error) {
        try {
            await connection.rollback();
        } catch { }

        console.error(
            'Delete material error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus materi'
        });

    } finally {
        connection.release();
    }
}


module.exports = {
    createMaterial,
    getLecturerMaterials,
    getStudentMaterials,
    getMaterialById,
    addMaterialFile,
    deleteMaterialFile,
    deleteMaterial
};
