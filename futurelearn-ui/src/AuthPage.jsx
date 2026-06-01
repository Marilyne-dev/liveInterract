import React, { useState, useEffect } from 'react';
import api from './api';
import {
    FaUser, FaEnvelope, FaLock, FaSpinner, FaGraduationCap,
    FaChalkboardTeacher, FaShieldAlt, FaEye, FaEyeSlash, FaCheckCircle,
    FaUserGraduate, FaBook, FaTerminal
} from 'react-icons/fa';

// ─── CONSTANTES ADMIN (identifiants fixes) ───────────────────────────────────
const ADMIN_EMAIL    = 'marilyneaniambossou@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// ─── SLIDESHOW (inchangé) ────────────────────────────────────────────────────
const SlideshowPanel = ({ overlay }) => {
    const images = ['image1.jpg', 'image9.jpg', 'image3.jpg', 'image4.jpg', 'image8.jpg'];
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setCurrentIndex(p => (p + 1) % images.length), 5000);
        return () => clearInterval(t);
    }, []);
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            {images.map((img, i) => (
                <div key={i} style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: i === currentIndex ? 1 : 0, transition: 'opacity 1.5s ease-in-out'
                }} />
            ))}
            <div style={{ position: 'absolute', inset: 0, background: overlay }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '160px', marginBottom: '30px', filter: 'brightness(0) invert(1)' }} />
                <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.2, margin: '0 0 16px 0' }}>
                    Apprenez.<br />Interagissez.<br />Progressez.
                </h1>
                <p style={{ fontSize: '16px', opacity: 0.85, maxWidth: '360px', lineHeight: 1.6 }}>
                    La plateforme interactive qui transforme chaque cours en expérience vivante.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
                    {images.map((_, i) => (
                        <div key={i} onClick={() => setCurrentIndex(i)} style={{
                            width: i === currentIndex ? '28px' : '8px', height: '8px',
                            borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: i === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
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

    // Reset du formulaire quand on change de rôle
    const switchRole = (r) => {
        setRole(r);
        setMode('login');
        setError('');
        setSuccessMsg('');
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    };

    // ── Sauvegarde locale + redirection ──────────────────────────────────────
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

    // ── Connexion admin (100% frontend, identifiants fixes) ──────────────────
    const handleAdminLogin = (e) => {
        e.preventDefault();
        setError('');
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            setSuccessMsg('Accès autorisé. Chargement...');
            setTimeout(() => {
                persistAndRedirect({ id: 0, name: 'Administrateur', email: ADMIN_EMAIL, role: 'admin' });
            }, 1000);
        } else {
            setError('Identifiants administrateur invalides.');
        }
    };

    // ── Connexion normale (étudiant / professeur) ─────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            const res = await api.post('/auth/login', { email, password });
            persistAndRedirect(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
        } finally { setLoading(false); }
    };

    // ── Inscription (étudiant / professeur) ───────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg('');
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
                    student_id: 'STU-' + res.data.user.id,
                    firstname: res.data.user.name,
                    email: res.data.user.email
                }));
            }
            setSuccessMsg('Compte créé ! Redirection...');
            setTimeout(() => onAuthSuccess(res.data.user), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
        } finally { setLoading(false); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDU selon le rôle
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                .auth-input:focus { border-color: var(--ac) !important; outline: none; background: white !important; }
                .auth-submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
                .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .auth-submit-btn { transition: all 0.2s; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                .form-anim { animation: fadeUp 0.3s ease forwards; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin-icon { animation: spin 0.9s linear infinite; }
                @keyframes pop { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
                .success-banner { animation: pop 0.4s ease forwards; }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
                .cursor-blink { animation: blink 1s step-end infinite; }
                .role-selector-btn { transition: all 0.2s; cursor: pointer; }
                .role-selector-btn:hover { transform: translateY(-2px); }
                @media (max-width: 768px) {
                    .auth-slideshow { display: none !important; }
                    .auth-form-panel { width: 100% !important; min-width: unset !important; }
                }
            `}</style>

            {/* ── Sélecteur de rôle (toujours visible en bas du panneau gauche) ── */}

            {/* ══════════════════════════════════════════════════════════════════
                RÔLE : ÉTUDIANT
            ══════════════════════════════════════════════════════════════════ */}
            {role === 'student' && (
                <>
                    <div className="auth-slideshow" style={{ flex: 1, minHeight: '100vh' }}>
                        <SlideshowPanel overlay="linear-gradient(135deg, rgba(30,27,75,0.78) 0%, rgba(109,40,217,0.58) 100%)" />
                    </div>
                    <div className="auth-form-panel" style={{ width: '480px', minWidth: '480px', height: '100vh', overflowY: 'auto', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '-10px 0 40px rgba(0,0,0,0.08)' }}>
                        <div style={{ width: '100%', maxWidth: '380px', padding: '32px 20px' }}>

                            {/* Icône + titre */}
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: 'rgba(109,40,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <FaUserGraduate size={28} color="#6d28d9" />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e1b4b', margin: '0 0 6px' }}>
                                    {mode === 'login' ? 'Espace Étudiant' : 'Créer mon compte'}
                                </h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                    {mode === 'login' ? 'Connectez-vous pour rejoindre vos cours.' : 'Inscrivez-vous gratuitement en quelques secondes.'}
                                </p>
                            </div>

                            {/* Onglets */}
                            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '4px' }}>
                                {['login', 'register'].map(m => (
                                    <button key={m} onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                                        style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                                            backgroundColor: mode === m ? '#6d28d9' : 'transparent',
                                            color: mode === m ? 'white' : '#64748b' }}>
                                        {m === 'login' ? 'Connexion' : 'Inscription'}
                                    </button>
                                ))}
                            </div>

                            {successMsg && <div className="success-banner" style={sBox}><FaCheckCircle /><span>{successMsg}</span></div>}

                            {/* FORMULAIRE LOGIN */}
                            {mode === 'login' && (
                                <form onSubmit={handleLogin} className="form-anim" style={{ marginTop: '20px' }}>
                                    <Field label="Email" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="etudiant@email.com" accent="#6d28d9" />
                                    <PasswordField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} accent="#6d28d9" />
                                    {error && <div style={eBox}>{error}</div>}
                                    <SubmitBtn loading={loading} label="ACCÉDER À MES COURS" color="#6d28d9" />
                                </form>
                            )}

                            {/* FORMULAIRE REGISTER */}
                            {mode === 'register' && (
                                <form onSubmit={handleRegister} className="form-anim" style={{ marginTop: '20px' }}>
                                    <Field label="Nom complet" icon={<FaUser />} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" accent="#6d28d9" />
                                    <Field label="Email" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="etudiant@email.com" accent="#6d28d9" />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <PasswordField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} accent="#6d28d9" flex={1} />
                                        <PasswordField label="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} accent="#6d28d9" flex={1} />
                                    </div>
                                    {error && <div style={eBox}>{error}</div>}
                                    <SubmitBtn loading={loading} label="CRÉER MON COMPTE" color="#6d28d9" />
                                </form>
                            )}

                            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
                                {mode === 'login' ? "Pas encore de compte ? " : "Déjà inscrit ? "}
                                <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }}
                                    style={{ color: '#6d28d9', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {mode === 'login' ? "S'inscrire" : "Se connecter"}
                                </span>
                            </p>

                            <RoleSwitcher current={role} onSwitch={switchRole} />
                        </div>
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                RÔLE : PROFESSEUR
            ══════════════════════════════════════════════════════════════════ */}
            {role === 'teacher' && (
                <>
                    <div className="auth-slideshow" style={{ flex: 1, minHeight: '100vh' }}>
                        <SlideshowPanel overlay="linear-gradient(135deg, rgba(6,78,59,0.82) 0%, rgba(16,185,129,0.55) 100%)" />
                    </div>
                    <div className="auth-form-panel" style={{ width: '480px', minWidth: '480px', height: '100vh', overflowY: 'auto', backgroundColor: '#f8fffe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '-10px 0 40px rgba(0,0,0,0.08)', borderLeft: '3px solid #10b981' }}>
                        <div style={{ width: '100%', maxWidth: '380px', padding: '32px 20px' }}>

                            {/* Badge institutionnel */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', padding: '16px', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FaChalkboardTeacher size={24} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Espace Enseignant</div>
                                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#064e3b', marginTop: '2px' }}>
                                        {mode === 'login' ? 'Bon retour 👋' : 'Rejoindre la plateforme'}
                                    </div>
                                </div>
                            </div>

                            {/* Onglets */}
                            <div style={{ display: 'flex', backgroundColor: '#ecfdf5', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '4px' }}>
                                {['login', 'register'].map(m => (
                                    <button key={m} onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                                        style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                                            backgroundColor: mode === m ? '#10b981' : 'transparent',
                                            color: mode === m ? 'white' : '#6b7280' }}>
                                        {m === 'login' ? 'Connexion' : 'Inscription'}
                                    </button>
                                ))}
                            </div>

                            {successMsg && <div className="success-banner" style={{ ...sBox, backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#6ee7b7' }}><FaCheckCircle /><span>{successMsg}</span></div>}

                            {mode === 'login' && (
                                <form onSubmit={handleLogin} className="form-anim" style={{ marginTop: '20px' }}>
                                    <Field label="Email professionnel" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professeur@ecole.com" accent="#10b981" />
                                    <PasswordField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} accent="#10b981" />
                                    {error && <div style={eBox}>{error}</div>}
                                    <SubmitBtn loading={loading} label="ACCÉDER À MON TABLEAU DE BORD" color="#10b981" />
                                </form>
                            )}

                            {mode === 'register' && (
                                <form onSubmit={handleRegister} className="form-anim" style={{ marginTop: '20px' }}>
                                    <Field label="Nom complet" icon={<FaUser />} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Prénom Nom" accent="#10b981" />
                                    <Field label="Email professionnel" icon={<FaEnvelope />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="professeur@ecole.com" accent="#10b981" />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <PasswordField label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} toggle={() => setShowPassword(!showPassword)} accent="#10b981" flex={1} />
                                        <PasswordField label="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} accent="#10b981" flex={1} />
                                    </div>
                                    {error && <div style={eBox}>{error}</div>}
                                    <SubmitBtn loading={loading} label="CRÉER MON COMPTE ENSEIGNANT" color="#10b981" />
                                </form>
                            )}

                            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
                                {mode === 'login' ? "Pas encore inscrit ? " : "Déjà inscrit ? "}
                                <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }}
                                    style={{ color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {mode === 'login' ? "Créer un compte" : "Se connecter"}
                                </span>
                            </p>

                            <RoleSwitcher current={role} onSwitch={switchRole} />
                        </div>
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                RÔLE : ADMINISTRATEUR — design sombre, accès restreint
            ══════════════════════════════════════════════════════════════════ */}
            {role === 'admin' && (
                <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

                    {/* Grille décorative en arrière-plan */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

                    {/* Halo violet */}
                    <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', width: '100%', maxWidth: '440px', padding: '20px' }}>

                        {/* En-tête */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '6px 16px', marginBottom: '20px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} className="cursor-blink" />
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', letterSpacing: '2px', textTransform: 'uppercase' }}>Accès Restreint</span>
                            </div>
                            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <FaShieldAlt size={30} color="white" />
                            </div>
                            <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Panneau Admin</h2>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Authentification requise pour continuer</p>
                        </div>

                        {/* Carte formulaire */}
                        <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', padding: '32px' }}>

                            {/* Terminal prompt décoratif */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '10px 14px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <FaTerminal size={12} color="#6366f1" />
                                <span style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>admin@futurelearn ~ $</span>
                                <span className="cursor-blink" style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>_</span>
                            </div>

                            {successMsg && (
                                <div className="success-banner" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
                                    <FaCheckCircle /><span>{successMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleAdminLogin} className="form-anim">
                                {/* Email */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Identifiant</label>
                                    <div style={{ position: 'relative' }}>
                                        <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: '13px' }} />
                                        <input
                                            className="auth-input"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="admin@..."
                                            required
                                            style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', backgroundColor: '#0f172a', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                {/* Mot de passe */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Clé d'accès</label>
                                    <div style={{ position: 'relative' }}>
                                        <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: '13px' }} />
                                        <input
                                            className="auth-input"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            required
                                            style={{ width: '100%', padding: '13px 40px 13px 40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', backgroundColor: '#0f172a', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                        <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', cursor: 'pointer' }}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="auth-submit-btn" style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <FaShieldAlt /> AUTHENTIFICATION SÉCURISÉE
                                </button>
                            </form>
                        </div>

                        {/* Avertissement */}
                        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#334155' }}>
                            Accès réservé aux administrateurs système autorisés.
                        </p>

                        <RoleSwitcher current={role} onSwitch={switchRole} dark />
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── COMPOSANTS RÉUTILISABLES ────────────────────────────────────────────────

const Field = ({ label, icon, type, value, onChange, placeholder, accent, flex }) => (
    <div style={{ marginBottom: '16px', flex }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontSize: '13px', pointerEvents: 'none' }}>{icon}</span>
            <input className="auth-input" type={type} value={value} onChange={onChange} placeholder={placeholder} required
                style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px', border: `1.5px solid #e2e8f0`, fontSize: '14px', backgroundColor: '#fafafa', transition: 'border-color 0.2s', boxSizing: 'border-box', '--ac': accent }} />
        </div>
    </div>
);

const PasswordField = ({ label, value, onChange, show, toggle, accent, flex }) => (
    <div style={{ marginBottom: '16px', flex }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontSize: '13px', pointerEvents: 'none' }} />
            <input className="auth-input" type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" required
                style={{ width: '100%', padding: '13px 40px 13px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', backgroundColor: '#fafafa', transition: 'border-color 0.2s', boxSizing: 'border-box', '--ac': accent }} />
            <div onClick={toggle} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>
                {show ? <FaEyeSlash /> : <FaEye />}
            </div>
        </div>
    </div>
);

const SubmitBtn = ({ loading, label, color }) => (
    <button type="submit" disabled={loading} className="auth-submit-btn"
        style={{ width: '100%', padding: '15px', backgroundColor: color, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        {loading ? <FaSpinner className="spin-icon" /> : label}
    </button>
);

// ─── SÉLECTEUR DE RÔLE (commun aux 3 pages) ──────────────────────────────────
const RoleSwitcher = ({ current, onSwitch, dark }) => {
    const roles = [
        { value: 'student', label: 'Étudiant',    icon: <FaGraduationCap />,   color: '#6d28d9' },
        { value: 'teacher', label: 'Enseignant',  icon: <FaChalkboardTeacher />, color: '#10b981' },
        { value: 'admin',   label: 'Admin',       icon: <FaShieldAlt />,        color: '#6366f1' },
    ];
    return (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9'}` }}>
            <p style={{ textAlign: 'center', fontSize: '11px', color: dark ? '#475569' : '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                Changer de profil
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {roles.map(r => (
                    <div key={r.value} className="role-selector-btn" onClick={() => onSwitch(r.value)}
                        style={{ flex: 1, padding: '10px 6px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                            border: current === r.value ? `2px solid ${r.color}` : `2px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
                            backgroundColor: current === r.value ? `${r.color}15` : 'transparent' }}>
                        <div style={{ fontSize: '16px', color: current === r.value ? r.color : (dark ? '#475569' : '#94a3b8'), marginBottom: '4px' }}>{r.icon}</div>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: current === r.value ? r.color : (dark ? '#475569' : '#94a3b8'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── STYLES PARTAGÉS ─────────────────────────────────────────────────────────
const eBox = { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' };
const sBox = { backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontWeight: '600', marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' };

export default AuthPage;
