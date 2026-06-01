import React, { useState, useEffect } from 'react';
import api from './api';
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaGraduationCap, FaChalkboardTeacher, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

// --- SLIDESHOW INTÉGRÉ (partie gauche) ---
const SlideshowPanel = () => {
    const images = ["image1.jpg", "image9.jpg", "image3.jpg", "image4.jpg", "image8.jpg"];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={slideshowWrap}>
            {images.map((img, index) => (
                <div
                    key={index}
                    style={{
                        ...slideStyle,
                        backgroundImage: `url(${img})`,
                        opacity: index === currentIndex ? 1 : 0,
                    }}
                />
            ))}
            <div style={slideshowOverlay} />
            <div style={slideshowContent}>
                <img src="/logo.png" alt="Logo" style={{ width: '160px', marginBottom: '30px', filter: 'brightness(0) invert(1)' }} />
                <h1 style={slideshowTitle}>Apprenez.<br />Interagissez.<br />Progressez.</h1>
                <p style={slideshowSub}>La plateforme interactive qui transforme chaque cours en expérience vivante.</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
                    {images.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            style={{
                                width: i === currentIndex ? '28px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: i === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                                transition: 'all 0.4s ease',
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---
const AuthPage = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            onAuthSuccess(JSON.parse(savedUser));
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
            onAuthSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas');
        if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
            onAuthSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'student',  label: 'Étudiant',      icon: <FaGraduationCap /> },
        { value: 'teacher',  label: 'Enseignant',     icon: <FaChalkboardTeacher /> },
        { value: 'admin',    label: 'Admin',          icon: <FaShieldAlt /> },
    ];

    return (
        <div style={pageWrap}>
            <style>{`
                * { box-sizing: border-box; }
                .auth-input { transition: border-color 0.2s; }
                .auth-input:focus { border-color: #6d28d9 !important; outline: none; background: white !important; }
                .auth-tab-btn { transition: all 0.25s; }
                .role-card { transition: all 0.2s; }
                .role-card:hover { border-color: #6d28d9 !important; transform: translateY(-2px); }
                .auth-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(109,40,217,0.45) !important; }
                .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .eye-btn:hover { color: #6d28d9 !important; }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .form-anim { animation: fadeSlideUp 0.3s ease forwards; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin-icon { animation: spin 0.9s linear infinite; }
                @media (max-width: 768px) {
                    .auth-slideshow { display: none !important; }
                    .auth-form-panel { width: 100% !important; min-width: unset !important; }
                }
            `}</style>

            {/* GAUCHE : SLIDESHOW */}
            <div className="auth-slideshow" style={{ flex: 1, minHeight: '100vh' }}>
                <SlideshowPanel />
            </div>

            {/* DROITE : FORMULAIRE */}
            <div className="auth-form-panel" style={formPanel}>
                <div style={formInner}>

                    {/* TITRE */}
                    <div style={{ marginBottom: '28px' }}>
                        <h2 style={formTitle}>
                            {mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
                        </h2>
                        <p style={formSub}>
                            {mode === 'login'
                                ? 'Connectez-vous pour accéder à votre espace.'
                                : 'Rejoignez la plateforme en quelques secondes.'}
                        </p>
                    </div>

                    {/* ONGLETS */}
                    <div style={tabBar}>
                        <button className="auth-tab-btn" onClick={() => { setMode('login'); setError(''); }} style={mode === 'login' ? tabActive : tabInactive}>
                            Connexion
                        </button>
                        <button className="auth-tab-btn" onClick={() => { setMode('register'); setError(''); }} style={mode === 'register' ? tabActive : tabInactive}>
                            Inscription
                        </button>
                    </div>

                    {/* CONNEXION */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="form-anim" style={{ marginTop: '24px' }}>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Email</label>
                                <div style={inputWrap}>
                                    <FaEnvelope style={inputIcon} />
                                    <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" style={inputStyle} required />
                                </div>
                            </div>

                            <div style={fieldWrap}>
                                <label style={labelStyle}>Mot de passe</label>
                                <div style={inputWrap}>
                                    <FaLock style={inputIcon} />
                                    <input className="auth-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} required />
                                    <div className="eye-btn" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>

                            {error && <div style={errorBox}>{error}</div>}

                            <button type="submit" disabled={loading} className="auth-submit-btn" style={submitBtn}>
                                {loading ? <FaSpinner className="spin-icon" /> : 'SE CONNECTER'}
                            </button>
                        </form>
                    )}

                    {/* INSCRIPTION */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="form-anim" style={{ marginTop: '24px' }}>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Nom complet</label>
                                <div style={inputWrap}>
                                    <FaUser style={inputIcon} />
                                    <input className="auth-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" style={inputStyle} required />
                                </div>
                            </div>

                            <div style={fieldWrap}>
                                <label style={labelStyle}>Email</label>
                                <div style={inputWrap}>
                                    <FaEnvelope style={inputIcon} />
                                    <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" style={inputStyle} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ ...fieldWrap, flex: 1 }}>
                                    <label style={labelStyle}>Mot de passe</label>
                                    <div style={inputWrap}>
                                        <FaLock style={inputIcon} />
                                        <input className="auth-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 car." style={inputStyle} required />
                                        <div className="eye-btn" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ ...fieldWrap, flex: 1 }}>
                                    <label style={labelStyle}>Confirmer</label>
                                    <div style={inputWrap}>
                                        <FaLock style={inputIcon} />
                                        <input className="auth-input" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} required />
                                        <div className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} style={eyeBtn}>
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={fieldWrap}>
                                <label style={labelStyle}>Je suis...</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {roles.map(r => (
                                        <div key={r.value} className="role-card" onClick={() => setRole(r.value)} style={{
                                            flex: 1, padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                                            border: role === r.value ? '2px solid #6d28d9' : '2px solid #e2e8f0',
                                            backgroundColor: role === r.value ? 'rgba(109,40,217,0.06)' : 'white',
                                        }}>
                                            <div style={{ fontSize: '18px', color: role === r.value ? '#6d28d9' : '#94a3b8', marginBottom: '5px' }}>{r.icon}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: role === r.value ? '#6d28d9' : '#64748b' }}>{r.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && <div style={errorBox}>{error}</div>}

                            <button type="submit" disabled={loading} className="auth-submit-btn" style={submitBtn}>
                                {loading ? <FaSpinner className="spin-icon" /> : 'CRÉER MON COMPTE'}
                            </button>
                        </form>
                    )}

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
                        {mode === 'login' ? "Pas encore de compte ? " : "Déjà inscrit ? "}
                        <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                            style={{ color: '#6d28d9', fontWeight: 'bold', cursor: 'pointer' }}>
                            {mode === 'login' ? "S'inscrire" : "Se connecter"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ===================== STYLES =====================
const pageWrap = { display: 'flex', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", backgroundColor: '#f8fafc' };

const slideshowWrap = { position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' };
const slideStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 1.5s ease-in-out' };
const slideshowOverlay = { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(30,27,75,0.78) 0%, rgba(109,40,217,0.58) 100%)' };
const slideshowContent = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white' };
const slideshowTitle = { fontSize: '42px', fontWeight: '900', lineHeight: 1.2, margin: '0 0 16px 0', textShadow: '0 2px 12px rgba(0,0,0,0.3)' };
const slideshowSub = { fontSize: '16px', opacity: 0.85, maxWidth: '360px', lineHeight: 1.6, margin: 0 };

const formPanel = { width: '480px', minWidth: '480px', height: '100vh', overflowY: 'auto', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '-10px 0 40px rgba(0,0,0,0.08)' };
const formInner = { width: '100%', maxWidth: '380px', padding: '40px 20px' };
const formTitle = { fontSize: '26px', fontWeight: '800', color: '#1e1b4b', margin: '0 0 6px 0' };
const formSub = { fontSize: '14px', color: '#64748b', margin: 0 };

const tabBar = { display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '4px', gap: '4px' };
const tabActive = { flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#6d28d9', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };
const tabInactive = { flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' };

const fieldWrap = { marginBottom: '16px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputWrap = { position: 'relative' };
const inputIcon = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontSize: '13px', pointerEvents: 'none' };
const eyeBtn = { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s' };
const inputStyle = { width: '100%', padding: '13px 40px 13px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', backgroundColor: '#fafafa' };

const submitBtn = { width: '100%', padding: '15px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', marginTop: '8px', boxShadow: '0 8px 20px rgba(109,40,217,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' };
const errorBox = { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' };

export default AuthPage;
