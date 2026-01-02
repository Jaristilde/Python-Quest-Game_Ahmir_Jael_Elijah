'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL5_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL5_LESSONS[0]; // Lesson 1
const LESSON_ID = 63; // Level 5 lessons start at 63 for tracking

export default function Lesson1() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('# Create your first tuple!\nbirthday = ("March", 15, 2015)\nprint(birthday)\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasCreatedTuple, setHasCreatedTuple] = useState(false);
    const [hasAccessedItem, setHasAccessedItem] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: Record<string, { type: string; value: unknown }> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Tuple assignment: variable = (item1, item2, ...)
                const tupleMatch = trimmed.match(/^(\w+)\s*=\s*\((.+)\)$/);
                if (tupleMatch) {
                    const varName = tupleMatch[1];
                    const items = tupleMatch[2].split(',').map(item => {
                        const t = item.trim();
                        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                            return t.slice(1, -1);
                        }
                        return isNaN(Number(t)) ? t : Number(t);
                    });
                    variables[varName] = { type: 'tuple', value: items };
                    setHasCreatedTuple(true);
                    continue;
                }

                // Tuple indexing: tuple_name[index]
                const indexMatch = trimmed.match(/^print\s*\(\s*(\w+)\[(\d+)\]\s*\)$/);
                if (indexMatch) {
                    const varName = indexMatch[1];
                    const index = parseInt(indexMatch[2]);
                    if (variables[varName] && variables[varName].type === 'tuple') {
                        const tupleVal = variables[varName].value as unknown[];
                        if (index < tupleVal.length) {
                            outputLines.push(String(tupleVal[index]));
                            setHasAccessedItem(true);
                        }
                    }
                    continue;
                }

                // Print tuple: print(tuple_name)
                const printTupleMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printTupleMatch) {
                    const varName = printTupleMatch[1];
                    if (variables[varName] && variables[varName].type === 'tuple') {
                        const tupleVal = variables[varName].value as unknown[];
                        const formatted = tupleVal.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
                        outputLines.push(`(${formatted})`);
                    }
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
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

        // Correct answers: Q1 = 1 (parentheses), Q2 = 2 (immutable)
        const correctAnswers = [1, 2];

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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔒</motion.div>
                </div>
            </div>
        );
    }

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={styles.successTitle} style={{ color: 'var(--accent-primary)' }}>
                    Tuple Master! 🔒
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level5/lesson2" className={`${styles.navBtn} ${styles.primary}`}>
                        Next Lesson <ChevronRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
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
                        {/* Lesson Title */}
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: 'var(--accent-primary)' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: 'var(--accent-secondary)' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                                <Sparkles size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Time to learn about TUPLES!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginRight: '1rem' }}>🔒</motion.div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>A TUPLE is like a locked list!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Once you make it, you can't change it.</p>
                                </div>
                            </div>

                            <p>
                                🎂 Think about your <strong style={{ color: 'var(--accent-secondary)' }}>birthday</strong>. If you were born on March 15, 2015, that will
                                <strong style={{ color: 'var(--accent-primary)' }}> NEVER change</strong>. That's what a tuple is for - data that should stay locked forever!
                            </p>
                        </motion.div>

                        {/* Lists vs Tuples Comparison */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-secondary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                                <Lightbulb size={20} style={{ color: 'var(--accent-secondary)' }} /> Lists vs Tuples
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(80, 250, 123, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(80, 250, 123, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#50fa7b', marginBottom: '0.5rem' }}>LIST = [ ] Square Brackets</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem' }}>
                                        cart = <span style={{ color: '#50fa7b' }}>["apple", "bread"]</span>{'\n'}
                                        cart.append("milk")  <span style={{ color: '#6272a4' }}># ✅ OK!</span>
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lists can change - like a shopping cart</p>
                                </div>

                                <div style={{ background: 'rgba(255, 121, 198, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 121, 198, 0.3)' }}>
                                    <p style={{ fontWeight: 700, color: '#ff79c6', marginBottom: '0.5rem' }}>TUPLE = ( ) Parentheses</p>
                                    <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem' }}>
                                        birthday = <span style={{ color: '#ff79c6' }}>("March", 15, 2015)</span>{'\n'}
                                        <span style={{ color: '#ff5555' }}># birthday[0] = "April" ❌ ERROR!</span>
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tuples are LOCKED - like your birthday</p>
                                </div>
                            </div>
                        </div>

                        {/* Vocabulary */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🔤 New Vocabulary</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 121, 198, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#ff79c6', fontSize: '1.1rem', fontWeight: 700 }}>TUPLE</code>
                                    <span>A locked list that can't be changed after you create it</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139, 233, 253, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#8be9fd', fontSize: '1.1rem', fontWeight: 700 }}>IMMUTABLE</code>
                                    <span>Means "can't be changed" - tuples are immutable!</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(189, 147, 249, 0.1)', borderRadius: '0.5rem' }}>
                                    <code style={{ color: '#bd93f9', fontSize: '1.1rem', fontWeight: 700 }}>( )</code>
                                    <span>Parentheses - use these to make a tuple</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Example: Birthday Tuple</h3>
                            <div className={styles.codeBlock} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Create a TUPLE with parentheses ()</span>{'\n'}
                                    birthday = <span style={{ color: '#ff79c6' }}>("March", 15, 2015)</span>{'\n\n'}
                                    <span className={styles.comment}># Access items same as lists - with [index]</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(birthday[0])  <span className={styles.comment}># First item</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(birthday[1])  <span className={styles.comment}># Second item</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(birthday[2])  <span className={styles.comment}># Third item</span>{'\n\n'}
                                    <span className={styles.comment}># Print the whole tuple</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(birthday)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>March{'\n'}15{'\n'}2015{'\n'}('March', 15, 2015)</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: 'var(--accent-secondary)' }}>Your Turn - Create a Tuple!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Create a tuple with your favorite things, then print individual items!
                            </p>
                            <div className={styles.editor} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '150px' }} />
                            </div>
                            <button className={styles.runBtn} onClick={runCode} style={{ background: 'var(--accent-primary)' }}>
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
                        <div className={styles.challenges} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasCreatedTuple ? styles.done : ''}`}>
                                        {hasCreatedTuple && <Check size={14} />}
                                    </div>
                                    Create a tuple using <code style={{ color: 'var(--accent-secondary)' }}>( )</code> parentheses
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasAccessedItem ? styles.done : ''}`}>
                                        {hasAccessedItem && <Check size={14} />}
                                    </div>
                                    Access an item with <code style={{ color: 'var(--accent-secondary)' }}>tuple_name[0]</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip */}
                        <div className={styles.tipBox} style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'var(--accent-secondary)' }}>
                            <Lightbulb size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Remember:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li>Use <code>( )</code> parentheses for tuples</li>
                                    <li>Use <code>[ ]</code> square brackets for lists</li>
                                    <li>Tuples are IMMUTABLE (can't change!)</li>
                                    <li>Access items the same way: <code>[0]</code>, <code>[1]</code>, etc.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level5" className={`${styles.navBtn} ${styles.secondary}`}>
                                <ChevronLeft size={18} /> Level Hub
                            </Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)} style={{ background: 'var(--accent-primary)' }}>
                                Quiz Time! <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Quiz Section */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection} style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', borderColor: 'var(--accent-primary)' }}>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: 'var(--accent-primary)' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>Which brackets create a TUPLE?</p>
                                <div className={styles.quizOptions}>
                                    {['[ ] Square brackets', '( ) Parentheses', '{ } Curly braces'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const newAnswers = [...quizAnswers]; newAnswers[0] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 1 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 1 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>What does IMMUTABLE mean?</p>
                                <div className={styles.quizOptions}>
                                    {['Very mutable', 'Easy to change', "Can't be changed"].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[1]) { const newAnswers = [...quizAnswers]; newAnswers[1] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[1] === idx ? styles.selected : ''} ${quizChecked[1] && idx === 2 ? styles.correct : ''} ${quizChecked[1] && quizAnswers[1] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[1]}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null} style={{ background: 'var(--accent-primary)' }}>
                                Check Answer
                            </button>
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 1 : 2) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'Tuples use parentheses ( ) while lists use square brackets [ ]!' : 'IMMUTABLE means it cannot be changed - like your birthday!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'var(--accent-primary)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>Tuples use parentheses ( )! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
