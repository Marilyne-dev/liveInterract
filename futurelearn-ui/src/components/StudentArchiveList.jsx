import React, { useState, useEffect } from 'react';
import api from '../api';

const StudentArchiveList = ({ onSelectSession }) => {
    const [sessions, setSessions] = useState([]);
    const myId = localStorage.getItem('my_student_id');

    useEffect(() => {
        api.get(`/student/${myId}/history`).then(res => setSessions(res.data));
    }, []);

    return (
        <div className="glass-card fadeIn" style={{padding:'20px', maxWidth:'600px', margin:'0 auto'}}>
            <h3 style={{color:'#6d28d9'}}>📚 Mes Sessions Passées</h3>
            <p style={{fontSize:'12px', color:'#94a3b8'}}>Retrouve tes cours et révise les activités.</p>
            
            <div style={{marginTop:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
                {sessions.map(s => (
                    <div key={s.id} onClick={() => onSelectSession(s)} style={sessionRow}>
                        <div>
                            <b style={{color:'#1e1b4b'}}>{s.title}</b>
                            <div style={{fontSize:'10px', color:'#94a3b8'}}>{new Date(s.created_at).toLocaleDateString()}</div>
                        </div>
                        <span style={btnReview}>REVOIR</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const sessionRow = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', backgroundColor:'#f8fafc', borderRadius:'12px', cursor:'pointer', transition:'0.2s' };
const btnReview = { fontSize:'10px', fontWeight:'bold', color:'#6d28d9', border:'1px solid #6d28d9', padding:'5px 10px', borderRadius:'8px' };

export default StudentArchiveList;