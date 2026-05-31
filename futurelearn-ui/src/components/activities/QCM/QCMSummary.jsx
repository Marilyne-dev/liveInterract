import React from 'react';
import { FaAward, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const QCMSummary = ({ activity }) => {
    // Calculer le taux de réussite (si une bonne réponse existe)
    const total = activity.results.reduce((acc, curr) => acc + curr.votes, 0);
    const correctResult = activity.results.find(r => r.name === activity.correct_answer);
    const successRate = total > 0 && correctResult ? Math.round((correctResult.votes / total) * 100) : 0;

    return (
        <div className="glass-card" style={card}>
            <div style={sideColor(successRate)}></div>
            
            <div style={content}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <h3 style={qTitle}>{activity.question}</h3>
                    <div style={rateBadge(successRate)}>{successRate}% de réussite</div>
                </div>

                <div style={resultsList}>
                    {activity.results.map((res, i) => {
                        const isCorrect = res.name === activity.correct_answer;
                        const percentage = total > 0 ? Math.round((res.votes / total) * 100) : 0;

                        return (
                            <div key={i} style={row}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'13px'}}>
                                    <span>
                                        {isCorrect ? <FaCheckCircle color="#10b981" /> : <FaTimesCircle color="#cbd5e1" />}
                                        <span style={{marginLeft:'8px', fontWeight: isCorrect ? 'bold' : 'normal'}}>{res.name}</span>
                                    </span>
                                    <b>{percentage}%</b>
                                </div>
                                <div style={barBg}>
                                    <div style={{...barFill, width: `${percentage}%`, backgroundColor: isCorrect ? '#10b981' : '#6d28d9'}}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={footer}>
                    <FaAward color="#f59e0b" /> 
                    <span> {total} étudiants ont participé à cette évaluation.</span>
                </div>
            </div>
        </div>
    );
};

const card = { display:'flex', backgroundColor:'white', borderRadius:'18px', overflow:'hidden', marginBottom:'20px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)' };
const sideColor = (rate) => ({ width:'8px', backgroundColor: rate > 50 ? '#10b981' : '#f59e0b' });
const content = { padding:'25px', flex:1 };
const qTitle = { margin:0, fontSize:'18px', color:'#1e1b4b', maxWidth:'80%' };
const rateBadge = (rate) => ({ padding:'5px 12px', borderRadius:'10px', backgroundColor: rate > 50 ? '#d1fae5' : '#fef3c7', color: rate > 50 ? '#065f46' : '#92400e', fontSize:'12px', fontWeight:'bold' });
const resultsList = { marginTop:'20px' };
const row = { marginBottom:'15px' };
const barBg = { height:'8px', backgroundColor:'#f1f5f9', borderRadius:'4px', overflow:'hidden' };
const barFill = { height:'100%', borderRadius:'4px', transition:'width 1s ease-in-out' };
const footer = { marginTop:'20px', paddingTop:'15px', borderTop:'1px solid #f1f5f9', fontSize:'12px', color:'#94a3b8', display:'flex', alignItems:'center', gap:'8px' };

export default QCMSummary;