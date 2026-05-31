import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

const ScaleStudent = ({ activity, onVote }) => {
    const [rating, setRating] = useState(0);
    const[sent, setSent] = useState(false);

    // CORRECTIF : On remet à zéro pour le prochain vote
    useEffect(() => {
        setRating(0);
        setSent(false);
    },[activity.id]);

    const handleHover = (val) => { if(!sent) setRating(val); };

    const submit = (val) => {
        setRating(val);
        setSent(true);
        onVote(val);
    };

    if (sent) return (
        <div className="glass-card fadeIn" style={{padding:'40px', textAlign:'center'}}>
            <h2 style={{color:'#f59e0b'}}>{rating} / 5</h2>
            <p>Votre avis a été pris en compte !</p>
        </div>
    );

    return (
        <div className="glass-card fadeIn" style={{padding:'30px', textAlign:'center'}}>
            <h2>{activity.question}</h2>
            <div style={{display:'flex', justifyContent:'center', gap:'10px', margin:'30px 0'}}>
                {[1, 2, 3, 4, 5].map(num => (
                    <FaStar 
                        key={num}
                        size={45}
                        color={num <= rating ? "#f59e0b" : "#e2e8f0"}
                        style={{cursor:'pointer', transition:'0.2s'}}
                        onMouseEnter={() => handleHover(num)}
                        onClick={() => submit(num)}
                    />
                ))}
            </div>
            <p style={{color:'#94a3b8'}}>Cliquez sur une étoile pour voter</p>
        </div>
    );
};
export default ScaleStudent;