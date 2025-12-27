'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Coins } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[8]; // Lesson 9
const LESSON_ID = 24;

export default function Lesson9() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState(1);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animated counter state
    const [demoValue, setDemoValue] = useState(100);
    const [demoOperation, setDemoOperation] = useState<string | null>(null);
    const [coinAnimation, setCoinAnimation] = useState<number[]>([]);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Demo animation for the operators
    const runDemoAnimation = () => {
        setDemoValue(100);
        setDemoOperation(null);
        setCoinAnimation([]);

        // Step 1: += 50
        setTimeout(() => {
            setDemoOperation('+= 50');
            setCoinAnimation([1, 2, 3, 4, 5]);
            setDemoValue(150);
        }, 1000);

        // Step 2: -= 25
        setTimeout(() => {
            setDemoOperation('-= 25');
            setCoinAnimation([]);
            setDemoValue(125);
        }, 2500);

        // Step 3: *= 2
        setTimeout(() => {
            setDemoOperation('*= 2');
            setCoinAnimation([1, 2, 3, 4, 5, 6, 7, 8]);
            setDemoValue(250);
        }, 4000);

        // Reset
        setTimeout(() => {
            setDemoOperation(null);
            setCoinAnimation([]);
        }, 5500);
    };

    useEffect(() => {
        // Run the demo animation on mount
        runDemoAnimation();
        // Repeat every 7 seconds
        const interval = setInterval(runDemoAnimation, 7000);
        return () => clearInterval(interval);
    }, []);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [name: string]: number } = {};

            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Simple variable assignment: name = number
                const simpleAssign = trimmed.match(/^(\w+)\s*=\s*(\d+(?:\.\d+)?)$/);
                if (simpleAssign) {
                    variables[simpleAssign[1]] = parseFloat(simpleAssign[2]);
                    continue;
                }

                // Self-assigning operators: += -= *= /=
                const selfAssign = trimmed.match(/^(\w+)\s*(\+|-|\*|\/)=\s*(\d+(?:\.\d+)?)$/);
                if (selfAssign && variables.hasOwnProperty(selfAssign[1])) {
                    const varName = selfAssign[1];
                    const operator = selfAssign[2];
                    const value = parseFloat(selfAssign[3]);

                    switch (operator) {
                        case '+':
                            variables[varName] += value;
                            break;
                        case '-':
                            variables[varName] -= value;
                            break;
                        case '*':
                            variables[varName] *= value;
                            break;
                        case '/':
                            if (value !== 0) {
                                variables[varName] /= value;
                            }
                            break;
                    }
                    continue;
                }

                // Variable assignment with expression: name = expression
                const exprAssign = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
                if (exprAssign && !trimmed.startsWith('print')) {
                    try {
                        let expr = exprAssign[2];
                        for (const [varName, value] of Object.entries(variables)) {
                            expr = expr.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(value));
                        }
                        if (/^[\d\s+\-*/().]+$/.test(expr)) {
                            variables[exprAssign[1]] = eval(expr);
                        }
                    } catch { /* ignore */ }
                    continue;
                }

                // print(variable)
                const printVar = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
                if (printVar && variables.hasOwnProperty(printVar[1])) {
                    const val = variables[printVar[1]];
                    outputLines.push(Number.isInteger(val) ? String(val) : val.toFixed(2));
                    continue;
                }

                // print("string")
                const printStr = trimmed.match(/^print\s*\(["'](.*)["']\)$/);
                if (printStr) {
                    outputLines.push(printStr[1]);
                    continue;
                }

                // print(expression)
                const printExpr = trimmed.match(/^print\s*\((.+)\)$/);
                if (printExpr) {
                    let expr = printExpr[1];
                    for (const [varName, value] of Object.entries(variables)) {
                        expr = expr.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(value));
                    }
                    try {
                        if (/^[\d\s+\-*/().]+$/.test(expr)) {
                            const result = eval(expr);
                            outputLines.push(Number.isInteger(result) ? String(result) : result.toFixed(2));
                        } else {
                            outputLines.push(expr);
                        }
                    } catch {
                        outputLines.push(expr);
                    }
                    continue;
                }
            }

            if (outputLines.length > 0) {
                setOutput(outputLines.join('\n'));
            } else {
                setOutput('Try using += -= *= /= and print the result!');
            }
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const checkQuiz = () => {
        setQuizChecked(true);
        const correctAnswer = quizStep === 1 ? 0 : 0; // Both correct answers are index 0

        if (quizAnswer === correctAnswer) {
            if (quizStep === 1) {
                // Move to question 2
                setTimeout(() => {
                    setQuizStep(2);
                    setQuizAnswer(null);
                    setQuizChecked(false);
                }, 1000);
            } else {
                // Complete lesson
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
                    <Check size={50} className="text-white" />
                </motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You mastered the shortcut operators!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson10" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/level2" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
                <span className={styles.lessonInfo}>Lesson {LESSON.id} of 18</span>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.hearts}`}><Heart size={14} fill="currentColor" /> {user.progress.lives}</div>
                    <div className={`${styles.statBadge} ${styles.xp}`}><Zap size={14} fill="currentColor" /> {user.progress.xp}</div>
                </div>
            </header>

            <div className={styles.content}>
                {!showQuiz ? (
                    <>
                        <div className={styles.lessonTitle}>
                            <motion.div className={styles.lessonEmoji} animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Story/Mission */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.explainBox} style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.15))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Coins size={24} className="text-yellow-400" />
                                <span style={{ fontWeight: 700 }}>Robo is counting coins!</span>
                            </div>
                            <p>Instead of writing <code>coins = coins + 1</code> every time, there is a SHORTCUT!</p>
                        </motion.div>

                        {/* Animated Counter Visual */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                border: '2px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                score =
                            </div>
                            <motion.div
                                key={demoValue}
                                initial={{ scale: 1.3, color: '#fbbf24' }}
                                animate={{ scale: 1, color: '#50fa7b' }}
                                style={{
                                    fontSize: '3rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace'
                                }}
                            >
                                {demoValue}
                            </motion.div>

                            <AnimatePresence>
                                {demoOperation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '1.5rem',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(245, 158, 11, 0.2)',
                                            border: '1px solid rgba(245, 158, 11, 0.5)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            fontFamily: 'monospace',
                                            color: '#fbbf24',
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        score {demoOperation}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Floating coins animation */}
                            <AnimatePresence>
                                {coinAnimation.map((coin, idx) => (
                                    <motion.div
                                        key={`coin-${coin}-${idx}`}
                                        initial={{ opacity: 0, y: 50, x: (idx - 4) * 30 }}
                                        animate={{ opacity: 1, y: -30 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '20%',
                                            left: '50%',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        🪙
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Explanation of operators */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>The Shortcut Operators:</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                These are called "augmented assignment operators" but we call them <strong>SHORTCUTS</strong>!
                            </p>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ color: '#50fa7b', fontSize: '1.1rem' }}>+=</code>
                                    <span>"add AND save"</span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.9rem' }}>score += 10 means score = score + 10</span>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ color: '#ff79c6', fontSize: '1.1rem' }}>-=</code>
                                    <span>"subtract AND save"</span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.9rem' }}>lives -= 1 means lives = lives - 1</span>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ color: '#8be9fd', fontSize: '1.1rem' }}>*=</code>
                                    <span>"multiply AND save"</span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.9rem' }}>coins *= 2 means coins = coins * 2</span>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <code style={{ color: '#f1fa8c', fontSize: '1.1rem' }}>/=</code>
                                    <span>"divide AND save"</span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.9rem' }}>health /= 2 means health = health / 2</span>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className={styles.codeSection}>
                            <h3>Example - Updating Score</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>main.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    score = <span className={styles.number}>100</span>{'\n\n'}
                                    score += <span className={styles.number}>50</span>   <span className={styles.comment}># Add 50</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(score)  <span className={styles.comment}># 150</span>{'\n\n'}
                                    score -= <span className={styles.number}>25</span>   <span className={styles.comment}># Subtract 25</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(score)  <span className={styles.comment}># 125</span>{'\n\n'}
                                    score *= <span className={styles.number}>2</span>    <span className={styles.comment}># Double it!</span>{'\n'}
                                    <span className={styles.keyword}>print</span>(score)  <span className={styles.comment}># 250</span>
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>150{'\n'}125{'\n'}250</div>
                            </div>
                        </div>

                        {/* Your Turn */}
                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <div className={styles.challenges} style={{ marginBottom: '1rem', padding: '1rem' }}>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                    <strong>Challenge:</strong> Start with <code>coins = 10</code>, add 5 coins using <code>+=</code>, double them with <code>*=</code>, then print the final amount!
                                </p>
                            </div>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'coins = 10\ncoins += 5\ncoins *= 2\nprint(coins)'}
                                    spellCheck={false}
                                    style={{ minHeight: '140px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <p><strong>Pro Tip:</strong> These shortcuts make your code shorter AND easier to read! <code>x += 1</code> is much cleaner than <code>x = x + 1</code></p>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson8" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Question {quizStep} of 2
                        </div>
                        <h2 className={styles.quizTitle}>Brain Check!</h2>

                        {quizStep === 1 ? (
                            <>
                                <p className={styles.quizQuestion}>
                                    What does <code>x += 5</code> mean?
                                </p>
                                <div className={styles.quizOptions}>
                                    {['x = x + 5', 'x = 5', 'x + 5'].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.quizQuestion}>
                                    What does <code>y *= 2</code> mean?
                                </p>
                                <div className={styles.quizOptions}>
                                    {['y = y * 2', 'y = 2', 'y * 2'].map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !quizChecked && setQuizAnswer(idx)}
                                            className={`${styles.quizOption} ${quizAnswer === idx ? styles.selected : ''} ${quizChecked && idx === 0 ? styles.correct : ''} ${quizChecked && quizAnswer === idx && idx !== 0 ? styles.wrong : ''}`}
                                            disabled={quizChecked}
                                        >
                                            <code>{option}</code>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {!quizChecked ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswer === null}>Check Answer</button>
                        ) : quizAnswer !== 0 ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {quizStep === 1
                                        ? 'The += operator adds AND saves. So x += 5 means "take x, add 5, and save it back to x"!'
                                        : 'The *= operator multiplies AND saves. So y *= 2 means "take y, multiply by 2, and save it back to y"!'
                                    }
                                </p>
                                <button className={styles.quizBtn} onClick={() => { setQuizChecked(false); setQuizAnswer(null); }} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.quizFeedback}`}
                                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                            >
                                <h4 style={{ color: '#10b981' }}>Correct!</h4>
                                <p>{quizStep === 1 ? 'Moving to the next question...' : 'Completing lesson...'}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
