import React, { useState, useEffect } from 'react'; 
import BackgroundSlideshow from './BackgroundSlideshow';
import StudentSession from './StudentSession'; 
import api from './api'; 
import { 
    FaUserGraduate, FaSignInAlt, FaSpinner, FaKeyboard, 
    FaCheckCircle, FaHistory, FaTimes, FaEnvelope, FaArrowLeft 
} from 'react-icons/fa';
import StudentSummary from './components/StudentSummary';

const StudentJoin = () => {
    const [step, setStep] = useState('login'); 
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activeSession, setActiveSession] = useState(null); 
    const [showHistory, setShowHistory] = useState(false);
    const [pastSessions, setPastSessions] = useState([]);
    const [summaryPin, setSummaryPin] = useState(null);

    useEffect(() => {
        const savedSession = localStorage.getItem('active_student_session');
        const savedId = localStorage.getItem('my_student_id');
        const savedData = localStorage.getItem('student_data');

        if (savedSession) setActiveSession(JSON.parse(savedSession));
        if (savedId && savedData) {
            setStudentInfo(JSON.parse(savedData));
            setStep('join');
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/student/login', { email });
            localStorage.setItem('my_student_id', res.data.student_id);
            localStorage.setItem('student_data', JSON.stringify(res.data));
            setStudentInfo(res.data);
            setStep('join');
        } catch (err) {
            setError("Email non reconnu dans Moodle");
        } finally { setLoading(false); }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const studentId = localStorage.getItem('my_student_id');
            const response = await api.post('/sessions/join', { pin_code: pin, student_id: studentId });
            setShowToast(true);
            localStorage.setItem('active_student_session', JSON.stringify(response.data.session));
            setActiveSession(response.data.session);
            setShowToast(false);
        } catch (err) {
            setError(err.response?.data?.error || "Code PIN invalide");
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const myId = localStorage.getItem('my_student_id');
            if (!myId) return alert("Identifiez-vous d'abord.");
            const res = await api.get(`/student/${myId}/history`);
            setPastSessions(res.data);
            setShowHistory(true);
        } catch (e) { alert("Erreur historique."); }
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
                setStep('join');
            }}
        />
    );

    return (
        <div className="student-join-page">
            <style>{`
                .student-join-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                    font-family: 'Montserrat', sans-serif;
                }
                .glass-card-container {
                    width: 100%;
                    max-width: 420px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    padding: 40px 30px;
                    border-radius: 30px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    text-align: center;
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .input-group {
                    position: relative;
                    margin-bottom: 20px;
                }
                .input-group svg {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #cbd5e1;
                }
                .main-input {
                    width: 100%;
                    padding: 15px 15px 15px 45px;
                    border-radius: 15px;
                    border: 2px solid #e2e8f0;
                    font-size: 16px;
                    outline: none;
                    box-sizing: border-box;
                    transition: 0.3s;
                }
                .main-input:focus { border-color: #6d28d9; }
                .pin-input {
                    text-align: center;
                    font-size: 32px;
                    letter-spacing: 10px;
                    font-weight: bold;
                    color: #6d28d9;
                    padding-left: 15px;
                }
                .primary-btn {
                    width: 100%;
                    padding: 16px;
                    background: #6d28d9;
                    color: white;
                    border: none;
                    border-radius: 15px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(109, 40, 217, 0.3);
                    transition: 0.3s;
                }
                .primary-btn:active { transform: scale(0.98); }
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 25px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    z-index: 3000;
                    animation: fadeInRight 0.5s;
                }
                .back-btn-float {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    padding: 10px 20px;
                    background: #1e1b4b;
                    color: white;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                }
                /* Mobile Fixes */
                @media (max-width: 480px) {
                    .glass-card-container { padding: 30px 20px; }
                    .pin-input { font-size: 24px; letter-spacing: 5px; }
                    h2 { font-size: 1.2rem; }
                }
            `}</style>

            <BackgroundSlideshow />
            
            {showToast && (
                <div className="toast-notification">
                    <FaCheckCircle color="#10b981" size={24} />
                    <div>
                        <b>Accès Autorisé</b>
                        <p style={{margin:0, fontSize:'12px'}}>Chargement de la session...</p>
                    </div>
                </div>
            )}

            <div className="glass-card-container">
                <img src="/logo.png" alt="Logo" style={{ width: '150px', marginBottom: '20px' }} />

                {step === 'login' ? (
                    <div className="fadeIn">
                        <h2 style={{color: '#1e1b4b'}}><FaEnvelope color="#6d28d9"/> Identification</h2>
                        <p style={{color:'#64748b', fontSize:'13px', marginBottom:'25px'}}>Saisissez votre email Moodle</p>
                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <FaEnvelope />
                                <input 
                                    className="main-input"
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nom@ecole.com"
                                    required 
                                />
                            </div>
                            {error && <p style={{color:'#ef4444', fontWeight:'bold', fontSize:'13px'}}>{error}</p>}
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? <FaSpinner className="spin"/> : "CONTINUER"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="fadeIn">
                        <div onClick={() => setStep('login')} style={{color:'#6d28d9', fontSize:'12px', cursor:'pointer', marginBottom:'15px'}}>
                            <FaArrowLeft /> Utiliser un autre compte
                        </div>
                        <h2 style={{color: '#1e1b4b'}}>{studentInfo?.firstname}, un cours t'attend !</h2>
                        <p style={{color:'#64748b', fontSize:'13px', marginBottom:'25px'}}>Saisis le code PIN à 6 chiffres</p>
                        <form onSubmit={handleJoin}>
                            <div className="input-group">
                                <FaKeyboard />
                                <input 
                                    className="main-input pin-input"
                                    type="text" 
                                    value={pin} 
                                    onChange={(e) => setPin(e.target.value.toUpperCase())}
                                    placeholder="000000"
                                    maxLength="6"
                                    required 
                                />
                            </div>
                            {error && <p style={{color:'#ef4444', fontWeight:'bold', fontSize:'13px'}}>{error}</p>}
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? <FaSpinner className="spin"/> : "REJOINDRE LE DIRECT"}
                            </button>
                        </form>
                    </div>
                )}

                <div onClick={loadHistory} style={{marginTop:'25px', color:'#64748b', fontSize:'13px', textDecoration:'underline', cursor:'pointer'}}>
                    <FaHistory /> Consulter mes archives XP
                </div>
            </div>

            {/* MODALE HISTORIQUE (Responsive) */}
            {showHistory && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:4000, display:'flex', justifyContent:'center', alignItems:'center', padding:'20px'}}>
                    <div className="glass-card-container" style={{maxHeight:'80vh', overflowY:'auto'}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                            <h3>Mon Historique</h3>
                            <FaTimes onClick={() => setShowHistory(false)} style={{cursor:'pointer'}}/>
                        </div>
                        {pastSessions.map(s => (
                            <div key={s.id} onClick={() => setSummaryPin(s.pin_code)} style={{padding:'15px', background:'#f8fafc', borderRadius:'15px', marginBottom:'10px', cursor:'pointer', textAlign:'left'}}>
                                <b>{s.title}</b><br/>
                                <small>{new Date(s.created_at).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentJoin;
