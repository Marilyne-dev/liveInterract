import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaHistory, FaPlus, FaArrowLeft, FaStopCircle, FaTrash } from 'react-icons/fa';

// Importation des composants modulaires
import ActivitySelector from './ActivitySelector';
import QCMCreator from './activities/QCM/QCMCreator';
import QCMDisplay from './activities/QCM/QCMDisplay';
import QCMSummary from './activities/QCM/QCMSummary';

import AIAssistant from "./AIAssistant";

import WordCloudCreator from './activities/WordCloud/WordCloudCreator';
import WordCloudDisplay from './activities/WordCloud/WordCloudDisplay';
import WordCloudSummary from './activities/WordCloud/WordCloudSummary';

import OpenQuestionCreator from './activities/OpenQuestion/OpenQuestionCreator';
import OpenQuestionDisplay from './activities/OpenQuestion/OpenQuestionDisplay';
import OpenQuestionSummary from './activities/OpenQuestion/OpenQuestionSummary';

import ScaleCreator from './activities/Scale/ScaleCreator';
import ScaleDisplay from './activities/Scale/ScaleDisplay';
import ScaleSummary from './activities/Scale/ScaleSummary';
// ... tes autres imports ...


const ActivityManager = ({ session, participantCount }) => {

    // --- ÉTATS DE NAVIGATION ---
    const [view, setView] = useState('selector'); // selector | create
    const [selectedType, setSelectedType] = useState(null);

    // --- ÉTATS DES DONNÉES ---
    const [activeActivity, setActiveActivity] = useState(null);
    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. INITIALISATION & TEMPS RÉEL ---
   useEffect(() => {
    loadData();

    if (window.Echo) {
        const channel = window.Echo.channel(`session.${session.pin_code}`);
        
        // On écoute le vote
           // Dans ActivityManager.jsx -> useEffect
          // Remplace le bloc .listen('.ActivityVoteReceived') par celui-ci :
          // Dans ActivityManager.jsx, modifie le listener dans le useEffect
                channel.listen('.ActivityVoteReceived', (e) => {
                setResults(prev => {
                    const incomingWord = String(e.answer).trim().toLowerCase();
                    
                    // CORRECTION : On force r.name en String pour éviter le crash sur les nombres
                    const exists = prev.find(r => String(r.name).toLowerCase() === incomingWord);

                    if (exists) {
                        return prev.map(r => 
                            String(r.name).toLowerCase() === incomingWord 
                            ? { ...r, votes: parseInt(r.votes) + 1 } 
                            : r
                        );
                    } else {
                        // Nouveau mot : on l'ajoute à la liste
                        return [...prev, { name: e.answer, votes: 1 }];
                    }
                });
            });

        return () => window.Echo.leave(`session.${session.pin_code}`);
    }
}, [session.pin_code]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Charger l'historique
            const histRes = await api.get(`/sessions/${session.id}/activities/history`);
            setHistory(histRes.data);

            // Vérifier s'il y a une activité en cours (status 'open')
            const current = histRes.data.find(a => a.status === 'open');
            if (current) {
                setActiveActivity(current);
                setResults(current.results);
            }
        } catch (e) {
            console.error("Erreur lors du chargement des activités", e);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. ACTIONS ---
    
    // Lancer une nouvelle activité (appelé par QCMCreator)
const handleLaunchActivity = async (activityData) => {
        try {
            // SÉCURITÉ : On s'assure que options est un tableau valide
            const safeOptions = Array.isArray(activityData.options) ? activityData.options :[];

            const res = await api.post('/activities/launch', {
                session_id: session.id,
                pin_code: session.pin_code,
                type: activityData.type,
                question: activityData.question,
                options: safeOptions,
                correct_answer: activityData.correct_answer
            });

            setActiveActivity(res.data);
            
            // SÉCURITÉ : On évite le crash du .map() si les options sont vides (comme pour l'Échelle)
            const returnedOptions = Array.isArray(res.data.options) ? res.data.options :[];
            setResults(returnedOptions.map(o => ({ name: o, votes: 0 })));
            
            setView('selector');
            loadData(); 
        } catch (e) {
            console.error(e);
            alert("Erreur lors du lancement de l'activité");
        }
    };

    // Arrêter l'activité en cours
    const handleStopActivity = async () => {
        if (!activeActivity) return;
        try {
            await api.post(`/activities/${activeActivity.id}/stop`, { 
                pin_code: session.pin_code 
            });
            setActiveActivity(null);
            setResults([]);
            loadData(); // Mettre à jour l'historique pour afficher le résumé
        } catch (e) {
            alert("Erreur lors de l'arrêt");
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm("Voulez-vous supprimer cette activité de l'historique ?")) {
            try {
                await api.delete(`/activities/${activityId}`);
                loadData(); // Rafraîchir l'historique
            } catch (e) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    // Remplace la ligne du calcul par celle-ci (pour forcer React à recalculer)
    const totalVotes = results.reduce((acc, curr) => acc + (parseInt(curr.votes) || 0), 0);

    if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Chargement du centre d'activités...</div>;

    return (
        <div className="activity-manager" style={container}>
            
            {/* SECTION 1 : CRÉATION OU DIRECT */}
            {!activeActivity ? (
                <div className="fadeIn">
                    {view === 'selector' ? (
                        <>
                            <div style={sectionHeader}>
                                <h3 style={sectionTitle}><FaPlus /> Créer une interaction</h3>
                                <p style={sectionDesc}>Choisissez un format pour dynamiser votre cours.</p>
                            </div>
                            <ActivitySelector onSelect={(type) => {
                                setSelectedType(type);
                                setView('create');
                            }} />
                        </>
                    ) : (
                        <div className="fadeIn">
                            <button onClick={() => setView('selector')} style={btnBack}>
                                <FaArrowLeft /> Retour aux activités
                            </button>
                            
               {/* Rendu dynamique du créateur selon le type sélectionné */}
                {selectedType === 'qcm' && <QCMCreator onLaunch={handleLaunchActivity} />}
                {selectedType === 'wordcloud' && <WordCloudCreator onLaunch={handleLaunchActivity} />}
                {(selectedType === 'open_question' || selectedType === 'open') && <OpenQuestionCreator onLaunch={handleLaunchActivity} />}
               {selectedType === 'scale' && <ScaleCreator onLaunch={handleLaunchActivity} />}

                {/* Correction de la condition d'erreur */}
                {selectedType !== 'qcm' && selectedType !== 'wordcloud' && 
                selectedType !== 'open_question' && selectedType !== 'open' && 
                selectedType !== 'scale' && (
                    <div className="glass-card" style={{padding:'40px', textAlign:'center'}}>
                        <p>Cette activité ({selectedType}) sera bientôt disponible.</p>
                        <button onClick={() => setView('selector')} style={btnBack}>Choisir une autre</button>
                    </div>
                )}
                        </div>
                    )}
                </div>
            ) : (
                /* --- AFFICHAGE DU DIRECT --- */
                <div className="fadeIn">
                    <div className="activity-live-header" style={liveHeader}>
                        <div style={liveBadge}>● SESSION LIVE</div>
                        <button onClick={handleStopActivity} style={btnStop}>
                            <FaStopCircle /> ARRÊTER L'ACTIVITÉ
                        </button>
                    </div>

                    {activeActivity.type === 'qcm' && (
                        <QCMDisplay 
                            activity={activeActivity} 
                            results={results} 
                            totalVotes={totalVotes} 
                        />
                    )}

                    {activeActivity.type === 'wordcloud' && (
                        <WordCloudDisplay activity={activeActivity} results={results} totalVotes={totalVotes} />
                    )}

                    {(activeActivity.type === 'open_question' || activeActivity.type === 'open') && (
                        <OpenQuestionDisplay 
                            activity={activeActivity} 
                            results={results} 
                            participantCount={participantCount} // <--- ON PASSE LA VARIABLE ICI
                        />
                    )}
                    {activeActivity.type === 'scale' 
                    && <ScaleDisplay activity={activeActivity} results={results} totalVotes={totalVotes} />}

                    {/* --- ASSISTANT IA (Disponible pour tous les types d'activités) --- */}
                    <div style={{marginTop:'30px'}}>
                       
                        <AIAssistant pinCode={session.pin_code} refreshTrigger={totalVotes} />
                    </div>
                    
                </div>
            )}

            {/* SECTION 2 : HISTORIQUE (REUSSITE PEDAGOGIQUE) */}
            <div className="activity-history-section" style={historySection}>
                <div style={sectionHeader}>
                    <h3 style={sectionTitle}><FaHistory /> Historique de la session</h3>
                    <p style={sectionDesc}>Retrouvez les résultats des activités précédentes.</p>
                </div>

            <div className="activity-history-grid" style={historyGrid}>
                    {history.filter(a => a.status === 'closed').map(prev => (
                        <div key={prev.id} className="history-item" style={{position:'relative'}}>
                            
                            {/* BOUTON SUPPRIMER L'ACTIVITÉ */}
                            <button 
                                onClick={() => handleDeleteActivity(prev.id)} 
                                style={{position:'absolute', top:'10px', right:'10px', background:'none', border:'none', color:'#ef4444', cursor:'pointer', zIndex:10}}
                                title="Supprimer cette activité"
                            >
                                <FaTrash />
                            </button>

                            {prev.type === 'qcm' ? (
                                <QCMSummary activity={prev} />
                            ) : (
                                <div className="glass-card" style={{padding:'20px', paddingRight:'40px'}}>
                                    <b>{prev.question}</b>
                                    <p style={{fontSize:'12px', color:'#94a3b8'}}>{prev.total} participations</p>
                                </div>
                            )}

                             {prev.type === 'wordcloud' && <WordCloudSummary activity={prev} />}
                             {(prev.type === 'open_question' || prev.type === 'open') && <OpenQuestionSummary activity={prev} />}
                            {prev.type === 'scale' && <ScaleSummary activity={prev} />}
                        </div>
                    ))}
                    {history.filter(a => a.status === 'closed').length === 0 && (
                        <div style={emptyHistory}>Aucune activité terminée pour le moment.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---
const container = { paddingBottom: '60px' };
const sectionHeader = { marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const sectionTitle = { margin: 0, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' };
const sectionDesc = { margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' };

const btnBack = { 
    background: 'none', border: 'none', color: '#6d28d9', cursor: 'pointer', 
    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '20px' 
};

const liveHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const liveBadge = { backgroundColor: '#fee2e2', color: '#ef4444', padding: '6px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 2s infinite' };
const btnStop = { backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };

const historySection = { marginTop: '50px' };
const historyGrid = { display: 'flex', flexDirection: 'column', gap: '20px' };
const emptyHistory = { textAlign: 'center', padding: '40px', color: '#cbd5e1', fontStyle: 'italic' };

export default ActivityManager;
