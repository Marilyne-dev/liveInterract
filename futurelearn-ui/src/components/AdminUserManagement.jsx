import React from 'react';
import { FaUsers, FaSearch, FaUserShield, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import api from '../api';

const AdminUserManagement = ({ users = [], onRefresh }) => { // Ajout de users = [] par sécurité
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleRoleChange = async (userId, newRole) => {
        if (window.confirm(`Changer le grade en ${newRole.toUpperCase()} ?`)) {
            try {
                await api.put(`/admin/users/${userId}/role`, { role: newRole });
                onRefresh(); 
            } catch (e) { alert("Erreur lors du changement de rôle"); }
        }
    };

    const filtered = users.filter(u => 
        (u.firstname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fadeIn">
            <div className="glass-card" style={searchBar}>
                <FaSearch color="#6d28d9" />
                <input 
                    style={searchInp} 
                    placeholder="Chercher un utilisateur Moodle..." 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>

            <div className="glass-card" style={listCard}>
                <table style={tableElite}>
                    <thead>
                        <tr style={thElite}>
                            <th>UTILISATEUR</th>
                            <th>EMAIL</th>
                            <th>RÔLE FUTURELEARN</th>
                            <th style={{textAlign:'right'}}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => {
                            // SÉCURITÉ : On définit un rôle par défaut si u.role est vide
                            const userRole = u.role || 'student';

                            return (
                                <tr key={u.id} style={trElite}>
                                    <td style={tdElite}>
                                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                            <div style={avatarElite}>{u.firstname ? u.firstname[0] : '?'}</div>
                                            <b>{u.firstname} {u.lastname}</b>
                                        </div>
                                    </td>
                                    <td style={tdElite}>{u.email}</td>
                                    <td style={tdElite}>
                                        <span style={userRole === 'admin' ? badgeRed : userRole === 'teacher' ? badgeBlue : badgeGray}>
                                            {userRole === 'admin' ? <FaUserShield/> : userRole === 'teacher' ? <FaChalkboardTeacher/> : <FaUserGraduate/>} 
                                            {userRole.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{...tdElite, textAlign:'right'}}>
                                        <select 
                                            style={selectElite}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            value={userRole}
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
                {filtered.length === 0 && <div style={{textAlign:'center', padding:'20px', color:'#94a3b8'}}>Aucun utilisateur trouvé.</div>}
            </div>
        </div>
    );
};

// ... gardez vos styles en bas du fichier ...
const searchBar = { display:'flex', alignItems:'center', gap:'15px', padding:'20px 30px', backgroundColor:'white', marginBottom:'20px', borderRadius:'20px' };
const searchInp = { border:'none', outline:'none', width:'100%', fontSize:'16px' };
const listCard = { padding:'30px', backgroundColor:'rgba(255,255,255,0.9)', borderRadius:'25px' };
const tableElite = { width:'100%', borderCollapse:'collapse' };
const thElite = { textAlign:'left', fontSize:'11px', color:'#94a3b8', borderBottom:'1px solid #f1f5f9', paddingBottom:'15px' };
const trElite = { borderBottom:'1px solid #f8fafc' };
const tdElite = { padding:'15px 0', fontSize:'14px' };
const avatarElite = { width:'35px', height:'35px', borderRadius:'8px', backgroundColor:'#6d28d9', color:'white', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'900' };
const badgeRed = { backgroundColor:'#fee2e2', color:'#991b1b', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'5px' };
const badgeBlue = { backgroundColor:'#e0e7ff', color:'#3730a3', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'5px' };
const badgeGray = { backgroundColor:'#f1f5f9', color:'#475569', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:'5px' };
const selectElite = { padding:'6px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'12px', cursor:'pointer', backgroundColor:'#f8fafc' };

export default AdminUserManagement;