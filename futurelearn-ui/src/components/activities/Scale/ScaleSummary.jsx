import React from 'react';
import { FaStar } from 'react-icons/fa';

const ScaleSummary = ({ activity }) => {
    const sum = activity.results.reduce((acc, curr) => acc + (parseInt(curr.name) * curr.votes), 0);
    const average = activity.total > 0 ? (sum / activity.total).toFixed(1) : 0;

    return (
        <div className="glass-card" style={{padding:'20px', display:'flex', alignItems:'center', gap:'20px', marginBottom:'15px'}}>
            <div style={{backgroundColor:'#fef3c7', padding:'15px', borderRadius:'15px', textAlign:'center', minWidth:'80px'}}>
                <div style={{fontSize:'24px', fontWeight:'900', color:'#d97706'}}>{average}</div>
                <div style={{fontSize:'10px', color:'#d97706'}}>MOYENNE</div>
            </div>
            <div style={{flex:1}}>
                <b style={{fontSize:'15px'}}>{activity.question}</b>
                <div style={{display:'flex', gap:'3px', marginTop:'5px'}}>
                    {[1, 2, 3, 4, 5].map(n => <FaStar key={n} size={12} color={n <= Math.round(average) ? "#f59e0b" : "#e2e8f0"} />)}
                </div>
            </div>
            <div style={{fontSize:'12px', color:'#94a3b8'}}>{activity.total} votes</div>
        </div>
    );
};
export default ScaleSummary;