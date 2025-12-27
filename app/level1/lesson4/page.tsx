'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[3]; // Lesson 4

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const runCode = () => {
        const lines = code.trim().split('\n');
        let outputLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                try {
                    // Simple math evaluation (basic safety - only numbers and operators)
                    const expr = printMatch[1];
                    if (/^[\d\s+\-*/().]+$/.test(expr)) {
                        const result = eval(expr);
                        outputLines.push(String(result));
                    } else {
                        outputLines.push('Error: Only use numbers and +, -, *, /');
                    }
                } catch {
                    outputLines.push('Error: Check your math!');
                }
            }
        }
        setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code!');
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        if (quizAnswer === 1) {
            setTimeout(() => {
                addXpAndCoins(LESSON.xpReward, 5);
                completeLevel(LESSON.id, LESSON.xpReward, 5, 1, 60);
                setLessonComplete(true);
            }, 1000);
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>🎉 CORRECT!</h2>
                <p className={styles.successMessage}>{LESSON.successMessage}</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level1/lesson5" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <div className={styles.lessonEmoji}>{LESSON.emoji}</div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: {LESSON.concept}</p>
                            </div>
                        </div>

                        <div className={styles.explainBox}>
                            <p>Your computer is a calculator! 🧮</p>
                            <p style={{ marginTop: '1rem' }}>
                                <code>+</code> means add &nbsp;&nbsp;
                                <code>-</code> means subtract
                            </p>
                            <p style={{ marginTop: '0.5rem' }}>
                                <code>*</code> means multiply (not x!) &nbsp;&nbsp;
                                <code>/</code> means divide
                            </p>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No equals button needed - just print it!</p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>📝 Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>5 + 3</span>)   <span className={styles.comment}># Add</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>10 - 4</span>)  <span className={styles.comment}># Subtract</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>3 * 3</span>)   <span className={styles.comment}># Multiply</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>20 / 5</span>)  <span className={styles.comment}># Divide</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>8{'\n'}6{'\n'}9{'\n'}4</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'print(100 + 50)\nprint(8 * 7)'} spellCheck={false} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>🎯 Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>What's 100 + 50?</li>
                                <li><div className={styles.challengeCheck}></div>What's 8 * 7?</li>
                                <li><div className={styles.challengeCheck}></div>If you have 24 cookies and 4 friends, how many each? (24 / 4)</li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p><strong>Remember:</strong> Use <code>*</code> for multiply (not x) and <code>/</code> for divide!</p>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson3" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>🧠 Brain Check!</h2>
                        <p className={styles.quizQuestion}>What does <code>print(6 * 2)</code> show?</p>
                        <div className={styles.quizOptions}>
                            {['62', '12', '6 * 2'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Hmm, not quite! 🤔</h4>
                                <p>The <code>*</code> means multiply. 6 × 2 = 12!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
