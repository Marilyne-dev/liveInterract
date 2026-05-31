import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaRobot, FaLightbulb, FaMagic } from 'react-icons/fa';

const AIAssistant = ({ pinCode, refreshTrigger }) => { 
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);

// Modifie le useEffect de AIAssistant.jsx
useEffect(() => {
    if (!pinCode || pinCode === "undefined") return;

    let cancelled = false;
    setLoading(true);

    const timeoutId = setTimeout(() => {
        api.get(`/sessions/${pinCode}/ai-insights`)
            .then(res => {
                if (cancelled) return;
                setTips(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                if (cancelled) return;
                console.error("Erreur chargement IA insights:", err);
                setTips([
                    "Encouragez les etudiants a poser des questions.",
                    "Verifiez si tout le monde suit le rythme.",
                    "Prevoyez un petit sondage pour dynamiser la session."
                ]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
    }, refreshTrigger === undefined ? 0 : 1200);

    return () => {
        cancelled = true;
        clearTimeout(timeoutId);
    };
}, [pinCode, refreshTrigger]);


    return (
        <div style={aiBox}>
            <div style={aiHeader}>
                <FaRobot size={24} color="#6d28d9" />
                <h3 style={{margin:0, fontSize:'16px'}}>Assistant Pédagogique IA</h3>
            </div>
            <div style={content}>
                {loading ? <p>Analyse de la session en cours...</p> : 
                    tips.map((tip, i) => (
                        <div key={i} style={tipRow}>
                            <FaLightbulb color="#f59e0b" style={{marginTop:'3px'}} />
                            <p style={tipText}>{tip}</p>
                        </div>
                    ))
                }
            </div>
            <div style={aiFooter}><FaMagic /> Analyse basée sur l'engagement réel</div>
        </div>
    );
};

// --- AJOUTE CES STYLES TOUT EN BAS DE AIAssistant.jsx ---

const aiBox = { 
    backgroundColor: '#f5f3ff', 
    borderRadius: '20px', 
    padding: '25px', 
    border: '1px solid #ddd6fe', 
    marginTop: '30px', 
    animation: 'slideUp 0.5s',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
};

const aiHeader = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '20px', 
    color: '#6d28d9' 
};

const content = { // <--- C'EST CETTE VARIABLE QUI MANQUAIT
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const tipRow = { 
    display: 'flex', 
    gap: '15px', 
    padding: '12px', 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    borderLeft: '4px solid #6d28d9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const tipText = { 
    margin: 0, 
    fontSize: '14px', 
    color: '#1e1b4b', 
    lineHeight: '1.5' 
};

const aiFooter = { 
    fontSize: '10px', 
    color: '#94a3b8', 
    textAlign: 'right', 
    fontStyle: 'italic',
    marginTop: '15px'
};

export default AIAssistant;
