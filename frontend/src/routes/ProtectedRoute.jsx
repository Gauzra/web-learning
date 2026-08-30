import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        if (user.role === 'lecturer') {
            return <Navigate to="/dosen/dashboard" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}