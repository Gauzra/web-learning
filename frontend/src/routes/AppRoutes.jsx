import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import Dashboard from '../pages/student/Dashboard';
import Materials from '../pages/student/Materials';
import StudentMaterialDetail from '../pages/student/MaterialDetail';
import StudentExercise from '../pages/student/StudentExercise';
import Profile from '../pages/student/Profile';
import StudentPanduan from '../pages/student/Panduan';

import LecturerDashboard from '../pages/lecturer/Dashboard';
import LecturerMaterials from '../pages/lecturer/Materials';
import AddMaterial from '../pages/lecturer/AddMaterial';
import MaterialDetail from '../pages/lecturer/MaterialDetail';
import ExerciseDetail from '../pages/lecturer/ExerciseDetail';
import AddVideo from '../pages/lecturer/AddVideo';
import Penilaian from '../pages/lecturer/Penilaian';
import LecturerProfile from '../pages/lecturer/Profile';
import Panduan from '../pages/lecturer/Panduan';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* ROUTE MAHASISWA */}
                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={['student']}
                        />
                    }
                >
                    <Route element={<MainLayout />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/materi"
                            element={<Materials />}
                        />

                        <Route
                            path="/materi/:id"
                            element={<StudentMaterialDetail />}
                        />

                        <Route
                            path="/latihan/:exerciseId"
                            element={<StudentExercise />}
                        />

                        <Route
                            path="/panduan"
                            element={<StudentPanduan />}
                        />

                        <Route
                            path="/profil"
                            element={<Profile />}
                        />

                    </Route>
                </Route>

                {/* ROUTE DOSEN */}
                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={['lecturer']}
                        />
                    }
                >
                    <Route element={<MainLayout />}>

                        <Route
                            path="/dosen/dashboard"
                            element={<LecturerDashboard />}
                        />

                        <Route
                            path="/dosen/materi"
                            element={<LecturerMaterials />}
                        />

                        <Route
                            path="/dosen/materi/tambah"
                            element={<AddMaterial />}
                        />

                        <Route
                            path="/dosen/materi/:id"
                            element={<MaterialDetail />}
                        />

                        <Route
                            path="/dosen/materi/:id/latihan/:exerciseId"
                            element={<ExerciseDetail />}
                        />

                        <Route
                            path="/dosen/materi/:id/video/tambah"
                            element={<AddVideo />}
                        />

                        <Route
                            path="/dosen/penilaian"
                            element={<Penilaian />}
                        />

                        <Route
                            path="/dosen/panduan"
                            element={<Panduan />}
                        />
                        
                        <Route
                            path="/dosen/profil"
                            element={<LecturerProfile />}
                        />

                    </Route>
                </Route>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}
