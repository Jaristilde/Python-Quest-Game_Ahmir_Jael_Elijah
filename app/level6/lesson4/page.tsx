'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Clock, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[3]; // Lesson 4
const LESSON_ID = 79;

export default function Lesson4() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('import datetime\n\n# Get the current date and time\nnow = datetime.datetime.now()\nprint(now)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedNow, setHasUsedNow] = useState(false);
    const [hasFormattedDate, setHasFormattedDate] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let hasDatetime = false;
            let variables: Record<string, { type: string; value: Date }> = {};
            const now = new Date();

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Import statement
                if (trimmed.match(/^import\s+datetime$/)) {
                    hasDatetime = true;
                    continue;
                }

                if (!hasDatetime && trimmed.includes('datetime.')) {
                    outputLines.push("Error: You need to 'import datetime' first!");
                    break;
                }

                // Variable assignment with datetime.datetime.now()
                const nowAssignMatch = trimmed.match(/^(\w+)\s*=\s*datetime\.datetime\.now\s*\(\s*\)$/);
                if (nowAssignMatch && hasDatetime) {
                    const varName = nowAssignMatch[1];
                    variables[varName] = { type: 'datetime', value: now };
                    setHasUsedNow(true);
                    continue;
                }

                // Print datetime variable directly
                const printVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVarMatch && variables[printVarMatch[1]]) {
                    const dt = variables[printVarMatch[1]].value;
                    const formatted = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}`;
                    outputLines.push(formatted);
                    continue;
                }

                // Print datetime.datetime.now() directly
                const printNowMatch = trimmed.match(/^print\s*\(\s*datetime\.datetime\.now\s*\(\s*\)\s*\)$/);
                if (printNowMatch && hasDatetime) {
                    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                    outputLines.push(formatted);
                    setHasUsedNow(true);
                    continue;
                }

                // Print variable.year, .month, .day, .hour, .minute
                const printAttrMatch = trimmed.match(/^print\s*\(\s*(\w+)\.(year|month|day|hour|minute|second)\s*\)$/);
                if (printAttrMatch && variables[printAttrMatch[1]]) {
                    const dt = variables[printAttrMatch[1]].value;
                    const attr = printAttrMatch[2];
                    let val: number;
                    switch (attr) {
                        case 'year': val = dt.getFullYear(); break;
                        case 'month': val = dt.getMonth() + 1; break;
                        case 'day': val = dt.getDate(); break;
                        case 'hour': val = dt.getHours(); break;
                        case 'minute': val = dt.getMinutes(); break;
                        case 'second': val = dt.getSeconds(); break;
                        default: val = 0;
                    }
                    outputLines.push(String(val));
                    setHasFormattedDate(true);
                    continue;
                }

                // Print formatted date with strftime
                const strftimeMatch = trimmed.match(/^print\s*\(\s*(\w+)\.strftime\s*\(\s*["'](.+)["']\s*\)\s*\)$/);
                if (strftimeMatch && variables[strftimeMatch[1]]) {
                    const dt = variables[strftimeMatch[1]].value;
                    let format = strftimeMatch[2];
                    format = format.replace('%Y', String(dt.getFullYear()));
                    format = format.replace('%m', String(dt.getMonth() + 1).padStart(2, '0'));
                    format = format.replace('%d', String(dt.getDate()).padStart(2, '0'));
                    format = format.replace('%H', String(dt.getHours()).padStart(2, '0'));
                    format = format.replace('%M', String(dt.getMinutes()).padStart(2, '0'));
                    format = format.replace('%S', String(dt.getSeconds()).padStart(2, '0'));
                    format = format.replace('%B', dt.toLocaleString('en-US', { month: 'long' }));
                    format = format.replace('%A', dt.toLocaleString('en-US', { weekday: 'long' }));
                    outputLines.push(format);
                    setHasFormattedDate(true);
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                    continue;
                }

                // Print with f-string like syntax (simplified)
                const fstringMatch = trimmed.match(/^print\s*\(\s*f["'](.+)["']\s*\)$/);
                if (fstringMatch) {
                    let result = fstringMatch[1];
                    // Replace {var.attr} patterns
                    for (const varName of Object.keys(variables)) {
                        const dt = variables[varName].value;
                        result = result.replace(new RegExp(`\\{${varName}\\.year\\}`, 'g'), String(dt.getFullYear()));
                        result = result.replace(new RegExp(`\\{${varName}\\.month\\}`, 'g'), String(dt.getMonth() + 1));
                        result = result.replace(new RegExp(`\\{${varName}\\.day\\}`, 'g'), String(dt.getDate()));
                        result = result.replace(new RegExp(`\\{${varName}\\.hour\\}`, 'g'), String(dt.getHours()));
                        result = result.replace(new RegExp(`\\{${varName}\\.minute\\}`, 'g'), String(dt.getMinutes()));
                    }
                    outputLines.push(result);
                    setHasFormattedDate(true);
                    continue;
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

        // Correct answers: Q1 = 0 (datetime.datetime.now()), Q2 = 1 (.year)
        const correctAnswers = [0, 1];

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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>⏰</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: '#3b82f6' }}>
                    Time Keeper! {LESSON.emoji}
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55, type: 'spring' }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '1rem' }}>
                    <Trophy size={20} /> Practice Lesson Complete!
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson5" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className={styles.header} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid #3b82f6' }}>
                <Link href="/level6" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9 <span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>(Practice +15 XP)</span></span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Practice Badge */}
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                            <Trophy size={20} style={{ color: '#fbbf24' }} />
                            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Practice Lesson - Earn 15 XP!</span>
                        </motion.div>

                        {/* Story Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Clock size={28} style={{ color: '#3b82f6' }} />
                                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3b82f6' }}>Become a TIME TRAVELER!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '3rem', marginRight: '1rem' }}>⏰</motion.div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.25rem' }}>The datetime module tracks time!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current time, dates, and more!</p>
                                </div>
                            </div>

                            <p>
                                The <code style={{ color: '#8b5cf6' }}>datetime</code> module lets your programs know
                                what time it is! Perfect for timestamps, countdowns, and scheduling.
                            </p>
                        </motion.div>

                        {/* Datetime Functions */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#8b5cf6' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                                <Lightbulb size={20} style={{ color: '#8b5cf6' }} /> Key Datetime Features
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>🕐</span>
                                        <code style={{ color: '#3b82f6', fontWeight: 700 }}>datetime.datetime.now()</code>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get the current date and time!</p>
                                </div>

                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>📅</span>
                                        <code style={{ color: '#8b5cf6', fontWeight: 700 }}>.year, .month, .day</code>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get specific parts of the date!</p>
                                </div>

                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>⏱️</span>
                                        <code style={{ color: '#3b82f6', fontWeight: 700 }}>.hour, .minute, .second</code>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get specific parts of the time!</p>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Example: What Time Is It?</h3>
                            <div className={styles.codeBlock} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span style={{ color: '#ff79c6' }}>import</span> datetime{'\n\n'}
                                    <span className={styles.comment}># Get current date and time</span>{'\n'}
                                    now = datetime.datetime.now(){'\n\n'}
                                    <span className={styles.comment}># Print the full date/time</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(now){'\n\n'}
                                    <span className={styles.comment}># Get specific parts</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(now.year)   <span className={styles.comment}># Current year</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(now.month)  <span className={styles.comment}># Current month (1-12)</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(now.day)    <span className={styles.comment}># Current day</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(now.hour)   <span className={styles.comment}># Current hour</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output (example):</div>
                                <div className={styles.outputText}>2024-12-30 14:30:45{'\n'}2024{'\n'}12{'\n'}30{'\n'}14</div>
                            </div>
                        </div>

                        {/* Real World Uses */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Cool Things You Can Build!</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🎂</span>
                                    <span><strong>Birthday countdown:</strong> Days until your birthday!</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                                    <span><strong>Journal app:</strong> Timestamp your entries!</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⏰</span>
                                    <span><strong>Alarm clock:</strong> Check if it's time to wake up!</span>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Your Turn - Explore Time!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try getting the current time and accessing different parts!
                            </p>
                            <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '150px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
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
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ color: '#3b82f6' }}>Practice Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedNow ? styles.done : ''}`}>
                                        {hasUsedNow && <Check size={14} />}
                                    </div>
                                    Get current time with <code style={{ color: '#8b5cf6' }}>datetime.datetime.now()</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasFormattedDate ? styles.done : ''}`}>
                                        {hasFormattedDate && <Check size={14} />}
                                    </div>
                                    Access parts like <code style={{ color: '#8b5cf6' }}>.year</code>, <code style={{ color: '#8b5cf6' }}>.month</code>, or <code style={{ color: '#8b5cf6' }}>.day</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip */}
                        <div className={styles.tipBox} style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }}>
                            <Lightbulb size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#8b5cf6' }}>Combining Modules!</p>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>You can use multiple modules together:</p>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'Fira Code, monospace', fontSize: '0.85rem' }}>
                                    import datetime{'\n'}
                                    import random{'\n'}
                                    import math{'\n\n'}
                                    <span style={{ color: '#6272a4' }}># Use all three in one program!</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level6/lesson3" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#3b82f6' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>How do you get the current date and time?</p>
                                <div className={styles.quizOptions}>
                                    {['datetime.datetime.now()', 'datetime.time()', 'datetime.current()'].map((option, idx) => (
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
                                <p className={styles.quizQuestion}>If <code>now = datetime.datetime.now()</code>, how do you get just the year?</p>
                                <div className={styles.quizOptions}>
                                    {['now.getYear()', 'now.year', 'now[year]'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 1 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 1) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'datetime.datetime.now() gives you the current date AND time!' : 'Use dot notation: now.year gets just the year!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>datetime.datetime.now() gets the current moment! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
