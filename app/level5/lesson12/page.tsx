'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[11]; // Lesson 12 (0-indexed)
const LESSON_ID = 74;

export default function Lesson12() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        // Q1=0 (List), Q2=1 (Tuple), Q3=2 (Dictionary), Q4=3 (Set)
        const correctAnswers = [0, 1, 2, 3];

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz < 3) {
                setTimeout(() => setCurrentQuiz(currentQuiz + 1), 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    const retryQuiz = () => {
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
    };

    if (isLoading || !user) {
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🧰</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Tool Expert! 🧰</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson13" className={`${styles.navBtn} ${styles.primary}`}>Final Project! <ChevronRight size={18} /></Link></motion.div>
            </div>
        );
    }

    const quizQuestions = [
        {
            question: "You're making a shopping cart where items can be added and removed. Which should you use?",
            options: ['LIST - items change frequently', 'TUPLE - items never change', 'DICTIONARY - need labels', 'SET - no duplicates needed'],
            correct: 0,
            explanation: "Shopping carts change all the time - items are added and removed. Lists are perfect for this!"
        },
        {
            question: "You need to store someone's birthday (month, day, year) that should never change. Which should you use?",
            options: ['LIST - easy to modify', 'TUPLE - data should be locked', 'DICTIONARY - need key-value', 'SET - need unique items'],
            correct: 1,
            explanation: "Birthdays never change! Tuples are immutable (locked), making them perfect for permanent data."
        },
        {
            question: "You're creating a player profile with name, score, and level. Which should you use?",
            options: ['LIST - ordered sequence', 'TUPLE - immutable data', 'DICTIONARY - labeled data', 'SET - unique collection'],
            correct: 2,
            explanation: "Player profiles have labeled data (name, score, level). Dictionaries let you access data by name!"
        },
        {
            question: "You're tracking which badges a player has earned, and each badge should only appear once. Which should you use?",
            options: ['LIST - might have duplicates', 'TUPLE - can\'t add new badges', 'DICTIONARY - don\'t need labels', 'SET - automatic no duplicates'],
            correct: 3,
            explanation: "Sets automatically prevent duplicates! Perfect for a collection of unique badges."
        }
    ];

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--accent-primary)' }}>
                <Link href="/level5" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 13</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-secondary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Which Tool Should You Use?</span>
                            </div>
                            <p>
                                You've learned four powerful data types. Now let's learn how to <strong style={{ color: 'var(--accent-secondary)' }}>choose the right one</strong> for each situation!
                            </p>
                        </motion.div>

                        {/* Decision Guide */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', textAlign: 'center' }}>🎯 Quick Decision Guide</h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* LIST */}
                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(80, 250, 123, 0.15)', padding: '1.25rem', borderRadius: '1rem', border: '2px solid rgba(80, 250, 123, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '2rem' }}>📝</span>
                                        <div>
                                            <h4 style={{ color: '#50fa7b', margin: 0 }}>LIST [ ]</h4>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>cart = ["apple", "bread"]</code>
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>Ask: "Will items be ADDED or REMOVED?"</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Use for: Shopping carts, to-do lists, game scores</p>
                                </motion.div>

                                {/* TUPLE */}
                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(255, 121, 198, 0.15)', padding: '1.25rem', borderRadius: '1rem', border: '2px solid rgba(255, 121, 198, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '2rem' }}>🔒</span>
                                        <div>
                                            <h4 style={{ color: '#ff79c6', margin: 0 }}>TUPLE ( )</h4>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>birthday = ("March", 15, 2015)</code>
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 700, color: '#ff79c6', marginBottom: '0.5rem' }}>Ask: "Should this data NEVER change?"</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Use for: Birthdays, coordinates, RGB colors</p>
                                </motion.div>

                                {/* DICTIONARY */}
                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(139, 233, 253, 0.15)', padding: '1.25rem', borderRadius: '1rem', border: '2px solid rgba(139, 233, 253, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '2rem' }}>🗄️</span>
                                        <div>
                                            <h4 style={{ color: '#8be9fd', margin: 0 }}>DICTIONARY {"{ : }"}</h4>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>pet = {"{"}"name": "Buddy"{"}"}</code>
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 700, color: '#8be9fd', marginBottom: '0.5rem' }}>Ask: "Do I need LABELS for my data?"</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Use for: Player profiles, settings, contacts</p>
                                </motion.div>

                                {/* SET */}
                                <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'rgba(189, 147, 249, 0.15)', padding: '1.25rem', borderRadius: '1rem', border: '2px solid rgba(189, 147, 249, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '2rem' }}>🎯</span>
                                        <div>
                                            <h4 style={{ color: '#bd93f9', margin: 0 }}>SET {"{ }"}</h4>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>gems = {"{"}"ruby", "emerald"{"}"}</code>
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 700, color: '#bd93f9', marginBottom: '0.5rem' }}>Ask: "Should there be NO DUPLICATES?"</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Use for: Badges, tags, unique items</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Flowchart */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🤔 Decision Flowchart</h3>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                <p style={{ fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '1rem' }}>Start Here: What kind of data do you have?</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                    <div style={{ background: 'rgba(80, 250, 123, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <p style={{ color: '#50fa7b', fontWeight: 700 }}>Need to change items?</p>
                                        <p style={{ marginTop: '0.5rem' }}>→ Use <strong>LIST</strong></p>
                                    </div>
                                    <div style={{ background: 'rgba(255, 121, 198, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <p style={{ color: '#ff79c6', fontWeight: 700 }}>Should stay locked?</p>
                                        <p style={{ marginTop: '0.5rem' }}>→ Use <strong>TUPLE</strong></p>
                                    </div>
                                    <div style={{ background: 'rgba(139, 233, 253, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <p style={{ color: '#8be9fd', fontWeight: 700 }}>Need labels/names?</p>
                                        <p style={{ marginTop: '0.5rem' }}>→ Use <strong>DICTIONARY</strong></p>
                                    </div>
                                    <div style={{ background: 'rgba(189, 147, 249, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <p style={{ color: '#bd93f9', fontWeight: 700 }}>No duplicates allowed?</p>
                                        <p style={{ marginTop: '0.5rem' }}>→ Use <strong>SET</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Pro Tip:</p>
                                <p style={{ fontSize: '0.9rem' }}>Often you'll combine these! A dictionary might have lists as values, or you might have a list of dictionaries. Use the right tool for each part of your data!</p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson11" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Test Your Knowledge! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧰</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Choose the Right Tool! (Question {currentQuiz + 1}/4)</h2>

                        <p className={styles.quizQuestion}>{quizQuestions[currentQuiz].question}</p>
                        <div className={styles.quizOptions}>
                            {quizQuestions[currentQuiz].options.map((opt, idx) => (
                                <button key={idx} onClick={() => { if (!quizChecked[currentQuiz]) { const a = [...quizAnswers]; a[currentQuiz] = idx; setQuizAnswers(a); } }}
                                    className={`${styles.quizOption} ${quizAnswers[currentQuiz] === idx ? styles.selected : ''} ${quizChecked[currentQuiz] && idx === quizQuestions[currentQuiz].correct ? styles.correct : ''} ${quizChecked[currentQuiz] && quizAnswers[currentQuiz] === idx && idx !== quizQuestions[currentQuiz].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked[currentQuiz]}>{opt}</button>
                            ))}
                        </div>

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{quizQuestions[currentQuiz].explanation}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz < 3 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>{quizQuestions[currentQuiz].explanation}</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
