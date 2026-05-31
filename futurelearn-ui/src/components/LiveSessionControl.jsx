import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import ActivityManager from './ActivityManager';
import BackgroundSlideshow from '../BackgroundSlideshow';
import AIAssistant from './AIAssistant'; // Vérifie bien le chemin du fichier 

import { 
    FaUsers, FaChartBar, FaRegComments, FaCog, FaPowerOff, 
    FaPlus, FaTimes, FaShieldAlt, FaQrcode, FaListUl, FaCheckCircle, FaUserGraduate, FaPaperPlane 
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';


const LiveSessionControl = ({ session, onQuit }) => {

const fbBadgeStyle = { position:'absolute', top:'-8px', right:'-8px', backgroundColor:'#ff3b30', color:'white', fontSize:'10px', fontWeight:'bold', minWidth:'18px', height:'18px', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center', border:'2px solid white' };
const containerStyle = { display:'flex', flexDirection:'column', height:'100%', width:'100%' };
const toolbarStyle = { marginTop:'20px', padding:'15px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'rgba(255,255,255,0.95)', borderRadius:'25px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', zIndex:10 };
const toolbarGroup = { display:'flex', gap:'40px', alignItems:'center' };
const toolBtn = { background:'none', border:'none', color:'#6d28d9', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', fontWeight:'bold', fontSize:'10px', opacity:0.5 };
const toolBtnActive = { ...toolBtn, opacity:1 };
const liveIndicator = { position:'absolute', top:'25px', right:'30px', display:'flex', alignItems:'center', gap:'8px', backgroundColor:'white', padding:'5px 15px', borderRadius:'20px', border:'1px solid #dcfce7'};
const fullContentCard = { 
    width: '100%', 
    maxWidth: '1100px', 
    minHeight: '80vh', // Utilise minHeight plutôt que height fixe
    height: 'auto',    // Permet à la carte de grandir si le contenu dépasse
    padding: '20px',   // Padding réduit
    backgroundColor: 'rgba(255,255,255,0.9)', 
    display: 'flex', 
    flexDirection: 'column', 
    borderRadius: '30px',
    marginBottom: '100px' // Laisse de la place pour la toolbar mobile
};
const contentWrapper = { 
    flex: 1, 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', // Aligne en haut pour faciliter le scroll mobile
    padding: '10px', 
    width: '100%',
    boxSizing: 'border-box'
};

const msgBubbleStyle = { backgroundColor:'white', padding:'15px', borderRadius:'20px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)' };
const emptyState = { textAlign:'center', paddingTop:'100px', color:'#cbd5e1' };
const modalOverlay = { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(30,27,75,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, backdropFilter:'blur(4px)' };
const modalContent = { width:'550px', padding:'35px', backgroundColor:'white', borderRadius:'30px' };
const modalHeader = { display:'flex', justifyContent:'space-between', marginBottom:'25px', alignItems:'center' };
const permRow = { display:'flex', justifyContent:'space-between', padding:'15px 0', borderBottom:'1px solid #f1f5f9' };
const saveBtn = { width:'100%', padding:'15px', backgroundColor:'#6d28d9', color:'white', border:'none', borderRadius:'15px', fontWeight:'bold', cursor:'pointer', marginTop:'20px' };
const viewListBtn = { backgroundColor:'rgba(109,40,217,0.1)', border:'none', padding:'6px 15px', borderRadius:'20px', color:'#6d28d9', fontSize:'10px', fontWeight:'bold', cursor:'pointer' };
const participantRowDirect = { display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', fontSize:'14px', fontWeight:'500' };
const onlineDot = { width:'8px', height:'8px', backgroundColor:'#10b981', borderRadius:'50%' };
// --- AJOUTE CES DEUX LIGNES ICI ---
const onlineWrapper = { 
    position: 'relative', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100px', 
    height: '100px', 
    margin: '0 auto' 
};

const onlineCountBadge = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: '#6d28d9',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    zIndex: 2
};
const onlineIndicator = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70px',
    height: '70px',
    backgroundColor: 'rgba(109,40,217,0.05)',
    borderRadius: '50%'
};

// À ajouter en bas du fichier avec les autres styles
const scrollContainer = {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '10px'
};

const tabTitle = { 
    cursor: 'pointer', 
    paddingBottom: '10px', 
    transition: '0.3s', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    fontSize: '18px',
    fontWeight: 'bold'
};


const rankingRow = { display:'flex', alignItems:'center', gap:'20px', padding:'15px', backgroundColor:'white', borderRadius:'15px', marginBottom:'10px' };
const rankNum = { width:'30px', height:'30px', borderRadius:'50%', backgroundColor:'#6d28d9', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' };
const btnDownload = { marginTop:'20px', padding:'15px 30px', backgroundColor:'#10b981', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px' };
const btnDownloadChic = { 
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    padding: '12px 25px', 
    borderRadius: '14px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
    transition: '0.3s'
};

const tableHeader = { 
    display: 'flex', 
    padding: '10px 20px', 
    color: '#94a3b8', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    letterSpacing: '1px' 
};

const rankingScrollArea = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    paddingRight: '10px'
};

const rankingRowChic = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '15px 25px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease'
};

const rankNumChic = {
    width: '50px',
    height: '50px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
    backgroundColor: '#f8fafc'
};

const xpBadgeChic = {
    textAlign: 'center',
    padding: '5px 20px',
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    borderRadius: '15px',
    color: '#6d28d9',
    minWidth: '100px'
};

const statusBadgeChic = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    fontWeight: '900',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '8px 15px',
    borderRadius: '30px'
};

const statusBadge = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '12px', 
    color: '#10b981', 
    fontWeight: 'bold',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '5px 12px',
    borderRadius: '10px'
};
const rankingGrid = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    marginTop: '20px',
    maxHeight: '400px',
    overflowY: 'auto'
};




        // 1. ÉTATS ORIGINAUX RESTAURÉS
        const [view, setView] = useState(() => localStorage.getItem('t_view') || 'pin');

    useEffect(() => {
        localStorage.setItem('t_view', view);
    }, [view]);

    const [showPermissions, setShowPermissions] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    // 1. État initial
const [perms, setPerms] = useState({
    allow_questions: session.allow_questions ?? true,
    is_moderated: session.is_moderated ?? false,
    show_results_to_students: session.show_results_to_students ?? true
});
const [communityMessages, setCommunityMessages] = useState([]); // Stocke le chat public
const [messageTab, setMessageTab] = useState('questions');      // 'questions' ou 'community'
const [unreadCommunity, setUnreadCommunity] = useState(0);       // Badge pour le chat public
const [unreadMessages, setUnreadMessages] = useState(0);         // Badge pour les questions privées
const [profCommunityMsg, setProfCommunityMsg] = useState('');
const [leaderboard, setLeaderboard] = useState([]); // <-- Ajoute ça
    const [sortCommunityByLikes, setSortCommunityByLikes] = useState(false); // Pour trier la communauté par likes
    const [allMessages, setAllMessages] = useState([]); 
    const [activeParticipants, setActiveParticipants] = useState([]);


    const [participantsList, setParticipantsList] = useState([]);
    const notifiedMessages = useRef(new Set());
    const activeViewRef = useRef('pin');
    const activeTabRef = useRef('questions');
    const sessionPin = session?.pin_code || session?.pin || '';

    // États pour le chat privé
    const [privateMessages, setPrivateMessages] = useState([]);
    const [chatPartners, setChatPartners] = useState([]);
    const [selectedChatPartner, setSelectedChatPartner] = useState(null);
    const selectedChatPartnerRef = useRef(selectedChatPartner);
    const privateTypingTimeoutRef = useRef(null);
    const privateTypingWhisperTimeoutRef = useRef(0);
    // Avec les autres useRef, après selectedChatPartnerRef
const messagesEndRef = useRef(null);
    const [currentConversation, setCurrentConversation] = useState([]);
    const [privateMessageInput, setPrivateMessageInput] = useState('');
    const [isPrivatePartnerTyping, setIsPrivatePartnerTyping] = useState(false);
    const [unreadPrivateChats, setUnreadPrivateChats] = useState({}); // {partnerId: count}


    const getConversationChannelName = (userId1, userId2) => {
        const key = [String(userId1), String(userId2)]
            .sort()
            .map(id => id.replace(/[^A-Za-z0-9_-]/g, '_'))
            .join('__');

        return `chat.conversation.${key}`;
    };

    const formatTime = (dateStr) => {
        if(!dateStr) return '...';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const normalizeParticipants = (participants = []) => {
        const byId = new Map();

        participants.forEach((participant) => {
            const id = participant?.id ?? participant?.student_id ?? participant?.moodle_user_id;
            if (!id) return;

            byId.set(String(id), {
                ...participant,
                id: String(id),
                name: participant?.name || participant?.user_name || `Etudiant ${String(id).slice(-4)}`
            });
        });

        return Array.from(byId.values());
    };

    const refreshParticipants = async () => {
        if (!sessionPin) return;

        try {
            const partRes = await api.get(`/sessions/${sessionPin}/participants`);
            setActiveParticipants(normalizeParticipants(partRes.data || []));
        } catch (error) {
            console.error("Erreur chargement participants", error);
        }
    };
    
    
    // --- FONCTION : CHARGER INITIALEMENT (BD) ---
   // Dans LiveSessionControl.jsx

const fetchInitialData = async () => {
    if (!sessionPin) return;

    try {
        // 1. Charger les messages de questions/privés (EXCLURE les messages de communauté)
        const msgRes = await api.get(`/sessions/${sessionPin}/messages`);
        // Filtrer pour exclure les messages de communauté (garder uniquement les questions)
        const questionMessages = (msgRes.data.messages || [])
            .filter(m => !m.is_community && (m.user_id || m.moodle_user_id))
            .map(m => ({ ...m, user_id: m.user_id || m.moodle_user_id }));
        setAllMessages(questionMessages);
        questionMessages.forEach(m => notifiedMessages.current.add(m.id));

        // 2. Charger les participants depuis la TABLE fl_participants (Persistance)
        const partRes = await api.get(`/sessions/${sessionPin}/participants`);
        setActiveParticipants(normalizeParticipants(partRes.data || [])); // ICI : On récupère les données de la DB

        // AJOUT : Charger la communauté (séparé des messages de questions)
        const commRes = await api.get(`/community/${sessionPin}/messages`);
        setCommunityMessages(commRes.data || []);

        // 4. CORRECTION : Charger le CLASSEMENT sans écraser les participants
        try {
            const sumRes = await api.get(`/sessions/${sessionPin}/summary`);
            if (sumRes.data && sumRes.data.summary_scores) {
                setLeaderboard(sumRes.data.summary_scores);
            }
        } catch (e) {
            console.log("Pas encore de classement");
        }
        
    } catch (error) { 
        console.error("Erreur chargement base", error);
        // Afficher une notification ou garder les valeurs par défaut
        setAllMessages([]);
        setActiveParticipants([]);
        setCommunityMessages([]);
    }
};

const fetchTopLikedCommunity = async () => {
    try {
        const response = await api.get(`/sessions/${sessionPin}/top-liked-community`);
        setCommunityMessages(response.data);
    } catch (error) {
        console.error("Erreur chargement messages likés", error);
    }
};

// Ton useEffect actuel avec Echo est bon, il s'occupera d'ajouter les NOUVEAUX venus sans refresh.



    // 4. LOGIQUE TEMPS RÉEL (WebSockets)
    useEffect(() => {
    fetchInitialData();
    const participantsInterval = setInterval(refreshParticipants, 5000);
    if (window.Echo && session.moodle_user_id) {
        const profId = `PROF-${session.moodle_user_id}`;
        const myChannel = window.Echo.channel(`private.chat.${profId}`);

        console.log("📡 Prof écoute sur:", `private.chat.${profId}`);
                myChannel.listen('.private.message.sent', (e) => {
            console.log("📩 [PROF] Message reçu en direct:", e.message);

            loadChatPartners();
            const currentPartner = selectedChatPartnerRef.current;
            const isFromCurrentPartner = String(e.message.sender_id) === String(currentPartner);
            const isToCurrentPartner = String(e.message.receiver_id) === String(currentPartner);
            if (!isFromCurrentPartner && !isToCurrentPartner) return;

            setCurrentConversation(prev => {
                if (prev.some(m => String(m.id) === String(e.message.id))) return prev;
                const tempMatch = prev.find(m =>
                    String(m.id).startsWith('temp-') &&
                    String(m.sender_id) === String(e.message.sender_id) &&
                    String(m.receiver_id) === String(e.message.receiver_id) &&
                    m.content === e.message.content
                );
                if (tempMatch) {
                    return prev.map(m => m.id === tempMatch.id ? e.message : m);
                }
                return [...prev, e.message];
            });
        });
                
        const sessionChannel = window.Echo.channel(`session.${sessionPin}`);
        const communityChannel = window.Echo.private(`community.${sessionPin}`);

        sessionChannel.listen('.UserJoined', (e) => {
            console.log("🔔 UserJoined event received:", e);
            if (!e.student_id) return console.error("Student ID missing in UserJoined event");
            setActiveParticipants(prev => {
                // Avoid duplicates
                return normalizeParticipants([
                    ...prev,
                    { id: e.student_id, name: e.user_name }
                ]);
            });
            refreshParticipants();
        }); 
            sessionChannel.listen('.LeaderboardUpdated', (e) => {
                console.log("Classement LIVE reçu", e.leaderboard);
                setLeaderboard(e.leaderboard);
            });
            // Session closed – clear participants and notify teacher
            sessionChannel.listen('.SessionClosed', () => {
                console.log("🔔 SessionClosed received on teacher side");
                setActiveParticipants([]);
                alert("La session a été clôturée. Tous les participants ont été éjectés.");
            });

   
        // Dans ton useEffect Echo
            // LiveSessionControl.jsx
            // LiveSessionControl.jsx
                // Dans ton useEffect Echo de LiveSessionControl.jsx
                                // Dans LiveSessionControl.jsx - useEffect
                        // Dans LiveSessionControl.jsx - useEffect
                            // ✅ NOUVEAU CODE avec meilleur debug
                sessionChannel.listen('.message.sent', (e) => {
                    console.log("✅ .message.sent reçu !", e.message);
                    
                    setAllMessages(prev => {
                        if (prev.some(m => String(m.id) === String(e.message.id))) return prev;
                        return [e.message, ...prev]; 
                    });
                    
                    if (activeViewRef.current !== 'messages' || activeTabRef.current !== 'questions') {
                        setUnreadMessages(u => u + 1);
                    }
                });


            // 1. ÉCOUTER LES NOUVEAUX MESSAGES COMMUNAUTÉ
            communityChannel.listen('.community.sent', (e) => {
                console.log("Message communauté reçu !", e.message);
                setCommunityMessages(prev => {
                    if (prev.some(m => String(m.id) === String(e.message.id))) return prev;
                    
                    const tempMatch = prev.find(m => 
                        String(m.id).startsWith('temp-') && 
                        String(m.user_id) === String(e.message.user_id) && 
                        m.content === e.message.content
                    );
                    if (tempMatch) {
                        return prev.map(m => m.id === tempMatch.id ? e.message : m);
                    }
                    
                    return [...prev, e.message];
                });
            }); 
                        
        
           

        // 2. RÉACTIONS / LIKES (EN DIRECT)
        // Dans ton useEffect principal, remplace le listener reaction.received par celui-ci :
        // 2. RÉACTIONS / LIKES (DANS LiveSessionControl.jsx)
           // CORRECTION DU LISTENER DE REACTIONS
            // LiveSessionControl.jsx - Ligne ~430 environ
            // Remplace ton listener de réaction par celui-ci :
            communityChannel.listen('.reaction.received', (e) => {
                console.log("Réaction reçue", e);
                setCommunityMessages(prev => prev.map(msg => {
                    // ON FORCE LA COMPARAISON EN STRING (String(...) === String(...))
                    if (String(msg.id) === String(e.messageId)) {
                        return { 
                            ...msg, 
                            likes_count: e.reactions.likes, 
                            love_count: e.reactions.love 
                        };
                    }
                    return msg;
                }));
            });


                    // ÉCOUTER LES RÉPONSES PRIVÉES
                    const privateResponseChannel = window.Echo.channel(`private.messages.PROF-${session.moodle_user_id}`);
                    privateResponseChannel.listen('.private.response.sent', (e) => {
                        console.log("Réponse privée reçue:", e.response);
                // Les réponses privées au prof ne sont rares, on peut notifier ou ignorer
            });


            // ===== CORRECTIF CLEF : RÉCEPTIONNER LES MESSAGES DES ÉTUDIANTS =====
            // Le prof envoie sur private.chat.PROF-{id} → il doit aussi écouter sur ce canal
       
 

        return () => {
            clearInterval(participantsInterval);
            window.Echo.leave(`session.${sessionPin}`);
            window.Echo.leave(`community.${sessionPin}`);
            window.Echo.leave(`private.chat.${profId}`);
           
            window.Echo.leave(`private.messages.PROF-${session.moodle_user_id}`);
            myChannel.stopListening('.private.message.sent');
        };
    }
    return () => clearInterval(participantsInterval);
}, [sessionPin, session.moodle_user_id]);

useEffect(() => { activeViewRef.current = view; }, [view]);
useEffect(() => { activeTabRef.current = messageTab; }, [messageTab]);

useEffect(() => { loadChatPartners(); }, []);

useEffect(() => {
    if (messageTab === 'private' && messagesEndRef.current) {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }
}, [currentConversation, messageTab]);

    const handleShowParticipants = async () => {
        try {
            const response = await api.get('/moodle-users');
            setParticipantsList(response.data);
            setShowParticipants(true);
        } catch (error) {
            alert("Impossible de charger la liste Moodle (Vérifiez la table mdl_user)");
        }
    };

    const handleCloturer = async () => {
        if (window.confirm("Voulez-vous vraiment fermer cette session ?")) {
            try {
                await api.delete(`/sessions/${session.id}`);
                onQuit(); 
            } catch (error) { alert("Erreur clôture"); }
        }
    };

    const handleSavePermissions = async () => {
        try {
            await api.put(`/sessions/${session.id}/permissions`, perms);
            setShowPermissions(false);
            // On ne fait rien d'autre, le changement est déjà fait en DB 
            // et le broadcast est parti vers les élèves.
            alert("Permissions mises à jour !");
        } catch (error) { alert("Erreur mise à jour"); }
    };

        const sendProfCommunityMessage = async () => {
            if (!profCommunityMsg.trim()) return;
            const val = profCommunityMsg;
            setProfCommunityMsg(''); 

            const tempId = 'temp-' + Date.now();
            const tempMessage = {
                id: tempId,
                session_id: session.id,
                user_id: 'PROF-' + session.moodle_user_id,
                user_name: 'ENSEIGNANT',
                content: val,
                created_at: new Date().toISOString(),
                likes_count: 0,
                love_count: 0
            };

            setCommunityMessages(prev => [...prev, tempMessage]);

            try {
                const response = await api.post('/community/messages', {
                    session_id: session.id,
                    pin_code: session.pin_code,
                    user_id: 'PROF-' + session.moodle_user_id,
                    user_name: 'ENSEIGNANT',
                    content: val
                });
                
                setCommunityMessages(prev => 
                    prev.map(msg => msg.id === tempId ? response.data : msg)
                );
            } catch (e) { 
                console.error("Erreur envoi prof", e);
                setCommunityMessages(prev => prev.filter(msg => msg.id !== tempId));
            }
        };

        const sendPrivateResponse = async (messageId, studentUserId, content) => {
            try {
                await api.post('/private-responses', {
                    message_id: messageId,
                    professor_id: 'PROF-' + session.moodle_user_id,
                    student_user_id: studentUserId,
                    content: content
                });
                alert('Réponse privée envoyée avec succès !');
            } catch (error) {
                console.error('Erreur envoi réponse privée:', error);
                alert('Erreur lors de l\'envoi de la réponse privée');
            }
        };
        // CHARGER LES PARTENAIRES DE CHAT
           const loadChatPartners = async () => {
                        try {
                            const res = await api.get(`/chat-partners/PROF-${session.moodle_user_id}`);
                            setChatPartners(res.data || []);
                        } catch (e) {
                            console.error("Erreur chargement partenaires :", e);
                        }
                    };


        const mergeConversationMessages = (serverMessages, previousMessages = []) => {
            const serverList = serverMessages || [];
            const hasServerMatch = (tempMsg) => serverList.some(msg =>
                String(msg.sender_id) === String(tempMsg.sender_id) &&
                String(msg.receiver_id) === String(tempMsg.receiver_id) &&
                msg.content === tempMsg.content
            );
            const pendingMessages = previousMessages.filter(msg =>
                String(msg.id).startsWith('temp-') && !hasServerMatch(msg)
            );

            return [...serverList, ...pendingMessages].sort((a, b) =>
                new Date(a.created_at || 0) - new Date(b.created_at || 0)
            );
        };

        const loadConversation = async (partnerId, keepPending = false) => {
            try {
                const response = await api.get(`/conversation/PROF-${session.moodle_user_id}/${partnerId}`);
                const serverMessages = response.data || [];
                setCurrentConversation(prev =>
                    keepPending ? mergeConversationMessages(serverMessages, prev) : serverMessages
                );
                // Marquer comme lu
                setUnreadPrivateChats(prev => ({ ...prev, [partnerId]: 0 }));
            } catch (error) {
                console.error('Erreur chargement conversation:', error);
            }
        };

        useEffect(() => {
            selectedChatPartnerRef.current = selectedChatPartner;
        }, [selectedChatPartner]);

       const handlePrivateMessageInputChange = (e) => {
                    const value = e.target.value;
                    setPrivateMessageInput(value);

                    if (!value.trim() || !selectedChatPartner || !window.Echo) return;

                    const now = Date.now();
                    if (now - privateTypingWhisperTimeoutRef.current < 700) return;
                    privateTypingWhisperTimeoutRef.current = now;

                    const profId = `PROF-${session.moodle_user_id}`;
                    window.Echo.private(getConversationChannelName(profId, selectedChatPartner))
                        .whisper('typing', {
                            senderId: profId,
                            receiverId: selectedChatPartner,
                        });
                };

       const sendPrivateMessage = async () => {
                    if (!privateMessageInput.trim() || !selectedChatPartner) return;
                    
                    const content = privateMessageInput.trim();
                    const profId = `PROF-${session.moodle_user_id}`;
                    
                    // ✅ OPTIMISTIC UPDATE
                    const tempMsg = {
                        id: 'temp-' + Date.now(),
                        sender_id: profId,
                        receiver_id: selectedChatPartner,
                        content: content,
                        created_at: new Date().toISOString()
                    };
                    setCurrentConversation(prev => [...prev, tempMsg]);
                    setPrivateMessageInput('');

                    try {
                        const res = await api.post('/private-messages', {
                            session_id: session.id,
                            sender_id: profId,
                            receiver_id: selectedChatPartner,
                            content: content
                        });
                        
                        // ✅ Remplacer le temporaire par le vrai message
                        setCurrentConversation(prev =>
                            prev.map(m => m.id === tempMsg.id ? res.data : m)
                        );
                    } catch (error) {
                        console.error('Erreur:', error);
                        setCurrentConversation(prev => 
                            prev.filter(m => m.id !== tempMsg.id)
                        );
                        alert('Erreur lors de l\'envoi');
                    }
                };

             const selectChatPartner = (partnerId) => {
            console.log("Ouverture du chat avec :", partnerId);
            setSelectedChatPartner(partnerId);
            loadConversation(partnerId); // Charge l'historique depuis la DB
        };

        useEffect(() => {
            if (messageTab !== 'private' || !selectedChatPartner) return;

            const refreshOpenConversation = () => {
                loadConversation(selectedChatPartner, true);
                loadChatPartners();
            };

            refreshOpenConversation();
            const intervalId = setInterval(refreshOpenConversation, 2000);
            return () => clearInterval(intervalId);
        }, [messageTab, selectedChatPartner]);

        useEffect(() => {
            if (!window.Echo || messageTab !== 'private' || !selectedChatPartner) return;

            const profId = `PROF-${session.moodle_user_id}`;
            const channelName = getConversationChannelName(profId, selectedChatPartner);
            const conversationChannel = window.Echo.private(channelName);

            conversationChannel.listen('.private.message.sent', (e) => {
                const incomingMsg = e.message;
                loadChatPartners();

                setCurrentConversation(prev => {
                    if (prev.some(m => String(m.id) === String(incomingMsg.id))) return prev;

                    const tempMatch = prev.find(m =>
                        String(m.id).startsWith('temp-') &&
                        String(m.sender_id) === String(incomingMsg.sender_id) &&
                        String(m.receiver_id) === String(incomingMsg.receiver_id) &&
                        m.content === incomingMsg.content
                    );

                    if (tempMatch) {
                        return prev.map(m => m.id === tempMatch.id ? incomingMsg : m);
                    }

                    return [...prev, incomingMsg];
                });
            });

            conversationChannel.listenForWhisper('typing', (e) => {
                if (String(e.senderId) === String(profId)) return;
                if (String(e.senderId) !== String(selectedChatPartner)) return;

                setIsPrivatePartnerTyping(true);
                clearTimeout(privateTypingTimeoutRef.current);
                privateTypingTimeoutRef.current = setTimeout(() => {
                    setIsPrivatePartnerTyping(false);
                }, 1800);
            });

            return () => {
                conversationChannel.stopListening('.private.message.sent');
                conversationChannel.stopListeningForWhisper?.('typing');
                window.Echo.leave(channelName);
                clearTimeout(privateTypingTimeoutRef.current);
                setIsPrivatePartnerTyping(false);
            };
        }, [messageTab, selectedChatPartner, session.moodle_user_id]);

        useEffect(() => { activeViewRef.current = view; }, [view]);
        useEffect(() => { activeTabRef.current = messageTab; }, [messageTab]);

    return (
        <div className="live-control-root" style={containerStyle}>
            <BackgroundSlideshow />
            <div className="live-control-stage" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', position:'relative', zIndex:1 }}>
                
                {/* VUE 1 : PIN CODE */}
              {/* VUE 1 : PIN CODE */}
                {view === 'pin' && (
                    <div className="live-pin-shell" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1100px', animation: 'fadeIn 0.5s' }}>
                        
                        {/* Ligne du haut : PIN et QR Code */}
                        <div className="live-pin-grid" style={{ display: 'flex', gap: '20px', width: '100%' }}>
                            <div className="glass-card" style={{ flex: 2, padding: '40px', textAlign: 'center', position: 'relative' }}>
                                <div style={liveIndicator}><div className="pulse-green"></div><span>SESSION ACTIVE</span></div>
                                <h1 style={{ color: '#121312' }}>{session.title}</h1>
                                <div style={{
                                    margin: '35px 0',
                                    fontSize: '72px',
                                    lineHeight: 1,
                                    fontWeight: '900',
                                    color: '#6d28d9',
                                    letterSpacing: '2px'
                                }}>
                                    {sessionPin}
                                </div>

                                <div style={onlineWrapper}>
                                    <div style={onlineIndicator}>
                                        <FaUsers size={34} color="#6d28d9" />
                                    </div>
                                    <div style={onlineCountBadge}>{activeParticipants.length}</div>
                                </div>

                                <p style={{
                                    margin: '12px 0 14px',
                                    color: '#6d28d9',
                                    fontSize: '12px',
                                    fontWeight: '900'
                                }}>
                                    PARTICIPANTS EN DIRECT
                                </p>

                                <button style={viewListBtn} onClick={handleShowParticipants}>
                                    <FaListUl /> LISTE
                                </button>
                            </div>

                            <div className="glass-card" style={{ flex: 1, padding: '20px', textAlign: 'center', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                                <QRCodeSVG value={`${window.location.origin}/join/${sessionPin}`} size={160} fgColor="#6d28d9" />
                                <p style={{marginTop:'15px', fontWeight:'bold', fontSize:'12px'}}>FLASH POUR REJOINDRE</p>
                            </div>
                        </div>

                        {/* LIGNE DU BAS : L'IA BIEN PLACÉE */}
                        <AIAssistant pinCode={sessionPin} />

                    </div>
                )}

                {/* VUE 2 : MUR DE QUESTIONS */}
              {view === 'messages' && (
                <div className="glass-card live-content-card" style={fullContentCard}>
                    {/* ONGLES */}
                    <div className="live-message-tabs" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                        <h2 onClick={() => { setMessageTab('questions'); setUnreadMessages(0); }}
                            style={{ ...tabTitle, color: messageTab === 'questions' ? '#6d28d9' : '#94a3b8', borderBottom: messageTab === 'questions' ? '3px solid #6d28d9' : 'none', cursor: 'pointer' }}>
                            <FaRegComments /> Questions ({allMessages.length})
                        </h2>
                        <h2 onClick={() => { setMessageTab('community'); setUnreadCommunity(0); }}
                            style={{ ...tabTitle, color: messageTab === 'community' ? '#6d28d9' : '#94a3b8', borderBottom: messageTab === 'community' ? '3px solid #6d28d9' : 'none', cursor: 'pointer' }}>
                            <FaUsers /> Communauté ({communityMessages.length})
                        </h2>
                        <h2 onClick={() => { setMessageTab('private'); loadChatPartners(); }}
                            style={{ ...tabTitle, color: messageTab === 'private' ? '#6d28d9' : '#94a3b8', borderBottom: messageTab === 'private' ? '3px solid #6d28d9' : 'none', cursor: 'pointer' }}>
                            💬 Chat Privé ({chatPartners.length})
                        </h2>

                    </div>

                    {/* BOUTON POUR TRIER PAR LIKES (SEULEMENT DANS LA COMMUNAUTÉ) */}
                    {messageTab === 'community' && (
                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <button 
                                onClick={() => {
                                    if (sortCommunityByLikes) {
                                        // Recharger les messages normaux
                                        fetchInitialData();
                                        setSortCommunityByLikes(false);
                                    } else {
                                        // Charger les messages triés par likes
                                        fetchTopLikedCommunity();
                                        setSortCommunityByLikes(true);
                                    }
                                }}
                                style={{
                                    backgroundColor: sortCommunityByLikes ? '#6d28d9' : 'rgba(109,40,217,0.1)',
                                    color: sortCommunityByLikes ? 'white' : '#6d28d9',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {sortCommunityByLikes ? 'Trier par date' : 'Top Messages 👍'}
                            </button>
                        </div>
                    )}

                    {/* LISTE DES MESSAGES */}
                    <div style={scrollContainer}>
                         {messageTab === 'questions' && allMessages.map((m, i) => {
                            const studentId = m.user_id || m.moodle_user_id;
                            return (
                                <div key={i} style={msgBubbleStyle}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <b style={{fontSize:'12px', color:'#6d28d9'}}>
                                            ÉTUDIANT {studentId ? studentId.substr(-4) : '...'}
                                        </b>
                                        <small>{new Date(m.created_at).toLocaleTimeString()}</small>
                                    </div>
                                    <p>{m.content}</p>
                                    
                                    <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px'}}>
                                        <button 
                                            onClick={() => {
                                                selectChatPartner(studentId);
                                                setMessageTab('private');
                                            }}
                                            style={{
                                                backgroundColor: '#25d366',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 15px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <FaRegComments /> DISCUTER EN PRIVÉ
                                        </button>

                                        <button 
                                            onClick={() => {
                                                const response = prompt('Réponse rapide (s\'affichera sous sa question) :');
                                                if (response && response.trim()) {
                                                    sendPrivateResponse(m.id, studentId, response.trim());
                                                }
                                            }}
                                            style={{
                                                backgroundColor: '#f1f5f9',
                                                color: '#64748b',
                                                border: 'none',
                                                padding: '8px 15px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '11px'
                                            }}
                                        >
                                            Réponse rapide
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {messageTab === 'community' && communityMessages.map((m, i) => (
                            <div key={i} style={{...msgBubbleStyle, borderLeftWidth: '5px', borderLeftStyle: 'solid', borderLeftColor: m.user_id.includes('PROF') ? '#6d28d9' : '#10b981'}}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <b style={{fontSize:'12px', color: m.user_id.includes('PROF') ? '#6d28d9' : '#10b981'}}>
                                        {m.user_name}
                                    </b>
                                    <small>{formatTime(m.created_at)}</small>
                                </div>
                                <p style={{margin:'5px 0'}}>{m.content}</p>
                                <div style={{fontSize:'11px', color:'#94a3b8'}}>
                                    👍 {m.likes_count || 0}  ❤️ {m.love_count || 0}
                                </div>
                            </div>
                        ))}

                        {/* Si on est en mode 'private', le scrollContainer sera vide, 
                            c'est normal car l'interface de chat privé est en dessous et prend toute la place */}
                    </div>

                    {/* ZONE D'ÉCRITURE POUR LE PROF (Seulement si onglet communauté) */}
                    {messageTab === 'community' && (
                        <div style={{display:'flex', gap:'10px', marginTop:'20px', padding:'15px', borderTop:'1px solid #eee'}}>
                            <input 
                                type="text" 
                                value={profCommunityMsg} 
                                onChange={(e) => setProfCommunityMsg(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendProfCommunityMessage()}
                                placeholder="Répondre à la communauté..." 
                                style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #ddd', outline:'none'}} 
                            />
                            <button onClick={sendProfCommunityMessage} style={{backgroundColor:'#6d28d9', color:'white', border:'none', borderRadius:'10px', padding:'0 20px', cursor:'pointer'}}><FaPlus/> ENVOYER</button>
                        </div>
                    )}

                    {/* ZONE CHAT PRIVÉ (Affichée uniquement si messageTab est 'private') */}
                    {messageTab === 'private' && (
                        <div className="live-private-chat" style={{ display: 'flex', height: '60vh', backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', marginTop: '20px' }}>
                            {/* ... le reste de ton code de chat privé est correct ... */}
        
        {/* COLONNE GAUCHE : LISTE DES DISCUSSIONS */}
        <div className="live-private-list" style={{ width: '30%', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Conversations</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {chatPartners.map(p => (
                    <div 
                        key={p.user_id}
                        onClick={() => selectChatPartner(p.user_id)}
                        style={{ 
                            padding: '15px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #f9f9f9',
                            backgroundColor: selectedChatPartner === p.user_id ? '#f0f4ff' : 'transparent' 
                        }}
                    >
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{p.user_id.replace('STU-', 'Étudiant ')}</div>
                        <div style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.last_message}</div>
                    </div>
                ))}
            </div>
        </div>

                    {/* COLONNE DROITE : LE CHAT EN DIRECT */}
                    <div className="live-private-thread" style={{ width: '70%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
                        {selectedChatPartner ? (
                            <>
                                <div style={{ padding: '10px 20px', backgroundColor: 'white', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                                    Chat avec {selectedChatPartner}
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {currentConversation.map((msg, i) => (
                                        <div key={i} style={{ 
                                            alignSelf: msg.sender_id.includes('PROF') ? 'flex-end' : 'flex-start',
                                            backgroundColor: msg.sender_id.includes('PROF') ? '#6d28d9' : 'white',
                                            color: msg.sender_id.includes('PROF') ? 'white' : 'black',
                                            padding: '10px 15px',
                                            borderRadius: '15px',
                                            maxWidth: '80%',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                        }}>
                                            {msg.content}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                
                                {/* ZONE DE SAISIE */}
                                {isPrivatePartnerTyping && (
                                    <div style={{fontSize:'12px', color:'#6d28d9', padding:'0 15px 8px', backgroundColor:'white', fontWeight:'600'}}>
                                        En train d'ecrire...
                                    </div>
                                )}
                                <div style={{ padding: '15px', backgroundColor: 'white', display: 'flex', gap: '10px' }}>
                                    <input 
                                        value={privateMessageInput}
                                        onChange={handlePrivateMessageInputChange}
                                        onKeyPress={(e) => e.key === 'Enter' && sendPrivateMessage()}
                                        placeholder="Écrire un message..."
                                        style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' }}
                                    />
                                    <button onClick={sendPrivateMessage} style={{ backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }}>
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                Sélectionnez un étudiant pour démarrer le chat
                            </div>
                        )}
                    </div>
                </div>
            )}
                </div>
            )}

                {/* VUE 3 : SONDAGES */}
                {view === 'polls' && (
                    <div className="glass-card" style={fullContentCard}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <h2 style={{ color: '#6d28d9' }}><FaChartBar /> Centre d'Activités</h2>
                        </div>
                        {/* ON AJOUTE LE GESTIONNAIRE D'ACTIVITÉ ICI */}
                        <ActivityManager 
                            session={session} 
                            participantCount={activeParticipants.length} // <--- ON ENVOIE LA TAILLE DE LA LISTE
                        />
                    </div>
                )}
            </div>

            {/* BARRE D'OUTILS BASSE */}
            <div className="glass-card" style={toolbarStyle}>
                <div style={toolbarGroup}>
                    <button style={view === 'messages' ? toolBtnActive : toolBtn} onClick={() => { setView('messages'); setUnreadMessages(0); }}>
                        <div style={{ position: 'relative' }}>
                            <FaRegComments size={24}/>
                            {unreadMessages > 0 && <span style={fbBadgeStyle}>{unreadMessages}</span>}
                        </div>
                        <span>Messages</span>
                    </button>
                     <button style={view === 'rankings' ? toolBtnActive : toolBtn} onClick={() => setView('rankings')}>
                        <FaUserGraduate size={24}/> <span>Classement</span>
                    </button>
                    <button style={view === 'polls' ? toolBtnActive : toolBtn} onClick={() => setView('polls')}><FaChartBar size={24}/> <span>Sondages</span></button>
                    <button style={view === 'pin' ? toolBtnActive : toolBtn} onClick={() => setView('pin')}><FaQrcode size={24}/> <span>Code PIN</span></button>
                </div>
                <div style={toolbarGroup}>
                    <button className="main-action-btn" onClick={() => setView('polls')}>
                        <FaPlus /> LANCER ACTIVITÉ
                    </button>
                </div>
                <div style={toolbarGroup}>
                    <button style={toolBtn} onClick={() => setShowPermissions(true)}><FaShieldAlt size={24}/> <span>Permissions</span></button>
                    <button onClick={handleCloturer} style={{...toolBtn, color: '#ef4444'}}><FaPowerOff size={24}/> <span>Clôturer</span></button>
                </div>
            </div>


            {/* MODALE : LISTE DES ÉTUDIANTS (FONCTIONNELLE) */}
            {showParticipants && (
                <div style={modalOverlay}>
                    <div className="glass-card" style={modalContent}>
                        <div style={modalHeader}>
                            <h3 style={{margin:0}}><FaUsers color="#6d28d9"/> Participants</h3>
                            <FaTimes onClick={() => setShowParticipants(false)} style={{cursor:'pointer', color:'#94a3b8'}} size={20} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h4 style={{fontSize:'11px', color:'#94a3b8'}}>EN DIRECT</h4>
                                <div style={{maxHeight:'250px', overflowY:'auto'}}>
                                    {activeParticipants.map(p => <div key={p.id} style={participantRowDirect}><div style={onlineDot}></div>{p.name}</div>)}
                                </div>
                            </div>
                            <div style={{borderLeft:'1px solid #eee', paddingLeft:'15px'}}>
                                <h4 style={{fontSize:'11px', color:'#94a3b8'}}>LISTE MOODLE</h4>
                                <div style={{maxHeight:'250px', overflowY:'auto'}}>
                                    {participantsList.map(u => <div key={u.id} style={{fontSize:'12px', marginBottom:'5px'}}><b>{u.firstname}</b></div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        {view === 'rankings' && (
        <div className="glass-card fadeIn" style={fullContentCard}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                <h2 style={{color:'#6d28d9', margin:0, display:'flex', alignItems:'center', gap:'12px'}}>
                    <FaUserGraduate /> Tableau d'Honneur
                </h2>
                <button style={btnDownloadChic} onClick={() => window.open(`${import.meta.env.VITE_API_URL}/sessions/${session.id}/export`, '_blank')}>
                    <FaChartBar /> EXPORTER EXCEL
                </button>
            </div>

             <div style={rankingScrollArea}>
                {leaderboard.length > 0 ? leaderboard.map((p, i) => (
                    <div key={i} style={{
                        ...rankingRowChic, 
                        borderLeft: `6px solid ${i === 0 ? '#f59e0b' : (i === 1 ? '#94a3b8' : (i === 2 ? '#b45309' : '#6d28d9'))}`,
                        borderLeft: `6px solid ${i === 0 ? '#f59e0b' : (i === 1 ? '#94a3b8' : (i === 2 ? '#b45309' : '#6d28d9'))}`,
                        borderLeft: `6px solid ${i === 0 ? '#f59e0b' : (i === 1 ? '#94a3b8' : (i === 2 ? '#b45309' : '#6d28d9'))}`,
                        backgroundColor: i === 0 ? 'rgba(245, 158, 11, 0.05)' : 'white'
                    }}>
                        {/* Position / Médaille */}
                        <div style={rankNumChic}>
                            {i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : i + 1))}
                        </div>
                        
                        {/* Infos Étudiant */}
                        <div style={{flex:1}}>
                            <div style={{fontWeight:'800', color:'#1e1b4b', fontSize:'18px'}}>{p.user_name || p.name}</div>
                            <div style={{fontSize:'12px', color:'#94a3b8'}}>{p.correct_answers || 0} bonnes réponses</div>
                        </div>

                        {/* Score XP */}
                        <div style={xpBadgeChic}>
                            <div style={{fontSize:'24px', fontWeight:'900'}}>{p.xp_points || 0}</div>
                            <div style={{fontSize:'10px', fontWeight:'bold', opacity:0.6}}>POINTS XP</div>
                        </div>

                        {/* Statut En Ligne */}
                        <div style={statusBadgeChic}>
                            <div className="pulse-green-small"></div> LIVE
                        </div>
                    </div>
                )) : (
                    <p style={{textAlign:'center', color:'#94a3b8', marginTop:'50px'}}>En attente de participation...</p>
                )}
            </div>
        </div>
    )}

            

            {/* MODALE : PERMISSIONS (RESTAURÉE) */}
            {/* MODALE : PERMISSIONS */}
                {showPermissions && (
                    <div style={modalOverlay}>
                        <div className="glass-card" style={modalContent}>
                            <div style={modalHeader}>
                                <h3><FaShieldAlt color="#6d28d9"/> Permissions de la salle</h3>
                                <FaTimes onClick={() => setShowPermissions(false)} style={{cursor:'pointer'}} />
                            </div>
                            
                            {/* 1. ON GARDE SEULEMENT LES QUESTIONS */}
                            <div style={permRow}>
                                <span>Autoriser les messages (Chat)</span>
                                <input type="checkbox" checked={perms.allow_questions} onChange={(e)=>setPerms({...perms, allow_questions: e.target.checked})} />
                            </div>

                            {/* 2. ON GARDE LA MODÉRATION */}
                            <div style={permRow}>
                                <span>Modération du chat</span>
                                <input type="checkbox" checked={perms.is_moderated} onChange={(e)=>setPerms({...perms, is_moderated: e.target.checked})} />
                        </div>
                    </div>
                </div>
                )}
                </div>
            );
        };

// --- STYLES ---

export default LiveSessionControl;

