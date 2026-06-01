import React, { useState, useEffect, useRef } from 'react';
import BackgroundSlideshow from './BackgroundSlideshow';
import PollInterface from './components/PollInterface';
import QCMStudent from './components/activities/QCM/QCMStudent';
import WordCloudStudent from './components/activities/WordCloud/WordCloudStudent';
import OpenQuestionStudent from './components/activities/OpenQuestion/OpenQuestionStudent';
import ScaleStudent from './components/activities/Scale/ScaleStudent';
import StudentSummary from './components/StudentSummary';
import api from './api';
import { FaPaperPlane, FaCommentDots, FaHeart, FaThumbsUp, FaFrown, FaSmile, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StudentSession = ({ session, onLeave }) => {
    // 1. ID persistant
    const [myId] = useState(() => {
        const savedId = localStorage.getItem('my_student_id');
        if (savedId) return savedId;
        const newId = "STU-" + Math.floor(Math.random() * 1000000);
        localStorage.setItem('my_student_id', newId);
        return newId;
    });

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const myName = "Étudiant " + String(myId).substr(-4);


    // --- ÉTATS DES MESSAGES (SÉPARÉS) ---
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('s_tab') || 'questions');

    useEffect(() => {
        localStorage.setItem('s_tab', activeTab);
    }, [activeTab]);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // Pour le prof (existant)
    const [communityMsgs, setCommunityMsgs] = useState([]); // Pour la communauté (NOUVEAU)
    const [privateResponses, setPrivateResponses] = useState([]); // Pour les réponses privées
    const [chatPartners, setChatPartners] = useState([]); // Liste des partenaires de chat
    const [selectedChatPartner, setSelectedChatPartner] = useState(null);
    const selectedChatPartnerRef = useRef(selectedChatPartner);
    const privateChatContainerRef = useRef(null);
    const privateTypingTimeoutRef = useRef(null);
    const privateTypingWhisperTimeoutRef = useRef(0);
    const messagesEndRef = useRef(null);  // ← AJOUTE ICI

    // Toast and Community Typing States
    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const showToastNotification = (msg, type = 'success') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ message: msg, type });
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    const [activeCommunityTypers, setActiveCommunityTypers] = useState([]);
    const communityTypersRef = useRef({});
    const communityTypingWhisperTimeoutRef = useRef(0);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            Object.values(communityTypersRef.current).forEach(clearTimeout);
        };
    }, []);

    const [currentPrivateConversation, setCurrentPrivateConversation] = useState([]);
    const [isPrivatePartnerTyping, setIsPrivatePartnerTyping] = useState(false);
    const [activitiesCount, setActivitiesCount] = useState(0);
    const [score, setScore] = useState(0);
    const [sessionPermissions, setSessionPermissions] = useState({
        allow_questions: session.allow_questions ?? true,
        show_results_to_students: session.show_results_to_students ?? true
    });
    const [showSummary, setShowSummary] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [privateMessageInput, setPrivateMessageInput] = useState('');

    
    // CHARGER LES PARTENAIRES DE CHAT (défini ici pour être accessible partout)
    const getConversationChannelName = (userId1, userId2) => {
        const key = [String(userId1), String(userId2)]
            .sort()
            .map(id => id.replace(/[^A-Za-z0-9_-]/g, '_'))
            .join('__');

        return `chat.conversation.${key}`;
    };

    const loadChatPartners = async () => {
        try {
            const res = await api.get(`/chat-partners/${myId}`);
            setChatPartners(res.data || []);
        } catch (e) {
            console.error("Erreur chargement partenaires :", e);
        }
    };

    // --- CHARGEMENT DES DONNÉES & GESTION TEMPS RÉEL (ECHO) ---
    useEffect(() => {
        const showFinalSummary = () => {
            setShowSummary(true);
            localStorage.removeItem('active_student_session');
            setParticipantsCount(0);
            setCurrentQuestion(null);
            setLeaderboard([]);
            setScore(0);
        };

        const autoJoin = async () => {
            try {
                await api.post('/sessions/join', { pin_code: session.pin_code, student_id: myId });
            } catch (e) {
                console.error("Erreur participation");
                if ([403, 404].includes(e.response?.status)) {
                    showFinalSummary();
                }
            }
        };
        autoJoin();

        const statusInterval = setInterval(async () => {
            try {
                const res = await api.get(`/sessions/${session.pin_code}/status`);
                if (res.data?.status === 'closed' || res.data?.session?.status === 'closed') {
                    showFinalSummary();
                }
            } catch (e) {
                if ([403, 404].includes(e.response?.status)) {
                    showFinalSummary();
                }
            }
        }, 2000);

        const loadCommunityMessages = async () => {
            try {
                const res = await api.get(`/community/${session.pin_code}/messages`);
                setCommunityMsgs(res.data || []);
            } catch (e) { console.error("Erreur messages communauté:", e); }
        };
        loadCommunityMessages();

        loadChatPartners();

        const loadPrivateResponses = async () => {
            try {
                const res = await api.get(`/private-responses/${myId}`);
                setPrivateResponses(res.data || []);
            } catch (e) { console.error("Erreur réponses privées:", e); }
        };
        loadPrivateResponses();
        if (window.Echo && myId) {
            console.log("📡 Initialisation des canaux pour l'étudiant:", myId);
            const mainChannel = window.Echo.channel(`session.${session.pin_code}`);
            const myChannel = window.Echo.channel(`private.chat.${myId}`);
            const communityChannel = window.Echo.private(`community.${session.pin_code}`);
            const myResponseChannel = window.Echo.channel(`private.messages.${myId}`);

            // ÉCOUTER LES RÉPONSES PRIVÉES
            myResponseChannel.listen('.private.response.sent', (e) => {
                console.log("✅ Réponse du professeur reçue !", e.response);
                setPrivateResponses(prev => {
                    if (prev.some(r => String(r.id) === String(e.response.id))) return prev;
                    return [...prev, e.response];
                });
            });

            // ÉCOUTER LA COMMUNAUTÉ
            communityChannel.listen('.community.sent', (e) => {
                setCommunityMsgs((prev) => {
                    if (prev.some(m => String(m.id) === String(e.message.id))) return prev;
                    
                    // Remplacer le message temporaire s'il existe
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

            // ÉCOUTER LES RÉACTIONS
            communityChannel.listen('.reaction.received', (e) => {
                setCommunityMsgs((prev) => prev.map(msg =>
                    String(msg.id) === String(e.messageId)
                        ? { ...msg, likes_count: e.reactions.likes, love_count: e.reactions.love }
                        : msg
                ));
            });

            // ÉCOUTER LES SAISIES COMMUNAUTÉ
            communityChannel.listenForWhisper('typing', (e) => {
                if (String(e.userId) === String(myId)) return;
                
                if (communityTypersRef.current[e.userId]) {
                    clearTimeout(communityTypersRef.current[e.userId]);
                }
                
                setActiveCommunityTypers(prev => {
                    if (prev.some(t => t.userId === e.userId)) return prev;
                    return [...prev, { userId: e.userId, userName: e.userName }];
                });
                
                communityTypersRef.current[e.userId] = setTimeout(() => {
                    setActiveCommunityTypers(prev => prev.filter(t => t.userId !== e.userId));
                    delete communityTypersRef.current[e.userId];
                }, 1800);
            });
            

            // ÉCOUTER LES ACTIVITÉS
            mainChannel.listen('.ActivityLaunched', (e) => {
                const activity = e.activity ?? e;
                console.log('🔥 RECU', e);
                // Éviter le lancement en double : si l'activité courante possède déjà cet ID, on ignore
                setShowSummary(false);
                setCurrentQuestion((prev) => (
                    prev && prev.id === activity.id ? prev : { ...activity, status: 'open' }
                ));
                console.log('🔥 RECU', e);
            // Éviter le lancement en double : si l'activité courante possède déjà cet ID, on ignore
            setShowSummary(false);
            setCurrentQuestion((prev) => (
                prev && prev.id === activity.id ? prev : { ...activity, status: 'open' }
            ));
            });

            // ACTIVITÉ ARRÊTÉE (ne pas afficher le feedback ici)
            mainChannel.listen('.ActivityStopped', () => {
                setCurrentQuestion(null);
            });

                // SESSION CLÔTURE – on montre le feedback et on redirige l'étudiant
                const handleSessionClosed = () => {
                    showFinalSummary();
                    // Cleanup: leave all channels to ensure student is ejected
                    window.Echo.leave(`session.${session.pin_code}`);
                    window.Echo.leave(`community.${session.pin_code}`);
                    window.Echo.leave(`private.chat.${myId}`);
                    window.Echo.leave(`private.messages.${myId}`);
                    // Remove any residual listeners
                    mainChannel.stopListening('.ActivityLaunched');
                    mainChannel.stopListening('.ActivityStopped');
                    mainChannel.stopListening('.ParticipantUpdated');
                    mainChannel.stopListening('.LeaderboardUpdated');
                    mainChannel.stopListening('.PermissionsUpdated');
                };
                // Listen for the namespaced event (with dot)
                mainChannel.listen('.SessionClosed', handleSessionClosed);
                // Fallback: listen for raw event name without dot (some Echo configs)
                mainChannel.listen('SessionClosed', handleSessionClosed);

            // PARTICIPANT UPDATED – update real‑time participant count
            mainChannel.listen('.ParticipantUpdated', (e) => {
                // Expected payload { participants_count: number } or similar
                if (e && (e.participants_count !== undefined || e.participantsCount !== undefined)) {
                    const count = e.participants_count ?? e.participantsCount;
                    setParticipantsCount(count);
                }
            });

            mainChannel.listen('.LeaderboardUpdated', (e) => {
                setLeaderboard(e.leaderboard);
                const me = e.leaderboard.find(u => String(u.student_id) === String(myId));
                if (me) setScore(me.xp_points);
            });

            mainChannel.listen('.PermissionsUpdated', (e) => {
                console.log("Nouvelles permissions reçues :", e.permissions);
                setSessionPermissions(e.permissions);
            });

            const handleNewMessage = (e) => {
                const incomingMsg = e.message;
                console.log("📩 MESSAGE PRIVÉ REÇU !", incomingMsg);
                loadChatPartners();

                const currentPartner = selectedChatPartnerRef.current;
                const isFromCurrentPartner = String(incomingMsg.sender_id) === String(currentPartner);
                const isToCurrentPartner = String(incomingMsg.receiver_id) === String(currentPartner);

                if (isFromCurrentPartner || isToCurrentPartner) {
                    setCurrentPrivateConversation(prev => {
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

                    setTimeout(() => {
                        if (privateChatContainerRef.current) {
                            const container = privateChatContainerRef.current;
                            const isFromMe = String(incomingMsg.sender_id) === String(myId);
                            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
                            if (isFromMe || isNearBottom) {
                                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                            }
                        }
                    }, 50);
                }
            };

            myChannel.listen('.private.message.sent', handleNewMessage);

            return () => {
                clearInterval(statusInterval);
                window.Echo.leave(`session.${session.pin_code}`);
                window.Echo.leave(`community.${session.pin_code}`);
                window.Echo.leave(`private.chat.${myId}`);
                window.Echo.leave(`private.messages.${myId}`);
                myChannel.stopListening('.private.message.sent');
            };
        }
        return () => clearInterval(statusInterval);
    }, [session.pin_code, myId, session.moodle_user_id]);

    useEffect(() => {
        selectedChatPartnerRef.current = selectedChatPartner;
    }, [selectedChatPartner]);

    const scrollToBottomPrivateChat = (behavior = 'auto') => {
        if (privateChatContainerRef.current) {
            privateChatContainerRef.current.scrollTo({
                top: privateChatContainerRef.current.scrollHeight,
                behavior: behavior
            });
        }
    };

    useEffect(() => {
        if (activeTab === 'private' && selectedChatPartner) {
            setTimeout(() => scrollToBottomPrivateChat('auto'), 100);
        }
    }, [selectedChatPartner, activeTab]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        if (!session?.id) {
            console.error("Session ID manquant !", session);
            showToastNotification("Erreur : Session non identifiée. Rafraîchis la page.", "error");
            return;
        }

        const msgData = {
            session_id: session.id,
            pin_code: session.pin_code,
            user_id: myId,
            content: message
        };

        setMessage('');

        try {
            const response = await api.post('/messages', msgData);
            console.log("Message envoyé au professeur ✓");
            setMessages(prev => [...prev, response.data]);
            showToastNotification("Question envoyée au professeur !", "success");
        } catch (e) {
            console.error("Erreur envoi du message:", e.response?.data || e.message);
            showToastNotification("Erreur lors de l'envoi: " + (e.response?.data?.error || e.message), "error");
        }
    };

    const handleSendCommunityMessage = async () => {
        if (!message.trim()) return;

        if (!session?.id) {
            console.error("Session ID manquant !", session);
            showToastNotification("Erreur : Session non identifiée. Rafraîchis la page.", "error");
            return;
        }

        const msgData = {
            session_id: session.id,
            pin_code: session.pin_code,
            user_id: myId,
            user_name: myName,
            content: message
        };

        // OPTIMISTIC UPDATE
        const tempId = 'temp-' + Date.now();
        const tempMessage = { ...msgData, id: tempId, created_at: new Date().toISOString(), likes_count: 0, love_count: 0 };
        setCommunityMsgs((prev) => [...prev, tempMessage]);
        setMessage('');

        try {
            const response = await api.post('/community/messages', msgData);
            console.log("Message communauté envoyé avec succès:", response.data);

            setCommunityMsgs((prev) =>
                prev.map(msg => msg.id === tempId ? response.data : msg)
            );

        } catch (e) {
            console.error("Erreur envoi message communauté:", e.response?.data || e.message);
            showToastNotification("Erreur lors de l'envoi: " + (e.response?.data?.error || e.message), "error");

            setCommunityMsgs((prev) => prev.filter(msg => msg.id !== tempId));
        }
    };

    // GESTION DES ACTIVITÉS
    const handleActivityResponse = async (activityId, response, points = 10) => {
        try {
            await api.post(`/activities/${activityId}/vote`, {
                student_id: myId,
                answer: response,
                points: points
            });

            setActivitiesCount(prev => prev + 1);
        } catch (e) { console.error(e); }
    };

    // RÉACTIONS SUR LES MESSAGES
    const sendReactionToMessage = async (messageId, type) => {
        try {
            const res = await api.post(`/community/messages/${messageId}/react`, {
                user_id: myId,
                type: type,
                pin_code: session.pin_code
            });

            // Mettre à jour les réactions dans communityMsgs
            setCommunityMsgs(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, likes_count: res.data.reactions.likes, love_count: res.data.reactions.love } : msg
            ));
        } catch (e) {
            console.error('Erreur réaction:', e);
        }
    };

    // CHARGER UNE CONVERSATION PRIVÉE
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

    const loadPrivateConversation = async (partnerId, keepPending = false) => {
        try {
            const res = await api.get(`/conversation/${myId}/${partnerId}`);
            const serverMessages = res.data || [];
            setCurrentPrivateConversation(prev =>
                keepPending ? mergeConversationMessages(serverMessages, prev) : serverMessages
            );
            console.log("Conversation chargée :", res.data);
        } catch (e) {
            console.error("Erreur chargement conversation :", e);
            if (!keepPending) setCurrentPrivateConversation([]);
        }
    };

    // SÉLECTIONNER UN PARTENAIRE DE CHAT
    const selectPrivateChatPartner = (partnerId) => {
        setSelectedChatPartner(partnerId);
        setActiveTab('private');
        loadPrivateConversation(partnerId);
    };

    // ENVOYER UN MESSAGE PRIVÉ
        // Dans StudentSession.jsx - Améliorer sendPrivateMessage
        useEffect(() => {
            if (activeTab !== 'private' || !selectedChatPartner) return;

            const refreshOpenConversation = () => {
                loadPrivateConversation(selectedChatPartner, true);
                loadChatPartners();
            };

            refreshOpenConversation();
            const intervalId = setInterval(refreshOpenConversation, 2000);
            return () => clearInterval(intervalId);
        }, [activeTab, selectedChatPartner]);

        useEffect(() => {
            if (!window.Echo || activeTab !== 'private' || !selectedChatPartner) return;

            const channelName = getConversationChannelName(myId, selectedChatPartner);
            const conversationChannel = window.Echo.private(channelName);

            conversationChannel.listen('.private.message.sent', (e) => {
                const incomingMsg = e.message;
                loadChatPartners();

                setCurrentPrivateConversation(prev => {
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
                if (String(e.senderId) === String(myId)) return;
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
        }, [activeTab, selectedChatPartner, myId]);

        const handlePrivateMessageInputChange = (e) => {
            const value = e.target.value;
            setPrivateMessageInput(value);

            if (!value.trim() || !selectedChatPartner || !window.Echo) return;

            const now = Date.now();
            if (now - privateTypingWhisperTimeoutRef.current < 700) return;
            privateTypingWhisperTimeoutRef.current = now;

            window.Echo.private(getConversationChannelName(myId, selectedChatPartner))
                .whisper('typing', {
                    senderId: myId,
                    receiverId: selectedChatPartner,
                });
        };

        const handleCommunityMessageInputChange = (e) => {
            const val = e.target.value;
            setMessage(val);

            if (activeTab === 'public' && val.trim() && window.Echo) {
                const now = Date.now();
                if (now - communityTypingWhisperTimeoutRef.current < 700) return;
                communityTypingWhisperTimeoutRef.current = now;

                window.Echo.private(`community.${session.pin_code}`)
                    .whisper('typing', {
                        userId: myId,
                        userName: myName
                    });
            }
        };

        const sendPrivateMessage = async () => {
            if (!privateMessageInput.trim() || !selectedChatPartner) return;

            const content = privateMessageInput.trim();
            const receiverId = selectedChatPartner;
            
            // ✅ OPTIMISTIC UPDATE
            const tempMsg = {
                id: 'temp-' + Date.now(),
                sender_id: myId,
                receiver_id: receiverId,
                content: content,
                created_at: new Date().toISOString()
            };
            
            setCurrentPrivateConversation(prev => [...prev, tempMsg]);
            setPrivateMessageInput('');
            setTimeout(() => scrollToBottomPrivateChat('smooth'), 50);

            try {
                // 🔑 POINT CLÉ : Envoyer au serveur avec les bons identifiants
                const res = await api.post('/private-messages', {
                    session_id: session.id,
                    sender_id: myId,
                    receiver_id: receiverId,  // ← doit être "PROF-{id}" ou "STU-{id}"
                    content: content
                });
                
                // Remplacer le message temporaire
                setCurrentPrivateConversation(prev =>
                    prev.map(m => m.id === tempMsg.id ? res.data : m)
                );
                
                // Rafraîchir la liste des partenaires
                await loadChatPartners();
                
            } catch (error) {
                console.error('❌ Erreur envoi message privé:', error);
                setCurrentPrivateConversation(prev => 
                    prev.filter(m => m.id !== tempMsg.id)
                );
                showToastNotification(error.response?.data?.error || "Erreur de connexion", "error");
            }
        };

    // FORMATAGE DU TEMPS
    const formatTime = (dateStr) => {
        if(!dateStr) return '...';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'À l\'instant';
        return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    // --- RENDER ---
    if (showSummary) {
        return (
            <div className="fadeIn">
                <StudentSummary pinCode={session.pin_code} />
            </div>
        );
    }

    return (
        <>
            <BackgroundSlideshow />
            <div className="student-live-layout" style={mainLayout}>
                 {/* SIDEBAR XP À GAUCHE (PUISSANTE) */}
                              {/* SIDEBAR : CLASSEMENT EN DIRECT (STYLE JEU) */}
                        <div className="glass-card sidebar-xp-glow student-xp-sidebar" style={sidebarXPStyle}>
                            <div style={{textAlign:'center', marginBottom: '20px'}}>
                                <div style={{fontSize:'10px', color:'#94a3b8', fontWeight:'bold'}}>VOUS ÊTES :</div>
                                <div style={{color:'#6d28d9', fontWeight:'bold', fontSize:'14px'}}>{myName}</div>
                            </div>

                            <div style={{textAlign:'center'}}>
                                <div style={xpCounterStyle}>{score} <small style={{fontSize:'14px'}}>XP</small></div>
                                <div style={{fontSize:'12px', color:'#94a3b8', marginTop:'5px'}}>Activités: {activitiesCount}</div>
                            </div>

                            {/* CLASSEMENT */}
                            <div style={{marginTop:'20px'}}>
                                <div style={{fontSize:'12px', color:'#94a3b8', marginBottom:'10px', textAlign:'center'}}>🏆 CLASSEMENT</div>
                                <div style={{maxHeight:'200px', overflowY:'auto'}}>
                                    {leaderboard.slice(0, 10).map((user, index) => (
                                        <div key={user.student_id} style={{
                                            display:'flex',
                                            justifyContent:'space-between',
                                            alignItems:'center',
                                            padding:'5px 10px',
                                            marginBottom:'3px',
                                            borderRadius:'8px',
                                            backgroundColor: String(user.student_id) === String(myId) ? 'rgba(109,40,217,0.2)' : 'rgba(255,255,255,0.05)',
                                            fontSize:'12px'
                                        }}>
                                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                <span style={{fontWeight:'bold', color:'#f59e0b'}}>#{index + 1}</span>
                                                <span style={{color: String(user.student_id) === String(myId) ? '#6d28d9' : '#e2e8f0'}}>
                                                    {String(user.student_id).includes('STU') ? `Étudiant ${String(user.student_id).substr(-4)}` : user.name}
                                                </span>
                                            </div>
                                            <span style={{color:'#f59e0b', fontWeight:'bold'}}>{user.xp_points} XP</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CONTENU PRINCIPAL */}
                        <div className="student-session-card" style={sessionCardFull}>
                            {/* HEADER */}
                            <div style={header}>
                                <div>
                                    <h2 style={{margin:'0 0 5px 0', color:'#1e293b'}}>Session Interactive</h2>
                                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                        <div style={pinBadge}>📌 {session.pin_code}</div>
                                        <div style={{fontSize:'14px', color:'#64748b'}}>
                                            {currentQuestion ? `Activité en cours: ${currentQuestion.title}` : 'En attente d\'activité...'}
                                        </div>
                                    </div>
                                </div>

                                {/* BOUTON CHAT */}
                                <button
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    style={chatToggleBtn}
                                >
                                    <FaCommentDots /> {isChatOpen ? 'Masquer Chat' : 'Ouvrir Chat'}
                                </button>
                            </div>

                            {/* CONTENU */}
                            <div style={contentArea}>
                                {currentQuestion ? (
                                    <div className="student-question-box" style={questionBox}>
                                        {/* LOGIQUE DES ACTIVITÉS */}
                                        {currentQuestion.type === 'poll' && <PollInterface activity={currentQuestion} onResponse={handleActivityResponse} />}
                                        {currentQuestion.type === 'qcm' && <QCMStudent activity={currentQuestion} onVote={(val) => handleActivityResponse(currentQuestion.id, val)} />}
                                        {currentQuestion.type === 'wordcloud' && <WordCloudStudent activity={currentQuestion} onVote={(val) => handleActivityResponse(currentQuestion.id, val)} />}
                                        {currentQuestion.type === 'open_question' && <OpenQuestionStudent activity={currentQuestion} onVote={(val) => handleActivityResponse(currentQuestion.id, val)} />}
                                        {currentQuestion.type === 'scale' && <ScaleStudent activity={currentQuestion} onVote={(val) => handleActivityResponse(currentQuestion.id, val)} />}
                                    </div>
                                ) : (
                                    <div className="student-waiting-state" style={waitingBox}>
                                        <div className="waiting-dots" aria-hidden="true">
                                            <span></span><span></span><span></span>
                                        </div>
                                        <h3>En attente d'une activité...</h3>
                                        <p>Le professeur va bientôt lancer une activité interactive.</p>
                                        <p style={{fontSize:'14px', color:'#94a3b8', marginTop:'10px'}}>
                                            Utilisez le chat pour poser vos questions en attendant !
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PANEL CHAT À DROITE */}
                        {isChatOpen && (
                            <div className="student-side-chat" style={sideChatPanel}>
                                {/* HEADER AVEC ONGLETS */}
                                <div style={tabHeader}>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <div
                                            onClick={() => setActiveTab('questions')}
                                            style={activeTab === 'questions' ? tabActive : tabInactive}
                                        >
                                            Questions au prof
                                        </div>
                                         <div
                                             onClick={() => setActiveTab('public')}
                                             style={activeTab === 'public' ? tabActive : tabInactive}
                                         >
                                             Communauté 💬
                                         </div>
                                         <div
                                             onClick={() => { setActiveTab('private'); loadChatPartners(); }}
                                             style={activeTab === 'private' ? tabActive : tabInactive}
                                         >
                                             Chat Privé 💬
                                         </div>
                                     </div>
                                 </div>

                                 {/* CONTENU DES ONGLETS */}
                                 <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
                                     {/* CONTENU CONDITIONNEL SELON L'ONGLET */}
                                     {activeTab === 'questions' ? (
                                         // ONLET QUESTIONS AU PROF
                                         <div style={{flex:1, overflowY:'auto', padding:'15px'}}>
                                             {messages.map((m, index) => (
                                                 <div key={index} style={String(m.user_id) === String(myId) ? myBubble : otherBubble}>
                                                     <small style={{display:'block', fontSize:'10px', opacity:0.8, marginBottom:'3px'}}>
                                                         {String(m.user_id) === String(myId) ? "Moi" : myName} • {formatTime(m.created_at)}
                                                     </small>
                                                     <div style={{wordBreak: 'break-word'}}>{m.content}</div>

                                                     {/* RÉPONSES PRIVÉES ASSOCIÉES */}
                                                     {(() => {
                                                         const responsesForThisMessage = privateResponses.filter(r => String(r.message_id) === String(m.id));
                                                         return responsesForThisMessage.length > 0 && (
                                                             <div style={{marginLeft: '20px', marginTop: '10px'}}>
                                                                 {responsesForThisMessage.map((response, idx) => (
                                                                     <div key={idx} style={{
                                                                         backgroundColor: '#10b981',
                                                                         color: 'white',
                                                                         padding: '8px 12px',
                                                                         borderRadius: '10px 10px 10px 0',
                                                                         fontSize: '13px',
                                                                         maxWidth: '80%',
                                                                         marginBottom: '5px',
                                                                         boxShadow: '0 2px 5px rgba(16, 185, 129, 0.2)'
                                                                     }}>
                                                                         <small style={{fontSize: '10px', opacity: 0.8}}>Réponse du professeur :</small><br/>
                                                                         {response.content}
                                                                     </div>
                                                                 ))}
                                                             </div>
                                                         );
                                                     })()}
                                                 </div>
                                             ))}
                                         </div>
                                     ) : activeTab === 'public' ? (
                                         // ONGLET COMMUNAUTÉ
                                         <div style={{flex:1, overflowY:'auto', padding:'15px'}}>
                                             {communityMsgs.map((m, index) => (
                                                 <div key={index} style={String(m.user_id) === String(myId) ? myBubble : otherBubble}>
                                                     <small style={{display:'block', fontSize:'10px', opacity:0.8, marginBottom:'3px'}}>
                                                         {String(m.user_id).includes('PROF') ? '⭐ ENSEIGNANT' : (String(m.user_id) === String(myId) ? "Moi" : m.user_name)} • {formatTime(m.created_at)}
                                                     </small>
                                                     <div style={{wordBreak: 'break-word'}}>{m.content}</div>
                                                     <div style={{display:'flex', gap:'8px', marginTop:'8px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'5px'}}>
                                                         <button onClick={() => sendReactionToMessage(m.id, 'like')} style={reactionSmallBtn}>
                                                             👍 <span style={{marginLeft:'3px'}}>{m.likes_count || 0}</span>
                                                         </button>
                                                         <button onClick={() => sendReactionToMessage(m.id, 'love')} style={reactionSmallBtn}>
                                                             ❤️ <span style={{marginLeft:'3px'}}>{m.love_count || 0}</span>
                                                         </button>
                                                     </div>
                                                 </div>
                                             ))}
                                             {activeCommunityTypers.length > 0 && (
                                                 <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', gap: '8px' }}>
                                                     <div className="typing-indicator-container">
                                                         <div className="typing-dots">
                                                             <span></span>
                                                             <span></span>
                                                             <span></span>
                                                         </div>
                                                     </div>
                                                     <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                                         {activeCommunityTypers.map(t => t.userName).join(', ')} {activeCommunityTypers.length === 1 ? "est en train d'écrire..." : "sont en train d'écrire..."}
                                                     </span>
                                                 </div>
                                             )}
                                         </div>
                                     ) : activeTab === 'private' ? (
                                         // ONGLET CHAT PRIVÉ
                                         selectedChatPartner ? (
                                             <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
                                                 {/* HEADER AVEC LE NOM DU PARTENAIRE */}
                                                 <div style={{
                                                     padding:'10px',
                                                     borderBottom:'1px solid #eee',
                                                     backgroundColor:'#f8fafc',
                                                     borderRadius:'10px 10px 0 0'
                                                 }}>
                                                     <div style={{fontWeight:'bold', color:'#6d28d9'}}>
                                                         Chat avec {selectedChatPartner.includes('PROF') ? 'l\'enseignant' : 'un étudiant'}
                                                     </div>
                                                     <button
                                                         onClick={() => setSelectedChatPartner(null)}
                                                         style={{
                                                             float:'right',
                                                             background:'none',
                                                             border:'none',
                                                             color:'#94a3b8',
                                                             cursor:'pointer',
                                                             fontSize:'12px'
                                                         }}
                                                     >
                                                         ← Retour
                                                     </button>
                                                 </div>

                                                 {/* MESSAGES */}
                                                 <div ref={privateChatContainerRef} style={{
                                                     flex:1,
                                                     overflowY:'auto',
                                                     padding:'15px',
                                                     backgroundColor:'#fafafa'
                                                 }}>
                                                     {currentPrivateConversation.map((msg, i) => (
                                                         <div key={i} style={{
                                                             marginBottom:'10px',
                                                             display:'flex',
                                                             justifyContent: msg.sender_id === myId ? 'flex-end' : 'flex-start'
                                                         }}>
                                                             <div style={{
                                                                 maxWidth:'80%',
                                                                 padding:'8px 12px',
                                                                 borderRadius:'15px',
                                                                 backgroundColor: msg.sender_id === myId ? '#6d28d9' : '#e5e7eb',
                                                                 color: msg.sender_id === myId ? 'white' : '#333',
                                                                 fontSize:'14px'
                                                             }}>
                                                                 {msg.content}
                                                                 <div style={{
                                                                     fontSize:'10px',
                                                                     opacity:0.7,
                                                                     marginTop:'3px',
                                                                     textAlign: msg.sender_id === myId ? 'right' : 'left'
                                                                 }}>
                                                                     {formatTime(msg.created_at)}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     ))}
                                                     <div ref={messagesEndRef} />
                                                 </div>

                                                 {/* ZONE DE SAISIE */}
                                                <div style={{padding:'10px', borderTop:'1px solid #eee'}}>
                                                    {isPrivatePartnerTyping && (
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                                                            <div className="typing-indicator-container">
                                                                <div className="typing-dots">
                                                                    <span></span>
                                                                    <span></span>
                                                                    <span></span>
                                                                </div>
                                                            </div>
                                                            <span style={{ fontSize: '12px', color: '#6d28d9', fontStyle: 'italic' }}>
                                                                {selectedChatPartner.includes('PROF') ? "Le professeur est en train d'écrire..." : "L'étudiant est en train d'écrire..."}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div style={{display:'flex', gap:'10px'}}>
                                                        <input
                                                            type="text"
                                                            value={privateMessageInput}
                                                            onChange={handlePrivateMessageInputChange}
                                                            onKeyPress={(e) => e.key === 'Enter' && sendPrivateMessage()}
                                                            placeholder="Tapez votre message..."
                                                            style={{
                                                                flex:1,
                                                                padding:'10px',
                                                                borderRadius:'20px',
                                                                border:'1px solid #ddd',
                                                                outline:'none'
                                                            }}
                                                        />
                                                        <button
                                                            onClick={sendPrivateMessage}
                                                            style={{
                                                                backgroundColor:'#6d28d9',
                                                                color:'white',
                                                                border:'none',
                                                                borderRadius:'50%',
                                                                width:'40px',
                                                                height:'40px',
                                                                cursor:'pointer',
                                                                display:'flex',
                                                                alignItems:'center',
                                                                justifyContent:'center'
                                                            }}
                                                        >
                                                            <FaPaperPlane />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // LISTE DES CONVERSATIONS DISPONIBLES
                                            <div style={{padding:'15px'}}>
                                                <h4 style={{margin:'0 0 15px 0', color:'#6d28d9'}}>Conversations privées</h4>
                                                {chatPartners.length > 0 ? (
                                                    chatPartners.map((partner) => (
                                                        <div
                                                            key={partner.user_id}
                                                            onClick={() => selectPrivateChatPartner(partner.user_id)}
                                                            style={{
                                                                padding:'12px',
                                                                marginBottom:'8px',
                                                                borderRadius:'10px',
                                                                backgroundColor:'#f8fafc',
                                                                border:'1px solid #e2e8f0',
                                                                cursor:'pointer',
                                                                display:'flex',
                                                                alignItems:'center',
                                                                gap:'10px'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width:'40px',
                                                                height:'40px',
                                                                borderRadius:'50%',
                                                                backgroundColor:'#6d28d9',
                                                                display:'flex',
                                                                alignItems:'center',
                                                                 justifyContent:'center',
                                                                 color:'white',
                                                                 fontWeight:'bold'
                                                             }}>
                                                                 {partner.user_id.includes('PROF') ? '👨‍🏫' : '👤'}
                                                             </div>
                                                             <div style={{flex:1}}>
                                                                 <div style={{fontWeight:'bold', color:'#374151'}}>
                                                                     {partner.user_id.includes('PROF') ? 'Enseignant' : 'Étudiant ' + partner.user_id.substr(-4)}
                                                                 </div>
                                                                 <div style={{fontSize:'12px', color:'#6b7280'}}>
                                                                     {partner.last_message ? partner.last_message.substr(0, 50) + '...' : 'Nouvelle conversation'}
                                                                 </div>
                                                             </div>
                                                             {partner.unread_count > 0 && (
                                                                 <div style={{
                                                                     backgroundColor:'#ef4444',
                                                                     color:'white',
                                                                     borderRadius:'50%',
                                                                     width:'20px',
                                                                     height:'20px',
                                                                     display:'flex',
                                                                     alignItems:'center',
                                                                     justifyContent:'center',
                                                                     fontSize:'12px',
                                                                     fontWeight:'bold'
                                                                 }}>
                                                                     {partner.unread_count}
                                                                 </div>
                                                             )}
                                                         </div>
                                                     ))
                                                 ) : (
                                                     <p style={{color:'#94a3b8', fontSize:'14px'}}>
                                                         Le professeur peut initier une conversation privée avec vous depuis vos questions.
                                                         <br/><br/>
                                                         Pour l'instant, aucune conversation n'est disponible.
                                                     </p>
                                                 )}
                                             </div>
                                         )
                                     ) : null}
                                 </div>

                                 {/* INPUT UNIQUE QUI S'ADAPTE À L'ONGLET ACTIF */}
                                 {activeTab !== 'private' && (
                                     <div style={chatInputArea}>
                                         <input
                                             type="text"
                                             value={message}
                                             onChange={handleCommunityMessageInputChange}
                                             onKeyPress={(e) => e.key === 'Enter' && sessionPermissions.allow_questions && (activeTab === 'questions' ? handleSendMessage() : handleSendCommunityMessage())}
                                             disabled={!sessionPermissions.allow_questions}
                                             placeholder={
                                                 !sessionPermissions.allow_questions 
                                                     ? "Le professeur a désactivé le chat" 
                                                     : (activeTab === 'questions' ? "Poser une question..." : "Discuter avec le groupe...")
                                             }
                                             style={{
                                                 ...chatInput,
                                                 backgroundColor: sessionPermissions.allow_questions ? 'white' : '#f1f5f9',
                                                 cursor: sessionPermissions.allow_questions ? 'text' : 'not-allowed'
                                             }}
                                         />
                                         <button
                                             onClick={activeTab === 'questions' ? handleSendMessage : handleSendCommunityMessage}
                                             disabled={!sessionPermissions.allow_questions}
                                             style={{
                                                 ...sendBtn,
                                                 backgroundColor: sessionPermissions.allow_questions ? '#6d28d9' : '#94a3b8',
                                                 cursor: sessionPermissions.allow_questions ? 'pointer' : 'not-allowed'
                                             }}
                                         >
                                             <FaPaperPlane />
                                         </button>
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                 </>
             );
         };

                // --- STYLES ---
        const isMobile = window.innerWidth < 768;

        const centeredNoticeStyle = { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', zIndex:1 };
        const sessionClosedCardStyle = { width:'100%', maxWidth:'460px', padding:'34px', textAlign:'center', backgroundColor:'rgba(255,255,255,0.94)', borderRadius:'24px' };
        const closedBannerStyle = { margin:'18px auto', maxWidth:'760px', padding:'14px 18px', borderRadius:'14px', backgroundColor:'rgba(109,40,217,0.12)', color:'#4c1d95', fontWeight:'800', textAlign:'center' };

        // LAYOUT GÉNÉRAL
        const mainLayout = {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : '10px',
            padding: isMobile ? '8px' : '40px',
            minHeight: '100vh',
            justifyContent: 'center',
            alignItems: isMobile ? 'stretch' : 'center',
            position: 'relative',
            zIndex: 1,
            boxSizing: 'border-box',
        };

        // SIDEBAR XP — cachée sur mobile
        const sidebarXPStyle = {
            display: isMobile ? 'none' : 'flex',
            width: '280px',
            height: '80vh',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '24px',
            padding: '30px 20px',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        };

        // CARTE SESSION
        const sessionCardFull = {
            width: '100%',
            maxWidth: isMobile ? '100%' : '1100px',
            height: isMobile ? 'auto' : '80vh',
            minHeight: isMobile ? '40vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: isMobile ? '14px' : '40px',
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderRadius: isMobile ? '16px' : '24px',
            boxSizing: 'border-box',
        };
        const sessionCardWithChat = { ...sessionCardFull };

        // PANEL CHAT — sur mobile : hauteur fixe, pas de position fixed pour éviter les bugs
        const sideChatPanel = {
            width: isMobile ? '100%' : '350px',
            height: isMobile ? '55vh' : '80vh',
            maxHeight: isMobile ? '55vh' : 'none',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.98)',
            padding: isMobile ? '12px' : '15px',
            borderRadius: isMobile ? '16px' : '24px',
            boxSizing: 'border-box',
            overflow: 'hidden',
        };

        // HEADER
        const header = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: isMobile ? '10px' : '15px',
            flexWrap: 'wrap',
            gap: '8px',
        };

        const pinBadge = {
            backgroundColor: '#6d28d9',
            color: 'white',
            padding: isMobile ? '4px 10px' : '6px 12px',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: isMobile ? '12px' : '14px',
        };

        // BOUTON OUVRIR/FERMER CHAT
        const chatToggleBtn = {
            backgroundColor: '#6d28d9',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: isMobile ? '8px 12px' : '12px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: isMobile ? '12px' : '14px',
            flexShrink: 0,
        };

        const contentArea = {
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '8px 0' : '20px',
        };

        const waitingBox = {
            textAlign: 'center',
            padding: isMobile ? '16px' : '40px',
        };

        const questionBox = {
            width: '100%',
            padding: isMobile ? '14px' : '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
        };

        // ─── ZONE INPUT CHAT ───────────────────────────────────────────
        // paddingRight: 70px sur mobile pour ne PAS être caché par le bouton flottant
        const chatInputArea = {
            display: 'flex',
            gap: '8px',
            marginTop: '8px',
            flexShrink: 0,
            alignItems: 'center',
            paddingRight: isMobile ? '0px' : '0px',   // le bouton envoi est DANS le flex, pas de padding nécessaire
            boxSizing: 'border-box',
            width: '100%',
        };

        const chatInput = {
            flex: 1,
            minWidth: 0,          // ← ESSENTIEL : empêche l'input de déborder
            padding: '10px 12px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '14px',
            boxSizing: 'border-box',
        };

        const sendBtn = {
            backgroundColor: '#6d28d9',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            minWidth: '42px',      // ← ne rétrécit jamais
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,         // ← ne se compresse pas
        };

        // ONGLETS
        const tabHeader = {
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            paddingBottom: '8px',
            marginBottom: '8px',
            overflowX: 'auto',
            flexShrink: 0,
            gap: '4px',
        };

        const tabInactive = {
            fontSize: isMobile ? '11px' : '13px',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '5px 8px',
            borderRadius: '8px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            flexShrink: 0,
        };

        const tabActive = {
            ...tabInactive,
            color: '#6d28d9',
            backgroundColor: 'rgba(109,40,217,0.1)',
            fontWeight: 'bold',
        };

        const xpCounterStyle = { fontSize: '36px', fontWeight: '900', color: '#f59e0b', margin: '10px 0' };
        const xpValue = { fontSize: '48px', fontWeight: '900', color: '#f59e0b', margin: '10px 0' };

        const myBubble = {
            alignSelf: 'flex-end',
            backgroundColor: '#6d28d9',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '18px 18px 5px 18px',
            maxWidth: '85%',
            marginBottom: '8px',
            wordBreak: 'break-word',
            fontSize: '14px',
        };

        const otherBubble = {
            alignSelf: 'flex-start',
            backgroundColor: 'white',
            color: '#374151',
            padding: '8px 12px',
            borderRadius: '18px 18px 18px 5px',
            maxWidth: '85%',
            marginBottom: '8px',
            wordBreak: 'break-word',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        };

        const reactionSmallBtn = {
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '2px 5px',
            borderRadius: '10px',
        };

        const btnQuit = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' };
        const interactionBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' };
        const reactionGroup = { display: 'flex', gap: '15px', alignItems: 'center' };
        const reactionBtn = { width: '45px', height: '45px', borderRadius: '50%', border: 'none', backgroundColor: 'white', cursor: 'pointer', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' };
        const messageHistory = { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' };

        export default StudentSession;
