import React, { useState } from 'react';
import { FaHistory, FaDownload, FaSearch, FaCalendarAlt, FaChalkboardTeacher } from 'react-icons/fa';

// sessions = getGlobalStats().history
// Chaque session a : id, title, pin_code, status, created_at,
//                    firstname (= users.name), message_count, participant_count
const AdminHistory = ({ sessions = [], onExport }) => {
    const [filter, setFilter] = useState('');

    const filteredHistory = sessions.filter(s => {
        const title   = (s.title     || '').toLowerCase();
        // Le backend met users.name dans firstname (voir AdminController)
        const teacher = (s.firstname || '').toLowerCase();
        return title.includes(filter.toLowerCase()) || teacher.includes(filter.toLowerCase());
    });

    return (
        <div className="fadeIn">
            <div className="glass-card" style={filterBar}>
                <div style={searchBox}>
                    <FaSearch color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Chercher dans l'historique (Titre ou Enseignant)..."
                        style={inputNone}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div style={historyBadge}>
                    <FaHistory /> {sessions.length} Sessions enregistrées
                </div>
            </div>

            <div className="glass-card" style={tableCard}>
                <table style={fullWidthTable}>
                    <thead>
                        <tr style={tableHeader}>
                            <th>DATE</th>
                            <th>SESSION</th>
                            <th>ENSEIGNANT</th>
                            <th>RÉSULTAT / ENGAGEMENT</th>
                            <th style={{ textAlign: 'right' }}>RAPPORT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.map(s => (
                            <tr key={s.id} style={tableRow}>
                                <td style={cell}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e1b4b' }}>
                                        <FaCalendarAlt />{' '}
                                        {s.created_at
                                            ? new Date(s.created_at).toLocaleDateString('fr-FR')
                                            : '—'}
                                    </div>
                                    <small style={{ color: '#94a3b8' }}>
                                        {s.created_at
                                            ? new Date(s.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </small>
                                </td>
                                <td style={cell}>
                                    <div style={{ fontWeight: 'bold' }}>{s.title}</div>
                                    <div style={{ fontSize: '10px', color: '#6d28d9' }}>PIN : {s.pin_code}</div>
                                </td>
                                <td style={cell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaChalkboardTeacher color="#94a3b8" />
                                        {/* firstname = users.name via le JOIN dans AdminController */}
                                        {s.firstname || '—'}
                                    </div>
                                </td>
                                <td style={cell}>
                                    <div style={engagementSummary}>
                                        <b>{s.message_count     ?? 0}</b> questions posées<br />
                                        <b>{s.participant_count ?? 0}</b> participants
                                    </div>
                                </td>
                                <td style={{ ...cell, textAlign: 'right' }}>
                                    <button
                                        onClick={() => onExport(s.id)}
                                        style={exportBtn}
                                        title="Télécharger le log complet"
                                    >
                                        <FaDownload /> EXPORTER .CSV
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredHistory.length === 0 && (
                    <div style={noResult}>Aucune archive trouvée.</div>
                )}
            </div>
        </div>
    );
};

const filterBar         = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 30px', backgroundColor:'rgba(255,255,255,0.8)', marginBottom:'20px', borderRadius:'20px' };
const searchBox         = { display:'flex', alignItems:'center', gap:'15px', flex:1 };
const inputNone         = { border:'none', background:'none', outline:'none', width:'100%', fontSize:'15px' };
const historyBadge      = { backgroundColor:'#1e1b4b', color:'white', padding:'6px 15px', borderRadius:'10px', fontSize:'11px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px' };
const tableCard         = { padding:'30px', backgroundColor:'rgba(255,255,255,0.95)', borderRadius:'25px' };
const fullWidthTable    = { width:'100%', borderCollapse:'collapse' };
const tableHeader       = { textAlign:'left', borderBottom:'2px solid #f1f5f9', color:'#64748b', fontSize:'11px', textTransform:'uppercase' };
const tableRow          = { borderBottom:'1px solid #f1f5f9' };
const cell              = { padding:'20px 0' };
const engagementSummary = { fontSize:'12px', color:'#475569', lineHeight:'1.4' };
const exportBtn         = { backgroundColor:'#6d28d9', color:'white', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontSize:'11px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'8px' };
const noResult          = { textAlign:'center', padding:'50px', color:'#94a3b8' };

export default AdminHistory;
