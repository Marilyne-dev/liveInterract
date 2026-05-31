import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import {
    FaAward,
    FaChartLine,
    FaCheckCircle,
    FaComments,
    FaGem,
    FaHome,
    FaMedal,
    FaQuestionCircle,
    FaShieldAlt,
    FaStar,
    FaTrophy,
    FaUser,
} from 'react-icons/fa';
import WordCloudSummary from './activities/WordCloud/WordCloudSummary';
import QCMSummary from './activities/QCM/QCMSummary';

const StudentSummary = ({ pinCode }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const myId = localStorage.getItem('my_student_id');
    const myName = `Etudiant ${String(myId || '').substr(-4)}`;

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get(`/sessions/${pinCode}/summary`);
                setData(res.data);
            } catch (e) {
                setError('Impossible de charger la synthese.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [pinCode]);

    const myScoreEntry = useMemo(() => {
        return data?.summary_scores?.find(s => String(s.student_id) === String(myId));
    }, [data, myId]);

    if (loading) {
        return (
            <div className="summary-loading">
                <div className="waiting-dots" aria-hidden="true"><span></span><span></span><span></span></div>
            </div>
        );
    }

    if (error) {
        return <div className="summary-loading"><h3>{error}</h3></div>;
    }

    const activities = data?.summary || [];
    const questions = data?.questions || [];
    const community = data?.community || [];
    const totalXP = myScoreEntry?.xp_points || 0;
    const correctAnswers = myScoreEntry?.correct_answers || 0;
    const rankLabel = totalXP >= 400 ? 'Major de promotion' : totalXP >= 200 ? 'Expert confirme' : 'Apprenti motive';

    return (
        <div className="student-summary-page">
            <div className="student-summary-shell">
                <header className="summary-topbar">
                    <div>
                        <span className="summary-session-badge">{data.session_title}</span>
                        <h1>Bilan de session</h1>
                    </div>
                    <button onClick={() => window.location.href = '/'} className="summary-home-btn">
                        <FaHome /> Quitter
                    </button>
                </header>

                <main className="summary-landscape">
                    <section className="summary-panel summary-score-panel">
                        <div className="summary-trophy">
                            <FaTrophy />
                        </div>

                        <div className="summary-student-name">
                            <FaUser /> {myName}
                        </div>

                        <div className="summary-xp">
                            <FaGem />
                            <strong>{totalXP}</strong>
                            <span>XP</span>
                        </div>

                        <div className="summary-rank">
                            {totalXP >= 200 ? <FaMedal /> : <FaAward />}
                            {rankLabel}
                        </div>

                        <div className="summary-mini-stats">
                            <div>
                                <FaChartLine />
                                <strong>{activities.length}</strong>
                                <span>Activites</span>
                            </div>
                            <div>
                                <FaCheckCircle />
                                <strong>{correctAnswers}</strong>
                                <span>Justes</span>
                            </div>
                            <div>
                                <FaStar />
                                <strong>{community.length}</strong>
                                <span>Echanges</span>
                            </div>
                        </div>
                    </section>

                    <section className="summary-panel summary-activities-panel">
                        <div className="summary-panel-header">
                            <FaChartLine />
                            <h2>Activites</h2>
                        </div>

                        <div className="summary-scroll">
                            {activities.map((activity, index) => (
                                <article key={index} className="summary-activity-card">
                                    {activity.type === 'qcm'
                                        ? <QCMSummary activity={activity} />
                                        : <WordCloudSummary activity={activity} />}
                                </article>
                            ))}
                            {activities.length === 0 && <p className="summary-empty">Aucune activite enregistree.</p>}
                        </div>
                    </section>

                    <section className="summary-panel summary-discussions-panel">
                        <div className="summary-panel-header">
                            <FaComments />
                            <h2>Feedback</h2>
                        </div>

                        <div className="summary-feedback-grid">
                            <div className="summary-feedback-column">
                                <h3><FaQuestionCircle /> Questions</h3>
                                <div className="summary-scroll compact">
                                    {questions.map((m, index) => (
                                        <MessageRow key={index} message={m} name="Etudiant" />
                                    ))}
                                    {questions.length === 0 && <p className="summary-empty">Aucune question posee.</p>}
                                </div>
                            </div>

                            <div className="summary-feedback-column">
                                <h3><FaShieldAlt /> Communaute</h3>
                                <div className="summary-scroll compact">
                                    {community.map((m, index) => (
                                        <MessageRow key={index} message={m} name={m.user_name} teacher={m.user_name === 'ENSEIGNANT'} />
                                    ))}
                                    {community.length === 0 && <p className="summary-empty">Aucun echange public.</p>}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

const MessageRow = ({ message, name, teacher = false }) => (
    <div className={`summary-message ${teacher ? 'teacher' : ''}`}>
        <div className="summary-message-avatar">
            {teacher ? <FaShieldAlt /> : <FaUser />}
        </div>
        <div>
            <div className="summary-message-meta">
                <strong>{name}</strong>
                {message.created_at && <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
            <p>{message.content}</p>
        </div>
    </div>
);

export default StudentSummary;
