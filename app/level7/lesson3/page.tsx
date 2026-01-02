'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL7_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL7_LESSONS[2]; // Lesson 3
const LESSON_ID = 87;

export default function Lesson3() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState(`# Find and Replace - String Detective!
message = "I love cats! Cats are great!"

# Find where a word starts
position = message.find("cats")
print("Found 'cats' at position:", position)

# Replace text
new_message = message.replace("cats", "dogs")
print(new_message)

# Replace ALL occurrences (case sensitive!)
fixed = message.replace("Cats", "Dogs")
print(fixed)
`);
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedFind, setHasUsedFind] = useState(false);
    const [hasUsedReplace, setHasUsedReplace] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, string | number> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // String variable assignment
                const strAssignMatch = trimmed.match(/^(\w+)\s*=\s*["'](.*)["']$/);
                if (strAssignMatch) {
                    variables[strAssignMatch[1]] = strAssignMatch[2];
                    continue;
                }

                // Find assignment: position = message.find("text")
                const findAssignMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\.find\(["'](.*)["']\)$/);
                if (findAssignMatch) {
                    const resultVar = findAssignMatch[1];
                    const sourceVar = findAssignMatch[2];
                    const searchText = findAssignMatch[3];
                    if (typeof variables[sourceVar] === 'string') {
                        variables[resultVar] = (variables[sourceVar] as string).indexOf(searchText);
                        setHasUsedFind(true);
                    }
                    continue;
                }

                // Replace assignment: new = old.replace("a", "b")
                const replaceAssignMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\.replace\(["'](.*)["'],\s*["'](.*)["']\)$/);
                if (replaceAssignMatch) {
                    const resultVar = replaceAssignMatch[1];
                    const sourceVar = replaceAssignMatch[2];
                    const oldText = replaceAssignMatch[3];
                    const newText = replaceAssignMatch[4];
                    if (typeof variables[sourceVar] === 'string') {
                        variables[resultVar] = (variables[sourceVar] as string).split(oldText).join(newText);
                        setHasUsedReplace(true);
                    }
                    continue;
                }

                // Print with label and variable
                const printLabelVarMatch = trimmed.match(/^print\s*\(["'](.*)["'],\s*(\w+)\)$/);
                if (printLabelVarMatch) {
                    const label = printLabelVarMatch[1];
                    const varName = printLabelVarMatch[2];
                    if (variables[varName] !== undefined) {
                        outputLines.push(`${label} ${variables[varName]}`);
                    }
                    continue;
                }

                // Print variable
                const printVarMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVarMatch && variables[printVarMatch[1]] !== undefined) {
                    outputLines.push(String(variables[printVarMatch[1]]));
                    continue;
                }

                // Print string
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

        const correctAnswers = [1, 0]; // Q1: position number, Q2: "I love dogs"

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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔍</motion.div>
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
                    String Detective! 🔍
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level7/lesson4" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
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
                                <Search size={28} style={{ color: '#a855f7' }} />
                                <Sparkles size={24} style={{ color: '#ec4899' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#a855f7' }}>Become a String Detective!</span>
                            </div>

                            <p>
                                Need to <strong style={{ color: '#ec4899' }}>find</strong> something in text? Want to <strong style={{ color: '#a855f7' }}>replace</strong> words?
                                Python has detective tools for that!
                            </p>
                        </motion.div>

                        {/* Find and Replace Methods */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#ec4899' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
                                <Lightbulb size={20} style={{ color: '#ec4899' }} /> Detective Methods
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#a855f7', fontWeight: 700 }}>.find("text")</code>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Returns the position where "text" starts, or -1 if not found</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        "Hello World".find("World") → <span style={{ color: '#50fa7b' }}>6</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#ec4899', fontWeight: 700 }}>.replace("old", "new")</code>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Replaces ALL occurrences of "old" with "new"</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        "I love cats".replace("cats", "dogs") → <span style={{ color: '#50fa7b' }}>"I love dogs"</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(139, 233, 253, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <code style={{ color: '#8be9fd', fontWeight: 700 }}>"text" in string</code>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Returns True/False if text exists in string</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        "cat" in "I love cats" → <span style={{ color: '#50fa7b' }}>True</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#ec4899' }}>Your Turn - Find and Replace!</h3>
                            <div className={styles.editor} style={{ borderColor: '#a855f7' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '260px' }} />
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
                                    <div className={`${styles.challengeCheck} ${hasUsedFind ? styles.done : ''}`} style={hasUsedFind ? { background: '#a855f7', borderColor: '#a855f7' } : {}}>
                                        {hasUsedFind && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: '#ec4899' }}>.find()</code> to locate text
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedReplace ? styles.done : ''}`} style={hasUsedReplace ? { background: '#a855f7', borderColor: '#a855f7' } : {}}>
                                        {hasUsedReplace && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: '#ec4899' }}>.replace()</code> to swap text
                                </li>
                            </ul>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level7/lesson2" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Previous
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderColor: '#a855f7' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#a855f7' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What does .find() return?</p>
                                <div className={styles.quizOptions}>
                                    {['The found text', 'The position number', 'True or False'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const newAnswers = [...quizAnswers]; newAnswers[0] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What does "I love cats".replace("cats", "dogs") return?</p>
                                <div className={styles.quizOptions}>
                                    {['"I love dogs"', '"I love cats"', '"dogs"'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 0 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 0 ? styles.wrong : ''}`}
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
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 0) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? '.find() returns the position (index) where the text starts!' : '.replace() swaps the old text with the new text!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>.find() returns the position number! Moving on...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
