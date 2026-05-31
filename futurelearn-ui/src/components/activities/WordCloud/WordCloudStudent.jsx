import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaCloud } from 'react-icons/fa';

const WordCloudStudent = ({ activity, onVote }) => {
    const [word, setWord] = useState('');
    const [hasSent, setHasSent] = useState(false);

    // CORRECTIF : On remet à zéro quand le prof lance un NOUVEAU nuage de mots
    useEffect(() => {
        setWord('');
        setHasSent(false);
    }, [activity.id]);

    const submit = () => {
        const cleanWord = word.trim().toLowerCase();
        if (!cleanWord) return;
        onVote(cleanWord);
        setHasSent(true);
    };

    if (hasSent) return (
        <div className="glass-card fadeIn" style={{padding:'40px', textAlign:'center'}}>
            <FaCloud size={50} color="#10b981" className="pulse-slow" />
            <h3 style={{marginTop:'20px'}}>Mot envoyé !</h3>
            <p style={{color:'#94a3b8'}}>Regardez l'écran du professeur pour voir le nuage évoluer.</p>
        </div>
    );

    return (
        <div className="glass-card fadeIn" style={card}>
            <h2 style={{fontSize:'22px', marginBottom:'20px'}}>{activity.question}</h2>
            <input 
                style={input} 
                placeholder="Tapez un mot ici..." 
                value={word}
                maxLength={20}
                onChange={(e) => setWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submit()}
            />
            <button onClick={submit} style={btnSend} disabled={!word.trim()}>
                <FaPaperPlane /> ENVOYER
            </button>
        </div>
    );
};

const card = { padding: '30px', textAlign: 'center' };
const input = { width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' };
const btnSend = { width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'10px' };

export default WordCloudStudent;