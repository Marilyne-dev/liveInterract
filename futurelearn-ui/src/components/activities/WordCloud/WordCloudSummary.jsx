import React from 'react';
import { FaCloud } from 'react-icons/fa';

const WordCloudSummary = ({ activity }) => {
    const sorted = [...activity.results].sort((a, b) => b.votes - a.votes);

    return (
        <div className="glass-card" style={container}>
            <div style={header}>
                <FaCloud color="#10b981" />
                <h3 style={{margin:0, flex:1, marginLeft:'10px'}}>{activity.question}</h3>
                <span style={badge}>{activity.total} mots</span>
            </div>

            <div style={list}>
                {sorted.slice(0, 10).map((word, i) => (
                    <div key={i} style={row}>
                        <span style={rank}>{i + 1}</span>
                        <span style={wordName}>{word.name}</span>
                        <div style={barContainer}>
                            <div style={{...bar, width: `${(word.votes / activity.total) * 100}%`}}></div>
                        </div>
                        <span style={count}>{word.votes}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const container = { padding: '25px', backgroundColor: 'white', borderRadius: '20px', marginBottom: '20px' };
const header = { display: 'flex', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' };
const badge = { fontSize: '12px', color: '#10b981', fontWeight: 'bold', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px' };
const list = { display: 'flex', flexDirection: 'column', gap: '10px' };
const row = { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px' };
const rank = { width: '20px', color: '#94a3b8', fontWeight: 'bold' };
const wordName = { width: '100px', fontWeight: '600', color: '#1e1b4b' };
const barContainer = { flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' };
const bar = { height: '100%', backgroundColor: '#10b981', borderRadius: '4px' };
const count = { width: '30px', fontWeight: 'bold', textAlign: 'right' };

export default WordCloudSummary;