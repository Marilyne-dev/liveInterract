import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList, CartesianGrid } from 'recharts';
import { FaUsers, FaCheck } from 'react-icons/fa';

const QCMDisplay = ({ activity, results, totalVotes }) => {
    // SÉCURITÉ : On s'assure que votes est toujours un nombre pour Recharts
    const chartData = results.map(r => ({
        ...r,
        votes: Number(r.votes) || 0
    }));

    return (
        <div className="glass-card fadeIn" style={container}>
            <div style={header}>
                <div style={badge}>QCM EN DIRECT</div>
                <h2 style={questionTitle}>{activity.question}</h2>
                <div style={statsRow}>
                    <div style={stat}><FaUsers /> <b>{totalVotes}</b> participations</div>
                </div>
            </div>

            <div className="qcm-chart-container" style={chartContainer}>
                {/* On utilise 99% de largeur pour éviter un bug de redimensionnement de Recharts */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 24, left: 12, bottom: 28 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#1e1b4b', fontWeight: 'bold', fontSize: 14}} 
                            dy={10}
                        />
                        {/* On ajoute un YAxis invisible pour aider Recharts à calculer l'échelle */}
                        <YAxis hide domain={[0, 'auto']} />
                        
                        <Bar dataKey="votes" radius={[10, 10, 0, 0]} maxBarSize={50}>
                            {chartData.map((entry, index) => {
                                const isCorrect = activity.status === 'closed' && entry.name === activity.correct_answer;
                                return (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={isCorrect ? '#10b981' : '#6d28d9'} 
                                    />
                                );
                            })}
                            <LabelList 
                                dataKey="votes" 
                                position="top" 
                                style={{ fill: '#6d28d9', fontWeight: 'bold', fontSize: 16 }} 
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {activity.status === 'closed' && activity.correct_answer && (
                <div className="fadeIn" style={correctBanner}>
                    <FaCheck /> La bonne réponse était : <b>{activity.correct_answer}</b>
                </div>
            )}
        </div>
    );
};

const container = { padding: '30px', backgroundColor: 'white', borderRadius: '30px', width: '100%', boxSizing: 'border-box' };
const header = { textAlign: 'center', marginBottom: '20px' };
const badge = { display: 'inline-block', backgroundColor: '#6d28d9', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', marginBottom: '10px' };
const questionTitle = { fontSize: '24px', color: '#1e1b4b', margin: '10px 0' };
const statsRow = { display: 'flex', justifyContent: 'center', gap: '20px', color: '#64748b' };
const stat = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' };

const chartContainer = { 
    marginTop: '20px', 
    backgroundColor: '#f8fafc', 
    padding: '20px', 
    borderRadius: '20px',
    height: '400px', // FIX : Hauteur explicite pour le ResponsiveContainer
    width: '100%',
    border: '1px solid #edf2f7'
};

const correctBanner = { marginTop: '20px', padding: '15px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '15px', textAlign: 'center', fontSize: '16px' };

export default QCMDisplay;

