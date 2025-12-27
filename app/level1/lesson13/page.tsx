'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Shuffle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[12]; // Lesson 13

export default function Lesson13() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [challengesDone, setChallengesDone] = useState<boolean[]>([false, false, false]);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                const content = printMatch[1].trim();

                // int() conversion
                const intMatch = content.match(/^int\s*\(["'](\d+)["']\)$/);
                if (intMatch) {
                    outputLines.push(intMatch[1]);
                    const newChallenges = [...challengesDone];
                    newChallenges[0] = true;
                    setChallengesDone(newChallenges);
                    continue;
                }

                // str() conversion
                const strMatch = content.match(/^str\s*\((\d+)\)$/);
                if (strMatch) {
                    outputLines.push(strMatch[1]);
                    const newChallenges = [...challengesDone];
                    newChallenges[1] = true;
                    setChallengesDone(newChallenges);
                    continue;
                }

                // Comparison "5" == 5
                if (content.includes('==')) {
                    const parts = content.split('==').map(p => p.trim());
                    const left = parts[0];
                    const right = parts[1];

                    // String vs int comparison
                    const leftIsStr = left.startsWith('"') || left.startsWith("'");
                    const rightIsStr = right.startsWith('"') || right.startsWith("'");

                    if (leftIsStr !== rightIsStr) {
                        outputLines.push('False');
                        const newChallenges = [...challengesDone];
                        newChallenges[2] = true;
                        setChallengesDone(newChallenges);
                    } else {
                        const leftVal = left.replace(/["']/g, '');
                        const rightVal = right.replace(/["']/g, '');
                        outputLines.push(leftVal === rightVal ? 'True' : 'False');
                    }
                    continue;
                }

                // type() with conversion
                const typeIntMatch = content.match(/^type\s*\(\s*int\s*\(["'](\d+)["']\)\s*\)$/);
                if (typeIntMatch) {
                    outputLines.push("<class 'int'>");
                    continue;
                }

                const typeStrMatch = content.match(/^type\s*\(\s*str\s*\((\d+)\)\s*\)$/);
                if (typeStrMatch) {
                    outputLines.push("<class 'str'>");
                    continue;
                }

                // Simple expressions
                if (content.match(/^\d+\s*\+\s*\d+$/)) {
                    const result = eval(content);
                    outputLines.push(String(result));
                }
            }
        }

        setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try: print("5" == 5)');
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 0) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🎭</motion.div>
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
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>🎉 TYPE TRANSFORMER! 🎉</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level1/lesson14" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(249, 115, 22, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Shuffle size={28} className="text-pink-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Type Transformer!</span>
                            </div>
                            <p>
                                <code>"5"</code> and <code>5</code> look similar, but they're completely different! 🤯
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                One is text, one is a number. Let's learn to convert between them!
                            </p>
                        </motion.div>

                        {/* The Problem */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🚨 The Tricky Part!</h4>
                            <div style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#50fa7b' }}>"5"</span>
                                <span style={{ color: '#ff79c6' }}> == </span>
                                <span style={{ color: '#8be9fd' }}>5</span>
                                <span style={{ color: '#ff5555' }}> → False!</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                A string "5" is NOT equal to the number 5. They're different types!
                            </p>
                        </div>

                        {/* Converting Types */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> Type Conversion
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#8be9fd' }}>int() - Convert to Number</div>
                                    <code>int("42")</code> → <code>42</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Turns text into a whole number</p>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#50fa7b' }}>str() - Convert to Text</div>
                                    <code>str(42)</code> → <code>"42"</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Turns a number into text</p>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ff79c6' }}>float() - Convert to Decimal</div>
                                    <code>float("3.14")</code> → <code>3.14</code>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Turns text into a decimal number</p>
                                </div>
                            </div>
                        </div>

                        {/* Examples */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># This is False - different types!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"5"</span> == <span className={styles.number}>5</span>){'\n\n'}
                                    <span className={styles.comment}># Convert string to int, now it's True!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.keyword}>int</span>(<span className={styles.string}>"5"</span>) == <span className={styles.number}>5</span>){'\n\n'}
                                    <span className={styles.comment}># Combine text with a number</span>{'\n'}
                                    age = <span className={styles.number}>10</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"I am "</span> + <span className={styles.keyword}>str</span>(age) + <span className={styles.string}>" years old"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>False{'\n'}True{'\n'}I am 10 years old</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Transform Types!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'print(int("100"))\nprint("5" == 5)'} spellCheck={false} style={{ minHeight: '100px' }} />
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
                                    Use int() to convert a string to a number
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>{challengesDone[1] && <Check size={14} />}</div>
                                    Use str() to convert a number to text
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>{challengesDone[2] && <Check size={14} />}</div>
                                    Compare "5" == 5 and see what happens
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Why This Matters:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>User input is always a string!</li>
                                    <li>You need int() to do math with input</li>
                                    <li>You need str() to combine numbers with text</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson12" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            What does <code>print(int("5") == 5)</code> show?
                        </p>
                        <div className={styles.quizOptions}>
                            {['True', 'False', 'Error'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite! 🤔</h4>
                                <p>int("5") converts "5" to the number 5. Now both sides are the same number, so it's True!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
