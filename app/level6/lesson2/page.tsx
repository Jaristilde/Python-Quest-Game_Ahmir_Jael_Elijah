'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Calculator, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL6_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL6_LESSONS[1]; // Lesson 2
const LESSON_ID = 77;

export default function Lesson2() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('import math\n\n# Try these math functions!\nprint(math.sqrt(25))\nprint(math.ceil(3.2))\nprint(math.floor(3.9))\n');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
    const [quizChecked, setQuizChecked] = useState<boolean[]>([false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [hasUsedSqrt, setHasUsedSqrt] = useState(false);
    const [hasUsedCeilOrFloor, setHasUsedCeilOrFloor] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let hasMath = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') continue;

                // Import statement
                if (trimmed.match(/^import\s+math$/)) {
                    hasMath = true;
                    continue;
                }

                if (!hasMath && trimmed.includes('math.')) {
                    outputLines.push("Error: You need to 'import math' first!");
                    break;
                }

                // math.pi
                const piMatch = trimmed.match(/^print\s*\(\s*math\.pi\s*\)$/);
                if (piMatch && hasMath) {
                    outputLines.push('3.141592653589793');
                    continue;
                }

                // math.sqrt()
                const sqrtMatch = trimmed.match(/^print\s*\(\s*math\.sqrt\s*\(\s*([\d.]+)\s*\)\s*\)$/);
                if (sqrtMatch && hasMath) {
                    const num = parseFloat(sqrtMatch[1]);
                    outputLines.push(String(Math.sqrt(num)));
                    setHasUsedSqrt(true);
                    continue;
                }

                // math.ceil()
                const ceilMatch = trimmed.match(/^print\s*\(\s*math\.ceil\s*\(\s*([\d.]+)\s*\)\s*\)$/);
                if (ceilMatch && hasMath) {
                    const num = parseFloat(ceilMatch[1]);
                    outputLines.push(String(Math.ceil(num)));
                    setHasUsedCeilOrFloor(true);
                    continue;
                }

                // math.floor()
                const floorMatch = trimmed.match(/^print\s*\(\s*math\.floor\s*\(\s*([\d.]+)\s*\)\s*\)$/);
                if (floorMatch && hasMath) {
                    const num = parseFloat(floorMatch[1]);
                    outputLines.push(String(Math.floor(num)));
                    setHasUsedCeilOrFloor(true);
                    continue;
                }

                // math.pow()
                const powMatch = trimmed.match(/^print\s*\(\s*math\.pow\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*\)$/);
                if (powMatch && hasMath) {
                    const base = parseFloat(powMatch[1]);
                    const exp = parseFloat(powMatch[2]);
                    outputLines.push(String(Math.pow(base, exp)));
                    continue;
                }

                // math.abs()
                const absMatch = trimmed.match(/^print\s*\(\s*math\.fabs\s*\(\s*(-?[\d.]+)\s*\)\s*\)$/);
                if (absMatch && hasMath) {
                    const num = parseFloat(absMatch[1]);
                    outputLines.push(String(Math.abs(num)));
                    continue;
                }

                // Regular print
                const printMatch = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printMatch) {
                    outputLines.push(printMatch[1]);
                    continue;
                }

                // Print number
                const printNumMatch = trimmed.match(/^print\s*\(\s*([\d.]+)\s*\)$/);
                if (printNumMatch) {
                    outputLines.push(printNumMatch[1]);
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

        // Correct answers: Q1 = 2 (5.0), Q2 = 1 (ceil)
        const correctAnswers = [2, 1];

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
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: '3rem' }}>🔢</motion.div>
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
                    Math Wizard! {LESSON.emoji}
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={styles.successMessage}>
                    {LESSON.successMessage}
                </motion.p>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className={styles.successXp}>
                    <Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Link href="/level6/lesson3" className={`${styles.navBtn} ${styles.primary}`} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
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
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 9</span>
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
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))' }}>
                                {LESSON.emoji}
                            </motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1 style={{ color: '#3b82f6' }}>{LESSON.title}</h1>
                                <p>Learn: <code style={{ color: '#8b5cf6' }}>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story Introduction */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderColor: '#3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Calculator size={28} style={{ color: '#3b82f6' }} />
                                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3b82f6' }}>Time for MATH MAGIC!</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '3rem', marginRight: '1rem' }}>🔢</motion.div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.25rem' }}>The math module is like a super calculator!</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Square roots, pi, rounding - it does it all!</p>
                                </div>
                            </div>

                            <p>
                                The <code style={{ color: '#8b5cf6' }}>math</code> module gives you superpowers for calculations!
                                You can find square roots, use pi for circles, and round numbers up or down!
                            </p>
                        </motion.div>

                        {/* Math Functions */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#8b5cf6' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                                <Lightbulb size={20} style={{ color: '#8b5cf6' }} /> Cool Math Functions
                            </h3>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ color: '#3b82f6', fontWeight: 700 }}>math.sqrt(25)</code>
                                        <span style={{ color: '#50fa7b' }}>= 5.0</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Square root - what times itself = 25?</p>
                                </div>

                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ color: '#8b5cf6', fontWeight: 700 }}>math.pi</code>
                                        <span style={{ color: '#50fa7b' }}>= 3.14159...</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Pi - the famous circle number!</p>
                                </div>

                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ color: '#3b82f6', fontWeight: 700 }}>math.ceil(3.2)</code>
                                        <span style={{ color: '#50fa7b' }}>= 4</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Ceiling - rounds UP to next whole number</p>
                                </div>

                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ color: '#8b5cf6', fontWeight: 700 }}>math.floor(3.9)</code>
                                        <span style={{ color: '#50fa7b' }}>= 3</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Floor - rounds DOWN to whole number</p>
                                </div>
                            </div>
                        </div>

                        {/* Memory Trick */}
                        <div className={styles.explainBox} style={{ background: 'var(--bg-secondary)', borderColor: '#3b82f6' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Memory Tricks!</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>天</span>
                                    <span><strong>CEIL</strong>ing - Look UP at the ceiling! Numbers go UP!</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>地</span>
                                    <span><strong>FLOOR</strong> - Look DOWN at the floor! Numbers go DOWN!</span>
                                </div>
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Example: Math Magic in Action</h3>
                            <div className={styles.codeBlock} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span style={{ color: '#ff79c6' }}>import</span> math{'\n\n'}
                                    <span className={styles.comment}># Square root of 100</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(math.sqrt(100))  <span className={styles.comment}># 10.0</span>{'\n\n'}
                                    <span className={styles.comment}># Pi for circle calculations</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(math.pi)  <span className={styles.comment}># 3.14159...</span>{'\n\n'}
                                    <span className={styles.comment}># Round up and down</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(math.ceil(7.1))   <span className={styles.comment}># 8 (up!)</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(math.floor(7.9))  <span className={styles.comment}># 7 (down!)</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>10.0{'\n'}3.141592653589793{'\n'}8{'\n'}7</div>
                            </div>
                        </div>

                        {/* Try It */}
                        <div className={styles.codeSection}>
                            <h3 style={{ color: '#8b5cf6' }}>Your Turn - Do Some Math Magic!</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                Try sqrt, ceil, and floor with different numbers!
                            </p>
                            <div className={styles.editor} style={{ borderColor: '#3b82f6' }}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ minHeight: '180px' }} />
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
                            <h3 style={{ color: '#3b82f6' }}>Try These Challenges:</h3>
                            <ul className={styles.challengeList}>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedSqrt ? styles.done : ''}`}>
                                        {hasUsedSqrt && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: '#8b5cf6' }}>math.sqrt()</code> to find a square root
                                </li>
                                <li>
                                    <div className={`${styles.challengeCheck} ${hasUsedCeilOrFloor ? styles.done : ''}`}>
                                        {hasUsedCeilOrFloor && <Check size={14} />}
                                    </div>
                                    Use <code style={{ color: '#8b5cf6' }}>math.ceil()</code> or <code style={{ color: '#8b5cf6' }}>math.floor()</code>
                                </li>
                            </ul>
                        </div>

                        {/* Tip */}
                        <div className={styles.tipBox} style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }}>
                            <Lightbulb size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#8b5cf6' }}>Fun Facts:</p>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                                    <li><code>math.sqrt()</code> = square root (opposite of squaring)</li>
                                    <li><code>math.pi</code> = 3.14159... (goes on forever!)</li>
                                    <li><code>math.ceil()</code> = always rounds UP</li>
                                    <li><code>math.floor()</code> = always rounds DOWN</li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className={styles.navBar}>
                            <Link href="/level6/lesson1" className={`${styles.navBtn} ${styles.secondary}`}>
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
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔢</motion.div>
                        <h2 className={styles.quizTitle} style={{ color: '#3b82f6' }}>Brain Check! (Question {currentQuiz + 1}/2)</h2>

                        {currentQuiz === 0 ? (
                            <>
                                <p className={styles.quizQuestion}>What does <code>math.sqrt(25)</code> return?</p>
                                <div className={styles.quizOptions}>
                                    {['25', '625', '5.0'].map((option, idx) => (
                                        <button key={idx} onClick={() => { if (!quizChecked[0]) { const newAnswers = [...quizAnswers]; newAnswers[0] = idx; setQuizAnswers(newAnswers); } }}
                                            className={`${styles.quizOption} ${quizAnswers[0] === idx ? styles.selected : ''} ${quizChecked[0] && idx === 2 ? styles.correct : ''} ${quizChecked[0] && quizAnswers[0] === idx && idx !== 2 ? styles.wrong : ''}`}
                                            disabled={quizChecked[0]}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>Which function rounds UP to the next whole number?</p>
                                <div className={styles.quizOptions}>
                                    {['math.floor()', 'math.ceil()', 'math.sqrt()'].map((option, idx) => (
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
                        ) : quizAnswers[currentQuiz] !== (currentQuiz === 0 ? 2 : 1) ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>{currentQuiz === 0 ? 'sqrt(25) = 5.0 because 5 x 5 = 25!' : 'ceil() rounds UP like looking at the ceiling! floor() rounds DOWN!'}</p>
                                <button className={styles.quizBtn} onClick={retryQuiz} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Try Again</button>
                            </motion.div>
                        ) : currentQuiz === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${styles.quizFeedback} ${styles.success}`}>
                                <h4>Correct!</h4>
                                <p>5 x 5 = 25, so sqrt(25) = 5.0! Moving to the next question...</p>
                            </motion.div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
