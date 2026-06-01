import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots, FaGripVertical } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const AIChatBot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([{ role: 'ai', text: "Bonjour ! Comment puis-je vous aider à dynamiser votre cours aujourd'hui ?" }]);
    const [loading, setLoading] = useState(false);

    // ── Position draggable ──────────────────────────────────────────
    const [pos, setPos] = useState({ x: null, y: null }); // null = position par défaut CSS
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const btnRef = useRef(null);
    const hasMoved = useRef(false);

    // Position initiale par défaut (coin bas-droit)
    useEffect(() => {
        const setDefault = () => {
            setPos({
                x: window.innerWidth - 80,
                y: window.innerHeight - 90,
            });
        };
        setDefault();
        window.addEventListener('resize', setDefault);
        return () => window.removeEventListener('resize', setDefault);
    }, []);

    // ── Drag (souris) ──────────────────────────────────────────────
    const onMouseDown = (e) => {
        hasMoved.current = false;
        dragOffset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        };
        setDragging(true);
        e.preventDefault();
    };

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e) => {
            hasMoved.current = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const btnW = 60, btnH = 60;
            const newX = Math.max(0, Math.min(window.innerWidth - btnW, clientX - dragOffset.current.x));
            const newY = Math.max(0, Math.min(window.innerHeight - btnH, clientY - dragOffset.current.y));
            setPos({ x: newX, y: newY });
        };
        const onUp = () => setDragging(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [dragging]);

    // ── Drag (tactile) ─────────────────────────────────────────────
    const onTouchStart = (e) => {
        hasMoved.current = false;
        const t = e.touches[0];
        dragOffset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
        setDragging(true);
    };

    // ── Click = ouvre/ferme seulement si pas de drag ───────────────
    const handleClick = () => {
        if (!hasMoved.current) setIsOpen(o => !o);
    };

    // ── Envoi message ──────────────────────────────────────────────
    const handleSend = async () => {
        if (!message.trim()) return;
        const storedTeacher = JSON.parse(localStorage.getItem('logged_teacher'));
        const studentId = localStorage.getItem('my_student_id');
        const userId = storedTeacher ? `PROF-${storedTeacher.moodle_user_id}` : studentId;
        const savedSession = localStorage.getItem('active_session') || localStorage.getItem('active_student_session');
        const sessionObj = savedSession ? JSON.parse(savedSession) : null;
        const currentPin = sessionObj?.pin_code;

        const userMsg = { role: 'user', text: message };
        setChat(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);
        try {
            const res = await api.post('/ai/chat', { message, pin_code: currentPin, user_id: userId });
            setChat(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch (e) {
            const errorMsg = e.response?.data?.reply || "L'IA est indisponible pour le moment.";
            setChat(prev => [...prev, { role: 'ai', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    // ── Fenêtre de chat : positionnée au-dessus du bouton ─────────
    const chatX = pos.x !== null ? Math.max(10, Math.min(window.innerWidth - 370, pos.x - 290)) : null;
    const chatY = pos.y !== null ? Math.max(10, pos.y - 470) : null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, zIndex: 9999, pointerEvents: 'none' }}>

            {/* ── Fenêtre de chat ───────────────────────────────── */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    left: chatX ?? 'auto',
                    right: chatX === null ? '10px' : 'auto',
                    top: chatY !== null && chatY > 10 ? chatY : 10,
                    width: '340px',
                    maxWidth: 'calc(100vw - 20px)',
                    height: '440px',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    pointerEvents: 'all',
                    zIndex: 9998,
                }}>
                    {/* Header */}
                    <div style={{ backgroundColor: '#6d28d9', color: 'white', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaRobot /> <b style={{ fontSize: '14px' }}>Copilote LiveInteract</b>
                        </div>
                        <FaTimes onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', fontSize: '18px' }} />
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc' }}>
                        {chat.map((m, i) => (
                            <div key={i} style={m.role === 'ai' ? aiMsgStyle : userMsgStyle}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div style={aiMsgStyle}>Réflexion en cours...</div>}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px', display: 'flex', gap: '8px', borderTop: '1px solid #eee', flexShrink: 0, backgroundColor: 'white' }}>
                        <input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Posez une question..."
                            style={{ flex: 1, minWidth: 0, border: '1px solid #ddd', padding: '9px 12px', borderRadius: '20px', outline: 'none', fontSize: '13px' }}
                        />
                        <button onClick={handleSend} style={{ backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '50%', width: '38px', height: '38px', minWidth: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FaPaperPlane size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Bouton flottant DRAGGABLE ─────────────────────── */}
            {pos.x !== null && (
                <div
                    ref={btnRef}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onClick={handleClick}
                    style={{
                        position: 'fixed',
                        left: pos.x,
                        top: pos.y,
                        width: '56px',
                        height: '56px',
                        backgroundColor: isOpen ? '#4c1d95' : '#6d28d9',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: dragging ? 'grabbing' : 'grab',
                        boxShadow: '0 6px 20px rgba(109,40,217,0.45)',
                        userSelect: 'none',
                        touchAction: 'none',
                        pointerEvents: 'all',
                        transition: dragging ? 'none' : 'background-color 0.2s',
                        zIndex: 9999,
                    }}
                    title="Glissez-moi où vous voulez !"
                >
                    {isOpen ? <FaTimes size={20} /> : <FaCommentDots size={20} />}

                    {/* Mini indicateur "déplaçable" */}
                    {!isOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-4px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}>
                            ✥
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const aiMsgStyle = {
    backgroundColor: '#ede9fe',
    padding: '9px 12px',
    borderRadius: '14px 14px 14px 0',
    fontSize: '13px',
    color: '#4c1d95',
    alignSelf: 'flex-start',
    maxWidth: '85%',
    lineHeight: '1.4',
};

const userMsgStyle = {
    backgroundColor: '#6d28d9',
    color: 'white',
    padding: '9px 12px',
    borderRadius: '14px 14px 0 14px',
    fontSize: '13px',
    alignSelf: 'flex-end',
    maxWidth: '85%',
    lineHeight: '1.4',
};

export default AIChatBot;
