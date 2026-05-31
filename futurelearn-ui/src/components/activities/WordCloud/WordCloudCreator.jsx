import React, { useState } from 'react';
import { FaCloud, FaPlay } from 'react-icons/fa';

const WordCloudCreator = ({ onLaunch }) => {
    const [question, setQuestion] = useState('');

    const launch = () => {
        if (!question.trim()) return alert("Veuillez poser une question");
        // On envoie type 'wordcloud' et options null car c'est du texte libre
        onLaunch({ type: 'wordcloud', question, options: null });
    };

    return (
        <div className="glass-card fadeIn" style={card}>
            <div style={iconHeader}><FaCloud size={30} color="#10b981" /></div>
            <h2 style={{color: '#1e1b4b', marginBottom: '10px'}}>Nouveau Nuage de Mots</h2>
            <p style={{color: '#94a3b8', fontSize: '13px', marginBottom: '25px'}}>
                Les étudiants répondent par un mot, et les plus cités s'affichent en gros.
            </p>

            <div style={inputGroup}>
                <label style={labelStyle}>VOTRE QUESTION</label>
                <input 
                    style={input} 
                    placeholder="Ex: Un mot pour définir ce cours ?" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
            </div>

            <button onClick={launch} style={btnLaunch}>
                <FaPlay /> LANCER LE NUAGE EN DIRECT
            </button>
        </div>
    );
};

const card = { padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px' };
const iconHeader = { width: '60px', height: '60px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' };
const inputGroup = { textAlign: 'left', marginBottom: '30px' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginLeft: '5px' };
const input = { width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '16px', marginTop: '8px' };
const btnLaunch = { width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };

export default WordCloudCreator;