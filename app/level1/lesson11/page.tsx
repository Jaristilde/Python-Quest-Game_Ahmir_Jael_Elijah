'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Type, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL1_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL1_LESSONS[10]; // Lesson 11

export default function Lesson11() {
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
        const variables: { [key: string]: string } = {};
        let outputLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Variable assignment
            const assignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
            if (assignMatch) {
                variables[assignMatch[1]] = assignMatch[2];
                continue;
            }

            // Print with comparison
            const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
            if (printMatch) {
                let expr = printMatch[1].trim();

                // Replace variables with their values
                for (const [varName, value] of Object.entries(variables)) {
                    expr = expr.replace(new RegExp(`\\b${varName}\\b`, 'g'), `"${value}"`);
                }

                // Handle string comparisons
                if (expr.includes('==')) {
                    const parts = expr.split('==').map(p => p.trim());
                    const left = parts[0].replace(/["']/g, '');
                    const right = parts[1].replace(/["']/g, '');
                    outputLines.push(left === right ? 'True' : 'False');

                    const newChallenges = [...challengesDone];
                    newChallenges[0] = true;
                    setChallengesDone(newChallenges);
                } else if (expr.includes('!=')) {
                    const parts = expr.split('!=').map(p => p.trim());
                    const left = parts[0].replace(/["']/g, '');
                    const right = parts[1].replace(/["']/g, '');
                    outputLines.push(left !== right ? 'True' : 'False');

                    const newChallenges = [...challengesDone];
                    newChallenges[1] = true;
                    setChallengesDone(newChallenges);
                } else if (expr.includes('<') && !expr.includes('=')) {
                    const parts = expr.split('<').map(p => p.trim());
                    const left = parts[0].replace(/["']/g, '');
                    const right = parts[1].replace(/["']/g, '');
                    outputLines.push(left < right ? 'True' : 'False');

                    const newChallenges = [...challengesDone];
                    newChallenges[2] = true;
                    setChallengesDone(newChallenges);
                } else if (expr.includes('>') && !expr.includes('=')) {
                    const parts = expr.split('>').map(p => p.trim());
                    const left = parts[0].replace(/["']/g, '');
                    const right = parts[1].replace(/["']/g, '');
                    outputLines.push(left > right ? 'True' : 'False');

                    const newChallenges = [...challengesDone];
                    newChallenges[2] = true;
                    setChallengesDone(newChallenges);
                } else {
                    // Simple string print
                    const strMatch = expr.match(/^["'](.*)["']$/);
                    if (strMatch) {
                        outputLines.push(strMatch[1]);
                    }
                }
            }
        }

        setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try: print("cat" == "cat")');
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

    if (isLoading || !user) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔤</motion.div>
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
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle}>🎉 WORD COMPARER! 🎉</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>{LESSON.successMessage}</motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level1/lesson12" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ rotateY: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Type size={28} className="text-purple-400" />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Mission: Word Detective!</span>
                            </div>
                            <p>
                                Robo-1 needs to check passwords and match secret codes! 🔐
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                You learned to compare numbers. Now let's compare <strong>words</strong>!
                            </p>
                        </motion.div>

                        {/* Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} className="text-amber-400" /> Comparing Words
                            </h3>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0', fontFamily: 'monospace' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#50fa7b' }}>"cat"</span>
                                    <span style={{ color: '#ff79c6' }}> == </span>
                                    <span style={{ color: '#50fa7b' }}>"cat"</span>
                                    <span style={{ color: '#8be9fd' }}> → True</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#50fa7b' }}>"cat"</span>
                                    <span style={{ color: '#ff79c6' }}> == </span>
                                    <span style={{ color: '#50fa7b' }}>"Cat"</span>
                                    <span style={{ color: '#ff5555' }}> → False</span>
                                    <span style={{ color: '#6272a4' }}> (capitals matter!)</span>
                                </div>
                                <div>
                                    <span style={{ color: '#50fa7b' }}>"apple"</span>
                                    <span style={{ color: '#ff79c6' }}> {"<"} </span>
                                    <span style={{ color: '#50fa7b' }}>"banana"</span>
                                    <span style={{ color: '#8be9fd' }}> → True</span>
                                    <span style={{ color: '#6272a4' }}> (alphabetical order!)</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Comparison operators:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <code style={{ color: '#ff79c6' }}>==</code>
                                        <span>Are they exactly the same?</span>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <code style={{ color: '#ff79c6' }}>!=</code>
                                        <span>Are they different?</span>
                                    </li>
                                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <code style={{ color: '#ff79c6' }}>{"<"}</code>
                                        <span>Comes before alphabetically?</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <code style={{ color: '#ff79c6' }}>{">"}</code>
                                        <span>Comes after alphabetically?</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Important */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🚨 Capitals Matter!</h4>
                            <p style={{ margin: 0 }}>
                                <code>"Hello"</code> and <code>"hello"</code> are <strong>NOT</strong> the same in Python!
                            </p>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Uppercase letters come before lowercase (A-Z before a-z)
                            </p>
                        </div>

                        {/* Examples */}
                        <div className={styles.codeSection}>
                            <h3>📝 Examples</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Check if words match</span>{'\n'}
                                    password = <span className={styles.string}>"secret123"</span>{'\n'}
                                    guess = <span className={styles.string}>"secret123"</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(password == guess){'\n\n'}
                                    <span className={styles.comment}># Check alphabetical order</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"apple"</span> {'<'} <span className={styles.string}>"banana"</span>){'\n'}
                                    <span className={styles.keyword}>print</span>(<span className={styles.string}>"zebra"</span> {'>'} <span className={styles.string}>"ant"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>True{'\n'}True{'\n'}True</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3>🎮 Your Turn - Compare Some Words!</h3>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={'print("hello" == "hello")\nprint("Cat" == "cat")'} spellCheck={false} style={{ minHeight: '100px' }} />
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
                                    Check if two words are the same (==)
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[1] ? styles.done : ''}`}>{challengesDone[1] && <Check size={14} />}</div>
                                    Check if two words are different (!=)
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${challengesDone[2] ? styles.done : ''}`}>{challengesDone[2] && <Check size={14} />}</div>
                                    Compare alphabetical order ({"<"} or {">"})
                                </li>
                            </ul>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Real World Uses:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Check if a password is correct</li>
                                    <li>Sort names alphabetically</li>
                                    <li>Find matching usernames</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level1/lesson10" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</motion.div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>
                        <p className={styles.quizQuestion}>
                            What does <code>print("Hello" == "hello")</code> show?
                        </p>
                        <div className={styles.quizOptions}>
                            {['True', 'False', 'Error'].map((option, idx) => (
                                <button key={idx} onClick={() => !quizChecked && setQuizAnswer(idx)} className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 1 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 1 ? styles.wrong : ''}`} disabled={quizChecked}>{option}</button>
                            ))}
                        </div>
                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 1 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite! 🤔</h4>
                                <p>Capital letters matter! "H" and "h" are different, so "Hello" != "hello"</p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
