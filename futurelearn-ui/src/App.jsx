import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';

const TeacherDashboard = lazy(() => import('./TeacherDashboard'));
const StudentJoin     = lazy(() => import('./StudentJoin'));
const AdminDashboard  = lazy(() => import('./AdminDashboard'));
const AIChatBot       = lazy(() => import('./components/AIChatBot'));

function PathPersist() {
    const location = useLocation();
    useEffect(() => {
        localStorage.setItem('last_path', location.pathname);
    }, [location]);
    return null;
}

function AppContent() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setUser(u);
            redirectByRole(u.role);
        }
    }, []);

    const redirectByRole = (role) => {
        if (role === 'teacher') navigate('/teacher');
        else if (role === 'admin') navigate('/admin');
        else navigate('/student');
    };

    const handleAuthSuccess = (userData) => {
        // Pour le TeacherDashboard qui utilise encore logged_teacher
        if (userData.role === 'teacher') {
            localStorage.setItem('logged_teacher', JSON.stringify({
                moodle_user_id: userData.id,
                firstname: userData.name,
                lastname: ''
            }));
        }
        // Pour le StudentJoin qui utilise my_student_id
        if (userData.role === 'student') {
            localStorage.setItem('my_student_id', 'STU-' + userData.id);
            localStorage.setItem('student_data', JSON.stringify({
                student_id: 'STU-' + userData.id,
                firstname: userData.name,
                email: userData.email
            }));
        }
        setUser(userData);
        redirectByRole(userData.role);
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('logged_teacher');
        localStorage.removeItem('active_session');
        localStorage.removeItem('active_student_session');
        localStorage.removeItem('my_student_id');
        localStorage.removeItem('student_data');
        setUser(null);
        navigate('/');
    };

    return (
        <>
            <PathPersist />

            <Suspense fallback={null}>
                <AIChatBot />
            </Suspense>

            <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>}>
                <Routes>
                    {/* PAGE D'AUTH (racine) */}
                    <Route path="/" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />

                    {/* ÉTUDIANT */}
                          <Route path="/join/:pin" element={
                          user?.role === 'student'
                              ? <StudentJoin onLogout={handleLogout} />
                              : <AuthPage onAuthSuccess={handleAuthSuccess} redirectPin={true} />
                      } />
                    <Route path="/student" element={
                        user?.role === 'student'
                            ? <StudentJoin onLogout={handleLogout} />
                            : <AuthPage onAuthSuccess={handleAuthSuccess} />
                    } />

                    {/* ENSEIGNANT */}
                    <Route path="/teacher" element={
                        user?.role === 'teacher'
                            ? <TeacherDashboard user={user} onLogout={handleLogout} />
                            : <AuthPage onAuthSuccess={handleAuthSuccess} />
                    } />

                    {/* ADMIN */}
                    <Route path="/admin" element={
                        user?.role === 'admin'
                            ? <AdminDashboard user={user} onLogout={handleLogout} />
                            : <AuthPage onAuthSuccess={handleAuthSuccess} />
                    } />
                </Routes>
            </Suspense>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
