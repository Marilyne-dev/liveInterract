import React, { useState, useEffect } from 'react';
import api from "./api"; 
import AdminOverview from './components/AdminOverview';
import AdminUserManagement from './components/AdminUserManagement';
import AdminHistory from './components/AdminHistory';
import BackgroundSlideshow from './BackgroundSlideshow';
import { FaShieldAlt, FaUsers, FaChartLine, FaHistory } from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [dashboardData, setDashboardData] = useState({ live: [], planned: [], history: [], topTeachers: [], chartData: [], totals: {} });

    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'history') fetchSessions();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/admin/sessions');
            setDashboardData(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (e) { console.error(e); }
    };

    const handleForceClose = async (id) => {
        if (window.confirm("Action irréversible : Arrêter cette session immédiatement ?")) {
            try {
                await api.delete(`/admin/sessions/${id}/force`);
                fetchSessions();
            } catch (e) { alert("Erreur lors de la clôture"); }
        }
    };

    const handleExportCSV = async (id) => {
        try {
            const res = await api.get(`/admin/sessions/${id}/export-csv`);
            const blob = new Blob([res.data.content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", res.data.filename);
            document.body.appendChild(link);
            link.click();
        } catch (e) { alert("Erreur d'exportation"); }
    };

    return (
        <div style={layout}>
            <BackgroundSlideshow />
            <div className="glass-card" style={sidebarStyle}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '80px' }} />
                    <h2 style={{ fontSize: '14px', color: 'white', marginTop:'10px' }}>ADMIN PANEL</h2>
                </div>
                <div onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? active : inactive}><FaChartLine /> Supervision</div>
                <div onClick={() => setActiveTab('users')} style={activeTab === 'users' ? active : inactive}><FaUsers /> Utilisateurs</div>
                <div onClick={() => setActiveTab('history')} style={activeTab === 'history' ? active : inactive}><FaHistory /> Historique</div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1 }}>
                <header className="glass-card" style={headerStyle}>
                    <h3 style={{ margin: 0, color: '#1e1b4b' }}><FaShieldAlt color="#6d28d9"/> Control Center</h3>
                    <div style={adminBadge}>ADMINISTRATEUR</div>
                </header>

                {activeTab === 'overview' && (
                    <AdminOverview 
                        data={dashboardData} 
                        onForceClose={handleForceClose} 
                        onExport={handleExportCSV} 
                    />
                )}
                {activeTab === 'users' && <AdminUserManagement users={users} onRefresh={fetchUsers} />}
                {activeTab === 'history' && <AdminHistory sessions={dashboardData.history || []} onExport={handleExportCSV} />}
            </div>
        </div>
    );
};

const layout = { display: 'flex', minHeight: '100vh', padding: '25px', gap: '25px', position: 'relative' };
const sidebarStyle = { width: '260px', padding: '30px', backgroundColor: 'rgba(30, 27, 75, 0.85)', display: 'flex', flexDirection: 'column' };
const inactive = { padding: '15px 20px', borderRadius: '15px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.3s' };
const active = { ...inactive, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' };
const headerStyle = { padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' };
const adminBadge = {backgroundColor:'#6d28d9', color:'white', padding:'5px 15px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold'};

export default AdminDashboard;