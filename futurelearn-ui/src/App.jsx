import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

const TeacherDashboard = lazy(() => import('./TeacherDashboard'));
const StudentJoin = lazy(() => import('./StudentJoin'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AIChatBot = lazy(() => import('./components/AIChatBot'));


function PathPersist() {
  const location = useLocation();
  useEffect(() => {
    // Sauvegarde l'URL actuelle (ex: /teacher)
    localStorage.setItem('last_path', location.pathname);
  }, [location]);
  return null;
}

function App() {
  useEffect(() => {
    // Au chargement, si on est sur la racine "/" mais qu'on a une sauvegarde
    // On pourrait rediriger, mais React Router le fait déjà via l'URL.
    // Le vrai souci est la perte des données de SESSION.
  }, []);

  return (
    <Router>
      <PathPersist /> 
      
      <Suspense fallback={null}>
        <AIChatBot />
      </Suspense>

      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>}>
        <Routes>
          <Route path="/" element={<StudentJoin />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
