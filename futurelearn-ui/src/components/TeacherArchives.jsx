import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaHistory, FaRobot, FaLightbulb, FaTrash } from 'react-icons/fa';
import StudentSummary from './StudentSummary'; 

const TeacherArchives = ({ teacherId }) => {
    const [sessions, setSessions] = useState([]);
    const [selectedPin, setSelectedPin] = useState(null);
    const[aiTips, setAiTips] = useState([]);

    useEffect(() => {
        loadArchives();
    }, [teacherId]);

    const loadArchives = () => {
        api.get(`/teacher/${teacherId}/history`).then(res => setSessions(res.data));
    };

    const viewArchive = async (pin) => {
        setSelectedPin(pin);
        const res = await api.get(`/sessions/${pin}/ai-insights`);
        setAiTips(res.data);
    };

    // SUPPRIMER LA SESSION
    const handleDeleteSession = async (e, id) => {
        e.stopPropagation(); // Empêche de cliquer sur la carte en même temps
        if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette session de vos archives ?")) {
            try {
                await api.delete(`/sessions/${id}`);
                loadArchives(); // Recharge la liste
            } catch(e) { alert("Erreur lors de la suppression"); }
        }
    };

    if (selectedPin) {
        return (
            <div className="fadeIn">
                <button onClick={() => setSelectedPin(null)} style={btnBack}>← Retour à la liste</button>
                
                <div style={aiBox}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#6d28d9', marginBottom:'15px'}}>
                        <FaRobot size={24} /> <h3>Analyse Pédagogique IA</h3>
                    </div>
                    {aiTips.length > 0 ? aiTips.map((tip, i) => (
                        <div key={i} style={tipRow}><FaLightbulb color="#f59e0b" /> {tip}</div>
                    )) : <p style={{color:'#94a3b8', fontSize:'13px'}}>Rien à signaler pour cette session.</p>}
                </div>

                <StudentSummary pinCode={selectedPin} />
            </div>
        );
    }

    return (
        <div className="glass-card" style={{padding:'30px'}}>
            <h2 style={{color:'#6d28d9'}}><FaHistory /> Historique de vos sessions</h2>
            <div style={listGrid}>
                {sessions.map(s => (
                    <div key={s.id} style={archiveCard} onClick={() => viewArchive(s.pin_code)}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                            <div>
                                <b style={{fontSize:'16px', color:'#1e1b4b'}}>{s.title}</b>
                                <div style={{fontSize:'12px', color:'#94a3b8', marginTop:'5px'}}>{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                            {/* BOUTON SUPPRIMER */}
                            <button onClick={(e) => handleDeleteSession(e, s.id)} style={btnTrash} title="Supprimer l'archive">
                                <FaTrash />
                            </button>
                        </div>
                        <div style={badgeReview}>CONSULTER L'ARCHIVE</div>
                    </div>
                ))}
                {sessions.length === 0 && <p style={{color:'#cbd5e1'}}>Aucune archive disponible.</p>}
            </div>
        </div>
    );
};

// --- STYLES ---
const aiBox = { backgroundColor:'#f5f3ff', padding:'25px', borderRadius:'20px', border:'1px solid #ddd6fe', marginBottom:'30px' };
const tipRow = { display:'flex', gap:'10px', padding:'10px', backgroundColor:'white', borderRadius:'10px', marginBottom:'10px', fontSize:'14px', fontWeight:'500', color:'#1e1b4b' };
const archiveCard = { padding:'20px', backgroundColor:'white', borderRadius:'15px', cursor:'pointer', border:'1px solid #e2e8f0', transition:'0.3s', boxShadow:'0 4px 10px rgba(0,0,0,0.02)' };
const badgeReview = { marginTop:'20px', fontSize:'11px', fontWeight:'bold', color:'#6d28d9', backgroundColor:'rgba(109,40,217,0.1)', display:'inline-block', padding:'5px 10px', borderRadius:'8px' };
const btnBack = { padding:'12px 25px', border:'none', backgroundColor:'#1e1b4b', color:'white', borderRadius:'12px', cursor:'pointer', marginBottom:'20px', fontWeight:'bold' };
const listGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px', marginTop:'20px' };
const btnTrash = { background:'none', border:'none', color:'#ef4444', cursor:'pointer', opacity:0.5, transition:'0.2s', padding:'5px' };

export default TeacherArchives;