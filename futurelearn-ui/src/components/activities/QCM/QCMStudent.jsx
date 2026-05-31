import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaHourglassHalf, FaInfoCircle } from 'react-icons/fa';

const QCMStudent = ({ activity, onVote, studentId }) => {
    const [selected, setSelected] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    

    // Si l'activité change (nouvelle question), on réinitialise
    useEffect(() => {
        setSelected(null); setHasVoted(false);
    }, [activity.id]);

    const handleVote = (option) => {
        if (hasVoted) return;
        setSelected(option);
        setHasVoted(true);
        onVote(option);
    };

    if (!hasVoted) {
        return (
            <div className="glass-card fadeIn" style={container}>
                <h2 style={questionStyle}>{activity.question}</h2>
                <div style={optionsGrid}>
                    {activity.options.map((opt, i) => (
                        <button key={i} onClick={() => handleVote(opt)} style={optionBtn}>{opt}</button>
                    ))}
                </div>
            </div>
        );
    }

    if (hasVoted && activity.status === 'open') {
        return (
            <div className="glass-card fadeIn" style={containerCenter}>
                <div className="loader-dots"></div>
                <h3>Réponse enregistrée !</h3>
                <p style={{color:'#94a3b8'}}>Attendez la correction pour vos XP...</p>
            </div>
        );
    }

    // --- CORRECTION ET FEEDBACK CHIC ---
   // --- ÉTAPE : COMPARAISON ---
    const isCorrect = String(selected).trim().toLowerCase() === String(activity.correct_answer).trim().toLowerCase();

    return (
        <div className="glass-card fadeIn" style={{...containerCenter, borderTop: `8px solid ${isCorrect ? '#10b981' : '#ef4444'}`, minHeight: '350px'}}>
            {isCorrect ? (
                <div style={{position:'relative'}}>
                    {/* LE BADGE XP QUI FLOTTE */}
                    <div className="xp-badge-anim">+100 XP</div>
                    
                    <div style={iconCircleSuccess} className="bounceIn"><FaCheck size={30} /></div>
                    <h2 className="bravo-text" style={{fontSize:'35px'}}>EXCELLENT !</h2>
                    <p style={{fontSize:'18px', fontWeight:'600'}}>Vous maîtrisez ce concept.</p>
                </div>
            ) : (
                <div className="shake">
                    <div style={iconCircleError}><FaTimes size={30} /></div>
                    <h2 style={{color:'#ef4444', fontWeight:'900'}}>ZÉRO XP...</h2>
                    <p>Dommage, ce n'est pas la bonne réponse.</p>
                    <div style={correctBox}>
                        <small>LA RÉPONSE ÉTAIT :</small>
                        <div style={{fontSize:'22px', fontWeight:'bold'}}>{activity.correct_answer}</div>
                    </div>
                    <p style={{fontSize:'12px', color:'#94a3b8', marginTop:'15px'}}>Concentrez-vous pour la prochaine question !</p>
                </div>
            )}
        </div>
    );
};

// --- STYLES (Design Jolie & Responsive) ---
const container = { padding: '30px', textAlign: 'left', minHeight: '300px' };
const containerCenter = { padding: '40px', textAlign: 'center' };
const badgeQCM = { display:'inline-block', backgroundColor:'rgba(109,40,217,0.1)', color:'#6d28d9', padding:'4px 12px', borderRadius:'20px', fontSize:'10px', fontWeight:'bold', marginBottom:'15px' };
const questionStyle = { color: '#1e1b4b', marginBottom: '10px', fontSize: '22px', lineHeight: '1.3' };
const instruction = { color: '#94a3b8', fontSize: '13px', marginBottom: '25px' };
const optionsGrid = { display: 'flex', flexDirection: 'column', gap: '12px' };
const optionBtn = { padding: '18px', borderRadius: '15px', border: '2px solid #e2e8f0', backgroundColor: 'white', color: '#1e1b4b', fontWeight: '600', cursor: 'pointer', textAlign: 'left', fontSize: '16px', transition: '0.2s' };
const myVoteBox = { marginTop: '30px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const correctBox = { marginTop: '20px', padding: '15px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '12px' };
const iconCircleSuccess = { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' };
const iconCircleError = { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' };

export default QCMStudent;