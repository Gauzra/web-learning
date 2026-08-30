import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const api = 'http://localhost:5000';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Avatar state
    const [avatarUploading, setAvatarUploading] = useState(false);

    // Edit name state
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameSaving, setNameSaving] = useState(false);
    const [nameMsg, setNameMsg] = useState('');

    // Edit NIM state
    const [editingNim, setEditingNim] = useState(false);
    const [newNim, setNewNim] = useState('');
    const [nimSaving, setNimSaving] = useState(false);
    const [nimMsg, setNimMsg] = useState('');

    // Change password state
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ text: '', ok: true });

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login', { replace: true }); return; }
        fetch(`${api}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (!d.success) throw new Error(d.message);
                setProfile(d.data);
                setNewName(d.data.name || '');
                setNewNim(d.data.nim || '');
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token, navigate]);

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setNameSaving(true);
        setNameMsg('');
        try {
            const r = await fetch(`${api}/api/auth/profile`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() })
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            setProfile(prev => ({ ...prev, name: newName.trim() }));
            // Update localStorage user
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const u = JSON.parse(stored);
                    localStorage.setItem('user', JSON.stringify({ ...u, name: newName.trim() }));
                } catch { }
            }
            setEditingName(false);
            setNameMsg('Nama berhasil diperbarui!');
            setTimeout(() => setNameMsg(''), 3000);
        } catch (e) {
            setNameMsg(e.message || 'Gagal memperbarui nama');
        } finally {
            setNameSaving(false);
        }
    };

    const handleSaveNim = async () => {
        setNimSaving(true);
        setNimMsg('');
        try {
            const r = await fetch(`${api}/api/auth/profile`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ nim: newNim.trim() })
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            setProfile(prev => ({ ...prev, nim: newNim.trim() }));
            
            setEditingNim(false);
            setNimMsg('NIM berhasil diperbarui!');
            setTimeout(() => setNimMsg(''), 3000);
        } catch (e) {
            setNimMsg(e.message || 'Gagal memperbarui NIM');
        } finally {
            setNimSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset input value to allow uploading the same file again if needed
        e.target.value = '';

        const formData = new FormData();
        formData.append('avatar', file);

        setAvatarUploading(true);
        try {
            const r = await fetch(`${api}/api/auth/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            
            setProfile(prev => ({ ...prev, avatar: d.data.avatar }));
            
            // Update localStorage user
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const u = JSON.parse(stored);
                    localStorage.setItem('user', JSON.stringify({ ...u, avatar: d.data.avatar }));
                } catch { }
            }
        } catch (error) {
            alert(error.message || 'Gagal mengunggah foto profil');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.next !== pwForm.confirm) {
            setPwMsg({ text: 'Password baru tidak cocok', ok: false }); return;
        }
        if (pwForm.next.length < 6) {
            setPwMsg({ text: 'Password minimal 6 karakter', ok: false }); return;
        }
        setPwSaving(true);
        setPwMsg({ text: '', ok: true });
        try {
            const r = await fetch(`${api}/api/auth/password`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next })
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            setPwForm({ current: '', next: '', confirm: '' });
            setPwMsg({ text: 'Password berhasil diubah!', ok: true });
            setTimeout(() => setPwMsg({ text: '', ok: true }), 4000);
        } catch (e) {
            setPwMsg({ text: e.message || 'Gagal mengubah password', ok: false });
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) return <div className="prof-state">Memuat profil...</div>;
    if (error) return <div className="prof-state prof-error">{error}</div>;
    if (!profile) return null;

    const initials = profile.name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join('');

    const joinDate = new Date(profile.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="prof-page">
            {/* Avatar card */}
            <div className="prof-hero">
                <div className="prof-avatar-wrapper">
                    <div className="prof-avatar">
                        {profile.avatar ? (
                            <img 
                                src={`${api}${profile.avatar}`} 
                                alt={profile.name} 
                                className="prof-avatar-img"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    
                    <label className="prof-avatar-edit" title="Ganti Foto Profil">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg, image/webp" 
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                        />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </label>

                    {avatarUploading && (
                        <div className="prof-avatar-loading">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                            </svg>
                            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}
                </div>
                <div className="prof-hero-info">
                    <h1 className="prof-hero-name">{profile.name}</h1>
                    <span className="prof-hero-role">
                        {profile.role === 'student' ? 'Mahasiswa' : 'Dosen'}
                    </span>
                    <p className="prof-hero-email">{profile.email}</p>
                    {profile.role === 'student' && profile.nim && (
                        <p className="prof-hero-email">NIM: {profile.nim}</p>
                    )}
                    <p className="prof-hero-join">Bergabung sejak {joinDate}</p>
                </div>
            </div>

            {/* Edit Name */}
            <section className="prof-section">
                <div className="prof-section-header">
                    <div>
                        <h2>Nama Lengkap</h2>
                        <p>Nama yang akan tampil di penilaian dosen</p>
                    </div>
                    {!editingName && (
                        <button className="prof-btn-outline" onClick={() => setEditingName(true)}>
                            Edit Nama
                        </button>
                    )}
                </div>

                {editingName ? (
                    <div className="prof-edit-row">
                        <input
                            className="prof-input"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Nama lengkap"
                            maxLength={100}
                            autoFocus
                        />
                        <div className="prof-btn-row">
                            <button
                                className="prof-btn-primary"
                                onClick={handleSaveName}
                                disabled={nameSaving || !newName.trim()}
                            >
                                {nameSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                                className="prof-btn-ghost"
                                onClick={() => { setEditingName(false); setNewName(profile.name); }}
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="prof-value">{profile.name}</p>
                )}
                {nameMsg && <p className="prof-msg prof-msg-ok">{nameMsg}</p>}
            </section>

            {/* Email (readonly) */}
            <section className="prof-section">
                <div className="prof-section-header">
                    <div>
                        <h2>Email</h2>
                        <p>Email tidak dapat diubah</p>
                    </div>
                </div>
                <p className="prof-value prof-muted">{profile.email}</p>
            </section>

            {/* Edit NIM (for student only) */}
            {profile.role === 'student' && (
                <section className="prof-section">
                    <div className="prof-section-header">
                        <div>
                            <h2>Nomor Induk Mahasiswa (NIM)</h2>
                            <p>NIM untuk keperluan penilaian dosen</p>
                        </div>
                        {!editingNim && (
                            <button className="prof-btn-outline" onClick={() => setEditingNim(true)}>
                                {profile.nim ? 'Edit NIM' : 'Tambah NIM'}
                            </button>
                        )}
                    </div>

                    {editingNim ? (
                        <div className="prof-edit-row">
                            <input
                                className="prof-input"
                                value={newNim}
                                onChange={e => setNewNim(e.target.value)}
                                placeholder="Masukkan NIM"
                                maxLength={20}
                                autoFocus
                            />
                            <div className="prof-btn-row">
                                <button
                                    className="prof-btn-primary"
                                    onClick={handleSaveNim}
                                    disabled={nimSaving}
                                >
                                    {nimSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    className="prof-btn-ghost"
                                    onClick={() => { setEditingNim(false); setNewNim(profile.nim || ''); }}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className={profile.nim ? 'prof-value' : 'prof-value prof-muted'}>
                            {profile.nim || 'Belum diatur'}
                        </p>
                    )}
                    {nimMsg && <p className="prof-msg prof-msg-ok">{nimMsg}</p>}
                </section>
            )}

            {/* Change Password */}
            <section className="prof-section">
                <div className="prof-section-header">
                    <div>
                        <h2>Ubah Password</h2>
                        <p>Gunakan password yang kuat dan unik</p>
                    </div>
                </div>
                <form className="prof-pw-form" onSubmit={handleChangePassword}>
                    <div className="prof-field">
                        <label>Password Saat Ini</label>
                        <input
                            type="password"
                            className="prof-input"
                            value={pwForm.current}
                            onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                            placeholder="Masukkan password saat ini"
                            required
                        />
                    </div>
                    <div className="prof-field">
                        <label>Password Baru</label>
                        <input
                            type="password"
                            className="prof-input"
                            value={pwForm.next}
                            onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                            placeholder="Minimal 6 karakter"
                            required
                        />
                    </div>
                    <div className="prof-field">
                        <label>Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            className="prof-input"
                            value={pwForm.confirm}
                            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                            placeholder="Ulangi password baru"
                            required
                        />
                    </div>
                    {pwMsg.text && (
                        <p className={`prof-msg ${pwMsg.ok ? 'prof-msg-ok' : 'prof-msg-err'}`}>
                            {pwMsg.text}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="prof-btn-primary"
                        disabled={pwSaving}
                    >
                        {pwSaving ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                </form>
            </section>
        </div>
    );
}