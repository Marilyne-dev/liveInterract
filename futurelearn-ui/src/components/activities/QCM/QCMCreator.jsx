import React, { useState } from 'react';

const QCMCreator = ({ onLaunch }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    const launch = () => {
        if(!question || options.some(o => !o)) return alert("Remplissez tout !");
        onLaunch({ type: 'qcm', question, options, correct_answer: correctAnswer });
    };

    return (
        <div className="glass-card" style={{padding:'25px'}}>
            <h2 style={{color:'#6d28d9'}}>Configuration QCM</h2>
            <input 
                style={input} 
                placeholder="Ex: Quelle est la capitale de la France ?" 
                onChange={e => setQuestion(e.target.value)} 
            />
            
            {options.map((opt, i) => (
                <div key={i} style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                    <input 
                        style={inputSmall} 
                        placeholder={`Option ${i+1}`}
                        onChange={e => {
                            const newO = [...options]; newO[i] = e.target.value; setOptions(newO);
                        }}
                    />
                    <button 
                        onClick={() => setCorrectAnswer(options[i])}
                        style={{...checkBtn, backgroundColor: correctAnswer === options[i] ? '#10b981' : '#f1f5f9'}}
                    >
                        {correctAnswer === options[i] ? 'Bonne' : 'Mauvaise'}
                    </button>
                </div>
            ))}
            
            <button onClick={() => setOptions([...options, ''])} style={addBtn}>+ Ajouter un choix</button>
            <button onClick={launch} style={launchBtn}>LANCER LE DIRECT</button>
        </div>
    );
};

// Styles (à mettre dans un fichier CSS plus tard)
const input = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px' };
const inputSmall = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #eee' };
const checkBtn = { border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
const launchBtn = { width: '100%', padding: '15px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' };
const addBtn = { background: 'none', border: 'none', color: '#6d28d9', cursor: 'pointer', fontSize: '13px' };

export default QCMCreator;