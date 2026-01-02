'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Scissors, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[0]; // Lesson 1
const LESSON_ID = 85; // Level 7 lessons start at 85

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# String Slicing - Word Surgery!
word = "PYTHON"

# Get specific characters
print(word[0])    # First letter
print(word[2])    # Third letter

# Slice a portion
print(word[0:3])  # First 3 letters
print(word[3:6])  # Last 3 letters
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasSlicedString, setHasSlicedString] = useState(false);
    const [hasUsedRange, setHasUsedRange] = useState(false);

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

                // Print with single index: print(word[0])
                const singleIndexMatch = trimmed.match(/^print\s*\(\s*(\w+)\[(\d+)\]\s*\)$/);
                if (singleIndexMatch) {
                    const varName = singleIndexMatch[1];
                    const index = parseInt(singleIndexMatch[2]);
                    if (variables[varName] && index < variables[varName].length) {
                        outputLines.push(variables[varName][index]);
                        setHasSlicedString(true);
                    }
                    continue;
                }

                // Print with slice: print(word[0:3])
                const sliceMatch = trimmed.match(/^print\s*\(\s*(\w+)\[(\d*):(\d*)\]\s*\)$/);
                if (sliceMatch) {
                    const varName = sliceMatch[1];
                    const start = sliceMatch[2] ? parseInt(sliceMatch[2]) : 0;
                    const end = sliceMatch[3] ? parseInt(sliceMatch[3]) : variables[varName]?.length;
                    if (variables[varName]) {
                        outputLines.push(variables[varName].slice(start, end));
                        setHasUsedRange(true);
                    }
                    continue;
                }

                // Print with negative index
                const negIndexMatch = trimmed.match(/^print\s*\(\s*(\w+)\[(-\d+)\]\s*\)$/);
                if (negIndexMatch) {
                    const varName = negIndexMatch[1];
                    const index = parseInt(negIndexMatch[2]);
                    if (variables[varName]) {
                        const str = variables[varName];
                        outputLines.push(str[str.length + index]);
                        setHasSlicedString(true);
                    }
                    continue;
                }

                // Simple print
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

        const correctAnswers = [1, 0]; // Q1: [0:3], Q2: H

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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>✂️</motion.div>
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
                    String Surgeon! ✂️
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level7/lesson2" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
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
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#a855f7' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#ec4899' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Scissors size={28} style={{ color: '#a855f7' }} />
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#a855f7' }}>Time for Word Surgery!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginRight: '1rem' }}>✂️</motion.div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 700, color: '#a855f7', marginBottom: '0.25rem' }}>Slice strings like a surgeon!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cut out exactly the pieces you need.</p>
                                </div>
                            </div>

                            <p>
                                Every letter in a string has a <strong style={{ color: '#ec4899' }}>position number</strong> starting from <strong style={{ color: '#a855f7' }}>0</strong>.
                                You can cut out any piece using <code style={{ color: '#ec4899' }}>text[start:end]</code>!
                            </p>
                        </motion.div>

                        {/* Index Visualization */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
                                <Lightbulb size={20} style={{ color: '#ec4899' }} /> String Index Positions
                            </h3>

                            <div style={{ fontFamily: 'Fira Code, monospace', textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                    {['P', 'Y', 'T', 'H', 'O', 'N'].map((letter, idx) => (
                                        <div key={idx} style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                                    {[0, 1, 2, 3, 4, 5].map((num) => (
                                        <div key={num} style={{ width: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#a855f7' }}>word[0]</code> = "P" <span style={{ color: 'var(--text-muted)' }}>(first letter)</span>
                                </div>
                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ec4899' }}>word[0:3]</code> = "PYT" <span style={{ color: 'var(--text-muted)' }}>(positions 0, 1, 2)</span>
                                </div>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#a855f7' }}>word[3:6]</code> = "HON" <span style={{ color: 'var(--text-muted)' }}>(positions 3, 4, 5)</span>
                                </div>
                            </div>
                        </div>

                        {/* Slicing Rules */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#a855f7' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#a855f7' }}>Slicing Rules</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 700 }}>text[start:end]</code>
                                    <span>Gets characters from start up to (but not including) end</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ec4899', fontSize: '1rem', fontWeight: 700 }}>text[:3]</code>
                                    <span>From beginning to position 3</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 700 }}>text[3:]</code>
                                    <span>From position 3 to the end</span>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Your Turn - Slice Some Strings!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try slicing the word "PYTHON" in different ways!
                            </p>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '200px' }} />
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
                                    <div className={`${styles.challengeCheck} ${hasSlicedString ? styles.done : ''}`} style={hasSlicedString ? { background: '#a855f7', borderColor: '#a855f7' } : {}}>
                                        {hasSlicedString && <Check size={14} />}
                                    </div>
                                    Get a single character with <code style={{ color: '#ec4899' }}>word[index]</code>
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedRange ? styles.done : ''}`} style={hasUsedRange ? { background: '#a855f7', borderColor: '#a855f7' } : {}}>
                                        {hasUsedRange && <Check size={14} />}
                                    </div>
                                    Slice a range with <code style={{ color: '#ec4899' }}>word[start:end]</code>
                                </li>
                            </ul>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level7" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Level Hub
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>If word = "HELLO", what does word[0:3] return?</p>
                                <div className={styles.quizOptions}>
                                    {['"HEL"', '"HELL"', '"ELL"'].map((option, idx) => (
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
                                <p className={styles.quizQuestion}>If word = "HELLO", what does word[0] return?</p>
                                <div className={styles.quizOptions}>
                                    {['"H"', '"E"', '"HELLO"'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 0 : 0) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Remember: [0:3] gets positions 0, 1, 2 - which is "HEL"!' : 'word[0] gets the first character at position 0!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>[0:3] gets the first 3 characters! Moving on...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
