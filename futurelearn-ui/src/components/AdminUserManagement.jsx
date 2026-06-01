import React from 'react';
import { FaSearch, FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaSync } from 'react-icons/fa';
import api from '../api';

const AdminUserManagement = ({ users = [], onRefresh }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [pendingRoles, setPendingRoles] = React.useState({});

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Changer le rôle en ${newRole.toUpperCase()} ?`)) return;

        // Feedback visuel immédiat
        setPendingRoles(prev => ({ ...prev, [userId]: newRole }));

        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            await onRefresh(); // Recharge la liste depuis la DB
        } catch (e) {
            alert("Erreur : " + (e.response?.data?.error || e.message));
            // Annule le feedback en cas d'erreur
            setPendingRoles(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        } finally {
            setPendingRoles(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        }
    };

    // Recherche sur name et email (champs réels de la table users)
    const filtered = users.filter(u => {
        const name  = (u.name  || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fadeIn">
            <div className="glass-card" style={searchBar}>
                <FaSearch color="#6d28d9" />
                <input
                    style={searchInp}
                    placeholder="Chercher un utilisateur..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={onRefresh} style={refreshBtn}>
                    <FaSync /> Rafraîchir
                </button>
            </div>

            <div className="glass-card" style={listCard}>
                <table style={tableElite}>
                    <thead>
                        <tr style={thElite}>
                            <th>UTILISATEUR</th>
                            <th>EMAIL</th>
                            <th>RÔLE ACTUEL</th>
                            <th style={{ textAlign: 'right' }}>CHANGER LE RÔLE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => {
                            // Priorité : feedback local → valeur DB
                            const displayedRole = pendingRoles[u.id] ?? u.role ?? 'student';
                            const initial = u.name ? u.name[0].toUpperCase() : '?';

                            return (
                                <tr key={u.id} style={trElite}>
                                    <td style={tdElite}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={avatarElite}>{initial}</div>
                                            <b>{u.name}</b>
                                        </div>
                                    </td>
                                    <td style={tdElite}>{u.email}</td>
                                    <td style={tdElite}>
                                        <span style={
                                            displayedRole === 'admin'   ? badgeRed  :
                                            displayedRole === 'teacher' ? badgeBlue :
                                            badgeGray
                                        }>
                                            {displayedRole === 'admin'   ? <FaUserShield />        :
                                             displayedRole === 'teacher' ? <FaChalkboardTeacher /> :
                                             <FaUserGraduate />}
                                            {' '}{displayedRole.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ ...tdElite, textAlign: 'right' }}>
                                        <select
                                            style={selectElite}
                                            value={displayedRole}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="student">Étudiant</option>
                                            <option value="teacher">Enseignant</option>
                                            <option value="admin">Administrateur</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                        Aucun utilisateur trouvé.
                    </div>
                )}
            </div>
        </div>
    );
};

const searchBar   = { display:'flex', alignItems:'center', gap:'15px', padding:'20px 30px', backgroundColor:'white', marginBottom:'20px', borderRadius:'20px' };
const searchInp   = { border:'none', outline:'none', width:'100%', fontSize:'16px' };
const refreshBtn  = { display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', backgroundColor:'#f5f3ff', color:'#6d28d9', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'12px', fontWeight:'bold', whiteSpace:'nowrap' };
const listCard    = { padding:'30px', backgroundColor:'rgba(255,255,255,0.9)', borderRadius:'25px' };
const tableElite  = { width:'100%', borderCollapse:'collapse' };
const thElite     = { textAlign:'left', fontSize:'11px', color:'#94a3b8', borderBottom:'1px solid #f1f5f9', paddingBottom:'15px' };
const trElite     = { borderBottom:'1px solid #f8fafc' };
const tdElite     = { padding:'15px 0', fontSize:'14px' };
const avatarElite = { width:'35px', height:'35px', borderRadius:'8px', backgroundColor:'#6d28d9', color:'white', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'900', flexShrink:0 };
const badgeRed    = { backgroundColor:'#fee2e2', color:'#991b1b', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'5px' };
const badgeBlue   = { backgroundColor:'#e0e7ff', color:'#3730a3', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'5px' };
const badgeGray   = { backgroundColor:'#f1f5f9', color:'#475569', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'5px' };
const selectElite = { padding:'6px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'12px', cursor:'pointer', backgroundColor:'#f8fafc' };

export default AdminUserManagement;
