import React from 'react';
import { FaListUl, FaCloud, FaCommentDots, FaStar, FaQuestionCircle } from 'react-icons/fa';

const activities = [
    { id: 'qcm', name: 'QCM', icon: <FaListUl />, color: '#6d28d9', desc: 'Évaluer avec une bonne réponse' },
    { id: 'wordcloud', name: 'Nuage de mots', icon: <FaCloud />, color: '#10b981', desc: 'Brainstorming collectif' },
    { id: 'open', name: 'Question Ouverte', icon: <FaCommentDots />, color: '#f59e0b', desc: 'Réponses libres' },
    { id: 'scale', name: 'Échelle', icon: <FaStar />, color: '#3b82f6', desc: 'Prendre le pouls de la classe' },
];

const ActivitySelector = ({ onSelect }) => {
    return (
        <div style={grid}>
            {activities.map(act => (
                <div key={act.id} onClick={() => onSelect(act.id)} className="activity-card" style={{...card, borderColor: act.color}}>
                    <div style={{...iconCircle, backgroundColor: act.color}}>{act.icon}</div>
                    <h3 style={{margin:'10px 0', fontSize:'16px'}}>{act.name}</h3>
                    <p style={{fontSize:'11px', color:'#64748b'}}>{act.desc}</p>
                </div>
            ))}
        </div>
    );
};

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', padding: '20px' };
const card = { 
    cursor: 'pointer', padding: '20px', borderRadius: '20px', backgroundColor: 'white', 
    textAlign: 'center', borderBottom: '4px solid', transition: '0.3s', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
};
const iconCircle = { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto' };

export default ActivitySelector;