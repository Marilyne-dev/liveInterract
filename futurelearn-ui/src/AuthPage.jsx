import React, { useState, useEffect } from 'react';
import api from './api';
import {
    FaUser, FaEnvelope, FaLock, FaSpinner, FaGraduationCap,
    FaChalkboardTeacher, FaShieldAlt, FaEye, FaEyeSlash, FaCheckCircle,
    FaUserGraduate, FaTerminal
} from 'react-icons/fa';

// ─── IDENTIFIANTS ADMIN FIXES ────────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// ─── SLIDESHOW ───────────────────────────────────────────────────────────────
const SlideshowPanel = ({ overlay }) => {
    const images = ['image1.jpg', 'image9.jpg', 'image3.jpg', 'image4.jpg', 'image8.jpg'];
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setIdx(p => (p + 1) % images.length), 5000);
        return () => clearInterval(t);
    }, []);
    // Si overlay est null/false → image naturelle, texte sombre en bas
    const hasOverlay = !!overlay;
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            {images.map((img, i) => (
                <div key={i} style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: i === idx ? 1 : 0, transition: 'opacity 1.5s ease-in-out'
                }} />
            ))}
            {/* Overlay coloré uniquement si demandé */}
            {hasOverlay && <div style={{ position: 'absolute', inset: 0, background: overlay }} />}
            {/* Voile blanc transparent simple pour le prof */}
            {!hasOverlay && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.35)' }} />}

            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: hasOverlay ? 'white' : '#1e1b4b' }}>
                {/* Logo bien agrandi */}
                <img src="/logo.png" alt="Logo" style={{ width: '400px', marginBottom: '45px', maxWidth: '90%', filter: hasOverlay ? 'brightness(0) invert(1)' : 'none' }} />
                <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.2, margin: '0 0 16px 0' }}>
                    Apprenez.<br />Interagissez.<br />Progressez.
                </h1>
                <p style={{ fontSize: '16px', opacity: 0.85, maxWidth: '360px', lineHeight: 1.6 }}>
                    La plateforme interactive qui transforme chaque cours en expérience vivante.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
                    {images.map((_, i) => (
                        <div key={i} onClick={() => setIdx(i)} style={{
                            width: i === idx ? '28px' : '8px', height: '8px', borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: i === idx ? (hasOverlay ? 'white' : '#6d28d9') : (hasOverlay ? 'rgba(255,255,255,0.4)' : 'rgba(109,40,217,0.3)'),
                            transition: 'all 0.4s ease'
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
const AuthPage = ({ onAuthSuccess }) => {
    const [role,            setRole]            = useState('student');
    const [mode,            setMode]            = useState('login');
    const [name,            setName]            = useState('');
    const [email,           setEmail]           = useState('');
    const [password,        setPassword]        = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading,         setLoading]         = useState(false);
    const [error,           setError]           = useState('');
    const [successMsg,      setSuccessMsg]      = useState('');
    const [showPassword,    setShowPassword]    = useState(false);
    const [showConfirm,     setShowConfirm]     = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('auth_user');
        if (saved) onAuthSuccess(JSON.parse(saved));
    }, []);

    const switchRole = (r) => {
        setRole(r); setMode('login'); setError(''); setSuccessMsg('');
        setEmail(''); setPassword(''); setName(''); setConfirmPassword('');
    };

    const persistAndRedirect = (user) => {
        localStorage.setItem('auth_user', JSON.stringify(user));
        if (user.role === 'teacher') {
            localStorage.setItem('logged_teacher', JSON.stringify({
                moodle_user_id: user.id, firstname: user.name, lastname: ''
            }));
        }
        if (user.role === 'student') {
            localStorage.setItem('my_student_id', 'STU-' + user.id);
            localStorage.setItem('student_data', JSON.stringify({
                student_id: 'STU-' + user.id, firstname: user.name, email: user.email
            }));
        }
        onAuthSuccess(user);
    };

    const handleAdminLogin = (e) => {
        e.preventDefault(); setError('');
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            setSuccessMsg('Accès autorisé. Chargement...');
            setTimeout(() => persistAndRedirect({ id: 0, name: 'Administrateur', email: ADMIN_EMAIL, role: 'admin' }), 1000);
        } else {
            setError('Identifiants administrateur invalides.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true); setError(''); setSuccessMsg('');
        try {
            const res = await api.post('/auth/login', { email, password });
            persistAndRedirect(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
        } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); setError(''); setSuccessMsg('');
        if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas');
        if (password.length < 6) return setError('Minimum 6 caractères requis');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
            if (res.data.user.role === 'teacher') {
                localStorage.setItem('logged_teacher', JSON.stringify({
                    moodle_user_id: res.data.user.id, firstname: res.data.user.name, lastname: ''
                }));
            }
            if (res.data.user.role === 'student') {
                localStorage.setItem('my_student_id', 'STU-' + res.data.user.id);
                localStorage.setItem('student_data', JSON.stringify({
                    student_id: 'STU-' + res.data.user.id, firstname: res.data.user.name, email: res.data.user.email
                }));
            }
            setSuccessMsg('Compte créé ! Redirection...');
            setTimeout(() => onAuthSuccess(res.data.user), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                .ai:focus { outline: none; border-color: var(--ac, #6d28d9) !important; background: white !important; }
                .ai-dark:focus { outline: none; border-color: #6366f1 !important; }
                .sb:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
                .sb:disabled { opacity: 0.6; cursor: not-allowed; }
                .sb { transition: all 0.2s; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                .fa { animation: fadeUp 0.3s ease forwards; }
                @keyframes spin { to{transform:rotate(360deg)} }
                .si { animation: spin 0.9s linear infinite; }
                @keyframes pop { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
                .sp { animation: pop 0.4s ease forwards; }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
                .bl { animation: blink 1s step-end infinite; }
                .rs:hover { transform: translateY(-2px); transition: all 0.2s; }
                @media(max-width:768px){ .sl{display:none!important} .fp{width:100%!important;min-width:unset!important} }
            `}</style>

            {/* ══ ÉTUDIANT — violet standard #6d28d9 ══════════════════════════ */}
            {role === 'student' && <>
                <div className="sl" style={{ flex: 1 }}>
                    <SlideshowPanel overlay="linear-gradient(135deg,rgba(30,27,75,0.78) 0%,rgba(109,40,217,0.58) 100%)" />
                </div>
                <div className="fp" style={panel('#ffffff', '#6d28d9')}>
                    <div style={inner}>
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={iconBox('#6d28d9', 'rgba(109,40,217,0.1)')}>
                                <FaUserGraduate size={26} color="#6d28d9" />
                            </div>
                            <h2 style={title('#1e1b4b')}>{mode === 'login' ? 'Espace Étudiant' : 'Créer mon compte'}</h2>
                            <p style={sub}>{mode === 'login' ? 'Connectez-vous pour rejoindre vos cours.' : 'Inscrivez-vous gratuitement.'}</p>
                        </div>

                        <Tabs mode={mode} setMode={setMode} setError={setError} setSuccessMsg={setSuccessMsg} accent="#6d28d9" bg="#f1f5f9" />
                        {successMsg && <Success msg={successMsg} />}

                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="fa" style={{ marginTop: '20px' }}>
                                <Field label="Email" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="etudiant@email.com" accent="#6d28d9" />
                                <PwdField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} accent="#6d28d9" />
                                {error && <Err msg={error} />}
                                <Btn loading={loading} label="ACCÉDER À MES COURS" color="#6d28d9" />
                            </form>
                        )}
                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="fa" style={{ marginTop: '20px' }}>
                                <Field label="Nom complet" icon={<FaUser />} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" accent="#6d28d9" />
                                <Field label="Email" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="etudiant@email.com" accent="#6d28d9" />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <PwdField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} accent="#6d28d9" flex={1} />
                                    <PwdField label="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} accent="#6d28d9" flex={1} />
                                </div>
                                {error && <Err msg={error} />}
                                <Btn loading={loading} label="CRÉER MON COMPTE" color="#6d28d9" />
                            </form>
                        )}

                        <Switch mode={mode} setMode={setMode} setError={setError} setSuccessMsg={setSuccessMsg} color="#6d28d9" />
                        <RoleSwitcher current={role} onSwitch={switchRole} />
                    </div>
                </div>
            </>}

            {/* ══ ENSEIGNANT — violet foncé #3b0764 / #4c1d95 ════════════════ */}
            {role === 'teacher' && <>
                <div className="sl" style={{ flex: 1 }}>
                    <SlideshowPanel overlay={null} />
                </div>
                <div className="fp" style={{ ...panel('#2d1b69', '#7c3aed'), backgroundColor: '#2d1b69', borderLeft: '3px solid #a78bfa' }}>
                    <div style={inner}>
                        {/* Badge institutionnel */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', padding: '16px', backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: '16px', border: '1px solid rgba(167,139,250,0.35)' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#4c1d95,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FaChalkboardTeacher size={22} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Espace Enseignant</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginTop: '3px' }}>
                                    {mode === 'login' ? 'Bon retour 👋' : 'Rejoindre la plateforme'}
                                </div>
                            </div>
                        </div>

                        {/* Onglets version sombre */}
                        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '4px' }}>
                            {['login', 'register'].map(m => (
                                <button key={m} onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                                    style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                                        backgroundColor: mode === m ? '#7c3aed' : 'transparent',
                                        color: mode === m ? 'white' : '#94a3b8' }}>
                                    {m === 'login' ? 'Connexion' : 'Inscription'}
                                </button>
                            ))}
                        </div>

                        {successMsg && <div className="sp" style={{ display:'flex',alignItems:'center',gap:'10px',backgroundColor:'rgba(124,58,237,0.15)',color:'#c4b5fd',border:'1px solid rgba(124,58,237,0.3)',borderRadius:'10px',padding:'12px 14px',fontSize:'13px',fontWeight:'600',marginTop:'16px',marginBottom:'8px' }}><FaCheckCircle />{successMsg}</div>}

                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="fa" style={{ marginTop: '20px' }}>
                                <DarkField label="Email professionnel" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professeur@ecole.com" />
                                <DarkPwdField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                                {error && <div style={darkErr}>{error}</div>}
                                <button type="submit" disabled={loading} className="sb"
                                    style={{ width:'100%',padding:'15px',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',border:'none',borderRadius:'12px',fontWeight:'800',fontSize:'14px',cursor:'pointer',marginTop:'8px',display:'flex',justifyContent:'center',alignItems:'center',gap:'8px' }}>
                                    {loading ? <FaSpinner className="si" /> : 'ACCÉDER À MON TABLEAU DE BORD'}
                                </button>
                            </form>
                        )}
                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="fa" style={{ marginTop: '20px' }}>
                                <DarkField label="Nom complet" icon={<FaUser />} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Prénom Nom" />
                                <DarkField label="Email professionnel" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professeur@ecole.com" />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <DarkPwdField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} flex={1} />
                                    <DarkPwdField label="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} flex={1} />
                                </div>
                                {error && <div style={darkErr}>{error}</div>}
                                <button type="submit" disabled={loading} className="sb"
                                    style={{ width:'100%',padding:'15px',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',border:'none',borderRadius:'12px',fontWeight:'800',fontSize:'14px',cursor:'pointer',marginTop:'8px',display:'flex',justifyContent:'center',alignItems:'center',gap:'8px' }}>
                                    {loading ? <FaSpinner className="si" /> : 'CRÉER MON COMPTE ENSEIGNANT'}
                                </button>
                            </form>
                        )}

                        <p style={{ textAlign:'center',marginTop:'20px',fontSize:'13px',color:'#64748b' }}>
                            {mode === 'login' ? 'Pas encore inscrit ? ' : 'Déjà inscrit ? '}
                            <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }}
                                style={{ color:'#a78bfa',fontWeight:'bold',cursor:'pointer' }}>
                                {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
                            </span>
                        </p>
                        <RoleSwitcher current={role} onSwitch={switchRole} dark />
                    </div>
                </div>
            </>}

            {/* ══ ADMIN — slideshow gauche + formulaire sombre droite ══════════ */}
            {role === 'admin' && <>
                {/* Slideshow à GAUCHE */}
                <div className="sl" style={{ flex: 1 }}>
                    <SlideshowPanel overlay="linear-gradient(135deg,rgba(10,5,30,0.85) 0%,rgba(99,102,241,0.5) 100%)" />
                </div>

                {/* Formulaire sombre à DROITE */}
                <div className="fp" style={{ width: '480px', minWidth: '480px', height: '100vh', overflowY: 'auto', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

                    {/* Grille décorative */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
                    {/* Halo */}
                    <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '250px', background: 'radial-gradient(ellipse,rgba(99,102,241,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', width: '100%', maxWidth: '380px', padding: '32px 24px' }}>

                        {/* En-tête admin */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '5px 14px', marginBottom: '18px' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} className="bl" />
                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#ef4444', letterSpacing: '2px', textTransform: 'uppercase' }}>Accès Restreint</span>
                            </div>
                            <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <FaShieldAlt size={28} color="white" />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Panneau Admin</h2>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Authentification requise pour continuer</p>
                        </div>

                        {/* Carte formulaire */}
                        <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', padding: '28px' }}>

                            {/* Terminal prompt */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', padding: '10px 14px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <FaTerminal size={12} color="#6366f1" />
                                <span style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>admin@futurelearn ~ $</span>
                                <span className="bl" style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>_</span>
                            </div>

                            {successMsg && <div className="sp" style={{ display:'flex',alignItems:'center',gap:'10px',backgroundColor:'rgba(16,185,129,0.1)',color:'#10b981',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'12px 14px',fontSize:'13px',fontWeight:'600',marginBottom:'18px' }}><FaCheckCircle />{successMsg}</div>}

                            <form onSubmit={handleAdminLogin} className="fa">
                                <DarkField label="Identifiant" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@..." />
                                <DarkPwdField label="Clé d'accès" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                                {error && <div style={{ backgroundColor:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',fontWeight:'600',marginBottom:'14px' }}>{error}</div>}
                                <button type="submit" className="sb"
                                    style={{ width:'100%',padding:'15px',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'white',border:'none',borderRadius:'12px',fontWeight:'800',fontSize:'14px',cursor:'pointer',letterSpacing:'0.5px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px' }}>
                                    <FaShieldAlt /> AUTHENTIFICATION SÉCURISÉE
                                </button>
                            </form>
                        </div>

                        <p style={{ textAlign:'center',marginTop:'16px',fontSize:'11px',color:'#334155' }}>
                            Accès réservé aux administrateurs système autorisés.
                        </p>
                        <RoleSwitcher current={role} onSwitch={switchRole} dark />
                    </div>
                </div>
            </>}
        </div>
    );
};

// ─── COMPOSANTS RÉUTILISABLES (thème clair) ──────────────────────────────────
const panel = (bg, accent) => ({ width:'480px', minWidth:'480px', height:'100vh', overflowY:'auto', backgroundColor: bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'-10px 0 40px rgba(0,0,0,0.08)' });
const inner = { width:'100%', maxWidth:'380px', padding:'32px 20px' };
const iconBox = (color, bg) => ({ width:'64px', height:'64px', borderRadius:'20px', backgroundColor: bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' });
const title  = (color) => ({ fontSize:'24px', fontWeight:'800', color, margin:'0 0 6px' });
const sub    = { fontSize:'13px', color:'#64748b', margin:0 };
const darkErr = { backgroundColor:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', fontWeight:'600', marginBottom:'14px' };

const Tabs = ({ mode, setMode, setError, setSuccessMsg, accent, bg }) => (
    <div style={{ display:'flex', backgroundColor: bg, borderRadius:'12px', padding:'4px', gap:'4px', marginBottom:'4px' }}>
        {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                style={{ flex:1, padding:'11px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'14px',
                    backgroundColor: mode === m ? accent : 'transparent', color: mode === m ? 'white' : '#64748b' }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
        ))}
    </div>
);

const Success = ({ msg }) => (
    <div className="sp" style={{ display:'flex', alignItems:'center', gap:'10px', backgroundColor:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'12px 14px', fontSize:'13px', fontWeight:'600', marginTop:'14px', marginBottom:'6px' }}>
        <FaCheckCircle />{msg}
    </div>
);

const Err = ({ msg }) => (
    <div style={{ backgroundColor:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', fontWeight:'600', marginBottom:'12px' }}>{msg}</div>
);

const Switch = ({ mode, setMode, setError, setSuccessMsg, color }) => (
    <p style={{ textAlign:'center', marginTop:'18px', fontSize:'13px', color:'#94a3b8' }}>
        {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
        <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }}
            style={{ color, fontWeight:'bold', cursor:'pointer' }}>
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
        </span>
    </p>
);

const Field = ({ label, icon, type, value, onChange, placeholder, accent, flex }) => (
    <div style={{ marginBottom:'16px', flex }}>
        <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>
        <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#cbd5e1', fontSize:'13px', pointerEvents:'none' }}>{icon}</span>
            <input className="ai" type={type} value={value} onChange={onChange} placeholder={placeholder} required
                style={{ '--ac': accent, width:'100%', padding:'13px 14px 13px 40px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontSize:'14px', backgroundColor:'#fafafa', transition:'border-color 0.2s', boxSizing:'border-box' }} />
        </div>
    </div>
);

const PwdField = ({ label, value, onChange, show, toggle, accent, flex }) => (
    <div style={{ marginBottom:'16px', flex }}>
        <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>
        <div style={{ position:'relative' }}>
            <FaLock style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#cbd5e1', fontSize:'13px', pointerEvents:'none' }} />
            <input className="ai" type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" required
                style={{ '--ac': accent, width:'100%', padding:'13px 40px 13px 40px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontSize:'14px', backgroundColor:'#fafafa', transition:'border-color 0.2s', boxSizing:'border-box' }} />
            <div onClick={toggle} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', cursor:'pointer' }}>
                {show ? <FaEyeSlash /> : <FaEye />}
            </div>
        </div>
    </div>
);

const Btn = ({ loading, label, color }) => (
    <button type="submit" disabled={loading} className="sb"
        style={{ width:'100%', padding:'15px', backgroundColor: color, color:'white', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'14px', cursor:'pointer', marginTop:'8px', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px' }}>
        {loading ? <FaSpinner className="si" /> : label}
    </button>
);

// Versions sombres des champs (pour prof et admin)
const DarkField = ({ label, icon, type, value, onChange, placeholder, flex }) => (
    <div style={{ marginBottom:'16px', flex }}>
        <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#94a3b8', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</label>
        <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#6366f1', fontSize:'13px', pointerEvents:'none' }}>{icon}</span>
            <input className="ai-dark" type={type} value={value} onChange={onChange} placeholder={placeholder} required
                style={{ width:'100%', padding:'13px 14px 13px 40px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.18)', fontSize:'14px', backgroundColor:'rgba(255,255,255,0.1)', color:'white', transition:'border-color 0.2s', boxSizing:'border-box' }} />
        </div>
    </div>
);

const DarkPwdField = ({ label, value, onChange, show, toggle, flex }) => (
    <div style={{ marginBottom:'16px', flex }}>
        <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#94a3b8', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</label>
        <div style={{ position:'relative' }}>
            <FaLock style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#6366f1', fontSize:'13px', pointerEvents:'none' }} />
            <input className="ai-dark" type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" required
                style={{ width:'100%', padding:'13px 40px 13px 40px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.18)', fontSize:'14px', backgroundColor:'rgba(255,255,255,0.1)', color:'white', transition:'border-color 0.2s', boxSizing:'border-box' }} />
            <div onClick={toggle} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'#6366f1', cursor:'pointer' }}>
                {show ? <FaEyeSlash /> : <FaEye />}
            </div>
        </div>
    </div>
);

// ─── SÉLECTEUR DE RÔLE ───────────────────────────────────────────────────────
const RoleSwitcher = ({ current, onSwitch, dark }) => {
    const roles = [
        { value: 'student', label: 'Étudiant',   icon: <FaGraduationCap />,    color: '#6d28d9' },
        { value: 'teacher', label: 'Enseignant', icon: <FaChalkboardTeacher />, color: '#7c3aed' },
        { value: 'admin',   label: 'Admin',      icon: <FaShieldAlt />,         color: '#6366f1' },
    ];
    const border  = dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9';
    const subText = dark ? '#475569' : '#94a3b8';
    return (
        <div style={{ marginTop:'26px', paddingTop:'18px', borderTop:`1px solid ${border}` }}>
            <p style={{ textAlign:'center', fontSize:'11px', color: subText, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'700' }}>
                Changer de profil
            </p>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
                {roles.map(r => (
                    <div key={r.value} className="rs" onClick={() => onSwitch(r.value)}
                        style={{ flex:1, padding:'10px 6px', borderRadius:'12px', textAlign:'center', cursor:'pointer',
                            border: current === r.value ? `2px solid ${r.color}` : `2px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
                            backgroundColor: current === r.value ? `${r.color}18` : 'transparent' }}>
                        <div style={{ fontSize:'16px', color: current === r.value ? r.color : subText, marginBottom:'4px' }}>{r.icon}</div>
                        <div style={{ fontSize:'10px', fontWeight:'700', color: current === r.value ? r.color : subText, textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuthPage;
