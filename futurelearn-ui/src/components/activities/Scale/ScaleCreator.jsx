import React, { useState } from 'react';
import { FaStar, FaPlay } from 'react-icons/fa';

const ScaleCreator = ({ onLaunch }) => {
    const [question, setQuestion] = useState('');

    const launch = () => {
        if (!question.trim()) return alert("Posez une question");
        onLaunch({ type: 'scale', question, options: ['1', '2', '3', '4', '5'] });
    };

    return (
        <div className="glass-card fadeIn" style={{padding:'30px', textAlign:'center'}}>
            <div style={{color:'#f59e0b', marginBottom:'15px'}}><FaStar size={40} /></div>
            <h2>Nouvelle Évaluation (1 à 5)</h2>
            <input 
                style={inputStyle} 
                placeholder="Ex: Avez-vous compris cette notion ?" 
                onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={launch} style={btnLaunch}><FaPlay /> LANCER L'ÉVALUATION</button>
        </div>
    );
};
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', marginBottom: '20px' };
const btnLaunch = { width: '100%', padding: '15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
export default ScaleCreator;