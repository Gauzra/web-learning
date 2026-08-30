const fs = require('fs');
const path = require('path');

const { pool } = require('../config/database');


async function createMaterialVideo(req, res) {
    try {
        const { materialId } = req.params;

        const {
            title,
            video_type,
            video_url
        } = req.body;

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
                message: 'Hanya dosen yang dapat menambahkan video'
            });
        }

        if (!title || !title.trim()) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(400).json({
                success: false,
                message: 'Judul video wajib diisi'
            });
        }

        if (!video_type) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(400).json({
                success: false,
                message: 'Tipe video wajib dipilih'
            });
        }

        if (!['youtube', 'url', 'upload'].includes(video_type)) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch { }
            }

            return res.status(400).json({
                success: false,
                message: 'Tipe video tidak valid'
            });
        }

        if (video_type === 'upload' && !req.file) {
            return res.status(400).json({
                success: false,
                message: 'File video wajib diupload'
            });
        }

        if (
            video_type !== 'upload' &&
            (!video_url || !video_url.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'URL video wajib diisi'
            });
        }

        const [materials] = await pool.execute(
            `
            SELECT id
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

        let originalName = null;
        let storedName = null;
        let filePath = null;
        let finalVideoUrl = null;

        if (video_type === 'upload') {
            originalName = req.file.originalname;
            storedName = req.file.filename;

            filePath = path
                .relative(process.cwd(), req.file.path)
                .replace(/\\/g, '/');

        } else {
            finalVideoUrl = video_url.trim();
        }

        const [result] = await pool.execute(
            `
            INSERT INTO material_videos
            (
                material_id,
                title,
                video_type,
                video_url,
                original_name,
                stored_name,
                file_path
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                materialId,
                title.trim(),
                video_type,
                finalVideoUrl,
                originalName,
                storedName,
                filePath
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Video berhasil ditambahkan',
            data: {
                id: result.insertId,
                material_id: Number(materialId),
                title: title.trim(),
                video_type,
                video_url: finalVideoUrl,
                original_name: originalName,
                stored_name: storedName,
                file_path: filePath
            }
        });

    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch { }
        }

        console.error(
            'Create material video error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}


async function getMaterialVideos(req, res) {
    try {
        const { materialId } = req.params;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        const [materials] = await pool.execute(
            `
            SELECT id, created_by, is_published
            FROM materials
            WHERE id = ?
            LIMIT 1
            `,
            [materialId]
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

        const [videos] = await pool.execute(
            `
            SELECT
                id,
                material_id,
                title,
                video_type,
                video_url,
                original_name,
                stored_name,
                file_path,
                duration_seconds,
                created_at
            FROM material_videos
            WHERE material_id = ?
            ORDER BY created_at ASC
            `,
            [materialId]
        );

        return res.json({
            success: true,
            data: videos
        });

    } catch (error) {
        console.error(
            'Get material videos error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}


async function deleteMaterialVideo(req, res) {
    try {
        const { materialId, videoId } = req.params;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Anda belum terautentikasi'
            });
        }

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({
                success: false,
                message: 'Hanya dosen yang dapat menghapus video'
            });
        }

        const [videos] = await pool.execute(
            `
            SELECT
                mv.id,
                mv.material_id,
                mv.video_type,
                mv.file_path
            FROM material_videos mv
            INNER JOIN materials m
                ON m.id = mv.material_id
            WHERE mv.id = ?
              AND mv.material_id = ?
              AND m.created_by = ?
            LIMIT 1
            `,
            [
                videoId,
                materialId,
                req.user.id
            ]
        );

        if (videos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Video tidak ditemukan'
            });
        }

        const video = videos[0];

        await pool.execute(
            `
            DELETE FROM material_videos
            WHERE id = ?
              AND material_id = ?
            `,
            [
                videoId,
                materialId
            ]
        );

        if (
            video.video_type === 'upload' &&
            video.file_path
        ) {
            const absolutePath = path.join(
                process.cwd(),
                video.file_path
            );

            try {
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath);
                }
            } catch (fileError) {
                console.error(
                    'Delete video file error:',
                    fileError
                );
            }
        }

        return res.json({
            success: true,
            message: 'Video berhasil dihapus'
        });

    } catch (error) {
        console.error(
            'Delete material video error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}


module.exports = {
    createMaterialVideo,
    getMaterialVideos,
    deleteMaterialVideo
};