import './echo';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TeacherDashboard from './TeacherDashboard';

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>
)
