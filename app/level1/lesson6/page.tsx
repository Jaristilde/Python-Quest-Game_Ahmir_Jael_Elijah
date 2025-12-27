'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[5]; // Lesson 6

export default function Lesson6() {
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
                    const expr = printMatch[1];
                    // Handle comparisons
                    if (expr.includes('==') || expr.includes('>') || expr.includes('<') || expr.includes('>=') || expr.includes('<=') || expr.includes('!=')) {
                        const result = eval(expr);
                        outputLines.push(result ? 'True' : 'False');
                    } else if (/^[\d\s+\-*/().]+$/.test(expr)) {
                        outputLines.push(String(eval(expr)));
                    }
                } catch {
                    outputLines.push('Error: Check your code!');
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
                <Link href="/level1/lesson7" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <p>Your computer can answer yes or no questions! ❓</p>
                            <p style={{ marginTop: '1rem' }}>
                                <code>==</code> means "is this the same as?"<br />
                                <code>&gt;</code> means "is this bigger than?"<br />
                                <code>&lt;</code> means "is this smaller than?"
                            </p>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Computer says: <strong>True</strong> (yes!) or <strong>False</strong> (nope!)</p>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>📝 Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>5 == 5</span>)   <span className={styles.comment}># True - yes they match!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>10 &gt; 3</span>)   <span className={styles.comment}># True - 10 is bigger</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.number}>2 &gt; 100</span>)  <span className={styles.comment}># False - 2 is not bigger</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>True{'\n'}True{'\n'}False</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'print(7 == 7)\nprint(20 > 15)\nprint(3 < 1)'} spellCheck={false} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.challenges}>
                            <h3>🎯 Now You Try:</h3>
                            <ul className={styles.challengeList}>
                                <li><div className={styles.challengeCheck}></div>Is 7 equal to 7?</li>
                                <li><div className={styles.challengeCheck}></div>Is 20 bigger than 15?</li>
                                <li><div className={styles.challengeCheck}></div>Is 3 smaller than 1?</li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p><strong>Watch out:</strong> Use <code>==</code> (two equals) to check if things match. One <code>=</code> is for giving names!</p>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>🧠 Brain Check!</h2>
                        <p className={styles.quizQuestion}>What does <code>print(10 == 10)</code> show?</p>
                        <div className={styles.quizOptions}>
                            {['10', 'True', 'Yes'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Hmm, not quite! 🤔</h4>
                                <p>Python says <code>True</code> (not "Yes") when things are equal!</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
