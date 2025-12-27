'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[11]; // Lesson 12

export default function Lesson12() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);
    const [superchargeCode, setSuperchargeCode] = useState('');
    const [superchargeOutput, setSuperchargeOutput] = useState('');
    const [superchargeDone, setSuperchargeDone] = useState(false);
    const [superchargeXpClaimed, setSuperchargeXpClaimed] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Print with type()
            const printTypeMatch = trimmed.match(/^print\s*\(\s*type\s*\((.+)\)\s*\)$/);
            if (printTypeMatch) {
                const value = printTypeMatch[1].trim();

                // Check what type it is
                if (value.match(/^["'].*["']$/)) {
                    outputLines.push("<class 'str'>");
                    const newChallenges = [...challengesDone];
                    newChallenges[0] = true;
                    setChallengesDone(newChallenges);
                } else if (value.match(/^\d+$/)) {
                    outputLines.push("<class 'int'>");
                    const newChallenges = [...challengesDone];
                    newChallenges[1] = true;
                    setChallengesDone(newChallenges);
                } else if (value.match(/^\d+\.\d+$/)) {
                    outputLines.push("<class 'float'>");
                    const newChallenges = [...challengesDone];
                    newChallenges[1] = true;
                    setChallengesDone(newChallenges);
                } else if (value === 'True' || value === 'False') {
                    outputLines.push("<class 'bool'>");
                    const newChallenges = [...challengesDone];
                    newChallenges[2] = true;
                    setChallengesDone(newChallenges);
                } else if (value.match(/^\[.*\]$/)) {
                    outputLines.push("<class 'list'>");
                }
                continue;
            }

            // Simple print
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                const content = printMatch[1].trim();
                const strMatch = content.match(/^["'](.*)["']$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
                } else if (content.match(/^\d+$/)) {
                    outputLines.push(content);
                } else if (content.match(/^\d+\.\d+$/)) {
                    outputLines.push(content);
                }
            }
        }

        setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try: print(type("hello"))');
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 2) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    const runSupercharge = () => {
        const lines = superchargeCode.trim().split('\n');
        let outputLines: string[] = [];
        const typesFound = { str: false, int: false, float: false, bool: false };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const printTypeMatch = trimmed.match(/^print\s*\(\s*type\s*\((.+)\)\s*\)$/);
            if (printTypeMatch) {
                const value = printTypeMatch[1].trim();

                if (value.match(/^["'].*["']$/)) {
                    outputLines.push("<class 'str'>");
                    typesFound.str = true;
                } else if (value.match(/^\d+$/)) {
                    outputLines.push("<class 'int'>");
                    typesFound.int = true;
                } else if (value.match(/^\d+\.\d+$/)) {
                    outputLines.push("<class 'float'>");
                    typesFound.float = true;
                } else if (value === 'True' || value === 'False') {
                    outputLines.push("<class 'bool'>");
                    typesFound.bool = true;
                }
            }
        }

        setSuperchargeOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try checking all 4 types!');

        // Check if all 4 types were found
        if (typesFound.str && typesFound.int && typesFound.float && typesFound.bool) {
            setSuperchargeDone(true);
        }
    };

    const claimSuperchargeXp = () => {
        if (!superchargeXpClaimed && superchargeDone) {
            addXpAndCoins(25, 0);
            setSuperchargeXpClaimed(true);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔍</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>🎉 TYPE DETECTIVE! 🎉</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level1/lesson13" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level1" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 15</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Search size={28} className="text-blue-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Type Detective!</span>
                            </div>
                            <p>
                                In Python, everything has a <strong>type</strong> - like how animals have species! 🐱🐕
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                Use <code>type()</code> to discover what kind of data you have!
                            </p>
                        </motion.div>

                        {/* Types Grid */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> The Four Main Types
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(80, 250, 123, 0.3)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
                                    <div style={{ fontWeight: 700, color: '#50fa7b' }}>str</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Text/Words</div>
                                    <code style={{ fontSize: '0.85rem' }}>"hello"</code>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(139, 233, 253, 0.3)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔢</div>
                                    <div style={{ fontWeight: 700, color: '#8be9fd' }}>int</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Whole Numbers</div>
                                    <code style={{ fontSize: '0.85rem' }}>42</code>
                                </div>

                                <div style={{ background: 'rgba(255, 121, 198, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 121, 198, 0.3)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔵</div>
                                    <div style={{ fontWeight: 700, color: '#ff79c6' }}>float</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Decimal Numbers</div>
                                    <code style={{ fontSize: '0.85rem' }}>3.14</code>
                                </div>

                                <div style={{ background: 'rgba(255, 184, 108, 0.15)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 184, 108, 0.3)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                                    <div style={{ fontWeight: 700, color: '#ffb86c' }}>bool</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>True or False</div>
                                    <code style={{ fontSize: '0.85rem' }}>True</code>
                                </div>
                            </div>
                        </div>

                        {/* Examples */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Check the type of different values</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.keyword}>type</span>(<span className={styles.string}>"Robo-1"</span>)){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.keyword}>type</span>(<span className={styles.number}>42</span>)){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.keyword}>type</span>(<span className={styles.number}>3.14</span>)){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.keyword}>type</span>(True))
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>{"<class 'str'>"}{'\n'}{"<class 'int'>"}{'\n'}{"<class 'float'>"}{'\n'}{"<class 'bool'>"}</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Discover Types!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'print(type("hello"))\nprint(type(100))\nprint(type(True))'} spellCheck={false} style={{ minHeight: '100px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>✨ Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges}>
                            <h3>🎯 Mini Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[0] ? styles.done : ''}`}>{challengesDone[0] && <Check size={14} />}</div>
                                    Find the type of a string (text in quotes)
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>{challengesDone[1] && <Check size={14} />}</div>
                                    Find the type of a number (int or float)
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>{challengesDone[2] && <Check size={14} />}</div>
                                    Find the type of True or False (bool)
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Quick Reference:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><strong>str</strong> = string = text in quotes</li>
                                    <li><strong>int</strong> = integer = whole number</li>
                                    <li><strong>float</strong> = decimal number</li>
                                    <li><strong>bool</strong> = boolean = True/False</li>
                                </ul>
                            </div>
                        </div>

                        {/* SUPERCHARGE Bonus Challenge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.25))',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                marginTop: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '1.5rem' }}
                                >⚡</motion.span>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fbbf24', fontWeight: 800 }}>SUPERCHARGE - Bonus Challenge</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optional • +25 XP • Not required to advance</p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>🎯 The Challenge: Type Collection!</p>
                                <p style={{ margin: 0 }}>
                                    Use <code>print(type())</code> to discover <strong>all 4 types</strong> in one program:
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <span style={{ background: 'rgba(80, 250, 123, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.9rem' }}>📝 str</span>
                                    <span style={{ background: 'rgba(139, 233, 253, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.9rem' }}>🔢 int</span>
                                    <span style={{ background: 'rgba(255, 121, 198, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.9rem' }}>🔵 float</span>
                                    <span style={{ background: 'rgba(255, 184, 108, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.9rem' }}>✅ bool</span>
                                </div>
                            </div>

                            <div className={styles.editor}>
                                <div className={styles.codeHeader}>
                                    <span>supercharge.py</span>
                                    <span style={{ color: '#fbbf24' }}>⚡ BONUS</span>
                                </div>
                                <textarea
                                    value={superchargeCode}
                                    onChange={(e) => setSuperchargeCode(e.target.value)}
                                    placeholder={'# Find all 4 types!\nprint(type("Python"))\nprint(type(100))\nprint(type(3.14))\nprint(type(True))'}
                                    spellCheck={false}
                                    style={{ minHeight: '140px' }}
                                />
                            </div>

                            <button
                                className={styles.runBtn}
                                onClick={runSupercharge}
                                style={{ background: superchargeDone ? '#10b981' : '#f59e0b' }}
                            >
                                <Play size={18} /> {superchargeDone ? 'All Types Found!' : 'Test Supercharge'}
                            </button>

                            {superchargeOutput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.outputBox}
                                    style={{ borderColor: superchargeDone ? 'rgba(16, 185, 129, 0.5)' : undefined }}
                                >
                                    <div className={styles.outputLabel}>{superchargeDone ? '⚡ ALL 4 TYPES COLLECTED!' : '✨ Output:'}</div>
                                    <div className={styles.outputText}>{superchargeOutput}</div>
                                </motion.div>
                            )}

                            {superchargeDone && !superchargeXpClaimed && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={claimSuperchargeXp}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Zap size={20} fill="currentColor" /> Claim +25 Bonus XP!
                                </motion.button>
                            )}

                            {superchargeXpClaimed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '1rem',
                                        marginTop: '1rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        borderRadius: 'var(--radius)',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}
                                >
                                    <Check size={20} /> +25 XP Claimed! Type Collector! 🏆
                                </motion.div>
                            )}
                        </motion.div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson11" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            What type is <code>"42"</code> (with quotes)?
                        </p>
                        <div className={styles.quizOptions}>
                            {['int', 'float', 'str'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 2 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 2 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 2 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite! 🤔</h4>
                                <p>Anything in quotes is a string (str), even if it looks like a number! "42" is text, not a number.</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
