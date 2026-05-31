import React, { useState } from 'react';
import api from '../api';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const AIChatBot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([{ role: 'ai', text: 'Bonjour ! Comment puis-je vous aider à dynamiser votre cours aujourd\'hui ?' }]);
    const [loading, setLoading] = useState(false);

const handleSend = async () => {
    if (!message.trim()) return;

    // 1. Récupération de l'ID utilisateur
    const storedTeacher = JSON.parse(localStorage.getItem('logged_teacher'));
    const studentId = localStorage.getItem('my_student_id');
    const userId = storedTeacher ? `PROF-${storedTeacher.moodle_user_id}` : studentId;

    // 2. Récupération du PIN
    const savedSession = localStorage.getItem('active_session') || localStorage.getItem('active_student_session');
    const sessionObj = savedSession ? JSON.parse(savedSession) : null;
    const currentPin = sessionObj?.pin_code;

    const userMsg = { role: 'user', text: message };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
        const res = await api.post('/ai/chat', { 
            message: message, 
            pin_code: currentPin,
            user_id: userId
        });
        
        setChat(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (e) {
        // Affiche l'erreur réelle du serveur pour le debug
        const errorMsg = e.response?.data?.reply || "L'IA est indisponible pour le moment.";
        setChat(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={botContainer}>
            {/* Bulle Flottante */}
            {!isOpen && (
                <div style={floatingBtn} onClick={() => setIsOpen(true)}>
                    <FaCommentDots size={25} />
                    
                </div>
            )}

            {/* Fenêtre de Chat */}
            {isOpen && (
                <div style={chatWindow}>
                    <div style={chatHeader}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <FaRobot /> <b>Copilote Future Learn</b>
                        </div>
                        <FaTimes onClick={() => setIsOpen(false)} style={{cursor:'pointer'}} />
                    </div>
                    
                    <div style={chatBody}>
                        {chat.map((m, i) => (
                            <div key={i} style={m.role === 'ai' ? aiMsg : userMsg}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div style={aiMsg}>Réflexion en cours...</div>}
                    </div>

                    <div style={chatInputArea}>
                        <input 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Posez une question..." 
                            style={inputStyle}
                        />
                        <button onClick={handleSend} style={sendBtn}><FaPaperPlane /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const botContainer = { position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'sans-serif' };
const floatingBtn = { width: '60px', height: '60px', backgroundColor: '#6d28d9', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(109,40,217,0.4)', position: 'relative' };
const badge = { position: 'absolute', top: '-10px', backgroundColor: '#10b981', padding: '4px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' };
const chatWindow = { width: '350px', height: '450px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const chatHeader = { backgroundColor: '#6d28d9', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const chatBody = { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc' };
const aiMsg = { backgroundColor: '#ede9fe', padding: '10px', borderRadius: '15px 15px 15px 0', fontSize: '13px', color: '#4c1d95', alignSelf: 'flex-start', maxWidth: '80%' };
const userMsg = { backgroundColor: '#6d28d9', color: 'white', padding: '10px', borderRadius: '15px 15px 0 15px', fontSize: '13px', alignSelf: 'flex-end', maxWidth: '80%' };
const chatInputArea = { padding: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' };
const inputStyle = { flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '10px', outline: 'none' };
const sendBtn = { backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '10px', width: '40px', cursor: 'pointer' };

export default AIChatBot;