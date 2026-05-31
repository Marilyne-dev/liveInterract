import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const OpenQuestionStudent = ({ activity, onVote }) => {
    const [answer, setAnswer] = useState('');
    const [sent, setSent] = useState(false);

    // CORRECTIF : On remet à zéro pour une nouvelle question
    useEffect(() => {
        setAnswer('');
        setSent(false);
    }, [activity.id]);

    const handleSubmit = () => {
        if (!answer.trim()) return;
        onVote(answer);
        setSent(true);
    };

    if (sent) return (
        <div className="glass-card fadeIn" style={{padding:'40px', textAlign:'center'}}>
            <h3 style={{color:'#10b981'}}>Réponse envoyée avec succès !</h3>
        </div>
    );

    return (
        <div className="glass-card fadeIn" style={{padding:'30px'}}>
            <h2 style={{fontSize:'20px', marginBottom:'20px'}}>{activity.question}</h2>
            <textarea 
                style={{width:'100%', padding:'15px', borderRadius:'15px', border:'2px solid #e2e8f0', outline:'none', minHeight:'120px', marginBottom:'20px'}}
                placeholder="Tapez votre réponse ici..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
            />
            <button onClick={handleSubmit} style={{width:'100%', padding:'15px', backgroundColor:'#f59e0b', color:'white', border:'none', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}>
                <FaPaperPlane /> PARTAGER MON IDÉE
            </button>
        </div>
    );
};
export default OpenQuestionStudent;