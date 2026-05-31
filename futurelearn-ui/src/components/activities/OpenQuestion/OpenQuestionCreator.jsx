import React, { useState } from 'react';
import { FaEdit, FaPlay } from 'react-icons/fa';

const OpenQuestionCreator = ({ onLaunch }) => {
    const [question, setQuestion] = useState('');

    const launch = () => {
        if (!question.trim()) return alert("Posez votre question !");
        onLaunch({ type: 'open_question', question, options: null });
    };

    return (
        <div className="glass-card fadeIn" style={card}>
            <div style={iconHeader}><FaEdit size={30} color="#f59e0b" /></div>
            <h2 style={{color: '#1e1b4b'}}>Question Ouverte</h2>
            <p style={{color: '#94a3b8', fontSize: '13px', marginBottom: '25px'}}>
                Idéal pour récolter des avis, des définitions ou des réflexions libres.
            </p>
            <input 
                style={input} 
                placeholder="Ex: Que retenez-vous de la séance d'aujourd'hui ?" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={launch} style={btnLaunch}><FaPlay /> LANCER LA RÉFLEXION</button>
        </div>
    );
};

const card = { padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px' };
const iconHeader = { width: '60px', height: '60px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' };
const input = { width: '100%', padding: '18px', borderRadius: '15px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '16px', marginBottom: '25px' };
const btnLaunch = { width: '100%', padding: '15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };

export default OpenQuestionCreator;