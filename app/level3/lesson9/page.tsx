'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Trophy, Star, Award, Crown, Medal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL3_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL3_LESSONS[8]; // Lesson 9 (0-indexed)
const LESSON_ID = 42;

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Find the max and min!\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for scoreboard visualization
    const [isAnimating, setIsAnimating] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [foundMax, setFoundMax] = useState(false);
    const [foundMin, setFoundMin] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'searching' | 'found_max' | 'found_min' | 'complete'>('idle');

    const quizQuestions = [
        {
            question: 'What does max([10, 5, 20, 15]) return?',
            options: ['10', '15', '20'],
            correct: 2
        },
        {
            question: 'What does min() find?',
            options: ['The first item', 'The smallest value', 'The list length'],
            correct: 1
        }
    ];

    const scoreboardData = [85, 92, 78, 95, 88];
    const maxScore = Math.max(...scoreboardData);
    const minScore = Math.min(...scoreboardData);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            const variables: { [key: string]: number[] | number | string } = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // List assignment: scores = [85, 92, 78, 95, 88]
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[([\d,\s]+)\]$/);
                if (listMatch) {
                    const varName = listMatch[1];
                    const items = listMatch[2].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                    variables[varName] = items;
                    continue;
                }

                // max() assignment: highest = max(scores)
                const maxMatch = trimmed.match(/^(\w+)\s*=\s*max\s*\(\s*(\w+)\s*\)$/);
                if (maxMatch) {
                    const varName = maxMatch[1];
                    const listName = maxMatch[2];
                    const list = variables[listName];
                    if (Array.isArray(list)) {
                        variables[varName] = Math.max(...list);
                    }
                    continue;
                }

                // min() assignment: lowest = min(scores)
                const minMatch = trimmed.match(/^(\w+)\s*=\s*min\s*\(\s*(\w+)\s*\)$/);
                if (minMatch) {
                    const varName = minMatch[1];
                    const listName = minMatch[2];
                    const list = variables[listName];
                    if (Array.isArray(list)) {
                        variables[varName] = Math.min(...list);
                    }
                    continue;
                }

                // print with string and variable: print("text", var)
                const printMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*,\s*(\w+)\s*\)$/);
                if (printMatch) {
                    const text = printMatch[1];
                    const varName = printMatch[2];
                    const value = variables[varName];
                    if (value !== undefined) {
                        outputLines.push(text + ' ' + value);
                    }
                    continue;
                }

                // Simple print: print("...")
                const simplePrintMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
                if (simplePrintMatch) {
                    outputLines.push(simplePrintMatch[1]);
                    continue;
                }

                // print(var)
                const printVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVarMatch) {
                    const varName = printVarMatch[1];
                    const value = variables[varName];
                    if (value !== undefined) {
                        outputLines.push(String(value));
                    }
                    continue;
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    // Animated scoreboard visualization
    const runAnimatedDemo = () => {
        setIsAnimating(true);
        setHighlightedIndex(null);
        setFoundMax(false);
        setFoundMin(false);
        setAnimationPhase('searching');

        // Search through each score for max
        scoreboardData.forEach((_, index) => {
            setTimeout(() => {
                setHighlightedIndex(index);
            }, 500 + index * 400);
        });

        // Found max!
        setTimeout(() => {
            const maxIdx = scoreboardData.indexOf(maxScore);
            setHighlightedIndex(maxIdx);
            setFoundMax(true);
            setAnimationPhase('found_max');
        }, 500 + scoreboardData.length * 400 + 300);

        // Search for min
        setTimeout(() => {
            setFoundMax(true);
            setAnimationPhase('searching');
            scoreboardData.forEach((_, index) => {
                setTimeout(() => {
                    setHighlightedIndex(index);
                }, index * 400);
            });
        }, 500 + scoreboardData.length * 400 + 1500);

        // Found min!
        setTimeout(() => {
            const minIdx = scoreboardData.indexOf(minScore);
            setHighlightedIndex(minIdx);
            setFoundMin(true);
            setAnimationPhase('found_min');
        }, 500 + scoreboardData.length * 400 + 1500 + scoreboardData.length * 400 + 300);

        // Complete
        setTimeout(() => {
            setAnimationPhase('complete');
            setHighlightedIndex(null);
            setIsAnimating(false);
        }, 500 + scoreboardData.length * 400 + 1500 + scoreboardData.length * 400 + 1500);
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            if (currentQuiz < 1) {
                setTimeout(() => {
                    setCurrentQuiz(currentQuiz + 1);
                    const resetChecked = [...quizChecked];
                    resetChecked[currentQuiz + 1] = false;
                    setQuizChecked(resetChecked);
                }, 1000);
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
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
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
                        <Trophy size={48} className="text-amber-400" />
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
                            {['1st', '2nd', '3rd', '100', '99', '1'][Math.floor(Math.random() * 6)]}
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
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        width: '100px',
                        height: '100px',
                        boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)'
                    }}
                >
                    <Trophy size={50} className="text-white" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.successTitle}
                    style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    EXTREME FINDER!
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
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
                        border: '2px solid rgba(251, 191, 36, 0.5)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        marginBottom: '1.5rem'
                    }}
                >
                    <Crown size={20} className="text-amber-400" />
                    <span style={{ fontWeight: 700 }}>min() & max() Mastered!</span>
                    <Check size={20} className="text-amber-400" />
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
                    <Link href="/level3/lesson10" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
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
                                style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{LESSON.emoji}</span>
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
                                border: '2px solid rgba(251, 191, 36, 0.3)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Animated Trophy Podium */}
                                <div style={{ position: 'relative', width: '120px', height: '100px', flexShrink: 0 }}>
                                    {/* Podium */}
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
                                        {/* 2nd place */}
                                        <motion.div
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
                                            style={{
                                                width: '30px',
                                                height: '35px',
                                                background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                                                borderRadius: '4px 4px 0 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            2nd
                                        </motion.div>
                                        {/* 1st place */}
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            style={{
                                                width: '35px',
                                                height: '50px',
                                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                borderRadius: '4px 4px 0 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                position: 'relative'
                                            }}
                                        >
                                            1st
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                style={{ position: 'absolute', top: '-25px', fontSize: '1.25rem' }}
                                            >
                                                <Crown size={24} className="text-amber-300" />
                                            </motion.div>
                                        </motion.div>
                                        {/* 3rd place */}
                                        <motion.div
                                            animate={{ y: [0, -2, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                            style={{
                                                width: '30px',
                                                height: '25px',
                                                background: 'linear-gradient(135deg, #c2884a, #a16a3b)',
                                                borderRadius: '4px 4px 0 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.7rem'
                                            }}
                                        >
                                            3rd
                                        </motion.div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <Trophy size={20} className="text-amber-400" />
                                        High Score Hunter!
                                    </div>
                                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                                        You have a list of game scores and need to find the <strong>HIGHEST</strong> score (the champion!) and the <strong>LOWEST</strong> score. Python has special tools for this!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Concept Explanation Box */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>How min() and max() Work</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>1</span>
                                    <p><code>max(list)</code> returns the <strong>biggest</strong> value in the list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2</span>
                                    <p><code>min(list)</code> returns the <strong>smallest</strong> value in the list</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>3</span>
                                    <p>Works with <strong>numbers AND strings</strong> (alphabetically for strings)</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>4</span>
                                    <p>Returns a <strong>single value</strong>, not a list</p>
                                </div>
                            </div>
                        </div>

                        {/* Symbol Explanations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ marginBottom: '0.75rem', color: '#10b981' }}>Symbol Guide</h3>
                            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
                                <div><code style={{ color: '#f472b6' }}>max()</code> = "Finds the MAXimum (biggest) value in the list"</div>
                                <div><code style={{ color: '#f472b6' }}>min()</code> = "Finds the MINimum (smallest) value in the list"</div>
                                <div><code style={{ color: '#f472b6' }}>( )</code> = "Put your list inside the parentheses"</div>
                            </div>
                        </motion.div>

                        {/* Interactive Scoreboard Visualization */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Play size={18} /> Watch min() and max() in Action
                            </h3>

                            {/* Scoreboard visualization */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
                                    scores = [85, 92, 78, 95, 88]
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {scoreboardData.map((score, idx) => {
                                        const isMax = score === maxScore && foundMax;
                                        const isMin = score === minScore && foundMin;
                                        const isHighlighted = highlightedIndex === idx;

                                        return (
                                            <motion.div
                                                key={idx}
                                                animate={{
                                                    scale: isHighlighted ? 1.15 : (isMax || isMin) ? 1.1 : 1,
                                                    borderColor: isMax ? '#fbbf24' : isMin ? '#3b82f6' : isHighlighted ? '#c084fc' : 'rgba(255,255,255,0.2)',
                                                    boxShadow: isMax ? '0 0 20px rgba(251, 191, 36, 0.5)' : isMin ? '0 0 20px rgba(59, 130, 246, 0.5)' : isHighlighted ? '0 0 15px rgba(192, 132, 252, 0.4)' : 'none'
                                                }}
                                                style={{
                                                    padding: '1rem 1.5rem',
                                                    background: isMax ? 'rgba(251, 191, 36, 0.2)' : isMin ? 'rgba(59, 130, 246, 0.2)' : isHighlighted ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                                                    border: '2px solid',
                                                    borderRadius: '0.75rem',
                                                    fontFamily: 'monospace',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 700,
                                                    position: 'relative',
                                                    minWidth: '60px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {score}
                                                {isMax && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-30px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Crown size={20} className="text-amber-400" />
                                                        <span style={{ fontSize: '0.65rem', color: '#fbbf24' }}>MAX</span>
                                                    </motion.div>
                                                )}
                                                {isMin && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '-30px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.65rem', color: '#3b82f6' }}>MIN</span>
                                                        <Medal size={18} className="text-blue-400" />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status message */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={animationPhase}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        textAlign: 'center',
                                        marginBottom: '1rem',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        background: animationPhase === 'complete' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)',
                                        color: animationPhase === 'complete' ? '#10b981' : 'var(--text-muted)'
                                    }}
                                >
                                    {animationPhase === 'idle' && 'Click the button to find max and min!'}
                                    {animationPhase === 'searching' && 'Searching through scores...'}
                                    {animationPhase === 'found_max' && `Found MAX: ${maxScore}! Now searching for MIN...`}
                                    {animationPhase === 'found_min' && `Found MIN: ${minScore}!`}
                                    {animationPhase === 'complete' && `max(scores) = ${maxScore}, min(scores) = ${minScore}`}
                                </motion.div>
                            </AnimatePresence>

                            <button
                                onClick={runAnimatedDemo}
                                disabled={isAnimating}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: isAnimating ? 'rgba(251, 191, 36, 0.3)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                                    margin: '0 auto'
                                }}
                            >
                                <Play size={18} /> {isAnimating ? 'Finding...' : 'Find Max & Min'}
                            </button>
                        </motion.div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>high_score.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    scores = [<span className={styles.number}>85</span>, <span className={styles.number}>92</span>, <span className={styles.number}>78</span>, <span className={styles.number}>95</span>, <span className={styles.number}>88</span>]{'\n\n'}
                                    highest = <span style={{ color: '#8be9fd' }}>max</span>(scores){'\n'}
                                    lowest = <span style={{ color: '#8be9fd' }}>min</span>(scores){'\n\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"High score:"</span>, highest){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"Low score:"</span>, lowest)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>High score: 95{'\n'}Low score: 78</div>
                            </div>
                        </div>

                        {/* Interactive Code Editor */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Try changing the scores! What happens when you add higher or lower numbers?</p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        {/* Tip Box */}
                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Works with Strings Too!</p>
                                <p style={{ fontSize: '0.9rem' }}><code>max(["apple", "banana", "cherry"])</code> returns <code>"cherry"</code> (last alphabetically). <code>min()</code> would return <code>"apple"</code> (first alphabetically).</p>
                            </div>
                        </div>

                        {/* Bonus Examples */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h4 style={{ marginBottom: '0.75rem', color: '#3b82f6' }}>More Examples</h4>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                <span style={{ color: '#6272a4' }}># Find temperature extremes</span>{'\n'}
                                temps = [72, 68, 75, 80, 65]{'\n'}
                                <span style={{ color: '#ff79c6' }}>print</span>(<span style={{ color: '#50fa7b' }}>"Hottest:"</span>, <span style={{ color: '#8be9fd' }}>max</span>(temps))  <span style={{ color: '#6272a4' }}># 80</span>{'\n'}
                                <span style={{ color: '#ff79c6' }}>print</span>(<span style={{ color: '#50fa7b' }}>"Coldest:"</span>, <span style={{ color: '#8be9fd' }}>min</span>(temps))  <span style={{ color: '#6272a4' }}># 65</span>
                            </div>
                        </motion.div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level3/lesson8" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button
                                className={`${styles.navBtn} ${styles.primary}`}
                                onClick={() => setShowQuiz(true)}
                                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                            >
                                Quiz Time! <Trophy size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.quizSection}
                        style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))' }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Question {currentQuiz + 1} of 2
                            </span>
                        </div>

                        <h2 className={styles.quizTitle}>Quick Check!</h2>

                        <p className={styles.quizQuestion}>{quizQuestions[currentQuiz].question}</p>
                        <div className={styles.quizOptions}>
                            {quizQuestions[currentQuiz].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!quizChecked[currentQuiz]) {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[currentQuiz] = idx;
                                            setQuizAnswers(newAnswers);
                                        }
                                    }}
                                    className={`${styles.quizOption} ${quizAnswers[currentQuiz] === idx ? styles.selected : ''} ${quizChecked[currentQuiz] && idx === quizQuestions[currentQuiz].correct ? styles.correct : ''} ${quizChecked[currentQuiz] && quizAnswers[currentQuiz] === idx && idx !== quizQuestions[currentQuiz].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked[currentQuiz]}
                                >
                                    {String.fromCharCode(65 + idx)}) {option}
                                </button>
                            ))}
                        </div>

                        {!quizChecked[currentQuiz] ? (
                            <button
                                className={styles.quizBtn}
                                onClick={checkQuiz}
                                disabled={quizAnswers[currentQuiz] === null}
                            >
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0 && 'max() finds the biggest value in the list. In [10, 5, 20, 15], the biggest number is 20!'}
                                    {currentQuiz === 1 && 'min() finds the MINimum - the smallest value in your list. It doesn\'t care about position or length!'}
                                </p>
                                <button
                                    className={styles.quizBtn}
                                    onClick={retryQuiz}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback} ${styles.success}`}
                            >
                                <h4>Correct!</h4>
                                <p>
                                    {currentQuiz === 0 && 'Yes! max([10, 5, 20, 15]) returns 20 - the biggest number!'}
                                    {currentQuiz === 1 && 'Exactly! min() finds the smallest value in any list.'}
                                </p>
                            </motion.div>
                        )}

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
