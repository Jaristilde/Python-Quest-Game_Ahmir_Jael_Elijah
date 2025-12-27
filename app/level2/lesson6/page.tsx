'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Play, ChevronRight, ChevronLeft, Check, Lightbulb, Sun, Thermometer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LEVEL2_LESSONS } from '../lessonData';
import styles from '../lessons.module.css';

const LESSON = LEVEL2_LESSONS[5]; // Lesson 6
const LESSON_ID = 21;

export default function Lesson6() {
    const router = useRouter();
    const { user, isLoading, addXpAndCoins, completeLevel } = useAuth();

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
    const [quizChecked, setQuizChecked] = useState([false, false, false]);
    const [lessonComplete, setLessonComplete] = useState(false);

    // Animation states for robot weather scene
    const [animSunny, setAnimSunny] = useState(true);
    const [animWarm, setAnimWarm] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Toggle animation values periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const random = Math.random();
            if (random < 0.33) {
                setAnimSunny(prev => !prev);
            } else if (random < 0.66) {
                setAnimWarm(prev => !prev);
            } else {
                setAnimSunny(prev => !prev);
                setAnimWarm(prev => !prev);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const runCode = () => {
        try {
            const lines = code.trim().split('\n');
            let outputLines: string[] = [];
            let variables: { [key: string]: boolean } = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Variable assignment: sunny = True
                const assignMatch = trimmed.match(/^(\w+)\s*=\s*(True|False)$/);
                if (assignMatch) {
                    variables[assignMatch[1]] = assignMatch[2] === 'True';
                    continue;
                }

                // If statement with and/or/not
                const ifMatch = trimmed.match(/^if\s+(.+):$/);
                if (ifMatch) {
                    const condition = ifMatch[1];
                    let result = evaluateCondition(condition, variables);

                    // Look for the print statement on the next line or same line
                    const nextLineIndex = lines.indexOf(line) + 1;
                    if (nextLineIndex < lines.length && result) {
                        const nextLine = lines[nextLineIndex].trim();
                        const printMatch = nextLine.match(/^print\s*\(["'](.*)["']\)$/);
                        if (printMatch) {
                            outputLines.push(printMatch[1]);
                        }
                    }
                    continue;
                }

                // Simple print with True/False or expression
                const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
                if (printMatch) {
                    const expr = printMatch[1].trim();
                    // Check if it's a quoted string
                    const stringMatch = expr.match(/^["'](.*)["']$/);
                    if (stringMatch) {
                        outputLines.push(stringMatch[1]);
                    } else {
                        // Evaluate as boolean expression
                        const result = evaluateCondition(expr, variables);
                        outputLines.push(result ? 'True' : 'False');
                    }
                }
            }
            setOutput(outputLines.length > 0 ? outputLines.join('\n') : 'Try using and, or, not with True/False!');
        } catch {
            setOutput('Error in code! Check your syntax.');
        }
    };

    const evaluateCondition = (condition: string, variables: { [key: string]: boolean }): boolean => {
        // Replace variable names with their values
        let expr = condition;

        // Handle 'not' operator
        expr = expr.replace(/\bnot\s+(\w+)/g, (_, varName) => {
            if (varName === 'True') return 'false';
            if (varName === 'False') return 'true';
            return variables[varName] ? 'false' : 'true';
        });

        // Replace True/False with JavaScript booleans
        expr = expr.replace(/\bTrue\b/g, 'true');
        expr = expr.replace(/\bFalse\b/g, 'false');

        // Replace variable names with their boolean values
        for (const [name, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${name}\\b`, 'g');
            expr = expr.replace(regex, value ? 'true' : 'false');
        }

        // Replace Python operators with JavaScript
        expr = expr.replace(/\band\b/g, '&&');
        expr = expr.replace(/\bor\b/g, '||');

        try {
            return eval(expr);
        } catch {
            return false;
        }
    };

    const quizQuestions = [
        {
            question: 'When does `and` return True?',
            options: ['Both must be True', 'One must be True', 'Neither needs to be True'],
            correct: 0
        },
        {
            question: 'When does `or` return True?',
            options: ['At least one is True', 'Both must be True', 'Neither needs to be True'],
            correct: 0
        },
        {
            question: 'What does `not True` equal?',
            options: ['False', 'True', 'Error'],
            correct: 0
        }
    ];

    const checkQuiz = () => {
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = true;
        setQuizChecked(newChecked);

        if (quizAnswers[currentQuiz] === quizQuestions[currentQuiz].correct) {
            if (currentQuiz < 2) {
                setTimeout(() => {
                    setCurrentQuiz(currentQuiz + 1);
                    const resetChecked = [...newChecked];
                    resetChecked[currentQuiz + 1] = false;
                    setQuizChecked(resetChecked);
                }, 1000);
            } else {
                setTimeout(() => {
                    addXpAndCoins(LESSON.xpReward, 5);
                    completeLevel(LESSON_ID, LESSON.xpReward, 5, 1, 60);
                    setLessonComplete(true);
                }, 1000);
            }
        }
    };

    const resetCurrentQuiz = () => {
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuiz] = null;
        setQuizAnswers(newAnswers);
        const newChecked = [...quizChecked];
        newChecked[currentQuiz] = false;
        setQuizChecked(newChecked);
    };

    if (isLoading || !user) return <div className={styles.container}><div className="flex items-center justify-center h-screen text-slate-400">Loading...</div></div>;

    if (lessonComplete) {
        return (
            <div className={styles.successOverlay}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.successIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}><Check size={50} className="text-white" /></motion.div>
                <h2 className={styles.successTitle}>{LESSON.successMessage}</h2>
                <p className={styles.successMessage}>You can now combine conditions like a pro!</p>
                <div className={styles.successXp}><Zap size={20} fill="currentColor" /> +{LESSON.xpReward} XP</div>
                <Link href="/level2/lesson7" className={`${styles.navBtn} ${styles.primary}`}>Next Lesson <ChevronRight size={18} /></Link>
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
                            <motion.div className={styles.lessonEmoji} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>{LESSON.emoji}</motion.div>
                            <div className={styles.lessonTitleText}>
                                <h1>{LESSON.title}</h1>
                                <p>Learn: <code>{LESSON.concept}</code></p>
                            </div>
                        </div>

                        {/* Robot Weather Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.explainBox}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))',
                                textAlign: 'center',
                                padding: '1.5rem'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
                                Robo wants to go to the pool! But there are TWO rules...
                            </div>

                            {/* Animated Scene */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2rem',
                                marginBottom: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                {/* Robot */}
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '3rem' }}
                                >
                                    {'\u{1F916}'}
                                </motion.div>

                                {/* Checklist */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    textAlign: 'left'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <motion.div
                                            animate={{ scale: animSunny ? [1, 1.2, 1] : 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Sun size={20} className={animSunny ? 'text-yellow-400' : 'text-slate-500'} />
                                        </motion.div>
                                        <span style={{ color: animSunny ? '#facc15' : '#64748b' }}>
                                            sunny = {animSunny ? 'True' : 'False'}
                                        </span>
                                        {animSunny && <Check size={16} className="text-green-400" />}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <motion.div
                                            animate={{ scale: animWarm ? [1, 1.2, 1] : 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Thermometer size={20} className={animWarm ? 'text-orange-400' : 'text-slate-500'} />
                                        </motion.div>
                                        <span style={{ color: animWarm ? '#fb923c' : '#64748b' }}>
                                            warm = {animWarm ? 'True' : 'False'}
                                        </span>
                                        {animWarm && <Check size={16} className="text-green-400" />}
                                    </div>
                                </div>

                                {/* Result */}
                                <motion.div
                                    key={`${animSunny}-${animWarm}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        fontSize: '2.5rem',
                                        filter: animSunny && animWarm ? 'none' : 'grayscale(100%)'
                                    }}
                                >
                                    {animSunny && animWarm ? '\u{1F3CA}' : '\u{1F6AB}'}
                                </motion.div>
                            </div>

                            <div style={{
                                color: animSunny && animWarm ? '#4ade80' : '#f87171',
                                fontWeight: 700,
                                fontSize: '1.1rem'
                            }}>
                                sunny <span style={{ color: '#c084fc' }}>and</span> warm = {animSunny && animWarm ? 'True' : 'False'}
                                {animSunny && animWarm ? " - Let's swim!" : ' - Not today...'}
                            </div>
                        </motion.div>

                        {/* Logic Operators Explanation */}
                        <div className={styles.explainBox}>
                            <h3 style={{ marginBottom: '1rem' }}>The Three Logic Operators:</h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }}>
                                    <code style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.1rem' }}>and</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        BOTH things must be true
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(34, 211, 238, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(34, 211, 238, 0.3)'
                                }}>
                                    <code style={{ color: '#22d3ee', fontWeight: 700, fontSize: '1.1rem' }}>or</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        at least ONE thing must be true
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(251, 146, 60, 0.15)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(251, 146, 60, 0.3)'
                                }}>
                                    <code style={{ color: '#fb923c', fontWeight: 700, fontSize: '1.1rem' }}>not</code>
                                    <span style={{ marginLeft: '0.75rem' }}>=</span>
                                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                        flip it! True becomes False, False becomes True
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Real World Examples */}
                        <div className={styles.explainBox} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <h3 style={{ marginBottom: '0.75rem', color: '#10b981' }}>Real World Examples:</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ color: '#a78bfa' }}>and:</span>
                                    <span style={{ color: 'var(--text-muted)' }}>"I'll go to the park if it's sunny AND I finish my homework" (both needed!)</span>
                                </li>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ color: '#22d3ee' }}>or:</span>
                                    <span style={{ color: 'var(--text-muted)' }}>"I'll have pizza OR pasta for dinner" (either one is fine!)</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ color: '#fb923c' }}>not:</span>
                                    <span style={{ color: 'var(--text-muted)' }}>"I'll go outside if it's NOT raining" (flip the condition!)</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Code Example</h3>
                            <div className={styles.codeBlock}>
                                <div className={styles.codeHeader}><span>pool_day.py</span><span>Python</span></div>
                                <div className={styles.codeContent}>
                                    <span className={styles.comment}># Check if we can go swimming</span>{'\n'}
                                    sunny = <span className={styles.keyword}>True</span>{'\n'}
                                    warm = <span className={styles.keyword}>True</span>{'\n\n'}
                                    <span className={styles.keyword}>if</span> sunny <span style={{ color: '#a78bfa' }}>and</span> warm:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"Let's go swimming!"</span>){'\n\n'}
                                    <span className={styles.keyword}>if</span> sunny <span style={{ color: '#22d3ee' }}>or</span> warm:{'\n'}
                                    {'    '}<span className={styles.keyword}>print</span>(<span className={styles.string}>"At least we can go outside!"</span>)
                                </div>
                            </div>
                            <div className={styles.outputBox}>
                                <div className={styles.outputLabel}>Output:</div>
                                <div className={styles.outputText}>Let's go swimming!{'\n'}At least we can go outside!</div>
                            </div>
                        </div>

                        <div className={styles.codeSection}>
                            <h3>Your Turn!</h3>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Try changing sunny and warm to different True/False combinations. Use <code>not</code> to flip a condition!
                            </p>
                            <div className={styles.editor}>
                                <div className={styles.codeHeader}><span>your_code.py</span><span>Python</span></div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={'sunny = True\nwarm = False\n\nif sunny and warm:\n    print("Pool time!")\n\nif sunny or warm:\n    print("We can go out!")\n\nprint(not False)'}
                                    spellCheck={false}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>
                            <button className={styles.runBtn} onClick={runCode}><Play size={18} /> Run Code</button>
                            {output && <div className={styles.outputBox}><div className={styles.outputLabel}>Output:</div><div className={styles.outputText}>{output}</div></div>}
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} className="text-amber-400 flex-shrink-0" />
                            <div>
                                <p><strong>Quick Reference:</strong></p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    <code>True and True</code> = True | <code>True and False</code> = False
                                </p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    <code>True or False</code> = True | <code>False or False</code> = False
                                </p>
                            </div>
                        </div>

                        <div className={styles.navBar}>
                            <Link href="/level2/lesson5" className={`${styles.navBtn} ${styles.secondary}`}><ChevronLeft size={18} /> Previous</Link>
                            <button className={`${styles.navBtn} ${styles.primary}`} onClick={() => setShowQuiz(true)}>Quiz Time! <ChevronRight size={18} /></button>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.quizSection}>
                        <h2 className={styles.quizTitle}>Brain Check! ({currentQuiz + 1}/3)</h2>
                        <p className={styles.quizQuestion}>{quizQuestions[currentQuiz].question}</p>
                        <div className={styles.quizOptions}>
                            {quizQuestions[currentQuiz].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!quizChecked[currentQuiz]) {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[currentQuiz] = idx;
                                            setQuizAnswers(newAnswers);
                                        }
                                    }}
                                    className={`${styles.quizOption} ${quizAnswers[currentQuiz] === idx ? styles.selected : ''} ${quizChecked[currentQuiz] && idx === quizQuestions[currentQuiz].correct ? styles.correct : ''} ${quizChecked[currentQuiz] && quizAnswers[currentQuiz] === idx && idx !== quizQuestions[currentQuiz].correct ? styles.wrong : ''}`}
                                    disabled={quizChecked[currentQuiz]}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!quizChecked[currentQuiz] ? (
                            <button className={styles.quizBtn} onClick={checkQuiz} disabled={quizAnswers[currentQuiz] === null}>Check Answer</button>
                        ) : quizAnswers[currentQuiz] !== quizQuestions[currentQuiz].correct ? (
                            <div className={`${styles.quizFeedback} ${styles.error}`}>
                                <h4>Not quite!</h4>
                                <p>
                                    {currentQuiz === 0 && "With 'and', BOTH conditions must be True for the result to be True!"}
                                    {currentQuiz === 1 && "With 'or', if ANY ONE condition is True, the result is True!"}
                                    {currentQuiz === 2 && "'not' flips the value - not True becomes False!"}
                                </p>
                                <button className={styles.quizBtn} onClick={resetCurrentQuiz} style={{ marginTop: '1rem' }}>Try Again</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
