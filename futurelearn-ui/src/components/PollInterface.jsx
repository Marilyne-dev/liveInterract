import React, { useState } from 'react';
import api from '../api';
import { FaCheckCircle, FaPaperPlane, FaStar } from 'react-icons/fa';

const PollInterface = ({ activity, studentId }) => {
    const [voted, setVoted] = useState(false);
    const [textAnswer, setTextAnswer] = useState('');
     const [textInput, setTextInput] = useState('');


    const handleVote = async (answer) => {
        try {
            await api.post(`/activities/${activity.id}/vote`, {
                student_id: studentId,
                answer: answer,
                pin_code: activity.pin_code
            });
            setVoted(true);
        } catch (e) { alert("Erreur lors de l'envoi"); }
    };

    if (activity.type === 'wordcloud' || activity.type === 'open') {
        return (
            <div className="glass-card">
                <h2>{activity.question}</h2>
                <input 
                    style={inputStyle} 
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Votre réponse..." 
                />
                <button onClick={() => handleVote(textInput)} style={optBtn}>ENVOYER</button>
            </div>
        );
    }

    if (voted) return (
        <div className="glass-card fadeIn" style={cardVoted}>
            <FaCheckCircle size={40} color="#10b981" />
            <p>Réponse envoyée avec succès !</p>
        </div>
    );

    // --- RENDU DYNAMIQUE SELON LE TYPE ---
    switch (activity.type) {
        case 'poll': // QCM Classique
            return (
                <div className="glass-card fadeIn" style={card}>
                    <h2 style={titleStyle}>{activity.question}</h2>
                    <div style={optionsGrid}>
                        {activity.options.map((opt, i) => (
                            <button key={i} onClick={() => handleVote(opt)} style={optBtn}>{opt}</button>
                        ))}
                    </div>
                </div>
            );

        case 'wordcloud': // Nuage de mots
        case 'open':      // Question ouverte
            return (
                <div className="glass-card fadeIn" style={card}>
                    <h2 style={titleStyle}>{activity.question}</h2>
                    <p style={{fontSize:'12px', color:'#94a3b8', marginBottom:'15px'}}>
                        {activity.type === 'wordcloud' ? 'Répondez par un seul mot' : 'Écrivez votre réponse ci-dessous'}
                    </p>
                    <input 
                        style={inputStyle}
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="Tapez ici..."
                    />
                    <button 
                        onClick={() => handleVote(textAnswer)} 
                        style={submitBtn}
                        disabled={!textAnswer.trim()}
                    >
                        <FaPaperPlane /> ENVOYER
                    </button>
                </div>
            );

        case 'scale': // Échelle 1 à 5
            return (
                <div className="glass-card fadeIn" style={card}>
                    <h2 style={titleStyle}>{activity.question}</h2>
                    <div style={{display:'flex', justifyContent:'center', gap:'15px', marginTop:'20px'}}>
                        {[1, 2, 3, 4, 5].map(num => (
                            <button key={num} onClick={() => handleVote(num)} style={starBtn}>
                                {num} <FaStar color="#f59e0b" />
                            </button>
                        ))}
                    </div>
                </div>
            );

        default:
            return <div className="glass-card">Activité en cours de préparation...</div>;
    }
};

// Styles rapides pour les nouveaux éléments
const card = { padding: '30px', textAlign: 'center', backgroundColor: 'white', borderRadius: '20px' };
const cardVoted = { ...card, padding: '50px' };
const titleStyle = { color:'#1e1b4b', marginBottom:'20px' };
const optionsGrid = { display: 'flex', flexDirection: 'column', gap: '10px' };
const optBtn = { padding: '15px', borderRadius: '12px', border: '2px solid #6d28d9', backgroundColor: 'white', color: '#6d28d9', fontWeight: 'bold', cursor: 'pointer' };
const inputStyle = { width:'100%', padding:'15px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'15px', outline:'none' };
const submitBtn = { width:'100%', padding:'12px', backgroundColor:'#6d28d9', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer' };
const starBtn = { padding:'10px 15px', borderRadius:'10px', border:'1px solid #ddd', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold' };

export default PollInterface;