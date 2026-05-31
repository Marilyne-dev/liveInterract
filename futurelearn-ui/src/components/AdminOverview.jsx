import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaPlayCircle, FaTrophy, FaUsers, FaComments, FaPowerOff, FaDownload, FaChalkboardTeacher, FaChartLine, FaClock } from 'react-icons/fa';

const AdminOverview = ({ data, onForceClose, onExport }) => {
    const { live = [], planned = [], topTeachers = [], chartData = [], totals = {} } = data;

    return (
        <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* LIGNE 1 : STATS & LEADERBOARD */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                    <div className="glass-card" style={statCard}>
                        <div style={{...iconCircle, backgroundColor: '#10b981'}}><FaPlayCircle /></div>
                        <div>
                            <div style={statVal}>{totals.active || 0}</div>
                            <div style={statLab}>SESSIONS LIVE</div>
                        </div>
                    </div>
                    <div className="glass-card" style={statCard}>
                        <div style={{...iconCircle, backgroundColor: '#6d28d9'}}><FaComments /></div>
                        <div>
                            <div style={statVal}>{totals.total_msgs || 0}</div>
                            <div style={statLab}>MESSAGES TOTAL</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={leaderboardCard}>
                    <h4 style={leaderTitle}><FaTrophy color="#f59e0b"/> ENGAGEMENT ENSEIGNANTS</h4>
                    {topTeachers.map((t, i) => (
                        <div key={i} style={leaderRow}>
                            <span style={{fontWeight:'bold'}}>{t.firstname} {t.lastname}</span>
                            <span style={leaderBadge}>{t.total} msg</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* LIGNE 2 : GRAPHIQUE ÉLITE */}
            {/* LIGNE 2 : GRAPHIQUE ÉLITE */}
            <div className="glass-card" style={{ padding: '25px', backgroundColor: 'white', minHeight: '300px' }}>
                <h4 style={{margin: '0 0 20px 0', color: '#1e1b4b', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaChartLine color="#6d28d9"/> Analyse de l'activité pédagogique
                </h4>
                <div style={{ width: '100%', height: '220px', minWidth: 0 }}> {/* Added minWidth: 0 */}
                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <Tooltip />
                                <Area 
                                    type="monotone" 
                                    dataKey="messages" 
                                    stroke="#6d28d9" 
                                    fill="rgba(109, 40, 217, 0.1)" 
                                    strokeWidth={4} 
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            Chargement des données...
                        </div>
                    )}
                </div>
            </div>
            {/* LIGNE 3 : LES DEUX COLONNES */}
            <div style={{ display: 'flex', gap: '25px' }}>
                
                <div className="glass-card" style={columnElite}>
                    <h3 style={columnTitle}><div className="pulse-green"></div> SESSIONS EN DIRECT</h3>
                    <div style={scrollArea}>
                        {live.map(s => (
                            <div key={s.id} style={cardLive}>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: '900', fontSize:'16px'}}>{s.title}</div>
                                    <div style={profSub}><FaChalkboardTeacher/> {s.firstname} {s.lastname}</div>
                                </div>
                                <div style={engagPill}><FaUsers/> {s.participant_count} | <FaComments/> {s.message_count}</div>
                                <div style={btnGroup}>
                                    <button onClick={() => onExport(s.id)} style={btnExport} title="Télécharger CSV"><FaDownload/></button>
                                    <button onClick={() => onForceClose(s.id)} style={btnStop} title="Forcer l'arrêt"><FaPowerOff/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={columnElite}>
                    <h3 style={columnTitle}><FaClock color="#3b82f6"/> AGENDA PRÉVISIONNEL</h3>
                    <div style={scrollArea}>
                        {planned.map(s => (
                            <div key={s.id} style={cardPlanned}>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: '900', fontSize:'15px'}}>{s.title}</div>
                                    <div style={profSub}><FaChalkboardTeacher/> {s.firstname} {s.lastname}</div>
                                </div>
                                <div style={timeTag}>{s.scheduled_at}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const statCard = { flex: 1, padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'white', borderRadius: '20px' };
const iconCircle = { width: '50px', height: '50px', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '22px' };
const statVal = { fontSize: '28px', fontWeight: '900', color: '#1e1b4b' };
const statLab = { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' };
const leaderboardCard = { width: '400px', padding: '20px', backgroundColor: 'white', borderRadius: '20px' };
const leaderTitle = { margin: '0 0 15px 0', fontSize: '11px', color: '#64748b', letterSpacing: '1px' };
const leaderRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' };
const leaderBadge = { backgroundColor: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '5px', fontWeight: 'bold' };
const columnElite = { flex: 1, padding: '25px', backgroundColor: 'rgba(255,255,255,0.85)', minHeight: '450px', borderRadius: '25px' };
const columnTitle = { fontSize: '13px', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e1b4b' };
const scrollArea = { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' };
const cardLive = { padding: '15px 20px', backgroundColor: 'white', borderRadius: '18px', borderLeft: '6px solid #10b981', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' };
const cardPlanned = { padding: '15px 20px', backgroundColor: 'white', borderRadius: '18px', borderLeft: '6px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '15px' };
const profSub = { fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' };
const engagPill = { backgroundColor: '#f5f3ff', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900', color: '#6d28d9' };
const btnGroup = { display: 'flex', gap: '5px' };
const btnExport = { border: 'none', background: '#eff6ff', color: '#3b82f6', width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const btnStop = { ...btnExport, background: '#fee2e2', color: '#ef4444' };
const timeTag = { fontSize: '10px', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '8px' };

export default AdminOverview;