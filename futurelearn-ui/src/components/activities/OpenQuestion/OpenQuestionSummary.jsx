import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const OpenQuestionSummary = ({ activity }) => (
    <div className="glass-card" style={{padding:'20px', marginBottom:'15px', backgroundColor:'white'}}>
        <b style={{color:'#6d28d9', display:'block', marginBottom:'10px'}}>💬 {activity.question}</b>
        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {activity.results.map((r, i) => (
                <div key={i} style={{fontSize:'13px', padding:'8px', backgroundColor:'#f8fafc', borderRadius:'8px'}}>{r.name}</div>
            ))}
        </div>
    </div>
);

const row = { display: 'flex', gap: '15px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px' };
const bullet = { width: '6px', height: '6px', backgroundColor: '#f59e0b', borderRadius: '50%', marginTop: '7px' };
const text = { margin: 0, fontSize: '14px', color: '#1e1b4b' };

export default OpenQuestionSummary;