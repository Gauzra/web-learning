import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './MainLayout.css';
import ConfirmModal from '../components/ConfirmModal';
import logoImage from '../assets/images/DigiLitera.png';


const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <rect x="14" y="14" width="6" height="6" rx="1" />
  </svg>
);

const MaterialIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 4.5C5 3.67 5.67 3 6.5 3H19V19H6.5C5.67 19 5 19.67 5 20.5C5 21.33 5.67 22 6.5 22H19" />
    <path d="M5 20.5V4.5" />
    <path d="M9 7H15" />
    <path d="M9 11H15" />
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9C14.5 11 12 11.5 12 13" />
    <path d="M12 17.5V17.6" />
  </svg>
);

const GradingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20C5.5 16.5 7.8 14.5 12 14.5C16.2 14.5 18.5 16.5 19 20" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 5H5V19H10" />
    <path d="M14 8L18 12L14 16" />
    <path d="M8 12H18" />
  </svg>
);

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const isLecturer = user?.role === 'lecturer';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="main-layout">

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>

        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={logoImage} alt="DigiLitera Logo" />
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="sidebar-main-menu">

            <NavLink
              to={isLecturer ? '/dosen/dashboard' : '/dashboard'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <DashboardIcon />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to={isLecturer ? '/dosen/materi' : '/materi'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <MaterialIcon />
              <span>Materi</span>
            </NavLink>

            {isLecturer && (
              <NavLink
                to="/dosen/penilaian"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <GradingIcon />
                <span>Penilaian</span>
              </NavLink>
            )}

            <NavLink
              to={isLecturer ? '/dosen/panduan' : '/panduan'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <HelpIcon />
              <span>Panduan</span>
            </NavLink>

          </div>

          <div className="sidebar-bottom-menu">

            <NavLink
              to={isLecturer ? '/dosen/profil' : '/profil'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <ProfileIcon />
              <span>Profil</span>
            </NavLink>

            <button
              type="button"
              className="sidebar-link logout-link"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogoutIcon />
              <span>Keluar</span>
            </button>

          </div>

        </nav>
      </aside>

      <div className="main-content-wrapper">

        <header className="mobile-header">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            Menu
          </button>

          <div className="mobile-header-actions">
            <NavLink
              to={isLecturer ? '/dosen/profil' : '/profil'}
              className="mobile-header-icon"
              aria-label="Profil"
            >
              <ProfileIcon />
            </NavLink>
            <button
              type="button"
              className="mobile-header-icon"
              onClick={() => setIsLogoutModalOpen(true)}
              aria-label="Keluar"
            >
              <LogoutIcon />
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>

      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

    </div>

  );
}