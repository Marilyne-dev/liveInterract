import React from 'react';
import { FaStar } from 'react-icons/fa';

const ScaleDisplay = ({ activity, results, totalVotes }) => {
    // Calcul de la moyenne
    const sum = results.reduce((acc, curr) => acc + (parseInt(curr.name) * curr.votes), 0);
    const average = totalVotes > 0 ? (sum / totalVotes).toFixed(1) : 0;

    return (
        <div className="glass-card fadeIn" style={{padding:'40px', textAlign:'center'}}>
            <span style={{backgroundColor:'#f59e0b', color:'white', padding:'5px 15px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold'}}>ÉVALUATION EN DIRECT</span>
            <h2 style={{marginTop:'20px'}}>{activity.question}</h2>
            
            <div style={{fontSize: 'clamp(40px, 15vw, 80px)',color:'#f59e0b', margin:'20px 0'}}>
                {average} <small style={{fontSize:'0.3em', color:'#94a3b8'}}>/ 5</small>
            </div>

            <div style={{display:'flex', justifyContent:'center', gap:'5px'}}>
                {[1, 2, 3, 4, 5].map(num => (
                    <FaStar key={num} size={30} color={num <= Math.round(average) ? "#f59e0b" : "#e2e8f0"} />
                ))}
            </div>
            <p style={{marginTop:'20px', color:'#94a3b8'}}>{totalVotes} réponses reçues</p>
        </div>
    );
};
export default ScaleDisplay;