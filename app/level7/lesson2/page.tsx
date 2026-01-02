'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[1]; // Lesson 2
const LESSON_ID = 86;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Changing Text Case!
message = "Hello World"

# Transform to different cases
print(message.upper())    # ALL CAPS
print(message.lower())    # all lowercase
print(message.title())    # Title Case

# Try with your name!
name = "john doe"
print(name.title())
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedUpper, setHasUsedUpper] = useState(false);
    const [hasUsedLower, setHasUsedLower] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, string> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Variable assignment
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (assignMatch) {
                    variables[assignMatch[1]] = assignMatch[2];
                    continue;
                }

                // Print with .upper()
                const upperMatch = trimmed.match(/^print\s*\(\s*(\w+)\.upper\(\)\s*\)$/);
                if (upperMatch) {
                    const varName = upperMatch[1];
                    if (variables[varName]) {
                        outputLines.push(variables[varName].toUpperCase());
                        setHasUsedUpper(true);
                    }
                    continue;
                }

                // Print with .lower()
                const lowerMatch = trimmed.match(/^print\s*\(\s*(\w+)\.lower\(\)\s*\)$/);
                if (lowerMatch) {
                    const varName = lowerMatch[1];
                    if (variables[varName]) {
                        outputLines.push(variables[varName].toLowerCase());
                        setHasUsedLower(true);
                    }
                    continue;
                }

                // Print with .title()
                const titleMatch = trimmed.match(/^print\s*\(\s*(\w+)\.title\(\)\s*\)$/);
                if (titleMatch) {
                    const varName = titleMatch[1];
                    if (variables[varName]) {
                        outputLines.push(variables[varName].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '));
                    }
                    continue;
                }

                // Print with .capitalize()
                const capMatch = trimmed.match(/^print\s*\(\s*(\w+)\.capitalize\(\)\s*\)$/);
                if (capMatch) {
                    const varName = capMatch[1];
                    if (variables[varName]) {
                        const str = variables[varName];
                        outputLines.push(str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
                    }
                    continue;
                }

                // Simple print variable
                const printVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVarMatch && variables[printVarMatch[1]]) {
                    outputLines.push(variables[printVarMatch[1]]);
                    continue;
                }

                // Simple print string
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                }
            }

            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Run your code to see output!');
        } catch {
            setOutput('Error! Check your code syntax.');
        }
    };

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        const correctAnswers = [0, 2]; // Q1: HELLO, Q2: .title()

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
        return (
            <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔠</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#a855f7' }}>
                    Case Master! 🔠
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level7/lesson3" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #a855f7' }}>
                <Link href="/level7" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 12</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#a855f7' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#ec4899' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>🔠</span>
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#a855f7' }}>Transform Your Text!</span>
                            </div>

                            <p>
                                Python has <strong style={{ color: '#ec4899' }}>magic methods</strong> that transform text case instantly!
                                Want to <strong style={{ color: '#a855f7' }}>SHOUT</strong> or <em style={{ color: '#ec4899' }}>whisper</em>? Easy!
                            </p>
                        </motion.div>

                        {/* Case Methods */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
                                <Lightbulb size={20} style={{ color: '#ec4899' }} /> Case Changing Methods
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>.upper()</code>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        "hello"<span style={{ color: '#a855f7' }}>.upper()</span> → <span style={{ color: '#50fa7b' }}>"HELLO"</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>.lower()</code>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        "HELLO"<span style={{ color: '#ec4899' }}>.lower()</span> → <span style={{ color: '#50fa7b' }}>"hello"</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>.title()</code>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        "hello world"<span style={{ color: '#a855f7' }}>.title()</span> → <span style={{ color: '#50fa7b' }}>"Hello World"</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>.capitalize()</code>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        "hello world"<span style={{ color: '#ec4899' }}>.capitalize()</span> → <span style={{ color: '#50fa7b' }}>"Hello world"</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Your Turn - Change Some Cases!</h3>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '220px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                <Play size={18} /> Run Code
                            </button>

                            {output && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.outputBox}>
                                    <div className={styles.outputLabel}>Output:</div>
                                    <div className={styles.outputText}>{output}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Challenges */}
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#a855f7' }}>
                            <h3 style={{ color: '#a855f7' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedUpper ? styles.done : ''}`} style={hasUsedUpper ? { background: '#a855f7', borderColor: '#a855f7' } : {}}>
                                        {hasUsedUpper && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: '#ec4899' }}>.upper()</code> to SHOUT text
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedLower ? styles.done : ''}`} style={hasUsedLower ? { background: '#a855f7', borderColor: '#a855f7' } : {}}>
                                        {hasUsedLower && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: '#ec4899' }}>.lower()</code> to whisper text
                                </li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level7/lesson1" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔠</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What does "hello".upper() return?</p>
                                <div className={styles.quizOptions}>
                                    {['"HELLO"', '"Hello"', '"hello"'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const newAnswers = [...quizAnswers]; newAnswers[0] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 0 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>Which method makes "hello world" into "Hello World"?</p>
                                <div className={styles.quizOptions}>
                                    {['.upper()', '.capitalize()', '.title()'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 2) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? '.upper() makes ALL letters uppercase!' : '.title() capitalizes the first letter of EACH word!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>.upper() makes everything UPPERCASE! Moving on...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
