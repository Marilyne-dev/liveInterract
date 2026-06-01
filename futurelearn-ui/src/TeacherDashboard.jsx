import React, { useState, useEffect } from 'react';
import api from './api'; 
import BackgroundSlideshow from './BackgroundSlideshow';
import LiveSessionControl from './components/LiveSessionControl';
import TeacherArchives from './components/TeacherArchives';

import { 
    FaPlus, FaCalendarAlt, FaShieldAlt, FaSpinner, 
    FaBook, FaClock, FaTrash, FaPlayCircle, FaCheckCircle, FaUserShield, FaHistory, FaPowerOff 
} from 'react-icons/fa';

const TeacherDashboard = (props) => {
    // --- ÉTATS ---
     const [teacher, setTeacher] = useState(null);
            const [activeTab, setActiveTab] = useState(() => localStorage.getItem('t_tab') || 'create');

        // Ajoute cet useEffect juste après pour sauvegarder l'onglet quand il change
        useEffect(() => {
            localStorage.setItem('t_tab', activeTab);
        }, [activeTab]);
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(''); 
    const [endTime, setEndTime] = useState('');     
    const [isPlanning, setIsPlanning] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mySessions, setMySessions] = useState([]);

    // --- 1. PERSISTANCE (RESTER DANS LA SESSION AU REFRESH) ---
     // --- 1. PERSISTANCE (RESTER CONNECTÉ AUTOMATIQUEMENT) ---
        useEffect(() => {
    // Priorité 1 : la prop user venant d'App.jsx (après login/register)
    if (props.user) {
        const t = {
            moodle_user_id: props.user.id,
            firstname: props.user.name,
            lastname: ''
        };
        setTeacher(t);
        localStorage.setItem('logged_teacher', JSON.stringify(t));
    } else {
        // Priorité 2 : localStorage (refresh de page)
        const savedTeacher = localStorage.getItem('logged_teacher');
        if (savedTeacher) setTeacher(JSON.parse(savedTeacher));
    }

    const savedSession = localStorage.getItem('active_session');
    if (savedSession) setSessionData(JSON.parse(savedSession));
}, []);

    const saveSession = (data) => {
        setSessionData(data);
        if (data) {
            localStorage.setItem('active_session', JSON.stringify(data));
        } else {
            localStorage.removeItem('active_session');
        }
    };

    // --- 2. GESTION DE L'AGENDA ---
    const fetchAgenda = async () => {
        if (!teacher) return; // Sécurité
        try {
            // On utilise l'ID Moodle dynamique
            const response = await api.get(`/teacher/${teacher.moodle_user_id}/sessions`);
            setMySessions(response.data);
        } catch (error) {
            console.error("Erreur chargement agenda");
        }
    };

    useEffect(() => {
        if (activeTab === 'agenda') fetchAgenda();
    }, [activeTab]);

    // --- CORRECTION CLÔTURE (Prévient les étudiants) ---
    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous supprimer cette session ? Tous les étudiants seront expulsés.")) {
            try {
                // On utilise la route DELETE qui déclenche l'événement SessionClosed dans Laravel
                await api.delete(`/sessions/${id}`);
                fetchAgenda();
                // Si la session supprimée était celle en cours, on nettoie le local
                const saved = JSON.parse(localStorage.getItem('active_session'));
                if (saved && saved.id === id) {
                    saveSession(null);
                }
            } catch (e) { alert("Erreur de suppression"); }
        }
    };

    // --- 3. CRÉATION / PLANIFICATION ---
   const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Transforme "HH:mm" ou "YYYY-MM-DDTHH:mm" en format ISO propre
    const formatToISO = (val) => {
        if (!val) return null;
        if (val.includes('T')) return val; // Déjà complet
        const today = new Date().toISOString().split('T')[0];
        return `${today}T${val}`; // Combine date du jour + heure
    };

    
    try {
        const payload = {
            title,
            started_at: isPlanning ? formatToISO(startTime) : null,
            expires_at: formatToISO(endTime),
            moodle_user_id: teacher.moodle_user_id // <-- Utilise l'ID du prof connecté
        };
        
        const response = await api.post('/sessions', payload);
        
        if (isPlanning) {
            alert("Session planifiée !");
            setActiveTab('agenda');
            setTitle(''); setStartTime(''); setEndTime(''); setIsPlanning(false);
        } else {
            saveSession(response.data);
        }
    } catch (error) {
            console.error("Détails erreur :", error.response?.data);
            alert("Erreur : " + (error.response?.data?.details || "Problème serveur"));
        } finally { setLoading(false); }
};

