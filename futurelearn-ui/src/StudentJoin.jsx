import React, { useState, useEffect } from 'react';
import BackgroundSlideshow from './BackgroundSlideshow';
import StudentSession from './StudentSession';
import api from './api';
import { FaSpinner, FaKeyboard, FaCheckCircle, FaHistory, FaTimes, FaUser } from 'react-icons/fa';
import StudentSummary from './components/StudentSummary';
import { useParams } from 'react-router-dom';

const StudentJoin = ({ onLogout, skipAuth }) => {
    const { pin: urlPin } = useParams();
    const [pin, setPin] = useState('');
    const [prenom, setPrenom] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [pastSessions, setPastSessions] = useState([]);
    const [summaryPin, setSummaryPin] = useState(null);

    // Si on arrive via QR code, on pré-remplit le PIN
   useEffect(() => {
    if (urlPin) {
        setPin(urlPin);
        // Si le prénom est déjà connu, rejoindre automatiquement
        const savedId = localStorage.getItem('my_student_id');
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        if (savedId || authUser.id) {
            // Rejoindre directement !
            const id = savedId || ('STU-' + authUser.id);
            api.post('/sessions/join', { pin_code: urlPin, student_id: id })
                .then(res => {
                    localStorage.setItem('active_student_session', JSON.stringify(res.data.session));
                    setActiveSession(res.data.session);
                })
                .catch(err => setError(err.response?.data?.error || 'Session introuvable'));
        }
    }
}, [urlPin]);


    // Récupère les infos de l'étudiant connecté
    const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
    const studentId = skipAuth
        ? ('STU-' + Math.random().toString(36).substr(2, 8).toUpperCase())
        : (localStorage.getItem('my_student_id') || ('STU-' + authUser.id));
    const firstname = skipAuth ? (prenom || 'Étudiant') : (authUser.name || 'Étudiant');

    useEffect(() => {
        const savedSession = localStorage.getItem('active_student_session');
        if (savedSession) setActiveSession(JSON.parse(savedSession));
    }, []);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (skipAuth && !prenom.trim()) {
            setError('Veuillez entrer votre prénom');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const id = skipAuth
                ? ('STU-' + Math.random().toString(36).substr(2, 8).toUpperCase())
                : studentId;
            localStorage.setItem('my_student_id', id);
            const response = await api.post('/sessions/join', { pin_code: pin, student_id: id });
            setShowToast(true);
            localStorage.setItem('active_student_session', JSON.stringify(response.data.session));
            setTimeout(() => {
                setActiveSession(response.data.session);
                setShowToast(false);
            }, 800);
        } catch (err) {
            setError(err.response?.data?.error || 'Code PIN invalide');
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const myId = localStorage.getItem('my_student_id');
            const res = await api.get(`/student/${myId}/history`);
            setPastSessions(res.data);
            setShowHistory(true);
        } catch (e) { alert('Erreur historique.'); }
    };

    if (summaryPin) return (
        <div className="fadeIn">
            <StudentSummary pinCode={summaryPin} />
            <button onClick={() => setSummaryPin(null)} className="back-btn-float">← RETOUR</button>
        </div>
    );

    if (activeSession) return (
        <StudentSession
            session={activeSession}
            onLeave={() => {
                localStorage.removeItem('active_student_session');
                setActiveSession(null);
            }}
        />
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "'Montserrat', sans-serif" }}>
            <style>{`
                .pin-card { width:100%; max-width:420px; background:rgba(255,255,255,0.95); backdrop-filter:blur(10px); padding:44px 36px; border-radius:28px; box-shadow:0 20px 50px rgba(0,0,0,0.15); text-align:center; animation:slideUp 0.5s ease-out; }
                @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
                .pin-input-field { width:100%; padding:18px 15px; border-radius:16px; border:2.5px solid #e2e8f0; font-size:34px; letter-spacing:12px; font-weight:900; color:#6d28d9; text-align:center; outline:none; box-sizing:border-box; transition:border-color 0.2s; background:#fafafa; }
                .pin-input-field:focus { border-color:#6d28d9; background:white; }
                .name-input-field { width:100%; padding:14px 15px; border-radius:16px; border:2.5px solid #e2e8f0; font-size:16px; font-weight:600; color:#1e1b4b; outline:none; box-sizing:border-box; transition:border-color 0.2s; background:#fafafa; margin-bottom:16px; }
                .name-input-field:focus { border-color:#6d28d9; background:white; }
                .join-btn { width:100%; padding:17px; background:#6d28d9; color:white; border:none; border-radius:16px; font-weight:800; font-size:15px; cursor:pointer; box-shadow:0 10px 24px rgba(109,40,217,0.35); transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:10px; }
                .join-btn:hover:not(:disabled) { transform:translateY(-1px); }
                .join-btn:disabled { opacity:0.7; cursor:not-allowed; }
                .logout-link { font-size:12px; color:#94a3b8; cursor:pointer; margin-top:18px; display:inline-block; }
                .logout-link:hover { color:#ef4444; }
                .toast-notif { position:fixed; top:24px; right:24px; background:white; padding:16px 24px; border-radius:16px; display:flex; align-items:center; gap:14px; box-shadow:0 10px 30px rgba(0,0,0,0.18); z-index:3000; }
                .back-btn-float { position:fixed; top:20px; left:20px; z-index:1000; padding:10px 20px; background:#1e1b4b; color:white; border-radius:10px; border:none; cursor:pointer; }
            `}</style>

            <BackgroundSlideshow />

            {showToast && (
                <div className="toast-notif">
                    <FaCheckCircle color="#10b981" size={22} />
                    <div>
                        <b>Accès autorisé !</b>
                        <p style={{ margin:0, fontSize:'12px', color:'#64748b' }}>Chargement de la session...</p>
                    </div>
                </div>
            )}

            <div className="pin-card">
                <img src="/logo.png" alt="Logo" style={{ width:'130px', marginBottom:'24px' }} />

                <h2 style={{ color:'#1e1b4b', margin:'0 0 6px 0', fontSize:'22px', fontWeight:'800' }}>
                    {skipAuth ? '🎓 Rejoindre un cours' : `${firstname}, un cours t'attend ! 🎓`}
                </h2>
                <p style={{ color:'#64748b', fontSize:'13px', margin:'0 0 28px 0' }}>
                    {skipAuth ? 'Entrez votre prénom et le code PIN' : 'Saisis le code PIN à 6 chiffres'}
                </p>

                <form onSubmit={handleJoin}>
                    {/* Champ prénom uniquement pour QR code */}
                    {skipAuth && (
                        <input
                            className="name-input-field"
                            type="text"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder="Votre prénom"
                            required
                        />
                    )}
                    <input
                        className="pin-input-field"
                        type="text"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        placeholder="000000"
                        maxLength="6"
                        required
                        style={{ marginBottom:'20px' }}
                    />
                    {error && (
                        <div style={{ backgroundColor:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', fontWeight:'600', marginBottom:'16px' }}>
                            {error}
                        </div>
                    )}
                    <button className="join-btn" type="submit" disabled={loading}>
                        {loading ? <FaSpinner style={{ animation:'spin 0.9s linear infinite' }} /> : <><FaKeyboard /> REJOINDRE LE COURS</>}
                    </button>
                </form>

                <div style={{ marginTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    {!skipAuth && (
                        <span onClick={loadHistory} style={{ fontSize:'12px', color:'#94a3b8', cursor:'pointer', textDecoration:'underline' }}>
                            <FaHistory /> Mes archives XP
                        </span>
                    )}
                    {onLogout && !skipAuth && (
                        <span className="logout-link" onClick={onLogout}>Déconnexion</span>
                    )}
                </div>
            </div>

            {showHistory && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:4000, display:'flex', justifyContent:'center', alignItems:'center', padding:'20px' }}>
                    <div style={{ width:'100%', maxWidth:'420px', background:'white', borderRadius:'24px', padding:'32px', maxHeight:'80vh', overflowY:'auto' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center' }}>
                            <h3 style={{ margin:0, color:'#1e1b4b' }}>Mon Historique</h3>
                            <FaTimes onClick={() => setShowHistory(false)} style={{ cursor:'pointer', color:'#94a3b8', fontSize:'18px' }} />
                        </div>
                        {pastSessions.length === 0 && <p style={{ color:'#94a3b8', textAlign:'center' }}>Aucune session terminée.</p>}
                        {pastSessions.map(s => (
                            <div key={s.id} onClick={() => setSummaryPin(s.pin_code)} style={{ padding:'15px', background:'#f8fafc', borderRadius:'14px', marginBottom:'10px', cursor:'pointer' }}>
                                <b style={{ color:'#1e1b4b' }}>{s.title}</b><br />
                                <small style={{ color:'#64748b' }}>{new Date(s.created_at).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentJoin;