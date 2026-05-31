import React from 'react';

const WordCloudDisplay = ({ activity, results, totalVotes }) => {
    
    // Trier les mots pour mettre les plus gros au centre ou simplement les mélanger
    const sortedWords = [...results].sort((a, b) => b.votes - a.votes);

    return (
        <div className="glass-card fadeIn" style={container}>
            <div style={header}>
                <span style={badge}>NUAGE DE MOTS EN DIRECT</span>
                <h2 style={{margin:'10px 0', color:'#1e1b4b'}}>{activity.question}</h2>
                <div style={{color:'#94a3b8', fontSize:'14px'}}>{totalVotes} réponses reçues</div>
            </div>

            <div style={cloudArea}>
                {sortedWords.length > 0 ? sortedWords.map((word, i) => {
                    // Calcul de la taille : base 16px + (nombre de votes * 8)
                    const fontSize = Math.min(60, 16 + (word.votes * 8));
                    const opacity = 0.5 + (word.votes / (sortedWords[0].votes + 1));

                    return (
                        <span key={i} style={{
                            fontSize: `${fontSize}px`,
                            opacity: opacity,
                            color: i % 3 === 0 ? '#6d28d9' : (i % 3 === 1 ? '#10b981' : '#3b82f6'),
                            fontWeight: 'bold',
                            transition: 'all 0.5s ease',
                            margin: '10px',
                            display: 'inline-block'
                        }}>
                            {word.name}
                        </span>
                    );
                }) : (
                    <div style={{color:'#cbd5e1', fontStyle:'italic'}}>En attente des premiers mots...</div>
                )}
            </div>
        </div>
    );
};

const container = { 
    padding: '5% 20px', // Padding dynamique : 5% en haut/bas, 20px sur les côtés
    backgroundColor: 'white', 
    borderRadius: '24px', 
    textAlign: 'center', 
    width: '100%',
    boxSizing: 'border-box' // Très important pour que le padding ne casse pas la largeur
};
const header = { marginBottom: '40px' };
const badge = { backgroundColor: '#10b981', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' };
const cloudArea = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '20px' };

export default WordCloudDisplay;