const closeActiveSession = async () => {
    if (!sessionData?.id) return;

    try {
        await api.delete(`/sessions/${sessionData.id}`);
    } catch (error) {
        console.error("Erreur cloture session active", error);
    }
};

const handleLogout = async () => {
    if(window.confirm("Voulez-vous vous déconnecter ?")) {
        await closeActiveSession();
        localStorage.removeItem('logged_teacher'); // On efface la mémoire
        localStorage.removeItem('active_session');
        setSessionData(null);
        setTeacher(null); // On remet l'état à zéro, l'écran de login reviendra
    }
};


// --- AJOUTE CE BLOC JUSTE AVANT LE "return (<> ... )" ---
if (!teacher) {
    return (
        <>
            <BackgroundSlideshow />
            <div style={centerFlex}>
                <div className="glass-card fadeIn" style={loginBoxStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                                <img src="/logo.png" alt="Logo" style={{ width: '300px' }} />
                    </div>
                    <h2 style={{color:'#1e1b4b', textAlign:'center'}}>Espace Enseignant</h2>
                    <p style={{fontSize:'13px', color:'#64748b', textAlign:'center', marginBottom:'30px'}}>
                        Identifiez-vous avec votre compte pour gérer vos sessions.
                    </p>
                    
                    <div style={inputGroup}>
                        <label style={labelStyle}>EMAIL</label>
                        <input type="email" id="t_email" placeholder="professeur@ecole.com" style={inputStyle} />
                    </div>

                    <button 
                        style={buttonStyle}
                        onClick={async () => {
                            const email = document.getElementById('t_email').value;
                            if(!email) return alert("Saisissez votre email");
                            try {
                                const res = await api.post('/teacher/login', { email });
                                localStorage.setItem('logged_teacher', JSON.stringify(res.data));
                                setTeacher(res.data);
                            } catch (e) {
                                alert("Compte introuvable");
                            }
                        }}
                    >
                        ACCÉDER À MON TABLEAU DE BORD
                    </button>
                </div>
            </div>
        </>
    );
}

// Le grand return (<> ... ) commence ici...



    return (
        <>
            <BackgroundSlideshow />
            <div className="teacher-dashboard-layout" style={{ display: 'flex', minHeight: '100vh', padding: '20px', gap: '20px', position: 'relative', zIndex: 1 }}>
                
                {/* --- SIDEBAR --- */}
        <div className="glass-card teacher-sidebar" style={sidebarStyle}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <img src="/logo.png" alt="Logo" style={{ width: '200px' }} />
                <h2 style={{ fontSize: '16px', color: '#6d28d9', fontWeight: 'bold', marginTop:'10px' }}>FUTURE LEARN</h2>
            </div>

            {/* NOUVEAU : BOUTON SESSION EN COURS (Toujours en premier si elle existe) */}
            {sessionData && (
                <div 
                    style={activeTab === 'live' ? navItemLiveActive : navItemLive} 
                    onClick={() => setActiveTab('live')}
                >
                    <span className="pulse-red"></span>
                    <FaPlayCircle style={{marginRight: '12px'}}/> Session en cours
                </div>
            )}

            {/* On enlève le setSessionData(null) de tous les onClick suivants */}
            <div 
                style={activeTab === 'create' ? navItemActive : navItem} 
                onClick={() => setActiveTab('create')}
            >
                <FaPlus style={{marginRight: '12px'}}/> Créer Session
            </div>
            
            <div 
                style={activeTab === 'agenda' ? navItemActive : navItem} 
                onClick={() => setActiveTab('agenda')}
            >
                <FaCalendarAlt style={{marginRight: '12px'}}/> Mon Agenda
            </div>
            
            <div 
                style={activeTab === 'permissions' ? navItemActive : navItem} 
                onClick={() => setActiveTab('permissions')}
            >
                <FaShieldAlt style={{marginRight: '12px'}}/> Mes Permissions
            </div>

            <div 
                style={activeTab === 'archives' ? navItemActive : navItem} 
                onClick={() => setActiveTab('archives')}
            >
                <FaHistory style={{marginRight: '12px'}}/> Mes Sessions
            </div>

            <div style={{marginTop: 'auto'}}> 
                <div style={navItem} onClick={handleLogout}>
                    <FaPowerOff style={{marginRight: '12px', color:'#ef4444'}}/> Déconnexion
                </div>
            </div>
        </div>

               {/* --- ZONE DE CONTENU --- */}
                    <div className="teacher-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>

                            {/* NOUVEAU : VUE LIVE (S'affiche si l'onglet est 'live' et qu'il y a une session) */}
                            {activeTab === 'live' && sessionData && (
                                <LiveSessionControl 
                                    session={sessionData} 
                                    onQuit={() => {
                                        saveSession(null);
                                        setActiveTab('create'); // Revient à l'écran de création quand on ferme la session
                                    }} 
                                />
                            )}

                            {/* ONGLET 1 : CRÉATION (Modifié pour basculer sur 'live' après création) */}
                            {activeTab === 'create' && (
                                <div style={centerFlex}>
                                    <div className="glass-card teacher-form-card" style={{ width: '100%', maxWidth: '650px', padding: '50px' }}>
                                        <h2 style={{ textAlign: 'center', marginBottom: '35px', color: '#1e1b4b' }}>
                                            {isPlanning ? "Programmer un cours" : "Lancer une session interactive"}
                                        </h2>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            await handleCreateSession(e);
                                            if (!isPlanning) setActiveTab('live'); // Bascule sur l'onglet Live si on ouvre la salle directement
                                        }}>
                                            <div style={inputGroup}>
                                                <label style={labelStyle}><FaBook /> TITRE DE LA LEÇON</label>
                                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Ex: Algorithmique L1..." required />
                                            </div>

                                            <div style={planningBox}>
                                                <input type="checkbox" id="p" checked={isPlanning} onChange={() => setIsPlanning(!isPlanning)} style={{width:'18px', height:'18px'}} />
                                                <label htmlFor="p" style={{fontWeight:'bold', color:'#6d28d9', cursor:'pointer'}}>Planifier pour une autre heure/date ?</label>
                                            </div>

                                            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={labelStyle}><FaClock /> DEBUT PRÉVU</label>
                                                    <input 
                                                        type={isPlanning ? "datetime-local" : "time"} 
                                                        value={startTime} 
                                                        onChange={(e) => setStartTime(e.target.value)} 
                                                        style={inputStyle} 
                                                        disabled={!isPlanning} 
                                                        placeholder="Maintenant"
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={labelStyle}><FaClock /> HEURE DE FIN</label>
                                                    <input 
                                                        type={isPlanning ? "datetime-local" : "time"} 
                                                        value={endTime} 
                                                        onChange={(e) => setEndTime(e.target.value)} 
                                                        style={inputStyle} 
                                                        required 
                                                    />
                                                </div>
                                            </div>

                                            <button type="submit" disabled={loading} style={buttonStyle}>
                                                {loading ? <FaSpinner className="spin" /> : (isPlanning ? "AJOUTER À L'AGENDA" : "OUVRIR LA SALLE DIRECTEMENT")}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* ONGLET 2 : AGENDA (Modifié pour basculer sur 'live' quand on lance) */}
                            {activeTab === 'agenda' && (
                                <div className="glass-card" style={{ padding: '40px', minHeight: '500px' }}>
                                    <h2 style={{color: '#6d28d9', marginBottom: '30px', display:'flex', alignItems:'center', gap:'15px'}}>
                                        <FaCalendarAlt /> Mes cours programmés
                                    </h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                                        {mySessions.length > 0 ? mySessions.map(s => (
                                            <div key={s.id} className="glass-card" style={{ padding: '25px', backgroundColor: 'white' }}>
                                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                                    <h3 style={{margin: 0, fontSize:'16px'}}>{s.title}</h3>
                                                    <span style={s.scheduled_at ? badgePlanned : badgeLive}>
                                                        {s.scheduled_at ? 'PLANIFIÉ' : 'DIRECT'}
                                                    </span>
                                                </div>
                                                <p style={{fontSize: '12px', color: '#64748b', marginTop:'15px'}}>Code PIN : <b style={{color:'#6d28d9'}}>{s.pin_code}</b></p>
                                                <p style={{fontSize: '13px', color: '#1e1b4b', fontWeight:'500'}}>
                                                    {s.scheduled_at ? `📅 ${new Date(s.scheduled_at).toLocaleString()}` : `⏱️ Créé le ${new Date(s.created_at).toLocaleDateString()}`}
                                                </p>
                                                <div style={{display:'flex', justifyContent:'space-between', marginTop:'25px', alignItems:'center'}}>
                                                    <button 
                                                        style={startBtnAgenda} 
                                                        onClick={() => {
                                                            saveSession(s);
                                                            setActiveTab('live'); // Bascule sur l'onglet Live après avoir cliqué sur Lancer
                                                        }}
                                                    >
                                                        <FaPlayCircle /> LANCER
                                                    </button>
                                                    <FaTrash color="#ef4444" style={{cursor:'pointer', opacity:0.7}} onClick={() => handleDelete(s.id)} />
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'100px'}}>
                                                <FaCalendarAlt size={50} style={{opacity:0.1}}/>
                                                <p style={{color:'#64748b'}}>Votre agenda est vide.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ONGLET 3 : PERMISSIONS */}
                            {activeTab === 'permissions' && (
                                <div style={centerFlex}>
                                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '50px' }}>
                                        <h2 style={{color: '#6d28d9', marginBottom: '30px'}}><FaUserShield /> Paramètres de Contrôle</h2>
                                        <div style={permRow}>
                                            <span>Activer le chat (Questions & Communauté)</span>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <div style={permRow}>
                                            <span>Afficher les résultats aux étudiants</span>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <p style={{fontSize:'12px', color:'#64748b', marginTop:'30px', textAlign:'center'}}>
                                            * Ces réglages s'appliquent à toutes vos futures sessions.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ONGLET 4 : ARCHIVES */}
                            {activeTab === 'archives' && (
                                <div className="fadeIn" style={{padding:'20px'}}>
                                    <TeacherArchives teacherId={teacher.moodle_user_id} />
                                </div>
                            )}
                        </div>
                    </div>
            </div>
        </>
    );
};

// --- STYLES ---
const sidebarStyle = { width: '280px', padding: '30px', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.7)' };
const navItem = { padding: '15px 20px', borderRadius: '15px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', marginBottom: '10px', transition: '0.3s', fontWeight:'500' };
const navItemActive = { ...navItem, backgroundColor: '#6d28d9', color: 'white', fontWeight: 'bold', boxShadow:'0 10px 20px rgba(109, 40, 217, 0.2)' };
const centerFlex = { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const inputGroup = { marginBottom: '25px' };
const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform:'uppercase' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white', fontSize:'15px' };
const buttonStyle = { width: '100%', padding: '18px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize:'16px', boxShadow:'0 10px 20px rgba(109, 40, 217, 0.3)' };
const planningBox = { marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: 'rgba(109, 40, 217, 0.05)', borderRadius: '15px', fontSize: '14px' };
const startBtnAgenda = { backgroundColor: '#6d28d9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px' };
const badgeLive = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' };
const badgePlanned = { backgroundColor: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' };
const permRow = { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontWeight: '500', color:'#1e1b4b' };


const loginBoxStyle = { 
    width: '100%', 
    maxWidth: '400px', 
    padding: '40px', 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: '30px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
};

const navItemLive = { 
    ...navItem, 
    color: '#ef4444', 
    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
    border: '1px solid rgba(239, 68, 68, 0.1)',
    marginTop: '10px' 
};

const navItemLiveActive = { 
    ...navItemLive, 
    backgroundColor: '#ef4444', 
    color: 'white', 
    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' 
};

export default TeacherDashboard;

