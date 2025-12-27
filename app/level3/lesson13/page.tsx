'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Star, Link2, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[12]; // Lesson 13 (0-indexed)
const LESSON_ID = 46; // Level 3 lessons start at 34, so lesson 13 = 34 + 12 = 46

export default function Lesson13() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStage, setQuizStage] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Interactive team builder simulation
    const [teamA, setTeamA] = useState<string[]>(['Alice', 'Bob']);
    const [teamB, setTeamB] = useState<string[]>(['Charlie', 'Diana']);
    const [megaTeam, setMegaTeam] = useState<string[]>([]);
    const [showMergeAnimation, setShowMergeAnimation] = useState(false);
    const [mergeMethod, setMergeMethod] = useState<'plus' | 'extend' | null>(null);
    const [demoCompleted, setDemoCompleted] = useState(false);

    // Code editor
    const [userCode, setUserCode] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [codeRan, setCodeRan] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Run the merge demo
    const runMergeDemo = (method: 'plus' | 'extend') => {
        setMergeMethod(method);
        setShowMergeAnimation(true);
        setMegaTeam([]);

        setTimeout(() => {
            if (method === 'plus') {
                // + creates a NEW list
                setMegaTeam([...teamA, ...teamB]);
            } else {
                // .extend() modifies team_a directly
                const newTeamA = [...teamA, ...teamB];
                setTeamA(newTeamA);
                setMegaTeam(newTeamA);
            }
            setShowMergeAnimation(false);
            setDemoCompleted(true);
        }, 1500);
    };

    // Reset demo
    const resetDemo = () => {
        setTeamA(['Alice', 'Bob']);
        setTeamB(['Charlie', 'Diana']);
        setMegaTeam([]);
        setMergeMethod(null);
        setDemoCompleted(false);
    };

    // Run user code
    const runCode = () => {
        try {
            const code = userCode.trim().toLowerCase();
            let output = '';

            // Check for + operator usage
            const hasPlusJoin = code.includes('+') && (code.includes('[') || code.includes('list'));

            // Check for .extend() usage
            const hasExtend = code.includes('.extend(');

            // Check for list definitions
            const hasLists = code.includes('[') && code.includes(']');

            if (hasPlusJoin && hasLists) {
                // Simulate + operation
                output = "team_a + team_b creates:\n['Alice', 'Bob', 'Charlie', 'Diana']\n\nOriginal lists unchanged!\nteam_a: ['Alice', 'Bob']\nteam_b: ['Charlie', 'Diana']";
                setCodeRan(true);
            } else if (hasExtend && hasLists) {
                // Simulate extend operation
                output = "team_a.extend(team_b) modifies team_a:\nteam_a is now: ['Alice', 'Bob', 'Charlie', 'Diana']\n\nteam_b unchanged: ['Charlie', 'Diana']";
                setCodeRan(true);
            } else if (hasLists) {
                output = "Good start! Now try combining lists with + or .extend()";
            } else {
                output = "Create two lists and combine them!\nHint: list1 + list2 or list1.extend(list2)";
            }

            setCodeOutput(output);
        } catch {
            setCodeOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        // Q1: A is correct (index 0), Q2: B is correct (index 1)
        const correctAnswer = quizStage === 1 ? 0 : 1;

        if (quizAnswer === correctAnswer) {
            if (quizStage === 1) {
                setTimeout(() => {
                    setQuizStage(2);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                }, 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 10);
                    completeLevel(LESSON_ID, LESSON.xpReward, 10, 1, 120);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '3rem' }}
                    >
                        <Link2 size={48} className="text-cyan-400" />
                    </motion.div>
                </div>
            </div>
        );
    }

    // Success screen
    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(20, 30, 50, 0.98))' }}>
                {/* Confetti Animation */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {[...Array(25)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -100, x: `${Math.random() * 100}vw`, opacity: 1, rotate: 0 }}
                            animate={{
                                y: '110vh',
                                opacity: [1, 1, 0],
                                rotate: Math.random() * 720 - 360
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: Math.random() * 2,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            style={{
                                position: 'absolute',
                                fontSize: '2rem',
                            }}
                        >
                            {['[+]', '[]', '+', '...', '>>'][Math.floor(Math.random() * 5)]}
                        </motion.div>
                    ))}
                </div>

                {/* Trophy Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={styles.successIcon}
                    style={{
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        width: '100px',
                        height: '100px',
                        boxShadow: '0 0 40px rgba(6, 182, 212, 0.4)'
                    }}
                >
                    <Link2 size={50} className="text-white" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    LIST COMBINER!
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={styles.successMessage}
                >
                    {LESSON.successMessage}
                </motion.p>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className={styles.successXp}
                >
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>

                {/* Stars */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.15, type: 'spring' }}
                        >
                            <Star size={28} fill="#fbbf24" className="text-amber-400" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Achievement Badge */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                        border: '2px solid rgba(6, 182, 212, 0.5)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        marginBottom: '1.5rem'
                    }}
                >
                    <Link2 size={20} className="text-cyan-400" />
                    <span style={{ fontWeight: 700 }}>List Joining Mastered!</span>
                    <Check size={20} className="text-blue-400" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <Link href="/level3" className={`${styles.navBtn} ${styles.secondary}`}>
                        <ArrowLeft size={18} /> Back to Level 3
                    </Link>
                    <Link href="/level3/lesson14" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level3" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 16</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Title Section */}
                        <div className={styles.lessonTitle}>
                            <motion.div
                                className={styles.lessonEmoji}
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{LESSON.emoji}</span>
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Mission Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                                border: '2px solid rgba(6, 182, 212, 0.4)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Users size={28} className="text-cyan-400" />
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Team Builder!</h3>
                            </div>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                You have two teams of players and want to combine them into one <strong>MEGA team</strong>!
                                Learn to JOIN lists together!
                            </p>
                        </motion.div>

                        {/* Interactive Team Merge Visual */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e, #0f172a)',
                                border: '2px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Sparkles size={20} className="text-cyan-400" />
                                <h3 style={{ margin: 0, fontWeight: 700 }}>Watch Teams Merge!</h3>
                            </div>

                            {/* Teams Display */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto 1fr',
                                gap: '1rem',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                {/* Team A */}
                                <motion.div
                                    animate={showMergeAnimation ? { x: 50, opacity: 0.5 } : { x: 0, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        border: '2px solid rgba(59, 130, 246, 0.5)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginBottom: '0.5rem', fontWeight: 600 }}>TEAM A</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {teamA.map((member, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.3)',
                                                    padding: '0.5rem',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {member}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Plus/Arrow */}
                                <motion.div
                                    animate={showMergeAnimation ? { scale: 1.5, rotate: 360 } : { scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                                    }}
                                >
                                    +
                                </motion.div>

                                {/* Team B */}
                                <motion.div
                                    animate={showMergeAnimation ? { x: -50, opacity: 0.5 } : { x: 0, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        background: 'rgba(236, 72, 153, 0.2)',
                                        border: '2px solid rgba(236, 72, 153, 0.5)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '0.8rem', color: '#f472b6', marginBottom: '0.5rem', fontWeight: 600 }}>TEAM B</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {teamB.map((member, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                style={{
                                                    background: 'rgba(236, 72, 153, 0.3)',
                                                    padding: '0.5rem',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {member}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Merge Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                                <button
                                    onClick={() => runMergeDemo('plus')}
                                    disabled={showMergeAnimation}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: mergeMethod === 'plus' ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: showMergeAnimation ? 'not-allowed' : 'pointer',
                                        opacity: showMergeAnimation ? 0.7 : 1
                                    }}
                                >
                                    <Play size={16} /> Use + (Plus)
                                </button>
                                <button
                                    onClick={() => runMergeDemo('extend')}
                                    disabled={showMergeAnimation}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: mergeMethod === 'extend' ? '#10b981' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: showMergeAnimation ? 'not-allowed' : 'pointer',
                                        opacity: showMergeAnimation ? 0.7 : 1
                                    }}
                                >
                                    <Play size={16} /> Use .extend()
                                </button>
                                {demoCompleted && (
                                    <button
                                        onClick={resetDemo}
                                        style={{
                                            padding: '0.75rem 1.25rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Mega Team Result */}
                            <AnimatePresence>
                                {megaTeam.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                                            border: '2px solid rgba(16, 185, 129, 0.5)',
                                            borderRadius: '0.75rem',
                                            padding: '1rem',
                                            marginTop: '1rem'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '1rem',
                                            color: '#10b981',
                                            marginBottom: '0.75rem',
                                            fontWeight: 700,
                                            textAlign: 'center'
                                        }}>
                                            MEGA TEAM! (Combined)
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem',
                                            justifyContent: 'center'
                                        }}>
                                            {megaTeam.map((member, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: idx * 0.1, type: 'spring' }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                                                    }}
                                                >
                                                    {member}
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '0.5rem',
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem'
                                        }}>
                                            {mergeMethod === 'plus' ? (
                                                <>
                                                    <div style={{ color: '#6272a4' }}># + creates a NEW list</div>
                                                    <div><span style={{ color: '#50fa7b' }}>mega_team</span> = team_a + team_b</div>
                                                    <div style={{ color: '#8be9fd', marginTop: '0.5rem' }}>Original lists unchanged!</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ color: '#6272a4' }}># .extend() modifies team_a</div>
                                                    <div><span style={{ color: '#50fa7b' }}>team_a</span>.extend(team_b)</div>
                                                    <div style={{ color: '#f1fa8c', marginTop: '0.5rem' }}>team_a is now modified!</div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Symbol Explanations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}
                        >
                            {/* Plus Symbol */}
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 700
                                    }}>+</div>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Plus Sign</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    Joins two lists into a <strong>NEW</strong> one. Original lists stay the same!
                                </p>
                                <code style={{
                                    display: 'block',
                                    marginTop: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.85rem'
                                }}>
                                    new_list = list1 + list2
                                </code>
                            </div>

                            {/* Extend Method */}
                            <div style={{
                                background: 'rgba(236, 72, 153, 0.1)',
                                border: '1px solid rgba(236, 72, 153, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 700
                                    }}>.ext()</div>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>.extend()</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    Extends your list by adding another list's items. <strong>Changes</strong> the first list!
                                </p>
                                <code style={{
                                    display: 'block',
                                    marginTop: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.85rem'
                                }}>
                                    list1.extend(list2)
                                </code>
                            </div>
                        </motion.div>

                        {/* Code Example */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={styles.codeSection}
                        >
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}>
                                    <span>team_builder.py</span>
                                    <span style={{ color: '#06b6d4' }}>Python</span>
                                </div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create two teams</span>{'\n'}
                                    <span className={styles.keyword}>team_a</span> = [<span className={styles.string}>"Alice"</span>, <span className={styles.string}>"Bob"</span>]{'\n'}
                                    <span className={styles.keyword}>team_b</span> = [<span className={styles.string}>"Charlie"</span>, <span className={styles.string}>"Diana"</span>]{'\n\n'}

                                    <span className={styles.comment}># Method 1: + creates NEW combined list</span>{'\n'}
                                    <span className={styles.keyword}>mega_team</span> = team_a + team_b{'\n'}
                                    <span className={styles.keyword}>print</span>(mega_team){'\n'}
                                    <span className={styles.comment}># ['Alice', 'Bob', 'Charlie', 'Diana']</span>{'\n\n'}

                                    <span className={styles.comment}># Method 2: .extend() modifies team_a</span>{'\n'}
                                    <span className={styles.keyword}>team_a</span>.<span style={{ color: '#8be9fd' }}>extend</span>(team_b){'\n'}
                                    <span className={styles.keyword}>print</span>(team_a){'\n'}
                                    <span className={styles.comment}># ['Alice', 'Bob', 'Charlie', 'Diana']</span>{'\n\n'}

                                    <span className={styles.comment}># Join multiple lists!</span>{'\n'}
                                    <span className={styles.keyword}>all_players</span> = team_a + team_b + [<span className={styles.string}>"Eve"</span>]
                                </div>
                            </div>
                        </motion.div>

                        {/* Key Differences */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={styles.tipBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.15))',
                                border: '1px solid rgba(251, 191, 36, 0.3)'
                            }}
                        >
                            <Lightbulb size={24} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem' }}>Key Difference:</p>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: '#3b82f6', fontWeight: 700 }}>+</span>
                                        <span>Creates a NEW list, originals stay unchanged</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: '#ec4899', fontWeight: 700 }}>.extend()</span>
                                        <span>Modifies the first list directly</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interactive Editor */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={styles.codeSection}
                            style={{ marginTop: '2rem' }}
                        >
                            <h3>Try It Yourself!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>your_teams.py</span>
                                    <span style={{ color: '#06b6d4' }}>Interactive</span>
                                </div>
                                <textarea
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    placeholder={`# Create two teams and combine them!
team_a = ["Alice", "Bob"]
team_b = ["Charlie", "Diana"]

# Try using + to combine:
mega_team = team_a + team_b
print(mega_team)

# Or try .extend():
# team_a.extend(team_b)
# print(team_a)`}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button
                                className={styles.runBtn}
                                onClick={runCode}
                                style={{ background: codeRan ? '#10b981' : 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                            >
                                <Play size={18} /> {codeRan ? 'Code Ran!' : 'Run Code'}
                            </button>
                            {codeOutput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                    style={{ borderColor: codeRan ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                                >
                                    <div className={styles.outputLabel}>{codeRan ? 'Output:' : 'Hint:'}</div>
                                    <div className={styles.outputText} style={{ whiteSpace: 'pre-wrap' }}>{codeOutput}</div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3/lesson12" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                            >
                                Take Quiz! <Trophy size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Question {quizStage} of 2
                            </span>
                        </div>

                        <h2 className={styles.quizTitle}>Quick Check!</h2>

                        {quizStage === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>What does <code>[1, 2] + [3, 4]</code> create?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) [1, 2, 3, 4]',
                                        'B) [4, 6]',
                                        'C) [[1, 2], [3, 4]]'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>Which method changes the original list?</p>
                                <div className={styles.quizOptions}>
                                    {[
                                        'A) Using +',
                                        'B) .extend()',
                                        'C) Neither'
                                    ].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswer === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswer !== (quizStage === 1 ? 0 : 1) ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStage === 1
                                        ? 'The + operator joins list elements together in order: [1, 2] + [3, 4] = [1, 2, 3, 4]!'
                                        : '.extend() modifies the original list, while + creates a brand new list!'}
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={() => { setQuizChecked(false); setQuizAnswer(null); }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : quizStage === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>The + operator joins the elements of both lists into a new combined list!</p>
                            </motion.div>
                        ) : null}

                        <button
                            onClick={() => setShowQuiz(false)}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Lesson
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
