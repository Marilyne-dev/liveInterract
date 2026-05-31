import React from 'react';
import { FaUsers, FaCheckCircle } from 'react-icons/fa';

const OpenQuestionDisplay = ({ activity, results, participantCount }) => {
    // Tes couleurs et ton design restent identiques
    const colors = ['#fef2f2', '#f0fdf4', '#eff6ff', '#fffbeb', '#faf5ff'];
    
    // Calcul du compteur (Réponses reçues / Total connectés)
    const count = results.length;
    const total = participantCount || 0;
    const percentage = total > 0 ? Math.min(Math.round((count / total) * 100), 100) : 0;

    return (
        <div className="glass-card fadeIn" style={{padding:'40px', backgroundColor:'white', borderRadius:'24px', textAlign:'center'}}>
            
            {/* --- LE COMPTEUR QUE TU AS DEMANDÉ (VIOLET) --- */}
            <div style={participationBox}>
                <div style={statsRow}>
                    <span style={statItem}><FaUsers color="#6d28d9" /> {total} Étudiants</span>
                    <span style={statItem}><FaCheckCircle color="#10b981" /> {count} Réponses</span>
                </div>
                <div style={progressBg}>
                    <div style={{...progressFill, width: `${percentage}%`}}></div>
                </div>
                <p style={percentageText}>{count} sur {total} ont terminé ({percentage}%)</p>
            </div>

            <h2 style={{color:'#1e1b4b', marginBottom:'30px'}}>{activity.question}</h2>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'20px'}}>
                {results.map((r, i) => (
                    <div key={i} className="bounceIn" style={{
                        padding:'20px', borderRadius:'15px', backgroundColor: colors[i % colors.length],
                        boxShadow:'0 4px 10px rgba(0,0,0,0.05)', textAlign:'left', border:'1px solid rgba(0,0,0,0.02)'
                    }}>
                        <p style={{margin:0, fontSize:'14px', fontWeight:'600', color:'#1e1b4b'}}>{r.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles pour le compteur
const participationBox = { marginBottom: '30px', padding: '15px', backgroundColor: '#f5f3ff', borderRadius: '15px', border: '1px solid #ddd6fe' };
const statsRow = { display: 'flex', justifyContent: 'space-around', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#1e1b4b' };
const statItem = { display: 'flex', alignItems: 'center', gap: '8px' };
const progressBg = { width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' };
const progressFill = { height: '100%', backgroundColor: '#6d28d9', transition: 'width 0.5s ease-out' };
const percentageText = { margin: '5px 0 0 0', fontSize: '11px', color: '#6d28d9', fontWeight: 'bold' };

export default OpenQuestionDisplay;