'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL9_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL9_LESSONS[0];
const LESSON_ID = 109;

const QUIZ_QUESTIONS = [
    {
        question: 'What is an API like?',
        options: ['A video game', 'A waiter at a restaurant', 'A calculator'],
        correct: 1
    },
    {
        question: 'What does an API do?',
        options: ['Draws pictures', 'Fetches data from somewhere else', 'Plays music'],
        correct: 1
    },
    {
        question: 'When you ask an API for data, what do you send?',
        options: ['A letter', 'A request', 'A photo'],
        correct: 1
    }
];

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
    const [checked, setChecked] = useState<boolean[]>([false, false, false]);
    const [score, setScore] = useState(0);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const checkAnswer = () => {
        const newChecked = [...checked];
        newChecked[currentQ] = true;
        setChecked(newChecked);

        if (answers[currentQ] === QUIZ_QUESTIONS[currentQ].correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQ < 2) {
                setCurrentQ(currentQ + 1);
            } else {
                const finalScore = answers[currentQ] === QUIZ_QUESTIONS[currentQ].correct ? score + 1 : score;
                if (finalScore >= 2) {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                }
                setLessonComplete(true);
            }
        }, 1200);
    };

    if (isLoading || !user) return <div className={styles.container}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🍽️</motion.div></div>;

    if (lessonComplete) {
        const passed = score >= 2;
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>🍽️</motion.div>
                <motion.h2 className={styles.successTitle} style={{ color: '#FF79C6' }}>{passed ? 'API Expert!' : 'Try Again!'}</motion.h2>
                <motion.p className={styles.successMessage}>{passed ? LESSON.successMessage : 'You need 2 correct to pass.'}</motion.p>
                {passed && <motion.div className={styles.successXp}><Zap size={20} /> +{LESSON.xpReward} XP</motion.div>}
                <Link href={passed ? "/level9/lesson2" : "/level9/lesson1"} className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>
                    {passed ? 'Next Lesson' : 'Try Again'} <ChevronRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ borderBottom: '1px solid #FF79C6' }}>
                <Link href="/level9" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 7</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.lessonTitle}>
                    <motion.div className={styles.lessonEmoji} animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}>{LESSON.emoji}</motion.div>
                    <div className={styles.lessonTitleText}>
                        <h1 style={{ color: '#FF79C6' }}>{LESSON.title}</h1>
                        <p>Understanding <code style={{ color: '#8BE9FD' }}>APIs</code></p>
                    </div>
                </div>

                <motion.div className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))', borderColor: '#FF79C6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb size={24} style={{ color: '#FF79C6' }} />
                        <span style={{ fontWeight: 700, color: '#FF79C6' }}>APIs are like Waiters!</span>
                    </div>
                    <p>Imagine you're at a restaurant. You can't go into the kitchen yourself - you need a <strong style={{ color: '#8BE9FD' }}>waiter</strong>!</p>
                    <p style={{ marginTop: '0.75rem' }}>An <strong style={{ color: '#FF79C6' }}>API</strong> (Application Programming Interface) is like that waiter:</p>
                </motion.div>

                <div className={styles.conceptBox} style={{ borderColor: '#8BE9FD' }}>
                    <h3 style={{ color: '#FF79C6', marginBottom: '1rem' }}>How APIs Work:</h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.75rem' }}>
                            <span style={{ fontSize: '2rem' }}>1️⃣</span>
                            <div>
                                <strong style={{ color: '#FF79C6' }}>You make a REQUEST</strong>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>"I'd like today's weather, please!"</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(139, 233, 253, 0.1)', borderRadius: '0.75rem' }}>
                            <span style={{ fontSize: '2rem' }}>2️⃣</span>
                            <div>
                                <strong style={{ color: '#8BE9FD' }}>The API fetches the data</strong>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>The waiter goes to the kitchen (server)</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.75rem' }}>
                            <span style={{ fontSize: '2rem' }}>3️⃣</span>
                            <div>
                                <strong style={{ color: '#50FA7B' }}>You get a RESPONSE</strong>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>"Here's your weather: Sunny, 75°F!"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.conceptBox} style={{ borderColor: '#50FA7B', marginTop: '1.5rem' }}>
                    <h3 style={{ color: '#50FA7B', marginBottom: '1rem' }}>Real World Examples:</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(80, 250, 123, 0.1)', borderRadius: '0.5rem' }}>
                            🌤️ <strong>Weather apps</strong> use APIs to get forecasts
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem' }}>
                            🎮 <strong>Games</strong> use APIs to get player scores
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(139, 233, 253, 0.1)', borderRadius: '0.5rem' }}>
                            📱 <strong>Social media</strong> uses APIs to load posts
                        </div>
                    </div>
                </div>

                {/* Quiz Section */}
                <motion.div className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(255, 121, 198, 0.15), rgba(139, 233, 253, 0.15))', borderColor: '#FF79C6', marginTop: '2rem' }}>
                    <h3 style={{ color: '#FF79C6', marginBottom: '1rem' }}>Quick Quiz! ({currentQ + 1}/3)</h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: checked[i] ? (answers[i] === QUIZ_QUESTIONS[i].correct ? '#50FA7B' : '#ff5555') : i === currentQ ? '#FF79C6' : 'rgba(255,255,255,0.2)'
                            }} />
                        ))}
                    </div>

                    <h4 style={{ marginBottom: '1rem' }}>{QUIZ_QUESTIONS[currentQ].question}</h4>

                    <div className={styles.quizOptions}>
                        {QUIZ_QUESTIONS[currentQ].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => !checked[currentQ] && setAnswers([...answers.slice(0, currentQ), idx, ...answers.slice(currentQ + 1)])}
                                className={`${styles.quizOption} ${answers[currentQ] === idx ? styles.selected : ''} ${checked[currentQ] && idx === QUIZ_QUESTIONS[currentQ].correct ? styles.correct : ''} ${checked[currentQ] && answers[currentQ] === idx && idx !== QUIZ_QUESTIONS[currentQ].correct ? styles.wrong : ''}`}
                                disabled={checked[currentQ]}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {!checked[currentQ] && (
                        <button
                            className={styles.quizBtn}
                            onClick={checkAnswer}
                            disabled={answers[currentQ] === null}
                            style={{ background: 'linear-gradient(135deg, #FF79C6, #8BE9FD)' }}
                        >
                            Check Answer
                        </button>
                    )}
                </motion.div>

                <div className={styles.navBar}>
                    <Link href="/level9" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Level 9</Link>
                    <span style={{ color: 'var(--text-muted)' }}>Answer all questions!</span>
                </div>
            </div>
        </div>
    );
}
