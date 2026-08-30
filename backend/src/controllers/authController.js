const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password wajib diisi'
            });
        }

        const userRole = role === 'lecturer' ? 'lecturer' : 'student';

        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email sudah terdaftar'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
            [name, email, hashedPassword, userRole]
        );

        return res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                id: result.insertId,
                name,
                email,
                role: userRole
            }
        });

    } catch (error) {
        console.error('Register error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });
        }

        const [users] = await pool.execute(
            `
      SELECT id, name, email, password, role
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}

async function getProfile(req, res) {
    try {
        const [users] = await pool.execute(
            `
      SELECT id, name, nim, email, role, created_at, avatar
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        return res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
}

async function updateProfile(req, res) {
    try {
        const { name, nim } = req.body;

        if (name !== undefined && (!name || !name.trim())) {
            return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong' });
        }

        // Validate NIM if provided: digits only, max 20 chars
        if (nim !== undefined && nim !== null && nim !== '') {
            if (!/^[0-9a-zA-Z]{1,20}$/.test(nim.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'NIM hanya boleh berisi huruf dan angka, maksimal 20 karakter'
                });
            }
        }

        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(name.trim());
        }

        if (nim !== undefined) {
            updateFields.push('nim = ?');
            updateValues.push(nim === '' ? null : nim.trim());
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'Tidak ada data yang diperbarui' });
        }

        updateValues.push(req.user.id);

        await pool.execute(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        return res.json({ success: true, message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

async function updatePassword(req, res) {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password || new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password tidak valid' });
        }

        const [users] = await pool.execute('SELECT password FROM users WHERE id = ? LIMIT 1', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const match = await bcrypt.compare(current_password, users[0].password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Password saat ini salah' });
        }

        const hashed = await bcrypt.hash(new_password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

        return res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('Update password error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

async function uploadAvatarImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        try {
            await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, req.user.id]);
        } catch (dbError) {
            if (dbError.code === 'ER_BAD_FIELD_ERROR') {
                // Buat kolom jika belum ada
                await pool.execute('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL');
                await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, req.user.id]);
            } else {
                throw dbError;
            }
        }

        return res.json({
            success: true,
            message: 'Foto profil berhasil diperbarui',
            data: {
                avatar: avatarPath
            }
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatarImage
};