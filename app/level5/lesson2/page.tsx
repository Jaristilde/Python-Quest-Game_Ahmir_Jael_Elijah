'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[1];
const LESSON_ID = 64;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Try using both lists and tuples!\ncart = ["apple", "bread"]\ncart.append("milk")\nprint("Cart:", cart)\n\nbirthday = ("March", 15)\nprint("Birthday:", birthday)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, { type: string; value: unknown[] }> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // List assignment
                const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.+)?\]$/);
                if (listMatch) {
                    const items = listMatch[2] ? listMatch[2].split(',').map(i => i.trim().replace(/['"]/g, '')) : [];
                    variables[listMatch[1]] = { type: 'list', value: items };
                    continue;
                }

                // Tuple assignment
                const tupleMatch = trimmed.match(/^(\w+)\s*=\s*\((.+)\)$/);
                if (tupleMatch) {
                    const items = tupleMatch[2].split(',').map(i => {
                        const t = i.trim();
                        return (t.startsWith('"') || t.startsWith("'")) ? t.slice(1, -1) : isNaN(Number(t)) ? t : Number(t);
                    });
                    variables[tupleMatch[1]] = { type: 'tuple', value: items };
                    continue;
                }

                // Append
                const appendMatch = trimmed.match(/^(\w+)\.append\(["'](.+)["']\)$/);
                if (appendMatch && variables[appendMatch[1]]?.type === 'list') {
                    (variables[appendMatch[1]].value as string[]).push(appendMatch[2]);
                    continue;
                }

                // Print with label
                const printLabelMatch = trimmed.match(/^print\(["'](.+)["'],\s*(\w+)\)$/);
                if (printLabelMatch) {
                    const v = variables[printLabelMatch[2]];
                    if (v) {
                        const formatted = v.type === 'tuple'
                            ? `(${v.value.map(x => typeof x === 'string' ? `'${x}'` : x).join(', ')})`
                            : `[${v.value.map(x => typeof x === 'string' ? `'${x}'` : x).join(', ')}]`;
                        outputLines.push(`${printLabelMatch[1]} ${formatted}`);
                    }
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\(["'](.+)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }
            }
            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
        } catch {
            setOutput('Error! Check syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);
        const correctAnswers = [0, 1]; // Q1=list, Q2=tuple

        if (quizAnswers[currentQuiz] === correctAnswers[currentQuiz]) {
            if (currentQuiz === 0) {
                setTimeout(() => setCurrentQuiz(1), 1000);
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
        return <div className={styles.container} style={{ background: 'var(--bg-primary)' }}><div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem' }}>🤔</motion.div></div></div>;
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}><Check size={50} /></motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>Decision Maker! 🤔</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><Link href="/level5/lesson3" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link></motion.div>
            </div>
        );
    }

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
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>When to use Lists vs Tuples?</span>
                            </div>
                            <p>🎯 Ask yourself: <strong style={{ color: 'var(--accent-secondary)' }}>Will this data ever change?</strong></p>
                        </motion.div>

                        {/* Comparison Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1.25rem', borderRadius: '1rem', border: '2px solid rgba(80, 250, 123, 0.4)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                                <h4 style={{ color: '#50fa7b', marginBottom: '0.5rem' }}>Use a LIST when...</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                                    <li>Things will be added or removed</li>
                                    <li>Order might change</li>
                                    <li>Shopping cart, to-do list, scores</li>
                                </ul>
                            </div>
                            <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1.25rem', borderRadius: '1rem', border: '2px solid rgba(255, 121, 198, 0.4)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                                <h4 style={{ color: '#ff79c6', marginBottom: '0.5rem' }}>Use a TUPLE when...</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                                    <li>Data should NEVER change</li>
                                    <li>Like facts or coordinates</li>
                                    <li>Birthday, GPS location, RGB color</li>
                                </ul>
                            </div>
                        </div>

                        {/* Examples */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Real Examples</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>📝 To-Do List (Changes!) → Use LIST</p>
                                    <code style={{ fontSize: '0.85rem' }}>todos = ["homework", "clean room"]</code><br/>
                                    <code style={{ fontSize: '0.85rem' }}>todos.append("practice piano")</code>
                                </div>
                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <p style={{ fontWeight: 700, color: '#ff79c6', marginBottom: '0.5rem' }}>🎂 Birthday (Never changes!) → Use TUPLE</p>
                                    <code style={{ fontSize: '0.85rem' }}>birthday = ("December", 25, 2012)</code><br/>
                                    <code style={{ fontSize: '0.85rem', color: '#ff5555' }}># Can't change - and that's good!</code>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn!</h3>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '180px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}><Play size={18} /> Run Code</button>
                            {output && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></motion.div>}
                        </div>

                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Quick Decision Guide:</p>
                                <p style={{ fontSize: '0.9rem' }}>📝 Will change? → <strong>LIST [ ]</strong></p>
                                <p style={{ fontSize: '0.9rem' }}>🔒 Should stay same? → <strong>TUPLE ( )</strong></p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level5/lesson1" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>You're making a shopping app. What should you use for the cart?</p>
                                <div className={styles.quizOptions}>
                                    {['LIST - items will be added/removed', 'TUPLE - cart never changes', "Either one - doesn't matter"].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const a = [...quizAnswers]; a[0] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 0 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What should you use to store a game's release date (May 15, 2023)?</p>
                                <div className={styles.quizOptions}>
                                    {['LIST - might need to change', 'TUPLE - release date is permanent', 'String - just text'].map((opt, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const a = [...quizAnswers]; a[1] = idx; setQuizAnswers(a); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 1 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>{opt}</button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 1) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Shopping carts change all the time - use a LIST!' : 'A release date never changes - perfect for a TUPLE!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4><p>Shopping carts change - LIST is perfect! Next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
